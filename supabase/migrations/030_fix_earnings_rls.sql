-- ============================================
-- MIGRATION 030: FIX EARNINGS AND POLICIES RLS FOR CLERK COMPATIBILITY
-- ============================================

-- Drop existing restrictive policies for earnings table
DROP POLICY IF EXISTS "Allow tutors to see their own earnings" ON earnings;
DROP POLICY IF EXISTS "Allow students to see their own payments" ON earnings;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON earnings;

-- Create simple policies compatible with Clerk authentication
-- All authorization checks are handled at the application level (consistent with other tables)
CREATE POLICY "Allow all operations on earnings" ON earnings
  FOR ALL USING (true);

-- Also fix policies table to be consistent
DROP POLICY IF EXISTS "Allow read access to policies for authenticated users" ON policies;
DROP POLICY IF EXISTS "Allow insert/update for policies by admins only" ON policies;

-- Allow read access to policies for all users (needed for commission calculation)
CREATE POLICY "Allow read access to policies" ON policies
  FOR SELECT USING (true);

-- Note: The function update_updated_at_column() already exists from migration 001
-- No need to recreate it in migration 029

-- Verify that triggers are properly created
-- Drop and recreate triggers to ensure they work correctly
DROP TRIGGER IF EXISTS update_policies_updated_at ON policies;
CREATE TRIGGER update_policies_updated_at 
  BEFORE UPDATE ON policies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_earnings_updated_at ON earnings;
CREATE TRIGGER update_earnings_updated_at 
  BEFORE UPDATE ON earnings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
