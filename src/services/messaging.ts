import { supabase } from './supabase';
import {
  Conversation,
  Message,
  ConversationWithProfiles,
  MessageWithProfiles,
  CreateConversationData,
  CreateMessageData,
  UpdateMessageData,
  ApiResponse,
  PaginatedResponse,
} from '../types/database';

// Conversations
export const getConversations = async (userId: string): Promise<ApiResponse<ConversationWithProfiles[]>> => {
  try {
    // Application-level authorization: only get conversations where user is a participant
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`tutor_id.eq.${userId},student_id.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsLast: true });

    if (error) throw error;

    if (!conversations || conversations.length === 0) {
      return { data: [], error: null };
    }

    // Get all unique user IDs
    const userIds = [...new Set([
      ...conversations.map(c => c.tutor_id),
      ...conversations.map(c => c.student_id)
    ])];

    // Fetch all profiles at once
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', userIds);

    if (profilesError) throw profilesError;

    // Create a map of user_id to profile
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    // Get messages for all conversations
    const conversationIds = conversations.map(c => c.id);
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .in('conversation_id', conversationIds);

    if (messagesError) throw messagesError;

    // Group messages by conversation
    const messagesByConversation = new Map<string, Message[]>();
    messages?.forEach(msg => {
      const convId = msg.conversation_id;
      if (!messagesByConversation.has(convId)) {
        messagesByConversation.set(convId, []);
      }
      messagesByConversation.get(convId)?.push(msg);
    });

    // Remove duplicates by conversation ID
    const uniqueConversations = conversations.filter((conv, index, self) => 
      index === self.findIndex(c => c.id === conv.id)
    );

    // Process conversations to add profiles, messages, and unread count
    const conversationsWithUnread = uniqueConversations.map(conv => {
      const tutorProfile = profileMap.get(conv.tutor_id) || { 
        user_id: conv.tutor_id, 
        first_name: 'Unknown', 
        last_name: 'User',
        avatar_url: null 
      };
      
      const studentProfile = profileMap.get(conv.student_id) || { 
        user_id: conv.student_id, 
        first_name: 'Unknown', 
        last_name: 'User',
        avatar_url: null 
      };

      const conversationMessages = messagesByConversation.get(conv.id) || [];
      
      // Remove duplicate messages
      const uniqueMessages = conversationMessages.filter((msg, index, self) => 
        index === self.findIndex(m => m.id === msg.id)
      );
      
      const unreadCount = uniqueMessages.filter(
        (msg: Message) => msg.receiver_id === userId && !msg.read_at
      ).length || 0;
      
      return {
        ...conv,
        tutor: tutorProfile,
        student: studentProfile,
        messages: uniqueMessages,
        unread_count: unreadCount,
      };
    });

    return { data: conversationsWithUnread, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getConversation = async (conversationId: string, currentUserId?: string): Promise<ApiResponse<ConversationWithProfiles>> => {
  try {
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) throw error;

    if (!conversation) {
      return { data: null, error: new Error('Conversation not found') };
    }

    // Fetch tutor and student profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', [conversation.tutor_id, conversation.student_id]);

    if (profilesError) throw profilesError;

    // Create profile map
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    // Fetch messages for this conversation
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    const tutorProfile = profileMap.get(conversation.tutor_id) || { 
      user_id: conversation.tutor_id, 
      first_name: 'Unknown', 
      last_name: 'User',
      avatar_url: null 
    };
    
    const studentProfile = profileMap.get(conversation.student_id) || { 
      user_id: conversation.student_id, 
      first_name: 'Unknown', 
      last_name: 'User',
      avatar_url: null 
    };

    // Calculate unread count for the current user
    const unreadCount = currentUserId ? messages?.filter(
      (msg: Message) => msg.receiver_id === currentUserId && !msg.read_at
    ).length || 0 : 0;

    const conversationWithProfiles = {
      ...conversation,
      tutor: tutorProfile,
      student: studentProfile,
      messages: messages || [],
      unread_count: unreadCount,
    };

    return { data: conversationWithProfiles, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const createConversation = async (conversationData: CreateConversationData, currentUserId?: string): Promise<ApiResponse<Conversation>> => {
  try {
    // Application-level authorization check
    if (currentUserId && currentUserId !== conversationData.tutor_id && currentUserId !== conversationData.student_id) {
      return { data: null, error: new Error('User must be a participant in the conversation') };
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert(conversationData)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getOrCreateConversation = async (tutorId: string, studentId: string, currentUserId?: string): Promise<ApiResponse<Conversation>> => {
  try {
    // Application-level authorization check
    if (currentUserId && currentUserId !== tutorId && currentUserId !== studentId) {
      return { data: null, error: new Error('User must be a participant in the conversation') };
    }

    // Try to find existing conversation (check both directions)
    const { data: existing, error: findError } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(tutor_id.eq.${tutorId},student_id.eq.${studentId}),and(tutor_id.eq.${studentId},student_id.eq.${tutorId})`)
      .maybeSingle();

    if (existing) {
      return { data: existing, error: null };
    }

    // Create new conversation if not found
    return await createConversation({ tutor_id: tutorId, student_id: studentId }, currentUserId);
  } catch (error) {
    return { data: null, error };
  }
};

