-- ============================================
-- MIGRATION 010: ADD PRESENTATION_VIDEO_URL TO PROFILES
-- ============================================

-- Add presentation_video_url field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS presentation_video_url TEXT;

-- Create index for better performance on presentation_video_url queries
CREATE INDEX IF NOT EXISTS idx_profiles_presentation_video_url ON profiles(presentation_video_url);

-- Add comment to document the field
COMMENT ON COLUMN profiles.presentation_video_url IS 'URL to the tutor presentation video';
