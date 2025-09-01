import React from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from 'react-native-paper';

import TutorEarningsBalance from '../../components/TutorEarningsBalance';
import TutorEarningsHistory from '../../components/TutorEarningsHistory';
import { useEarnings } from '../../hooks/useEarnings';

const EarningsScreen: React.FC = () => {
  const theme = useTheme();
  const { summary, earnings, loading, refresh } = useEarnings();

  const onRefresh = async () => {
    await refresh();
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
      <TutorEarningsBalance summary={summary} loading={loading} />

      {/* Revenue History Section */}
      <TutorEarningsHistory earnings={earnings} loading={loading} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default EarningsScreen;
