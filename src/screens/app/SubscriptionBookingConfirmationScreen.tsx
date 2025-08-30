import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SubscriptionBookingConfirmationScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="clock-outline"
          size={64}
          color={theme.colors.primary}
          style={styles.icon}
        />
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {t('common.comingSoon')}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Cette fonctionnalité sera bientôt disponible
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Baloo2_600SemiBold',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Baloo2_400Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default SubscriptionBookingConfirmationScreen;
