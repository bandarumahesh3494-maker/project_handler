-- Project Tracker - Complete Database Initialization
-- Run this script once in your Supabase SQL Editor to set up all tables

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read all users" ON users;
DROP POLICY IF EXISTS "Public can insert users" ON users;
DROP POLICY IF EXISTS "Public can update users" ON users;
DROP POLICY IF EXISTS "Public can delete users" ON users;

CREATE POLICY "Public can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Public can insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update users" ON users FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete users" ON users FOR DELETE USING (true);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('dev', 'test', 'infra', 'support')) DEFAULT 'dev',
  priority integer DEFAULT 0,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read all tasks" ON tasks;
DROP POLICY IF EXISTS "Public can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Public can update tasks" ON tasks;
DROP POLICY IF EXISTS "Public can delete tasks" ON tasks;

CREATE POLICY "Public can read all tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Public can insert tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update tasks" ON tasks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete tasks" ON tasks FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- ============================================
-- SUBTASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name text NOT NULL,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read all subtasks" ON subtasks;
DROP POLICY IF EXISTS "Public can insert subtasks" ON subtasks;
DROP POLICY IF EXISTS "Public can update subtasks" ON subtasks;
DROP POLICY IF EXISTS "Public can delete subtasks" ON subtasks;

CREATE POLICY "Public can read all subtasks" ON subtasks FOR SELECT USING (true);
CREATE POLICY "Public can insert subtasks" ON subtasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update subtasks" ON subtasks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete subtasks" ON subtasks FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_assigned_to ON subtasks(assigned_to);

-- ============================================
-- SUB-SUBTASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sub_subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subtask_id uuid NOT NULL REFERENCES subtasks(id) ON DELETE CASCADE,
  name text NOT NULL,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  order_index integer DEFAULT 0,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sub_subtasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read all sub_subtasks" ON sub_subtasks;
DROP POLICY IF EXISTS "Public can insert sub_subtasks" ON sub_subtasks;
DROP POLICY IF EXISTS "Public can update sub_subtasks" ON sub_subtasks;
DROP POLICY IF EXISTS "Public can delete sub_subtasks" ON sub_subtasks;

CREATE POLICY "Public can read all sub_subtasks" ON sub_subtasks FOR SELECT USING (true);
CREATE POLICY "Public can insert sub_subtasks" ON sub_subtasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update sub_subtasks" ON sub_subtasks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete sub_subtasks" ON sub_subtasks FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_sub_subtasks_subtask_id ON sub_subtasks(subtask_id);
CREATE INDEX IF NOT EXISTS idx_sub_subtasks_assigned_to ON sub_subtasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_sub_subtasks_order ON sub_subtasks(order_index);

-- ============================================
-- MILESTONES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subtask_id uuid REFERENCES subtasks(id) ON DELETE CASCADE,
  sub_subtask_id uuid REFERENCES sub_subtasks(id) ON DELETE CASCADE,
  milestone_date date NOT NULL,
  milestone_text text NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT milestone_has_parent CHECK (
    (subtask_id IS NOT NULL AND sub_subtask_id IS NULL) OR
    (subtask_id IS NULL AND sub_subtask_id IS NOT NULL)
  )
);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read all milestones" ON milestones;
DROP POLICY IF EXISTS "Public can insert milestones" ON milestones;
DROP POLICY IF EXISTS "Public can update milestones" ON milestones;
DROP POLICY IF EXISTS "Public can delete milestones" ON milestones;

CREATE POLICY "Public can read all milestones" ON milestones FOR SELECT USING (true);
CREATE POLICY "Public can insert milestones" ON milestones FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update milestones" ON milestones FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete milestones" ON milestones FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_milestones_subtask_id ON milestones(subtask_id);
CREATE INDEX IF NOT EXISTS idx_milestones_sub_subtask_id ON milestones(sub_subtask_id);
CREATE INDEX IF NOT EXISTS idx_milestones_date ON milestones(milestone_date);

-- ============================================
-- APP CONFIG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read config" ON app_config;
DROP POLICY IF EXISTS "Anyone can update config" ON app_config;
DROP POLICY IF EXISTS "Anyone can insert config" ON app_config;

CREATE POLICY "Anyone can read config" ON app_config FOR SELECT USING (true);
CREATE POLICY "Anyone can update config" ON app_config FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can insert config" ON app_config FOR INSERT WITH CHECK (true);

-- Insert default configuration
INSERT INTO app_config (config_key, config_value) VALUES
  ('milestone_options', '[
    {"value": "planned", "label": "PLANNED"},
    {"value": "closed", "label": "CLOSED"},
    {"value": "dev-complete", "label": "Dev Complete"},
    {"value": "dev-merge-done", "label": "Dev Merge Done"},
    {"value": "staging-merge-done", "label": "Staging Merge Done"},
    {"value": "prod-merge-done", "label": "Prod Merge Done"},
    {"value": "in-progress", "label": "In progress"}
  ]'::jsonb),
  ('row_colors', '{"planned": "#fbdd2b", "actual": "#1f3cd1", "plannedOpacity": 0.2, "actualOpacity": 0.2, "subSubtaskOpacity": 0.15}'::jsonb),
  ('category_colors', '{"dev": "#10b981", "test": "#3b82f6", "infra": "#eab308", "support": "#f97316"}'::jsonb),
  ('category_opacity', '{"dev": 1.0, "test": 1.0, "infra": 1.0, "support": 1.0}'::jsonb)
ON CONFLICT (config_key) DO NOTHING;

-- ============================================
-- ACTION HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS action_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  entity_name text NOT NULL,
  old_value text,
  new_value text,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  user_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE action_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read action history" ON action_history;
DROP POLICY IF EXISTS "Anyone can insert action history" ON action_history;

CREATE POLICY "Anyone can read action history" ON action_history FOR SELECT USING (true);
CREATE POLICY "Anyone can insert action history" ON action_history FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_action_history_created_at ON action_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_action_history_entity ON action_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_action_history_user ON action_history(user_id);

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Database schema initialized successfully!';
  RAISE NOTICE 'All tables, indexes, and policies have been created.';
  RAISE NOTICE 'You can now use the Project Tracker application.';
END $$;
