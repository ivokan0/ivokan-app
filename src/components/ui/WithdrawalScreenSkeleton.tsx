import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

import Skeleton from './Skeleton';

const WithdrawalScreenSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Balance Section Skeleton */}
      <View style={styles.balanceSection}>
        <Skeleton width="100%" height={80} borderRadius={12} style={styles.balanceCard} />
      </View>
      
      {/* Amount Input Skeleton */}
      <View style={styles.inputSection}>
        <Skeleton width="100%" height={56} borderRadius={8} style={styles.amountInput} />
      </View>
      
      {/* Payment Method Selection Skeleton */}
      <View style={styles.paymentSection}>
        <Skeleton width="100%" height={30} borderRadius={4} style={styles.sectionTitle} />
        {[1, 2, 3].map((index) => (
          <View key={index} style={styles.paymentMethodItem}>
            <Skeleton width={24} height={24} borderRadius={12} />
            <Skeleton width="70%" height={20} borderRadius={4} />
            <Skeleton width={24} height={24} borderRadius={12} />
          </View>
        ))}
      </View>
      
      {/* Submit Button Skeleton */}
      <View style={styles.buttonSection}>
        <Skeleton width="100%" height={48} borderRadius={8} />
      </View>
      
      {/* Recent Withdrawals Skeleton */}
      <View style={styles.withdrawalsSection}>
        <Skeleton width="100%" height={30} borderRadius={4} style={styles.sectionTitle} />
        {[1, 2, 3].map((index) => (
          <View key={index} style={styles.withdrawalItem}>
            <View style={styles.withdrawalInfo}>
              <Skeleton width="60%" height={18} borderRadius={4} style={styles.withdrawalTitle} />
              <Skeleton width="40%" height={14} borderRadius={4} style={styles.withdrawalDate} />
            </View>
            <View style={styles.withdrawalAmount}>
              <Skeleton width={80} height={20} borderRadius={4} />
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
  balanceSection: {
    padding: 16,
    paddingBottom: 8,
  },
  balanceCard: {
    marginBottom: 16,
  },
  inputSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  amountInput: {
    marginBottom: 16,
  },
  paymentSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  buttonSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  withdrawalsSection: {
    paddingHorizontal: 16,
    gap: 16,
  },
  withdrawalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  withdrawalInfo: {
    flex: 1,
    gap: 8,
  },
  withdrawalTitle: {
    marginBottom: 4,
  },
  withdrawalDate: {
    marginBottom: 4,
  },
  withdrawalAmount: {
    alignItems: 'flex-end',
  },
});

export default WithdrawalScreenSkeleton;
