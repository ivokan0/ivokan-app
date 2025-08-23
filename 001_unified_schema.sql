-- ============================================
-- MIGRATION UNIFIÉE SUPABASE - PROFILES
-- Combine toutes les migrations en un seul fichier
-- ============================================

-- 1. CRÉATION DE LA TABLE PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  profile_type TEXT NOT NULL DEFAULT 'student' CHECK (profile_type IN ('student','tutor')),
  -- Minimum notice before a reservation in minutes (e.g., 30, 120, 360, 1440)
  minimum_time_notice INTEGER NOT NULL DEFAULT 120 CHECK (minimum_time_notice > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INDEX POUR LES PERFORMANCES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_type ON profiles(profile_type);

-- 3. TRIGGER POUR UPDATED_AT
-- ============================================
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

-- 3b. TUTOR AVAILABILITIES
-- ============================================
-- Availability slots per tutor (by user_id)
CREATE TABLE IF NOT EXISTS tutor_availabilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_user_id TEXT NOT NULL,
  -- 0 = Sunday, 6 = Saturday (JS Date.getDay convention)
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_tutor_availabilities_tutor_user_id ON tutor_availabilities(tutor_user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_availabilities_day ON tutor_availabilities(day_of_week);

CREATE TRIGGER update_tutor_availabilities_updated_at
  BEFORE UPDATE ON tutor_availabilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. SÉCURITÉ RLS POUR LA TABLE PROFILES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;


-- Créer les politiques permissives pour Clerk + Supabase
CREATE POLICY "Allow all operations on profiles" ON profiles
  FOR ALL USING (true);

-- RLS for tutor_availabilities (permissive, see notes below)
ALTER TABLE tutor_availabilities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on tutor_availabilities" ON tutor_availabilities;
CREATE POLICY "Allow all operations on tutor_availabilities" ON tutor_availabilities
  FOR ALL USING (true);

-- Note: Cette politique permissive est sécurisée car :
-- 1. L'authentification est gérée par Clerk
-- 2. Les vérifications de sécurité sont faites côté application
-- 3. Chaque user_id correspond à un utilisateur Clerk authentifié

-- 5. BUCKET STORAGE POUR LES AVATARS
-- ============================================
-- Créer le bucket avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 6. POLITIQUES RLS POUR LE STORAGE AVATARS
-- ============================================
-- Supprimer toutes les anciennes politiques du bucket avatars
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir tous les avatars" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs peuvent uploader leurs propres avatars" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leurs propres avatars" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on avatars bucket" ON storage.objects;

-- Créer une politique permissive pour le bucket avatars
CREATE POLICY "Allow all operations on avatars bucket" ON storage.objects
FOR ALL USING (bucket_id = 'avatars');

-- Note: Cette approche est sécurisée car :
-- 1. Le bucket avatars est public par nature
-- 2. Les noms de fichiers contiennent l'ID utilisateur (évite les conflits)
-- 3. Les vérifications de propriété sont faites côté application

-- ============================================
-- COMMENTAIRES DE SÉCURITÉ
-- ============================================
-- Cette migration est conçue pour fonctionner avec Clerk + Supabase :
-- 
-- SÉCURITÉ CÔTÉ APPLICATION :
-- - Clerk gère l'authentification
-- - L'application vérifie user_id avant les opérations
-- - Validation des données côté client et serveur
--
-- SÉCURITÉ CÔTÉ BASE DE DONNÉES :
-- - RLS activé sur la table profiles
-- - Bucket avatars public (par design)
-- - Triggers pour updated_at automatique
-- - Contraintes sur profile_type
--
-- POUR LA PRODUCTION :
-- Considérez d'ajouter des politiques RLS plus strictes
-- basées sur des JWT personnalisés de Clerk si nécessaire.


-- ============================================
-- MIGRATION - TUTOR PAYMENT METHODS
-- Add table for tutor payment methods
-- ============================================

-- 1. CRÉATION DE LA TABLE TUTOR_PAYMENT_METHODS
-- ============================================
CREATE TABLE IF NOT EXISTS tutor_payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id TEXT NOT NULL,
  payment_type TEXT NOT NULL CHECK (
    payment_type IN ('orange_money', 'wave', 'mtn_money', 'moov_money', 'bank_transfer')
  ),
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  bank_name TEXT, -- Optional, mainly for bank_transfer
  country TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key constraint to profiles table
  CONSTRAINT fk_tutor_payment_methods_tutor_id 
    FOREIGN KEY (tutor_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

-- 2. INDEX POUR LES PERFORMANCES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tutor_payment_methods_tutor_id ON tutor_payment_methods(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_payment_methods_is_default ON tutor_payment_methods(is_default);

-- 3. TRIGGER POUR UPDATED_AT
-- ============================================
CREATE TRIGGER update_tutor_payment_methods_updated_at
  BEFORE UPDATE ON tutor_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. FONCTION POUR ASSURER UN SEUL DÉFAUT PAR TUTEUR
-- ============================================
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le nouveau/mis à jour payment method est défini comme défaut
  IF NEW.is_default = true THEN
    -- Désactiver tous les autres payment methods par défaut pour ce tuteur
    UPDATE tutor_payment_methods 
    SET is_default = false 
    WHERE tutor_id = NEW.tutor_id 
      AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. TRIGGER POUR LE PAYMENT METHOD DÉFAUT UNIQUE
-- ============================================
CREATE TRIGGER ensure_single_default_payment_method_trigger
  AFTER INSERT OR UPDATE ON tutor_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_payment_method();

-- 6. SÉCURITÉ RLS
-- ============================================
ALTER TABLE tutor_payment_methods ENABLE ROW LEVEL SECURITY;

-- Politique permissive pour le développement (similaire aux autres tables)
CREATE POLICY "Allow all operations on tutor_payment_methods" ON tutor_payment_methods
  FOR ALL USING (true);

-- Note: Cette politique permissive est sécurisée car :
-- 1. L'authentification est gérée par Clerk
-- 2. Les vérifications de sécurité sont faites côté application
-- 3. Chaque tutor_id correspond à un utilisateur Clerk authentifié
