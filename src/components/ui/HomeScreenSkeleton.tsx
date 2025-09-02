import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import Skeleton from './Skeleton';

const HomeScreenSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Title skeleton */}
      <Skeleton width="60%" height={32} borderRadius={8} style={styles.title} />
      
      {/* Welcome text skeleton */}
      <Skeleton width="80%" height={20} borderRadius={4} style={styles.welcomeText} />
      
      {/* Spacer */}
      <View style={styles.spacer} />
      
      {/* Button skeleton */}
      <Skeleton width="100%" height={48} borderRadius={8} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 16,
  },
  welcomeText: {
    marginBottom: 16,
  },
  spacer: {
    height: 12,
  },
});

export default HomeScreenSkeleton;
