-- ============================================
-- MIGRATION 018: FIX AVAILABILITY RLS
-- ============================================

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Allow tutors to manage their own availability" ON tutor_availability;
DROP POLICY IF EXISTS "Allow students to view tutor availability" ON tutor_availability;

-- Disable RLS for tutor_availability table
-- Note: Since we're using Clerk authentication and not Supabase auth,
-- auth.uid() will not work. We handle authorization in the application layer.
ALTER TABLE tutor_availability DISABLE ROW LEVEL SECURITY;