// Messages
export const getMessages = async (
  conversationId: string,
  page: number = 1,
  pageSize: number = 50
): Promise<ApiResponse<PaginatedResponse<MessageWithProfiles>>> => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!fk_message_sender(*),
        receiver:profiles!fk_message_receiver(*)
      `, { count: 'exact' })
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    return {
      data: {
        data: data || [],
        count: count || 0,
        page,
        pageSize,
        totalPages,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
};

export const sendMessage = async (messageData: CreateMessageData, currentUserId?: string): Promise<ApiResponse<Message>> => {
  try {
    // Application-level authorization: verify user is the sender
    if (currentUserId && currentUserId !== messageData.sender_id) {
      return { data: null, error: new Error('User can only send messages as themselves') };
    }

    // Verify user is a participant in the conversation
    if (currentUserId) {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('tutor_id, student_id')
        .eq('id', messageData.conversation_id)
        .single();

      if (!conversation || (conversation.tutor_id !== currentUserId && conversation.student_id !== currentUserId)) {
        return { data: null, error: new Error('User must be a participant in the conversation') };
      }
    }

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;

    // Note: The database trigger will automatically update conversation's last_message and last_message_at
    // No need to manually update here anymore

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const markMessageAsRead = async (messageId: string): Promise<ApiResponse<Message>> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const markConversationAsRead = async (conversationId: string, userId: string): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
      .is('read_at', null);

    if (error) throw error;

    return { data: null, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Real-time subscriptions
export const subscribeToMessages = (
  conversationId: string,
  callback: (message: MessageWithProfiles) => void
) => {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        // Fetch the complete message with profiles
        const { data: messageWithProfiles } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!fk_message_sender(*),
            receiver:profiles!fk_message_receiver(*)
          `)
          .eq('id', payload.new.id)
          .single();
        
        if (messageWithProfiles) {
          callback(messageWithProfiles as MessageWithProfiles);
        }
      }
    )
    .subscribe();
};

// Subscribe to messages to update conversation lists
export const subscribeToMessagesForConversations = (
  userId: string,
  callback: (conversation: ConversationWithProfiles) => void
) => {
  return supabase
    .channel(`messages-for-conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      },
      async (payload) => {
        // When a new message arrives, fetch the updated conversation
        const { data: conversationWithProfiles } = await getConversation(payload.new.conversation_id, userId);
        if (conversationWithProfiles) {
          callback(conversationWithProfiles);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${userId}`,
      },
      async (payload) => {
        // When we send a message, also update the conversation list
        const { data: conversationWithProfiles } = await getConversation(payload.new.conversation_id, userId);
        if (conversationWithProfiles) {
          callback(conversationWithProfiles);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      },
      async (payload) => {
        // When a message is marked as read, update the conversation list
        const { data: conversationWithProfiles } = await getConversation(payload.new.conversation_id, userId);
        if (conversationWithProfiles) {
          callback(conversationWithProfiles);
        }
      }
    )
    .subscribe();
};

// Find or create a conversation between a tutor and a student
export const findOrCreateConversation = async (
  tutorId: string,
  studentId: string
): Promise<ApiResponse<ConversationWithProfiles>> => {
  try {
    // First, try to find an existing conversation
    const { data: existingConversation, error: findError } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(tutor_id.eq.${tutorId},student_id.eq.${studentId}),and(tutor_id.eq.${studentId},student_id.eq.${tutorId})`)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned", which is expected if no conversation exists
      throw findError;
    }

    if (existingConversation) {
      // Return the existing conversation with full details
      return await getConversation(existingConversation.id, tutorId);
    }

    // Create a new conversation
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        tutor_id: tutorId,
        student_id: studentId,
      })
      .select()
      .single();

    if (createError) throw createError;

    // Return the new conversation with full details
    return await getConversation(newConversation.id, tutorId);
  } catch (error) {
    console.error('Error finding or creating conversation:', error);
    return { data: null, error };
  }
};

export const subscribeToConversations = (
  userId: string,
  callback: (conversation: ConversationWithProfiles) => void
) => {
  return supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `tutor_id=eq.${userId}`,
      },
      async (payload) => {
        // Fetch the complete conversation with profiles and messages
        const { data: conversationWithProfiles } = await getConversation(payload.new.id, userId);
        if (conversationWithProfiles) {
          callback(conversationWithProfiles);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `student_id=eq.${userId}`,
      },
      async (payload) => {
        // Fetch the complete conversation with profiles and messages
        const { data: conversationWithProfiles } = await getConversation(payload.new.id, userId);
        if (conversationWithProfiles) {
          callback(conversationWithProfiles);
        }
      }
    )
    .subscribe();
};
