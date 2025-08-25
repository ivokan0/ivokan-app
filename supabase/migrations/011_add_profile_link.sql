-- ============================================
-- MIGRATION 011: ADD PROFILE_LINK TO PROFILES
-- ============================================

-- Add profile_link field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_link TEXT UNIQUE;

-- Create index for better performance on profile_link queries
CREATE INDEX IF NOT EXISTS idx_profiles_profile_link ON profiles(profile_link);

-- Add comment to document the field
COMMENT ON COLUMN profiles.profile_link IS 'Unique link identifier for the tutor profile, used for sharing';

-- Generate unique profile links for existing profiles (optional, can be done in app)
-- UPDATE profiles SET profile_link = LOWER(REPLACE(COALESCE(first_name, '') || '-' || COALESCE(last_name, '') || '-' || SUBSTRING(id::text, 1, 8), ' ', '-'))
-- WHERE profile_link IS NULL AND profile_type = 'tutor';
