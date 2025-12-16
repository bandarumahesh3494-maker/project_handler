/*
  # Add Configuration Table

  1. New Tables
    - `app_config`
      - `id` (uuid, primary key)
      - `config_key` (text, unique) - Configuration key identifier
      - `config_value` (jsonb) - Configuration value as JSON
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `app_config` table
    - Add policy for anyone to read config (needed for app functionality)
    - Add policy for anyone to update config (simplified for demo purposes)

  3. Initial Data
    - Insert default milestone options
    - Insert default row colors
*/

CREATE TABLE IF NOT EXISTS app_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read config"
  ON app_config
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update config"
  ON app_config
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert config"
  ON app_config
  FOR INSERT
  WITH CHECK (true);

-- Insert default milestone options
INSERT INTO app_config (config_key, config_value)
VALUES (
  'milestone_options',
  '[
    {"value": "planned", "label": "PLANNED"},
    {"value": "closed", "label": "CLOSED"},
    {"value": "dev-complete", "label": "Dev Complete"},
    {"value": "dev-merge-done", "label": "Dev Merge Done"},
    {"value": "staging-merge-done", "label": "Staging Merge Done"},
    {"value": "prod-merge-done", "label": "Prod Merge Done"},
    {"value": "check", "label": "✓"}
  ]'::jsonb
)
ON CONFLICT (config_key) DO NOTHING;

-- Insert default row colors
INSERT INTO app_config (config_key, config_value)
VALUES (
  'row_colors',
  '{"planned": "#fbdd2b", "actual": "#1f3cd1"}'::jsonb
)
ON CONFLICT (config_key) DO NOTHING;
