import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

import Skeleton from './Skeleton';

const TutorSubscriptionsScreenSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Section Skeleton */}
      <View style={styles.headerSection}>
        <Skeleton width="100%" height={60} borderRadius={8} style={styles.headerCard} />
      </View>
      
      {/* Subscription Cards Skeleton */}
      <View style={styles.subscriptionsList}>
        {[1, 2, 3, 4].map((index) => (
          <View key={index} style={styles.subscriptionCard}>
            <View style={styles.cardHeader}>
              <Skeleton width={50} height={50} borderRadius={25} />
              <View style={styles.cardInfo}>
                <Skeleton width="70%" height={20} borderRadius={4} style={styles.studentName} />
                <Skeleton width="50%" height={16} borderRadius={4} style={styles.language} />
                <Skeleton width="40%" height={16} borderRadius={4} />
              </View>
              <View style={styles.cardStatus}>
                <Skeleton width={60} height={24} borderRadius={12} />
              </View>
            </View>
            <View style={styles.cardBody}>
              <Skeleton width="100%" height={16} borderRadius={4} style={styles.description} />
              <Skeleton width="100%" height={16} borderRadius={4} style={styles.description} />
            </View>
            <View style={styles.cardFooter}>
              <Skeleton width="30%" height={16} borderRadius={4} />
              <Skeleton width="20%" height={16} borderRadius={4} />
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
  headerSection: {
    padding: 16,
    paddingBottom: 8,
  },
  headerCard: {
    marginBottom: 16,
  },
  subscriptionsList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  subscriptionCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardInfo: {
    flex: 1,
    gap: 8,
  },
  studentName: {
    marginBottom: 4,
  },
  language: {
    marginBottom: 4,
  },
  cardStatus: {
    alignItems: 'flex-end',
  },
  cardBody: {
    gap: 8,
  },
  description: {
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default TutorSubscriptionsScreenSkeleton;
