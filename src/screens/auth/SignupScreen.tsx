import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
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
    if (err) setError(err.message);
    if (!err && needsEmailConfirmation) {
      Alert.alert('Check your email', 'Please confirm your email address to sign in.');
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
        errorText={touched.email && !email ? t('auth.login.email') + ' required' : null}
      />
      <AppTextInput
        label={t('auth.login.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        onBlur={() => setTouched((s) => ({ ...s, password: true }))}
        errorText={touched.password && !password ? t('auth.login.password') + ' required' : null}
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

export default SignupScreen;


