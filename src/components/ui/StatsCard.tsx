import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  const theme = useTheme();
  const cardColor = color || theme.colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.iconContainer, { backgroundColor: cardColor + '20' }]}>
        <MaterialCommunityIcons 
          name={icon as keyof typeof MaterialCommunityIcons.glyphMap} 
          size={24} 
          color={cardColor} 
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.value, { color: theme.colors.onSurface }]}>
          {value}
        </Text>
        <Text style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>
          {title}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 24,
    fontFamily: 'Baloo2_700Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontFamily: 'Baloo2_500Medium',
    fontWeight: '500',
  },
});

export default StatsCard;
