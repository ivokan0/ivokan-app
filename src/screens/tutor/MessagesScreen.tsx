import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import ConversationList from '../../components/ConversationList';
import TutorChatScreen from '../../components/TutorChatScreen';
import TutorMessagesScreenSkeleton from '../../components/ui/TutorMessagesScreenSkeleton';
import { useAuth } from '../../hooks/useAuth';
import { getConversations, subscribeToConversations, subscribeToMessagesForConversations } from '../../services/messaging';
import { ConversationWithProfiles } from '../../types/database';

const TutorMessagesScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithProfiles | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    loadConversations();

    // Subscribe to conversation updates
    const conversationSubscription = subscribeToConversations(user.id, (updatedConversation) => {
      setConversations(prev => {
        const index = prev.findIndex(c => c.id === updatedConversation.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = updatedConversation;
          return updated;
        } else {
          return [updatedConversation, ...prev];
        }
      });
    });

    // Subscribe to message updates to refresh conversation list
    const messageSubscription = subscribeToMessagesForConversations(user.id, (updatedConversation) => {
      setConversations(prev => {
        const index = prev.findIndex(c => c.id === updatedConversation.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = updatedConversation;
          return updated;
        } else {
          return [updatedConversation, ...prev];
        }
      });
    });

    return () => {
      conversationSubscription.unsubscribe();
      messageSubscription.unsubscribe();
    };
  }, [user?.id]);

  const loadConversations = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await getConversations(user.id);
      if (error) {
        console.error('Error loading conversations:', error);
        return;
      }
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationPress = (conversation: ConversationWithProfiles) => {
    setSelectedConversation(conversation);
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    // Refresh conversations to get updated unread counts
    loadConversations();
  };

  if (selectedConversation) {
    return (
      <TutorChatScreen
        conversation={selectedConversation}
        currentUserId={user?.id || ''}
        onBack={handleBackToConversations}
      />
    );
  }

  // Show skeleton while loading
  if (loading) {
    return <TutorMessagesScreenSkeleton />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ConversationList
        conversations={conversations}
        currentUserId={user?.id || ''}
        onConversationPress={handleConversationPress}
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default TutorMessagesScreen;
