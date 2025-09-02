import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

import Skeleton from './Skeleton';

const TutorResumeProfileScreenSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scroll}>
        {/* Resume Items Skeleton */}
        <View style={styles.content}>
          {/* Work Experience Section */}
          <View style={styles.section}>
            <Skeleton width="100%" height={24} borderRadius={4} style={styles.sectionTitle} />
            {[1, 2].map((index) => (
              <View key={index} style={styles.itemWrapper}>
                <Skeleton width="100%" height={60} borderRadius={8} style={styles.resumeItem} />
              </View>
            ))}
          </View>
          
          <View style={styles.sectionSeparator} />
          
          {/* Education Section */}
          <View style={styles.section}>
            <Skeleton width="100%" height={24} borderRadius={4} style={styles.sectionTitle} />
            {[1, 2].map((index) => (
              <View key={index} style={styles.itemWrapper}>
                <Skeleton width="100%" height={60} borderRadius={8} style={styles.resumeItem} />
              </View>
            ))}
          </View>
          
          <View style={styles.sectionSeparator} />
          
          {/* Certification Section */}
          <View style={styles.section}>
            <Skeleton width="100%" height={24} borderRadius={4} style={styles.sectionTitle} />
            {[1, 2].map((index) => (
              <View key={index} style={styles.itemWrapper}>
                <Skeleton width="100%" height={60} borderRadius={8} style={styles.resumeItem} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  itemWrapper: {
    paddingVertical: 8,
  },
  resumeItem: {
    marginBottom: 8,
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
});

export default TutorResumeProfileScreenSkeleton;
