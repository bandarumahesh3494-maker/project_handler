/*
  # Project Tracker Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `role` (text) - 'engineer' or 'lead'
      - `created_at` (timestamp)
      
    - `tasks`
      - `id` (uuid, primary key)
      - `name` (text) - Task name (e.g., "DBInsights")
      - `category` (text) - 'dev', 'test', 'infra', or 'support'
      - `created_by` (uuid, references users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `subtasks`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `name` (text) - Subtask name (e.g., "UI", "Backend")
      - `assigned_to` (uuid, references users) - Engineer/Lead assigned
      - `created_by` (uuid, references users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `milestones`
      - `id` (uuid, primary key)
      - `subtask_id` (uuid, references subtasks)
      - `milestone_date` (date) - The date for this milestone
      - `milestone_text` (text) - e.g., "Dev complete", "DEV merged"
      - `created_by` (uuid, references users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Engineers can read all data but only update their assigned subtasks
    - Leads can read and update all data
    - Both engineers and leads can create tasks, subtasks, and milestones
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('engineer', 'lead')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read all user data
CREATE POLICY "Users can read all user data"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('dev', 'test', 'infra', 'support')),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read tasks
CREATE POLICY "Users can read all tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can create tasks
CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Leads can update all tasks, engineers can update tasks they created
CREATE POLICY "Users can update tasks based on role"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'lead' OR tasks.created_by = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'lead' OR tasks.created_by = auth.uid())
    )
  );

-- Leads can delete tasks
CREATE POLICY "Leads can delete tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'lead'
    )
  );

-- Create subtasks table
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

-- All authenticated users can read subtasks
CREATE POLICY "Users can read all subtasks"
  ON subtasks FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can create subtasks
CREATE POLICY "Users can create subtasks"
  ON subtasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Engineers can update subtasks assigned to them, leads can update all
CREATE POLICY "Users can update subtasks based on role"
  ON subtasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'lead' OR subtasks.assigned_to = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'lead' OR subtasks.assigned_to = auth.uid())
    )
  );

-- Leads can delete subtasks
CREATE POLICY "Leads can delete subtasks"
  ON subtasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'lead'
    )
  );

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subtask_id uuid NOT NULL REFERENCES subtasks(id) ON DELETE CASCADE,
  milestone_date date NOT NULL,
  milestone_text text NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read milestones
CREATE POLICY "Users can read all milestones"
  ON milestones FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can create milestones
CREATE POLICY "Users can create milestones"
  ON milestones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Engineers can update milestones for their subtasks, leads can update all
CREATE POLICY "Users can update milestones based on role"
  ON milestones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        users.role = 'lead' 
        OR EXISTS (
          SELECT 1 FROM subtasks
          WHERE subtasks.id = milestones.subtask_id
          AND subtasks.assigned_to = auth.uid()
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        users.role = 'lead' 
        OR EXISTS (
          SELECT 1 FROM subtasks
          WHERE subtasks.id = milestones.subtask_id
          AND subtasks.assigned_to = auth.uid()
        )
      )
    )
  );

-- Leads can delete milestones
CREATE POLICY "Leads can delete milestones"
  ON milestones FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'lead'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_assigned_to ON subtasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_milestones_subtask_id ON milestones(subtask_id);
CREATE INDEX IF NOT EXISTS idx_milestones_date ON milestones(milestone_date);
