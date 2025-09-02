import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

import Skeleton from './Skeleton';

const MessagesScreenSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Conversation List Skeleton */}
      <View style={styles.conversationList}>
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <View key={index} style={styles.conversationItem}>
            <View style={styles.conversationHeader}>
              <Skeleton width={50} height={50} borderRadius={25} />
              <View style={styles.conversationInfo}>
                <Skeleton width="60%" height={18} borderRadius={4} style={styles.conversationName} />
                <Skeleton width="80%" height={14} borderRadius={4} style={styles.lastMessage} />
              </View>
              <View style={styles.conversationMeta}>
                <Skeleton width={40} height={14} borderRadius={4} style={styles.timestamp} />
                <Skeleton width={20} height={20} borderRadius={10} style={styles.unreadBadge} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  conversationList: {
    padding: 16,
    gap: 16,
  },
  conversationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  conversationInfo: {
    flex: 1,
    gap: 8,
  },
  conversationName: {
    marginBottom: 4,
  },
  lastMessage: {
    marginBottom: 4,
  },
  conversationMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  timestamp: {
    marginBottom: 4,
  },
  unreadBadge: {
    marginBottom: 4,
  },
});

export default MessagesScreenSkeleton;
