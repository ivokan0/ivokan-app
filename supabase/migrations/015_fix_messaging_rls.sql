-- ============================================
-- MIGRATION 015: FIX MESSAGING RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "participants_all_conversations" ON conversations;
DROP POLICY IF EXISTS "participants_all_messages" ON messages;

-- Disable RLS for conversations (we'll handle authorization at the application level)
-- Note: Since we're using Clerk authentication and not Supabase auth,
-- auth.uid() will not work. We handle authorization in the application layer.
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
