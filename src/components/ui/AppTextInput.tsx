import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { TextInput } from 'react-native-paper';

type AppTextInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  errorText?: string | null;
  autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
  onBlur?: () => void;
};

export const AppTextInput: React.FC<AppTextInputProps> = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  errorText,
  autoCapitalize = 'none',
  keyboardType,
  onBlur,
}) => {
  return (
    <>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        mode="outlined"
        style={styles.input}
        error={!!errorText}
      />
      {!!errorText && <Text style={styles.error}>{errorText}</Text>}
    </>
  );
};

const styles = StyleSheet.create({
  input: { marginBottom: 8 },
  error: { color: 'red', marginBottom: 8 },
});

export default AppTextInput;


