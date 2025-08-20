import React from 'react';
import { ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

type AppButtonProps = {
  label: string;
  onPress: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  mode?: 'contained' | 'outlined' | 'text';
  icon?: string;
};

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  loading,
  disabled,
  style,
  mode = 'contained',
  icon,
}) => {
  const theme = useTheme();
  const indicatorColor = mode === 'contained' ? theme.colors.onPrimary : theme.colors.primary;
  return (
    <Button
      mode={mode}
      icon={icon}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, style]}
      contentStyle={styles.content}
    >
      {loading ? <ActivityIndicator color={indicatorColor} /> : label}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: { borderRadius: 8 },
  content: { paddingVertical: 6 },
});

export default AppButton;


