import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

const HomeScreen: React.FC = () => {
  const { signOut, user } = useAuth();
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('home.title')}</Text>
      <Text>
        {t('home.welcome', { email: user?.email ?? t('home.guest') })}
      </Text>
      <View style={{ height: 12 }} />
      <Button title={t('home.signOut')} onPress={signOut} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
});

export default HomeScreen;


