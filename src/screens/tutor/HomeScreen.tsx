import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import TutorStatsSection from '../../components/TutorStatsSection';

const TutorHomeScreen: React.FC = () => {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TutorStatsSection />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
});

export default TutorHomeScreen;
