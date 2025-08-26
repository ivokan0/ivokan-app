-- ============================================
-- MIGRATION 019: FIX AVAILABILITY DEFAULTS
-- ============================================

-- Remove the default value for is_full_day column
-- This ensures weekly availability can have NULL values for is_full_day
ALTER TABLE tutor_availability ALTER COLUMN is_full_day DROP DEFAULT;

-- Update any existing weekly availability records to have NULL is_full_day
UPDATE tutor_availability 
SET is_full_day = NULL 
WHERE type = 'weekly_availability';
