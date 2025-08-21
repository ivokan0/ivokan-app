-- Correction des politiques RLS pour fonctionner avec Clerk
-- Ce script doit être exécuté après avoir créé la table profiles

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Créer les nouvelles politiques qui fonctionnent avec Clerk
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (true); -- Temporairement permettre la lecture pour tous

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (true); -- Temporairement permettre l'insertion pour tous

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (true); -- Temporairement permettre la mise à jour pour tous

-- Note: Ces politiques sont temporaires pour permettre le développement
-- En production, vous devriez implémenter une sécurité plus stricte
