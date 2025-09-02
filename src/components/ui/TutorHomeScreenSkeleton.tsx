import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import Skeleton from './Skeleton';

const TutorHomeScreenSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Earnings Balance Section Skeleton */}
      <View style={styles.earningsSection}>
        <Skeleton width="100%" height={120} borderRadius={12} style={styles.earningsCard} />
      </View>
      
      {/* Stats Section Skeleton */}
      <View style={styles.statsSection}>
        <Skeleton width="100%" height={80} borderRadius={12} style={styles.statsCard} />
        <View style={styles.statsRow}>
          <Skeleton width="48%" height={80} borderRadius={12} />
          <Skeleton width="48%" height={80} borderRadius={12} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  earningsSection: {
    marginBottom: 24,
  },
  earningsCard: {
    marginBottom: 16,
  },
  statsSection: {
    gap: 16,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default TutorHomeScreenSkeleton;
