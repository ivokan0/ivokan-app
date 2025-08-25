-- ============================================
-- MIGRATION 016: CONVERSATION MESSAGE TRIGGER
-- ============================================

-- Function to update conversation's last_message and last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the conversation with the new message details
  UPDATE conversations 
  SET 
    last_message = NEW.content,
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update conversation when message is inserted
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON messages;
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Also handle message updates (in case content is modified)
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message_update ON messages;
CREATE TRIGGER trigger_update_conversation_last_message_update
  AFTER UPDATE ON messages
  FOR EACH ROW
  WHEN (OLD.content IS DISTINCT FROM NEW.content OR OLD.created_at IS DISTINCT FROM NEW.created_at)
  EXECUTE FUNCTION update_conversation_last_message();
