import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import AppTextInput from '../../components/ui/AppTextInput';
import AppButton from '../../components/ui/AppButton';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';

const LoginScreen: React.FC = () => {
  const { signIn, signInWithGoogle } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });

  const onSubmit = async () => {
    setSubmitLoading(true);
    setError(null);
    const { error: err } = await signIn({ email, password });
    if (err) setError(err.message);
    setSubmitLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    const { error: err } = await signInWithGoogle();
    if (err) setError(err.message);
    setGoogleLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image source={require('../../../assets/logo-orange.png')} style={styles.logo} />
        </View>
        
        <View style={styles.formContainer}>
        <Text style={styles.title}>{t('auth.login.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>
        
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
        
        <AppButton 
          label={submitLoading ? t('common.loading') : t('auth.login.signIn')} 
          onPress={onSubmit} 
          loading={submitLoading} 
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('auth.login.or')}</Text>
          <View style={styles.dividerLine} />
        </View>

        <AppButton 
          label={t('auth.login.googleSignIn')}
          onPress={handleGoogleSignIn}
          loading={googleLoading}
          mode="outlined"
          style={styles.socialButton}
        />
        
        <View style={styles.linksRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Signup' as never)}>
            <Text style={styles.link}>{t('auth.login.createAccount')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword' as never)}>
            <Text style={styles.link}>{t('auth.login.forgot')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 60,
    resizeMode: 'contain',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    fontFamily: 'Baloo2_600SemiBold',
    textAlign: 'center',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Baloo2_400Regular',
  },
  error: { 
    marginBottom: 16,
    color: '#e74c3c',
    textAlign: 'center',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666666',
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  socialButton: {
    marginBottom: 24,
  },
  linksRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: {
    color: '#f05728',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default LoginScreen;


