import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

import Skeleton from './Skeleton';

const TutorScheduleScreenSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Calendar Header Skeleton */}
      <View style={styles.calendarHeader}>
        <Skeleton width="100%" height={60} borderRadius={8} />
      </View>
      
      {/* Week View Skeleton */}
      <View style={styles.weekView}>
        {[1, 2, 3, 4, 5, 6, 7].map((index) => (
          <View key={index} style={styles.dayColumn}>
            <Skeleton width="100%" height={20} borderRadius={4} style={styles.dayLabel} />
            <Skeleton width="100%" height={16} borderRadius={4} style={styles.dateLabel} />
            <View style={styles.timeSlots}>
              {[1, 2, 3, 4].map((slotIndex) => (
                <Skeleton key={slotIndex} width="100%" height={12} borderRadius={2} style={styles.timeSlot} />
              ))}
            </View>
          </View>
        ))}
      </View>
      
      {/* Today's Bookings Skeleton */}
      <View style={styles.todayBookings}>
        <Skeleton width="100%" height={30} borderRadius={4} style={styles.sectionTitle} />
        {[1, 2, 3].map((index) => (
          <View key={index} style={styles.bookingItem}>
            <View style={styles.bookingTime}>
              <Skeleton width={60} height={16} borderRadius={4} />
            </View>
            <View style={styles.bookingDetails}>
              <Skeleton width="70%" height={18} borderRadius={4} style={styles.studentName} />
              <Skeleton width="50%" height={14} borderRadius={4} style={styles.lessonType} />
            </View>
            <View style={styles.bookingStatus}>
              <Skeleton width={50} height={24} borderRadius={12} />
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
  calendarHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  weekView: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    marginBottom: 4,
  },
  dateLabel: {
    marginBottom: 8,
  },
  timeSlots: {
    gap: 4,
    width: '100%',
  },
  timeSlot: {
    marginBottom: 2,
  },
  todayBookings: {
    paddingHorizontal: 16,
    gap: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  bookingTime: {
    width: 60,
  },
  bookingDetails: {
    flex: 1,
    gap: 8,
  },
  studentName: {
    marginBottom: 4,
  },
  lessonType: {
    marginBottom: 4,
  },
  bookingStatus: {
    alignItems: 'flex-end',
  },
});

export default TutorScheduleScreenSkeleton;
