import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

import Skeleton from './Skeleton';

const PaymentMethodsScreenSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Section Skeleton */}
      <View style={styles.header}>
        <Skeleton width="100%" height={60} borderRadius={12} style={styles.headerCard} />
      </View>
      
      {/* Add Button Skeleton */}
      <View style={styles.addButtonSection}>
        <Skeleton width="100%" height={48} borderRadius={8} />
      </View>
      
      {/* Payment Methods List Skeleton */}
      <View style={styles.paymentMethodsSection}>
        {[1, 2, 3].map((index) => (
          <View key={index} style={styles.paymentMethodItem}>
            <View style={styles.paymentMethodHeader}>
              <Skeleton width={40} height={40} borderRadius={20} />
              <View style={styles.paymentMethodInfo}>
                <Skeleton width="70%" height={20} borderRadius={4} style={styles.paymentMethodName} />
                <Skeleton width="50%" height={16} borderRadius={4} style={styles.paymentMethodNumber} />
              </View>
              <Skeleton width={24} height={24} borderRadius={12} />
            </View>
            <View style={styles.divider} />
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
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerCard: {
    marginBottom: 16,
  },
  addButtonSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  paymentMethodsSection: {
    paddingHorizontal: 16,
    gap: 8,
  },
  paymentMethodItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentMethodInfo: {
    flex: 1,
    gap: 8,
  },
  paymentMethodName: {
    marginBottom: 4,
  },
  paymentMethodNumber: {
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginTop: 16,
  },
});

export default PaymentMethodsScreenSkeleton;
