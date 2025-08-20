import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { translateSupabaseError } from '../../utils/i18nErrors';
import AppTextInput from '../../components/ui/AppTextInput';
import AppButton from '../../components/ui/AppButton';

const SignupScreen: React.FC = () => {
  const { signUp } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    const { error: err, needsEmailConfirmation } = await signUp({ email, password });
    if (err) setError(translateSupabaseError(err, t));
    if (!err && needsEmailConfirmation) {
      Alert.alert(t('alerts.checkEmailTitle'), t('alerts.checkEmailBody'));
      // After sign up, go to home flow when email is confirmed by user on next login
      navigation.navigate('Login' as never);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.signup.title')}</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <AppTextInput
        label={t('auth.login.email')}
        value={email}
        onChangeText={setEmail}
        onBlur={() => setTouched((s) => ({ ...s, email: true }))}
        keyboardType="email-address"
        errorText={touched.email && !email ? t('validation.required', { field: t('auth.login.email') }) : null}
      />
      <AppTextInput
        label={t('auth.login.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        onBlur={() => setTouched((s) => ({ ...s, password: true }))}
        errorText={touched.password && !password ? t('validation.required', { field: t('auth.login.password') }) : null}
      />
      <AppButton label={loading ? t('common.loading') : t('auth.signup.create')} onPress={onSubmit} loading={loading} />
      <View style={{ height: 24 }} />
      <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
        <Text style={styles.link}>{t('auth.signup.haveAccount')}</Text>
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

export default SignupScreen;


