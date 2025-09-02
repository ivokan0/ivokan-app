import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

import Skeleton from './Skeleton';

const StudentSubscriptionDetailsScreenSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Section Skeleton */}
      <View style={styles.headerSection}>
        <View style={styles.tutorInfo}>
          <Skeleton width={80} height={80} borderRadius={40} style={styles.avatar} />
          <View style={styles.tutorDetails}>
            <Skeleton width="70%" height={24} borderRadius={4} style={styles.tutorName} />
            <Skeleton width="50%" height={16} borderRadius={4} style={styles.language} />
            <Skeleton width="40%" height={16} borderRadius={4} />
          </View>
        </View>
      </View>
      
      {/* Subscription Details Skeleton */}
      <View style={styles.detailsSection}>
        <Skeleton width="100%" height={30} borderRadius={4} style={styles.sectionTitle} />
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Skeleton width="100%" height={60} borderRadius={8} />
          </View>
          <View style={styles.detailItem}>
            <Skeleton width="100%" height={60} borderRadius={8} />
          </View>
          <View style={styles.detailItem}>
            <Skeleton width="100%" height={60} borderRadius={8} />
          </View>
          <View style={styles.detailItem}>
            <Skeleton width="100%" height={60} borderRadius={8} />
          </View>
        </View>
      </View>
      
      {/* Progress Section Skeleton */}
      <View style={styles.progressSection}>
        <Skeleton width="100%" height={30} borderRadius={4} style={styles.sectionTitle} />
        <Skeleton width="100%" height={20} borderRadius={10} style={styles.progressBar} />
        <View style={styles.progressStats}>
          <Skeleton width="30%" height={16} borderRadius={4} />
          <Skeleton width="30%" height={16} borderRadius={4} />
        </View>
      </View>
      
      {/* Actions Section Skeleton */}
      <View style={styles.actionsSection}>
        <Skeleton width="100%" height={48} borderRadius={8} style={styles.actionButton} />
        <Skeleton width="100%" height={48} borderRadius={8} />
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
  tutorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    marginBottom: 8,
  },
  tutorDetails: {
    flex: 1,
    gap: 8,
  },
  tutorName: {
    marginBottom: 4,
  },
  language: {
    marginBottom: 4,
  },
  detailsSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    width: '48%',
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  progressBar: {
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionsSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});

export default StudentSubscriptionDetailsScreenSkeleton;
