import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

import Skeleton from './Skeleton';

const ScheduleScreenSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Tabs Skeleton */}
      <View style={styles.tabsContainer}>
        {[1, 2, 3].map((index) => (
          <Skeleton key={index} width="30%" height={40} borderRadius={20} />
        ))}
      </View>
      
      {/* Booking Cards Skeleton */}
      <View style={styles.bookingsList}>
        {[1, 2, 3, 4].map((index) => (
          <View key={index} style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <Skeleton width={50} height={50} borderRadius={25} />
              <View style={styles.bookingInfo}>
                <Skeleton width="70%" height={20} borderRadius={4} style={styles.tutorName} />
                <Skeleton width="50%" height={16} borderRadius={4} style={styles.language} />
                <Skeleton width="40%" height={16} borderRadius={4} />
              </View>
              <View style={styles.bookingStatus}>
                <Skeleton width={60} height={24} borderRadius={12} />
              </View>
            </View>
            <View style={styles.bookingDetails}>
              <View style={styles.detailRow}>
                <Skeleton width={20} height={20} borderRadius={10} />
                <Skeleton width="60%" height={16} borderRadius={4} />
              </View>
              <View style={styles.detailRow}>
                <Skeleton width={20} height={20} borderRadius={10} />
                <Skeleton width="40%" height={16} borderRadius={4} />
              </View>
            </View>
            <View style={styles.bookingActions}>
              <Skeleton width="30%" height={36} borderRadius={18} />
              <Skeleton width="30%" height={36} borderRadius={18} />
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
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  bookingsList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  bookingCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    gap: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookingInfo: {
    flex: 1,
    gap: 8,
  },
  tutorName: {
    marginBottom: 4,
  },
  language: {
    marginBottom: 4,
  },
  bookingStatus: {
    alignItems: 'flex-end',
  },
  bookingDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});

export default ScheduleScreenSkeleton;
