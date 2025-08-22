-- Ajout du champ profile_type à la table profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS profile_type TEXT NOT NULL DEFAULT 'student'
  CHECK (profile_type IN ('student','tutor'));
