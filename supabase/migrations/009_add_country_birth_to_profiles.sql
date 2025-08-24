
-- ============================================
-- MIGRATION 009: ADD COUNTRY_BIRTH TO PROFILES
-- ============================================

-- Add country_birth field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS country_birth TEXT;

-- Create index for better performance on country_birth queries
CREATE INDEX IF NOT EXISTS idx_profiles_country_birth ON profiles(country_birth);

-- Add comment to document the field
COMMENT ON COLUMN profiles.country_birth IS 'Country of birth for the user profile';
