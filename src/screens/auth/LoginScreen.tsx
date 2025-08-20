import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import AppTextInput from '../../components/ui/AppTextInput';
import AppButton from '../../components/ui/AppButton';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { translateSupabaseError } from '../../utils/i18nErrors';

const LoginScreen: React.FC = () => {
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
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
    const { error: err } = await signIn({ email, password });
    if (err) setError(translateSupabaseError(err, t));
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.login.title')}</Text>
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
        onBlur={() => setTouched((s) => ({ ...s, password: true }))}
        secureTextEntry
        errorText={touched.password && !password ? t('validation.required', { field: t('auth.login.password') }) : null}
      />
      <AppButton label={loading ? t('common.loading') : t('auth.login.signIn')} onPress={onSubmit} loading={loading} />
      <View style={{ height: 16 }} />
      <AppButton label={t('auth.login.google')} onPress={signInWithGoogle} mode="outlined" />
      <View style={{ height: 8 }} />
      <AppButton label={t('auth.login.apple')} onPress={signInWithApple} mode="outlined" />
      <View style={{ height: 24 }} />
      <View style={styles.linksRow}>
        <TouchableOpacity onPress={() => navigation.navigate('Signup' as never)}>
          <Text style={styles.link}>{t('auth.login.createAccount')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword' as never)}>
          <Text style={styles.link}>{t('auth.login.forgot')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, fontFamily: 'Baloo2_600SemiBold' },
  error: { marginBottom: 8 },
  linksRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  link: {
    color: '#f05728',
    fontWeight: '600',
  },
});

export default LoginScreen;


