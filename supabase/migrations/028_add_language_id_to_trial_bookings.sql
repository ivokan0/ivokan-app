-- Add language_id column to trial_bookings table
ALTER TABLE trial_bookings 
ADD COLUMN IF NOT EXISTS language_id TEXT;

-- Add comment explaining the purpose
COMMENT ON COLUMN trial_bookings.language_id IS 'The language chosen by the student for the trial lesson from tutor taught_languages';

-- Update the trial_bookings table to allow language_id to be null for existing records
-- but should be required for new bookings where language selection is implemented
