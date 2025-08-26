-- ============================================
-- MIGRATION 025: FIX TRIAL BOOKINGS RLS FOR CLERK
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON trial_bookings;

-- Option 1: Disable RLS completely (if you want to handle all auth at application level)
-- ALTER TABLE trial_bookings DISABLE ROW LEVEL SECURITY;

-- Option 2: Create a simple policy that allows all operations
-- This is the recommended approach when using external auth providers like Clerk
ALTER TABLE trial_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON trial_bookings
  FOR ALL USING (true);

-- Note: All authorization checks are handled at the application level in the TypeScript services
-- This ensures compatibility with Clerk authentication while maintaining security
