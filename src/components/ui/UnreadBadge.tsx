import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

interface UnreadBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
}

const UnreadBadge: React.FC<UnreadBadgeProps> = ({ count, size = 'medium' }) => {
  const theme = useTheme();

  if (count === 0) {
    return null;
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 16, height: 16, borderRadius: 8 },
          text: { fontSize: 10 }
        };
      case 'large':
        return {
          container: { width: 24, height: 24, borderRadius: 12 },
          text: { fontSize: 14 }
        };
      default: // medium
        return {
          container: { width: 20, height: 20, borderRadius: 10 },
          text: { fontSize: 12 }
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[
      styles.container,
      sizeStyles.container,
      { backgroundColor: theme.colors.error }
    ]}>
      <Text style={[
        styles.text,
        sizeStyles.text,
        { color: theme.colors.onError }
      ]}>
        {count > 99 ? '99+' : count.toString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -5,
    right: -5,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 16,
  },
  text: {
    fontFamily: 'Baloo2_700Bold',
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default UnreadBadge;
