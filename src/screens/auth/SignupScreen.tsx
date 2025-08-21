import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import AppTextInput from '../../components/ui/AppTextInput';
import AppButton from '../../components/ui/AppButton';
import * as WebBrowser from 'expo-web-browser';

const TERMS_URL = 'https://example.com/terms';
const PRIVACY_URL = 'https://example.com/privacy';

const SignupScreen: React.FC = () => {
  const { signUp, signInWithGoogle } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ 
    email: boolean; 
    password: boolean; 
    firstName: boolean; 
    lastName: boolean; 
  }>({ email: false, password: false, firstName: false, lastName: false });

  const openTerms = async () => {
    await WebBrowser.openBrowserAsync(TERMS_URL);
  };

  const openPrivacy = async () => {
    await WebBrowser.openBrowserAsync(PRIVACY_URL);
  };

  const onSubmit = async () => {
    setLoading(true);
    setError(null);

    const { error: err, needsEmailConfirmation } = await signUp({ 
      email, 
      password, 
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined
    });
    if (err) setError(err.message);
    if (!err && needsEmailConfirmation) {
      Alert.alert(t('alerts.checkEmailTitle'), t('alerts.checkEmailBody'));
      navigation.navigate('Login' as never);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await signInWithGoogle();
    if (err) setError(err.message);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../../../assets/logo-orange.png')} style={styles.logo} />
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>{t('auth.signup.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.signup.subtitle')}</Text>
        
        {!!error && <Text style={styles.error}>{error}</Text>}
        
        <AppTextInput
          label={t('auth.signup.firstName')}
          value={firstName}
          onChangeText={setFirstName}
          onBlur={() => setTouched((s) => ({ ...s, firstName: true }))}
          errorText={touched.firstName && !firstName ? t('validation.required', { field: t('auth.signup.firstName') }) : null}
        />

        <AppTextInput
          label={t('auth.signup.lastName')}
          value={lastName}
          onChangeText={setLastName}
          onBlur={() => setTouched((s) => ({ ...s, lastName: true }))}
          errorText={touched.lastName && !lastName ? t('validation.required', { field: t('auth.signup.lastName') }) : null}
        />
        
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

        <View style={styles.termsRowNoCheckbox}>
          <Text style={styles.termsText}>
            {t('auth.signup.acceptPrefix')}
            <Text style={styles.link} onPress={openTerms}> {t('auth.signup.terms')} </Text>
            {t('auth.signup.and')}
            <Text style={styles.link} onPress={openPrivacy}> {t('auth.signup.privacy')} </Text>
          </Text>
        </View>
        
        <AppButton 
          label={loading ? t('common.loading') : t('auth.signup.create')} 
          onPress={onSubmit} 
          loading={loading} 
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('auth.signup.or')}</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity 
          style={[styles.socialButton, styles.googleButton]} 
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Text style={styles.googleButtonText}>{t('auth.signup.googleSignUp')}</Text>
        </TouchableOpacity>
        
        <View style={styles.linkContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
            <Text style={styles.linkAlt}>{t('auth.signup.haveAccount')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
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
  termsRowNoCheckbox: {
    marginTop: 8,
    marginBottom: 16,
  },
  termsText: {
    color: '#444',
    fontSize: 13,
    lineHeight: 18,
  },
  link: {
    color: '#f05728',
    fontWeight: '600',
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  googleButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
  },
  linkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkAlt: { 
    color: '#f05728', 
    fontWeight: '600', 
    textAlign: 'center',
    fontSize: 16,
  },
});

export default SignupScreen;


