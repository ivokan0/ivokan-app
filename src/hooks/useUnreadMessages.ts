import { useState, useEffect } from 'react';

import { useAuth } from './useAuth';
import { getConversations, subscribeToConversations } from '../services/messaging';
import { ConversationWithProfiles } from '../types/database';

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    let subscription: any;

    const loadUnreadCount = async () => {
      try {
        setLoading(true);
        const { data: conversations, error } = await getConversations(user.id);
        
        if (error) {
          console.error('Error loading conversations for unread count:', error);
          return;
        }

        const totalUnread = conversations?.reduce((total, conversation) => {
          return total + (conversation.unread_count || 0);
        }, 0) || 0;

        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Error calculating unread count:', error);
      } finally {
        setLoading(false);
      }
    };

    const setupSubscription = () => {
      subscription = subscribeToConversations(user.id, (updatedConversation: ConversationWithProfiles) => {
        // Recalculate total unread count when conversations update
        loadUnreadCount();
      });
    };

    loadUnreadCount();
    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user?.id]);

  return { unreadCount, loading };
};
