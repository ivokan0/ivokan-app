import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

import Skeleton from './Skeleton';

const MyResumeScreenSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Resume Items Skeleton */}
        <View style={styles.content}>
          {[1, 2, 3, 4].map((index) => (
            <View key={index} style={styles.resumeItem}>
              <View style={styles.resumeItemHeader}>
                <View style={styles.resumeItemInfo}>
                  <Skeleton width={24} height={24} borderRadius={12} style={styles.resumeItemIcon} />
                  <View style={styles.resumeItemContent}>
                    <Skeleton width="80%" height={20} borderRadius={4} style={styles.resumeItemTitle} />
                    <Skeleton width="60%" height={16} borderRadius={4} style={styles.resumeItemSubtitle} />
                    <Skeleton width="40%" height={14} borderRadius={4} />
                  </View>
                </View>
                <Skeleton width={24} height={24} borderRadius={12} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      
      {/* FAB Skeleton */}
      <View style={styles.fab}>
        <Skeleton width={56} height={56} borderRadius={28} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  resumeItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  resumeItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resumeItemInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  resumeItemIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  resumeItemContent: {
    flex: 1,
    gap: 8,
  },
  resumeItemTitle: {
    marginBottom: 4,
  },
  resumeItemSubtitle: {
    marginBottom: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});

export default MyResumeScreenSkeleton;
