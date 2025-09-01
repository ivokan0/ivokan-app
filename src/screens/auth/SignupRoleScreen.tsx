import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, Image } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppButton from '../../components/ui/AppButton';

const TUTOR_URL = 'https://www.ivokan.com/devenir-tuteur';

const SignupRoleScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const theme = useTheme();

  const chooseStudent = () => {
    navigation.navigate('Signup', { profileType: 'student' });
  };

  const chooseTutor = async () => {
    await WebBrowser.openBrowserAsync(TUTOR_URL);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../../../assets/logo-orange.png')} style={styles.logo} />
      </View>

      <Text style={[styles.title, { color: theme.colors.onBackground }]}>{t('signupRole.title')}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>{t('signupRole.subtitle')}</Text>

      <AppButton label={t('signupRole.learn')} onPress={chooseStudent} style={styles.button} />
      <AppButton label={t('signupRole.teach')} onPress={chooseTutor} style={styles.button} mode="outlined" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', paddingHorizontal: 24, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 120, height: 60, resizeMode: 'contain' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', fontFamily: 'Baloo2_600SemiBold' },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 32, fontFamily: 'Baloo2_400Regular' },
  button: { marginBottom: 14 },
});

export default SignupRoleScreen;
