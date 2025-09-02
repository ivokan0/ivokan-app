import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

import Skeleton from './Skeleton';

const EarningsScreenSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Balance Section Skeleton */}
      <View style={styles.balanceSection}>
        <Skeleton width="100%" height={120} borderRadius={12} style={styles.balanceCard} />
      </View>
      
      {/* History Section Skeleton */}
      <View style={styles.historySection}>
        <Skeleton width="100%" height={40} borderRadius={8} style={styles.sectionTitle} />
        
        {/* History Items */}
        {[1, 2, 3, 4, 5].map((index) => (
          <View key={index} style={styles.historyItem}>
            <View style={styles.historyHeader}>
              <Skeleton width={40} height={40} borderRadius={20} />
              <View style={styles.historyInfo}>
                <Skeleton width="60%" height={18} borderRadius={4} style={styles.historyTitle} />
                <Skeleton width="40%" height={14} borderRadius={4} style={styles.historyDate} />
              </View>
              <View style={styles.historyAmount}>
                <Skeleton width={80} height={20} borderRadius={4} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  balanceSection: {
    padding: 16,
    paddingBottom: 8,
  },
  balanceCard: {
    marginBottom: 16,
  },
  historySection: {
    paddingHorizontal: 16,
    gap: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyInfo: {
    flex: 1,
    gap: 8,
  },
  historyTitle: {
    marginBottom: 4,
  },
  historyDate: {
    marginBottom: 4,
  },
  historyAmount: {
    alignItems: 'flex-end',
  },
});

export default EarningsScreenSkeleton;
