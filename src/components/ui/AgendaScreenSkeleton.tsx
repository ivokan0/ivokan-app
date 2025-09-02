import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

import Skeleton from './Skeleton';

const AgendaScreenSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Tabs Skeleton */}
      <View style={styles.tabsContainer}>
        {[1, 2, 3, 4].map((index) => (
          <Skeleton key={index} width="22%" height={40} borderRadius={20} />
        ))}
      </View>
      
      {/* Create Booking Button Skeleton */}
      <View style={styles.createButtonContainer}>
        <Skeleton width="100%" height={48} borderRadius={8} />
      </View>
      
      {/* Bookings List Skeleton */}
      <View style={styles.bookingsList}>
        {[1, 2, 3, 4].map((index) => (
          <View key={index} style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <Skeleton width={50} height={50} borderRadius={25} />
              <View style={styles.bookingInfo}>
                <Skeleton width="70%" height={18} borderRadius={4} style={styles.studentName} />
                <Skeleton width="50%" height={14} borderRadius={4} style={styles.lessonType} />
                <Skeleton width="40%" height={14} borderRadius={4} />
              </View>
              <View style={styles.bookingMeta}>
                <Skeleton width={60} height={14} borderRadius={4} style={styles.date} />
                <Skeleton width={50} height={14} borderRadius={4} />
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
  createButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  studentName: {
    marginBottom: 4,
  },
  lessonType: {
    marginBottom: 4,
  },
  bookingMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  date: {
    marginBottom: 4,
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});

export default AgendaScreenSkeleton;
