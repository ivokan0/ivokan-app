import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import Skeleton from './Skeleton';

const ChatScreenSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.headerInfo}>
          <Skeleton width="60%" height={20} borderRadius={4} style={styles.contactName} />
          <Skeleton width="40%" height={16} borderRadius={4} style={styles.status} />
        </View>
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>
      
      {/* Messages Skeleton */}
      <View style={styles.messagesContainer}>
        {[1, 2, 3, 4, 5].map((index) => (
          <View key={index} style={[
            styles.messageItem,
            index % 2 === 0 ? styles.messageRight : styles.messageLeft
          ]}>
            <Skeleton 
              width={index % 2 === 0 ? "70%" : "60%"} 
              height={index % 2 === 0 ? 60 : 40} 
              borderRadius={16} 
            />
          </View>
        ))}
      </View>
      
      {/* Input Area Skeleton */}
      <View style={styles.inputArea}>
        <Skeleton width="100%" height={48} borderRadius={24} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    gap: 12,
  },
  headerInfo: {
    flex: 1,
    gap: 8,
  },
  contactName: {
    marginBottom: 4,
  },
  status: {
    marginBottom: 4,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  messageItem: {
    marginBottom: 8,
  },
  messageLeft: {
    alignItems: 'flex-start',
  },
  messageRight: {
    alignItems: 'flex-end',
  },
  inputArea: {
    padding: 16,
    paddingBottom: 24,
  },
});

export default ChatScreenSkeleton;
