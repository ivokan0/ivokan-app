import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import AppButton from '../../components/ui/AppButton';
import HomeScreenSkeleton from '../../components/ui/HomeScreenSkeleton';
import { useAuth } from '../../hooks/useAuth';

const HomeScreen: React.FC = () => {
  const { signOut, user, isLoaded } = useAuth();
  const { t } = useTranslation();

  // Show skeleton while auth is loading
  if (!isLoaded || !user) {
    return <HomeScreenSkeleton />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('home.title')}</Text>
      <Text>
        {t('home.welcome', { email: user?.email ?? t('home.guest') })}
      </Text>
      <View style={{ height: 12 }} />
      <AppButton label={t('home.signOut')} onPress={signOut} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, fontFamily: 'Baloo2_600SemiBold' },
});

export default HomeScreen;


