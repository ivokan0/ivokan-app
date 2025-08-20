import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { translateSupabaseError } from '../../utils/i18nErrors';
import AppButton from '../../components/ui/AppButton';
import AppTextInput from '../../components/ui/AppTextInput';

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: undefined,
    });
    if (err) setError(translateSupabaseError(err, t));
    else Alert.alert(t('alerts.resetEmailSentTitle'), t('alerts.resetEmailSentBody'));
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.forgot.title')}</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <AppTextInput label={t('auth.login.email')} value={email} onChangeText={setEmail} />
      <AppButton label={loading ? t('common.loading') : t('auth.forgot.send')} onPress={onSubmit} loading={loading} />
      <View style={{ height: 24 }} />
      <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
        <Text style={styles.link}>{t('auth.forgot.back')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, fontFamily: 'Baloo2_600SemiBold' },
  error: { marginBottom: 8 },
  link: { color: '#f05728', fontWeight: '600', textAlign: 'center' },
});

export default ForgotPasswordScreen;


