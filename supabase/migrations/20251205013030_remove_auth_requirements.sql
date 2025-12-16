/*
  # Remove Authentication Requirements

  1. Changes to Tables
    - Drop existing RLS policies that require authentication
    - Update users table to be simpler (remove auth.users reference)
    - Add new public access policies for all tables
    
  2. New Public Access
    - All operations are now allowed without authentication
    - Anyone can create, read, update, and delete all records
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read all user data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Users can read all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks based on role" ON tasks;
DROP POLICY IF EXISTS "Leads can delete tasks" ON tasks;

DROP POLICY IF EXISTS "Users can read all subtasks" ON subtasks;
DROP POLICY IF EXISTS "Users can create subtasks" ON subtasks;
DROP POLICY IF EXISTS "Users can update subtasks based on role" ON subtasks;
DROP POLICY IF EXISTS "Leads can delete subtasks" ON subtasks;

DROP POLICY IF EXISTS "Users can read all milestones" ON milestones;
DROP POLICY IF EXISTS "Users can create milestones" ON milestones;
DROP POLICY IF EXISTS "Users can update milestones based on role" ON milestones;
DROP POLICY IF EXISTS "Leads can delete milestones" ON milestones;

-- Modify users table to be independent of auth
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Create new public policies for users
CREATE POLICY "Public can read all users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Public can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update users"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete users"
  ON users FOR DELETE
  USING (true);

-- Create new public policies for tasks
CREATE POLICY "Public can read all tasks"
  ON tasks FOR SELECT
  USING (true);

CREATE POLICY "Public can insert tasks"
  ON tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update tasks"
  ON tasks FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete tasks"
  ON tasks FOR DELETE
  USING (true);

-- Create new public policies for subtasks
CREATE POLICY "Public can read all subtasks"
  ON subtasks FOR SELECT
  USING (true);

CREATE POLICY "Public can insert subtasks"
  ON subtasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update subtasks"
  ON subtasks FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete subtasks"
  ON subtasks FOR DELETE
  USING (true);

-- Create new public policies for milestones
CREATE POLICY "Public can read all milestones"
  ON milestones FOR SELECT
  USING (true);

CREATE POLICY "Public can insert milestones"
  ON milestones FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update milestones"
  ON milestones FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete milestones"
  ON milestones FOR DELETE
  USING (true);
