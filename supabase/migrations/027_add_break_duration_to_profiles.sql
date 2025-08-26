-- ============================================
-- MIGRATION 027: ADD BREAK DURATION TO PROFILES
-- ============================================

-- Add break_duration_minutes column with default 15
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS break_duration_minutes INTEGER DEFAULT 15;

-- Update existing tutor profiles to have 15 minutes break by default when null
UPDATE profiles 
SET break_duration_minutes = 15 
WHERE profile_type = 'tutor' AND break_duration_minutes IS NULL;

-- Ensure positive (or zero) values
ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS profiles_break_duration_positive 
CHECK (break_duration_minutes >= 0);
