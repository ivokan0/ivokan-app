import React from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import TutorEarningsBalance from '../../components/TutorEarningsBalance';
import WithdrawalHistory from '../../components/WithdrawalHistory';
import { useEarnings } from '../../hooks/useEarnings';
import { useWithdrawals } from '../../hooks/useWithdrawals';

const EarningsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { summary, earnings, loading, refresh } = useEarnings();
  const { withdrawals, withdrawalsWithDetails, summary: withdrawalSummary, loading: withdrawalsLoading, refresh: refreshWithdrawals } = useWithdrawals();

  const onRefresh = async () => {
    await Promise.all([refresh(), refreshWithdrawals()]);
  };

  const handleWithdrawPress = () => {
    navigation.navigate('Withdrawal' as never);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Balance Section */}
      <TutorEarningsBalance 
        summary={summary} 
        withdrawalSummary={withdrawalSummary}
        loading={loading || withdrawalsLoading} 
        onWithdrawPress={handleWithdrawPress}
      />

      {/* History Section with Tabs */}
      <WithdrawalHistory 
        earnings={earnings} 
        withdrawals={withdrawalsWithDetails}
        loading={loading || withdrawalsLoading} 
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default EarningsScreen;
