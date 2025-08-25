# Messaging Feature Implementation

## Overview

The messaging feature allows students and tutors to communicate directly through the Ivokan app. It includes real-time messaging, conversation management, and unread message indicators.

## Database Schema

The messaging system uses two main tables:

### Conversations Table
- `id`: UUID primary key
- `tutor_id`: Reference to tutor's user_id
- `student_id`: Reference to student's user_id
- `last_message`: Content of the last message
- `last_message_at`: Timestamp of the last message
- `created_at`: Conversation creation timestamp
- `updated_at`: Last update timestamp

### Messages Table
- `id`: UUID primary key
- `conversation_id`: Reference to conversation
- `sender_id`: User ID of message sender
- `receiver_id`: User ID of message receiver
- `content`: Message content
- `read_at`: Timestamp when message was read
- `created_at`: Message creation timestamp

## Key Features

### 1. Conversation Management
- Students can start conversations with tutors from tutor profiles
- Conversations are automatically created when needed
- Real-time updates when new messages arrive

### 2. Real-time Messaging
- Messages are sent and received in real-time using Supabase subscriptions
- Messages are automatically marked as read when viewed
- Support for message timestamps and read status

### 3. UI Components

#### ConversationList Component
- Displays all conversations for a user
- Shows unread message indicators
- Displays last message preview and timestamp
- Handles empty state with helpful messaging

#### ChatScreen Component
- Full-screen chat interface
- Real-time message updates
- Message input with send functionality
- Keyboard-aware layout
- Message bubbles with timestamps

### 4. Navigation Integration
- Messages tab in both student and tutor navigation
- Direct navigation to chat from tutor profiles
- Proper back navigation and state management

## Implementation Details

### Services (`src/services/messaging.ts`)
- `getConversations()`: Fetch user's conversations
- `getOrCreateConversation()`: Find or create conversation between users
- `sendMessage()`: Send a new message
- `markConversationAsRead()`: Mark all messages in conversation as read
- `subscribeToMessages()`: Real-time subscription for new messages
- `subscribeToConversations()`: Real-time subscription for conversation updates

### Components
- `ConversationList`: Main conversation list view
- `ChatScreen`: Individual chat interface
- Integration with existing `BottomActionBar` for tutor profiles

### Navigation
- Added `Chat` screen to navigation stack
- Updated tutor profile to navigate to chat
- Proper screen transitions and state management

## Usage

### For Students
1. Browse tutors in the search screen
2. Tap on a tutor profile
3. Tap the message icon in the bottom action bar
4. Start chatting with the tutor

### For Tutors
1. Access the Messages tab in the bottom navigation
2. View all conversations with students
3. Tap on a conversation to open the chat
4. Respond to student messages

## Technical Notes

- Uses Supabase Row Level Security (RLS) for data protection
- Real-time subscriptions for live updates
- Proper error handling and loading states
- Internationalization support for all text
- Consistent with app's design system and Baloo2 font
- Follows minimalist UI principles (no popups, separate pages)

## Security

- RLS policies ensure users can only access their own conversations
- Message content is validated and sanitized
- User authentication required for all messaging operations

## Future Enhancements

- Message attachments (images, files)
- Typing indicators
- Message reactions
- Push notifications
- Message search functionality
- Conversation archiving
