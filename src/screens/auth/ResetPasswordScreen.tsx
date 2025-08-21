import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { translateSupabaseError } from '../../utils/i18nErrors';
import AppButton from '../../components/ui/AppButton';
import AppTextInput from '../../components/ui/AppTextInput';

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
    if (err) setError(translateSupabaseError(err, t));
    else Alert.alert(t('alerts.passwordUpdatedTitle'));
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../../../assets/logo-orange.png')} style={styles.logo} />
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>{t('auth.reset.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.reset.subtitle')}</Text>
        
        {!!error && <Text style={styles.error}>{error}</Text>}
        
        <AppTextInput
          label={t('auth.reset.newPassword')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <AppButton 
          label={loading ? t('common.loading') : t('auth.reset.update')} 
          onPress={onSubmit} 
          loading={loading} 
        />
        
        <View style={styles.linkContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
            <Text style={styles.link}>{t('auth.reset.back')}</Text>
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
  linkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  link: { 
    color: '#f05728', 
    fontWeight: '600', 
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ResetPasswordScreen;


