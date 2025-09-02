import { RouteProp, useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import ChatScreenSkeleton from '../../components/ui/ChatScreenSkeleton';
import StudentChatScreen from '../../components/StudentChatScreen';
import { useAuth } from '../../hooks/useAuth';
import { getConversation } from '../../services/messaging';
import { ConversationWithProfiles } from '../../types/database';

type ChatScreenProps = {
  route: RouteProp<{ Chat: { conversationId: string } }, 'Chat'>;
};

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { conversationId } = route.params;
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<ConversationWithProfiles | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  const loadConversation = async () => {
    if (!conversationId) return;

    setLoading(true);
    try {
      const { data, error } = await getConversation(conversationId, user?.id);
      if (error) {
        console.error('Error loading conversation:', error);
        return;
      }
      setConversation(data);
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Show skeleton while loading
  if (loading || !conversation) {
    return <ChatScreenSkeleton />;
  }

  return (
    <StudentChatScreen
      conversation={conversation}
      currentUserId={user?.id || ''}
      onBack={handleBack}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatScreen;
