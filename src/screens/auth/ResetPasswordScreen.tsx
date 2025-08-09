import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';

const ResetPasswordScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) setError(err.message);
    else Alert.alert('Password updated');
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.reset.title')}</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        placeholder={t('auth.reset.newPassword')}
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title={loading ? t('common.loading') : t('auth.reset.update')} onPress={onSubmit} disabled={loading} />
      <View style={{ height: 24 }} />
      <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
        <Text style={styles.link}>{t('auth.reset.back')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  error: { color: 'red', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  link: { color: '#2563eb', fontWeight: '600', textAlign: 'center' },
});

export default ResetPasswordScreen;


