import React from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from 'react-native-paper';

import TutorEarningsBalance from '../../components/TutorEarningsBalance';
import TutorStatsSection from '../../components/TutorStatsSection';
import TutorHomeScreenSkeleton from '../../components/ui/TutorHomeScreenSkeleton';
import { useEarnings } from '../../hooks/useEarnings';

const TutorHomeScreen: React.FC = () => {
  const theme = useTheme();
  const { summary, loading: loadingEarnings, refresh } = useEarnings();
  
  const onRefresh = async () => {
    await refresh();
  };

  // Show skeleton while loading
  if (loadingEarnings) {
    return <TutorHomeScreenSkeleton />;
  }
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Earnings Balance Section */}
      <TutorEarningsBalance summary={summary} loading={loadingEarnings} />
      
      {/* Stats Section */}
      <TutorStatsSection />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
});

export default TutorHomeScreen;
