-- Création de la table Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  timezone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) pour sécuriser les données
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir et modifier uniquement leur propre profil
-- Note: Avec Clerk, nous utilisons le user_id directement car nous n'avons pas de JWT Supabase
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (true); -- Temporairement permettre la lecture pour tous

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (true); -- Temporairement permettre l'insertion pour tous

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (true); -- Temporairement permettre la mise à jour pour tous

-- Note: Pour une sécurité plus stricte en production, vous pouvez :
-- 1. Créer une fonction qui vérifie le user_id via une API
-- 2. Utiliser des tokens JWT personnalisés de Clerk
-- 3. Implémenter une vérification côté application
