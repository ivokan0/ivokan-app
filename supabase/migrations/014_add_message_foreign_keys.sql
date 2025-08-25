-- ============================================
-- MIGRATION 014: ADD MESSAGE FOREIGN KEYS
-- ============================================

-- Add foreign key constraints for messages table
ALTER TABLE messages 
ADD CONSTRAINT fk_message_sender 
FOREIGN KEY (sender_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT fk_message_receiver 
FOREIGN KEY (receiver_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
