import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import AppButton from '../../components/ui/AppButton';
import AppTextInput from '../../components/ui/AppTextInput';
import { supabase } from '../../services/supabase';
import { translateSupabaseError } from '../../utils/i18nErrors';

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
        <Text style={styles.title}>{t('auth.forgot.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.forgot.subtitle')}</Text>
        
        {!!error && <Text style={styles.error}>{error}</Text>}
        
        <AppTextInput 
          label={t('auth.login.email')} 
          value={email} 
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        
        <AppButton 
          label={loading ? t('common.loading') : t('auth.forgot.send')} 
          onPress={onSubmit} 
          loading={loading} 
        />
        
        <View style={styles.linkContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
            <Text style={styles.link}>{t('auth.forgot.back')}</Text>
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
    fontFamily: 'Baloo2_400Regular',
  },
  linkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  link: { 
    color: '#f05728', 
    fontWeight: '600', 
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
  },
});

export default ForgotPasswordScreen;


