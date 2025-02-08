/*
  # Complete Database Recovery Migration

  This file contains the complete database schema and initial data setup for the React Game Center.
  It can be used to restore the database from scratch or recover from major issues. The table prefix "rgc" stands for "React Game Center."

  1. Tables
    - profiles: User profiles and roles
    - rgc_games: Game metadata
    - rgc_game_settings: Game-specific settings
    - rgc_high_scores: Player scores
    - rgc_system_settings: Global system and branding settings

  2. Functions
    - is_admin: Check if a user has admin role
    - update_game_last_accessed: Update game access timestamp

  3. Security
    - Row Level Security (RLS) policies for all tables
    - Admin-only access for sensitive operations
*/

-- Create tables
CREATE TABLE IF NOT EXISTS rgc_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_accessed timestamptz
);

CREATE TABLE IF NOT EXISTS rgc_game_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES rgc_games(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  version integer DEFAULT 1,
  UNIQUE(game_id, key)
);

CREATE TABLE IF NOT EXISTS rgc_high_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  score integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  username text NOT NULL
);

CREATE TABLE IF NOT EXISTS rgc_system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  version integer DEFAULT 1
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rgc_games_slug ON rgc_games(slug);
CREATE INDEX IF NOT EXISTS idx_rgc_game_settings_game_id ON rgc_game_settings(game_id);

-- Enable Row Level Security
ALTER TABLE rgc_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgc_game_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgc_high_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgc_system_settings ENABLE ROW LEVEL SECURITY;

-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles
    WHERE id = p_user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update last_accessed timestamp
CREATE OR REPLACE FUNCTION update_game_last_accessed()
RETURNS trigger AS $$
BEGIN
  UPDATE rgc_games 
  SET last_accessed = now()
  WHERE id = NEW.game_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for last_accessed
DROP TRIGGER IF EXISTS update_game_last_accessed_trigger ON rgc_game_settings;
CREATE TRIGGER update_game_last_accessed_trigger
AFTER INSERT OR UPDATE ON rgc_game_settings
FOR EACH ROW
EXECUTE FUNCTION update_game_last_accessed();

-- Create RLS Policies

-- Games table policies
CREATE POLICY "Allow read access to all users"
  ON rgc_games
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow write access to admin users"
  ON rgc_games
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Allow cross-origin read access"
  ON rgc_games
  FOR SELECT
  TO anon
  USING (active = true);

-- Game settings policies
CREATE POLICY "Allow read access to all users"
  ON rgc_game_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admin to update settings"
  ON rgc_game_settings
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Allow admin to insert settings"
  ON rgc_game_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Allow admin to delete settings"
  ON rgc_game_settings
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Allow cross-origin settings read"
  ON rgc_game_settings
  FOR SELECT
  TO anon
  USING (true);

-- High scores policies
CREATE POLICY "Anyone can read high scores"
  ON rgc_high_scores
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert high scores"
  ON rgc_high_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- System settings policies
CREATE POLICY "Allow read access to all users"
  ON rgc_system_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin to update settings"
  ON rgc_system_settings
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Insert initial data

-- Insert games
INSERT INTO rgc_games (name, slug) VALUES
  ('Crossy Road', 'crossy-road'),
  ('Flappy Bird', 'flappy-bird')
ON CONFLICT (slug) DO NOTHING;

-- Insert Crossy Road settings
INSERT INTO rgc_game_settings (game_id, key, value, description)
SELECT 
  games.id,
  settings.key,
  settings.value::jsonb,
  settings.description
FROM rgc_games games
CROSS JOIN (
  VALUES 
    ('characterSize', '{"type": "number", "value": 30, "min": 20, "max": 50}', 'Size of the player character'),
    ('characterColor', '{"type": "color", "value": "#fde047"}', 'Color of the player character'),
    ('carSize', '{"type": "number", "value": 40, "min": 30, "max": 60}', 'Size of the cars'),
    ('carColor', '{"type": "color", "value": "#ef4444"}', 'Color of the cars'),
    ('baseCarSpeed', '{"type": "number", "value": 2, "min": 1, "max": 5, "step": 0.5}', 'Base speed of cars'),
    ('maxCarSpeed', '{"type": "number", "value": 10, "min": 5, "max": 15}', 'Maximum car speed'),
    ('carSpawnRate', '{"type": "number", "value": 0.02, "min": 0.01, "max": 0.1, "step": 0.01}', 'Rate at which cars spawn'),
    ('levelSpeedIncrease', '{"type": "number", "value": 0.05, "min": 0, "max": 0.2, "step": 0.01}', 'Speed increase per level'),
    ('levelSpawnIncrease', '{"type": "number", "value": 0.1, "min": 0, "max": 0.5, "step": 0.05}', 'Spawn rate increase per level'),
    ('grassColor', '{"type": "color", "value": "#4ade80"}', 'Color of the grass'),
    ('roadColor', '{"type": "color", "value": "#374151"}', 'Color of the road'),
    ('finishLineColor', '{"type": "color", "value": "#fbbf24"}', 'Color of the finish line')
  ) AS settings(key, value, description)
WHERE games.slug = 'crossy-road'
ON CONFLICT (game_id, key) DO NOTHING;

-- Insert Flappy Bird settings
INSERT INTO rgc_game_settings (game_id, key, value, description)
SELECT 
  games.id,
  settings.key,
  settings.value::jsonb,
  settings.description
FROM rgc_games games
CROSS JOIN (
  VALUES 
    ('pipeSpeed', '{"type": "number", "value": 3, "min": 1, "max": 10, "step": 0.5}', 'Speed of the pipes'),
    ('pipeSpawnRate', '{"type": "number", "value": 1500, "min": 1000, "max": 3000, "step": 100}', 'Time between pipe spawns (ms)'),
    ('gapSize', '{"type": "number", "value": 250, "min": 150, "max": 400, "step": 10}', 'Size of the gap between pipes'),
    ('gravity', '{"type": "number", "value": 0.6, "min": 0.3, "max": 1.0, "step": 0.1}', 'Gravity strength'),
    ('jumpForce', '{"type": "number", "value": -9, "min": -15, "max": -5, "step": 0.5}', 'Jump force (negative for upward)')
  ) AS settings(key, value, description)
WHERE games.slug = 'flappy-bird'
ON CONFLICT (game_id, key) DO NOTHING;

-- Insert system settings
INSERT INTO rgc_system_settings (key, value, description)
VALUES 
  ('logoUrl', '{"type": "text", "value": "https://adventurebuildrstorage.storage.googleapis.com/wp-content/uploads/2024/10/11185818/AdventureBuildr-Logo-e1731351627826.png"}', 'URL for the game center logo'),
  ('brandName', '{"type": "text", "value": "Game Center"}', 'Name of the game center'),
  ('primaryColor', '{"type": "color", "value": "#4f46e5"}', 'Primary brand color'),
  ('secondaryColor', '{"type": "color", "value": "#6366f1"}', 'Secondary brand color')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value;