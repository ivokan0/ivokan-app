import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useTheme } from 'react-native-paper';

import { ConversationWithProfiles } from '../types/database';


interface ConversationListProps {
  conversations: ConversationWithProfiles[];
  currentUserId: string;
  onConversationPress: (conversation: ConversationWithProfiles) => void;
  loading?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentUserId,
  onConversationPress,
  loading = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getOtherUser = (conversation: ConversationWithProfiles) => {
    return conversation.tutor_id === currentUserId 
      ? conversation.student 
      : conversation.tutor;
  };

  const renderConversation = ({ item }: { item: ConversationWithProfiles }) => {
    const otherUser = getOtherUser(item);
    const isUnread = item.unread_count > 0;
    
    // Add safety check for otherUser
    if (!otherUser) {
      return null;
    }
    
    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          { backgroundColor: theme.colors.surface },
          isUnread && { backgroundColor: theme.colors.surfaceVariant }
        ]}
        onPress={() => onConversationPress(item)}
      >
        <View style={styles.avatarContainer}>
          {otherUser.avatar_url ? (
            <Image source={{ uri: otherUser.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.avatarText, { color: theme.colors.onPrimary }]}>
                {otherUser.first_name?.[0]?.toUpperCase() || otherUser.last_name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          {isUnread && (
            <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.unreadText, { color: theme.colors.onPrimary }]}>
                {item.unread_count > 99 ? '99+' : item.unread_count}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.headerRow}>
            <Text 
              style={[
                styles.name,
                { color: theme.colors.onSurface },
                isUnread && { fontFamily: 'Baloo2_600SemiBold' }
              ]}
              numberOfLines={1}
            >
              {otherUser.first_name || ''} {otherUser.last_name || ''}
            </Text>
            <Text style={[styles.time, { color: theme.colors.onSurfaceVariant }]}>
              {formatTime(item.last_message_at)}
            </Text>
          </View>
          
          <View style={styles.messageRow}>
            <Text 
              style={[
                styles.lastMessage,
                { color: theme.colors.onSurfaceVariant },
                isUnread && { color: theme.colors.onSurface, fontFamily: 'Baloo2_500Medium' }
              ]}
              numberOfLines={1}
            >
              {item.last_message || t('student.startConversationShort')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons
          name="message-text-outline"
          size={64}
          color={theme.colors.onSurfaceVariant}
        />
        <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
          {t('student.noConversations')}
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
          {t('student.startConversation')}
        </Text>
        <TouchableOpacity
          style={[styles.findTutorButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Search' as never)}
        >
          <Text style={[styles.findTutorButtonText, { color: theme.colors.onPrimary }]}>
            {t('student.findTutor')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      renderItem={renderConversation}
      keyExtractor={(item, index) => `conversation-${item.id}-${index}`}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontFamily: 'Baloo2_600SemiBold',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    fontSize: 12,
    fontFamily: 'Baloo2_600SemiBold',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Baloo2_500Medium',
    flex: 1,
  },
  time: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Baloo2_600SemiBold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  findTutorButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  findTutorButtonText: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    textAlign: 'center',
  },
});

export default ConversationList;
