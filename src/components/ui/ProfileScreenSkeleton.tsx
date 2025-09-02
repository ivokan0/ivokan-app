import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

import Skeleton from './Skeleton';

const ProfileScreenSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Profile Header Skeleton */}
      <View style={styles.profileHeader}>
        <Skeleton width={80} height={80} borderRadius={40} style={styles.avatar} />
        <View style={styles.profileInfo}>
          <Skeleton width="70%" height={24} borderRadius={4} style={styles.name} />
          <Skeleton width="50%" height={16} borderRadius={4} style={styles.email} />
        </View>
      </View>
      
      {/* Menu Items Skeleton */}
      <View style={styles.menuSection}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
          <View key={index} style={styles.menuRow}>
            <View style={styles.menuRowContent}>
              <Skeleton width={24} height={24} borderRadius={12} style={styles.menuIcon} />
              <Skeleton width="60%" height={20} borderRadius={4} />
            </View>
            <Skeleton width={16} height={16} borderRadius={8} />
          </View>
        ))}
      </View>
      
      {/* Divider */}
      <View style={styles.divider} />
      
      {/* Assistance Section Skeleton */}
      <View style={styles.assistanceSection}>
        <Skeleton width="100%" height={20} borderRadius={4} style={styles.sectionTitle} />
        {[1, 2].map((index) => (
          <View key={index} style={styles.menuRow}>
            <View style={styles.menuRowContent}>
              <Skeleton width={24} height={24} borderRadius={12} style={styles.menuIcon} />
              <Skeleton width="50%" height={20} borderRadius={4} />
            </View>
            <Skeleton width={16} height={16} borderRadius={8} />
          </View>
        ))}
      </View>
      
      {/* Sign Out Button Skeleton */}
      <View style={styles.signOutSection}>
        <Skeleton width="100%" height={48} borderRadius={8} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    padding: 16,
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    marginBottom: 8,
  },
  profileInfo: {
    alignItems: 'center',
    gap: 8,
  },
  name: {
    marginBottom: 4,
  },
  email: {
    marginBottom: 4,
  },
  menuSection: {
    paddingHorizontal: 16,
    gap: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  menuRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIcon: {
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 16,
  },
  assistanceSection: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  signOutSection: {
    padding: 16,
    marginTop: 16,
  },
});

export default ProfileScreenSkeleton;
