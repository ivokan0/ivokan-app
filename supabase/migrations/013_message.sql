-- ============================================
-- MIGRATION 013: CONVERSATIONS AND MESSAGES
-- ============================================

-- 1. CONVERSATIONS TABLE (tutor <-> student)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_tutor_student UNIQUE (tutor_id, student_id),
  CONSTRAINT fk_conversation_tutor FOREIGN KEY (tutor_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_conversation_student FOREIGN KEY (student_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

-- trigger to keep updated_at fresh
DROP TRIGGER IF EXISTS conversations_set_updated_at ON conversations;
CREATE TRIGGER conversations_set_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 2. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies: a user can access a conversation if they are tutor or student of it (use ALL)
DROP POLICY IF EXISTS "participants_all_conversations" ON conversations;
CREATE POLICY "participants_all_conversations" ON conversations
FOR ALL
USING (
  auth.uid()::text = tutor_id OR auth.uid()::text = student_id
)
WITH CHECK (
  auth.uid()::text = tutor_id OR auth.uid()::text = student_id
);

-- Messages policies: only participants can access and write (use ALL)
DROP POLICY IF EXISTS "participants_all_messages" ON messages;
CREATE POLICY "participants_all_messages" ON messages
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
      AND (auth.uid()::text = c.tutor_id OR auth.uid()::text = c.student_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
      AND (auth.uid()::text = c.tutor_id OR auth.uid()::text = c.student_id)
  )
);


