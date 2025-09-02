import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

import Skeleton from './Skeleton';

const SearchScreenSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Language Filter Skeleton */}
      <View style={styles.languageFilter}>
        <Skeleton width="100%" height={60} borderRadius={8} />
      </View>
      
      {/* Tutor Filter Skeleton */}
      <View style={styles.tutorFilter}>
        <Skeleton width="100%" height={80} borderRadius={8} />
      </View>
      
      {/* Tutor Cards Skeleton */}
      <View style={styles.tutorList}>
        {[1, 2, 3, 4, 5].map((index) => (
          <View key={index} style={styles.tutorCard}>
            <View style={styles.tutorCardHeader}>
              <Skeleton width={60} height={60} borderRadius={30} />
              <View style={styles.tutorCardInfo}>
                <Skeleton width="70%" height={20} borderRadius={4} style={styles.tutorName} />
                <Skeleton width="50%" height={16} borderRadius={4} style={styles.tutorLocation} />
                <Skeleton width="40%" height={16} borderRadius={4} />
              </View>
            </View>
            <View style={styles.tutorCardBody}>
              <Skeleton width="100%" height={16} borderRadius={4} style={styles.tutorDescription} />
              <Skeleton width="100%" height={16} borderRadius={4} style={styles.tutorDescription} />
              <Skeleton width="60%" height={16} borderRadius={4} />
            </View>
            <View style={styles.tutorCardFooter}>
              <Skeleton width="30%" height={32} borderRadius={16} />
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
  languageFilter: {
    padding: 16,
    paddingBottom: 8,
  },
  tutorFilter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tutorList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  tutorCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    gap: 12,
  },
  tutorCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tutorCardInfo: {
    flex: 1,
    gap: 8,
  },
  tutorName: {
    marginBottom: 4,
  },
  tutorLocation: {
    marginBottom: 4,
  },
  tutorCardBody: {
    gap: 8,
  },
  tutorDescription: {
    marginBottom: 4,
  },
  tutorCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default SearchScreenSkeleton;
