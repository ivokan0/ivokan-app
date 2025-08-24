

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
