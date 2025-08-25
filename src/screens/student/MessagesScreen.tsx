import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import ConversationList from '../../components/ConversationList';
import StudentChatScreen from '../../components/StudentChatScreen';
import { ConversationWithProfiles } from '../../types/database';
import { getConversations, subscribeToConversations, subscribeToMessagesForConversations, getConversation } from '../../services/messaging';
import { useRoute, useNavigation } from '@react-navigation/native';

const MessagesScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
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

  // Handle conversationId from navigation params
  useEffect(() => {
    const params = route.params as any;
    if (params?.conversationId && user?.id) {
      loadConversationById(params.conversationId);
    }
  }, [route.params, user?.id]);

  const loadConversationById = async (conversationId: string) => {
    try {
      const { data: conversation, error } = await getConversation(conversationId, user?.id);
      if (error) {
        console.error('Error loading conversation:', error);
        return;
      }
      if (conversation) {
        setSelectedConversation(conversation);
        // Hide the header when conversation is loaded from navigation
        (navigation as any).setOptions({ headerShown: false });
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

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
    // Hide the header when conversation is selected
    (navigation as any).setOptions({ headerShown: false });
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    // Show the header when going back to conversations list
    (navigation as any).setOptions({ headerShown: true });
    // Refresh conversations to get updated unread counts
    loadConversations();
  };

  if (selectedConversation) {
    return (
              <StudentChatScreen
          conversation={selectedConversation}
          currentUserId={user?.id || ''}
          onBack={handleBackToConversations}
        />
    );
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

export default MessagesScreen;
