import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { MessageWithProfiles, ConversationWithProfiles } from '../types/database';
import { sendMessage, markConversationAsRead, subscribeToMessages } from '../services/messaging';
import TutorProfileModal from './TutorProfileModal';

interface StudentChatScreenProps {
  conversation: ConversationWithProfiles;
  currentUserId: string;
  onBack: () => void;
  onBook?: () => void;
}

const StudentChatScreen: React.FC<StudentChatScreenProps> = ({
  conversation,
  currentUserId,
  onBack,
  onBook,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<MessageWithProfiles[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTutorProfile, setShowTutorProfile] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // For students, the other user is always the tutor
  const tutor = conversation.tutor;

  // Safety check for tutor
  if (!tutor) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Error: Unable to load tutor information
        </Text>
      </View>
    );
  }

  useEffect(() => {
    // Load initial messages and convert to MessageWithProfiles
    const messagesWithProfiles: MessageWithProfiles[] = (conversation.messages || []).map(message => ({
      ...message,
      sender: message.sender_id === conversation.tutor_id ? conversation.tutor : conversation.student,
      receiver: message.receiver_id === conversation.tutor_id ? conversation.tutor : conversation.student,
    }));
    
    setMessages(messagesWithProfiles);
    setLoading(false);

    // Mark conversation as read
    markConversationAsRead(conversation.id, currentUserId);

    // Subscribe to new messages
    const subscription = subscribeToMessages(conversation.id, (newMessage) => {
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const existingIndex = prev.findIndex(msg => msg.id === newMessage.id);
        if (existingIndex >= 0) {
          return prev; // Message already exists, don't add duplicate
        }
        return [...prev, newMessage];
      });
      
      // Mark as read if we're the receiver
      if (newMessage.receiver_id === currentUserId) {
        markConversationAsRead(conversation.id, currentUserId);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [conversation.id, currentUserId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const messageData = {
        conversation_id: conversation.id,
        sender_id: currentUserId,
        receiver_id: tutor.user_id,
        content: newMessage.trim(),
      };

      const { data, error } = await sendMessage(messageData, currentUserId);
      
      if (error) {
        console.error('Error sending message:', error);
        return;
      }

      if (data) {
        // Add the new message to the list
        const newMessageWithProfiles: MessageWithProfiles = {
          ...data,
          sender: conversation.student, // Student is always the sender
          receiver: tutor,
        };
        
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const existingIndex = prev.findIndex(msg => msg.id === data.id);
          if (existingIndex >= 0) {
            return prev; // Message already exists, don't add duplicate
          }
          return [...prev, newMessageWithProfiles];
        });
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: MessageWithProfiles }) => {
    const isOwnMessage = item.sender_id === currentUserId;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          {
            backgroundColor: isOwnMessage ? theme.colors.primary : theme.colors.surfaceVariant,
          }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isOwnMessage ? theme.colors.onPrimary : theme.colors.onSurface }
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            { color: isOwnMessage ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }
          ]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header with clickable tutor name and book button */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: theme.colors.surface,
          paddingTop: insets.top,
        }
      ]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerCenter} onPress={() => setShowTutorProfile(true)}>
          <Text style={[styles.headerName, { color: theme.colors.onSurface }]}>
            {tutor.first_name} {tutor.last_name}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bookButton} onPress={onBook}>
          <Text style={[styles.bookButtonText, { color: theme.colors.primary }]}>
            {t('student.book')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => `message-${item.id}-${index}`}
        style={styles.messagesList}
        contentContainerStyle={[
          styles.messagesContent,
          messages.length === 0 && styles.emptyMessagesContent
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons
              name="message-text-outline"
              size={64}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={[styles.emptyStateTitle, { color: theme.colors.onSurface }]}>
              {t('student.startConversationTitle')}
            </Text>
            <Text style={[styles.emptyStateSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              {t('student.startConversationSubtitle')}
            </Text>
          </View>
        }
      />

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
        <TextInput
          style={[
            styles.textInput,
            { 
              backgroundColor: theme.colors.surfaceVariant,
              color: theme.colors.onSurface,
              borderColor: theme.colors.outline,
            }
          ]}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder={t('student.typeMessage')}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { 
              backgroundColor: newMessage.trim() ? theme.colors.primary : theme.colors.surfaceVariant,
            }
          ]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={theme.colors.onPrimary} />
          ) : (
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={newMessage.trim() ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Tutor Profile Modal */}
      <TutorProfileModal
        visible={showTutorProfile}
        onClose={() => setShowTutorProfile(false)}
        conversation={conversation}
        currentUserId={currentUserId}
        onBookTrial={() => {
          setShowTutorProfile(false);
          // TODO: Implement book trial lesson functionality
        }}
        onOpenProfile={() => {
          setShowTutorProfile(false);
          // Navigate to tutor profile screen
          (navigation as any).navigate('TutorProfile', { 
            tutor: {
              ...tutor,
              id: tutor.user_id,
              user_id: tutor.user_id,
              profile_type: tutor.profile_type,
            }
          });
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  bookButton: {
    padding: 4,
  },
  bookButtonText: {
    fontSize: 16,
    fontFamily: 'Baloo2_500Medium',
    textDecorationLine: 'underline',
  },
  headerName: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyMessagesContent: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Baloo2_600SemiBold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  messageContainer: {
    marginVertical: 4,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StudentChatScreen;
