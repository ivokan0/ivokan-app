import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCurrency } from '../../hooks/useCurrency';
import { useAuth } from '../../hooks/useAuth';
import { createStudentSubscription } from '../../services/studentSubscriptions';
import { getLanguageByCode } from '../../services/languages';
import { SubscriptionPlan } from '../../types/database';

type RouteParams = {
  tutor: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
    average_rating?: number;
    total_reviews?: number;
  };
  languageCode: string;
  selectedPlan: SubscriptionPlan;
  tutorName: string;
};

const SubscriptionBookingConfirmationScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { currency, formatCurrency } = useCurrency();
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { tutor, languageCode, selectedPlan, tutorName } = route.params as unknown as RouteParams;

  const formatLanguageName = (code: string) => {
    return code.charAt(0).toUpperCase() + code.slice(1);
  };

  const getTotalPrice = () => {
    const monthlyPrice = currency === 'FCFA' ? selectedPlan.price_fcfa : selectedPlan.price_eur;
    return monthlyPrice * selectedPlan.duration_months;
  };

  const getPricePerSession = () => {
    const totalPrice = getTotalPrice();
    const pricePerSession = totalPrice / selectedPlan.sessions_count;
    return formatCurrency(pricePerSession);
  };

  const handleSubscribe = async () => {
    if (!profile?.user_id) {
      Alert.alert(t('common.error'), t('errors.auth.notLoggedIn'));
      return;
    }

    try {
      setIsLoading(true);

      // Get language ID from language code
      const { data: language, error: langError } = await getLanguageByCode(languageCode);
      if (langError || !language) {
        Alert.alert(t('common.error'), t('errors.subscription.invalidLanguage'));
        return;
      }

      // Calculate dates
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + selectedPlan.duration_months);

      // Create subscription data
      const subscriptionData = {
        student_id: profile.user_id,
        tutor_id: tutor.id,
        language_id: language.id,
        plan_id: selectedPlan.id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        total_sessions: selectedPlan.sessions_count,
        remaining_sessions: selectedPlan.sessions_count,
        status: 'active' as const,
      };

      // Create subscription
      const { data: subscription, error } = await createStudentSubscription(subscriptionData);

      if (error) {
        console.error('Error creating subscription:', error);
        Alert.alert(t('errors.subscription.title'), t('errors.subscription.create'));
        return;
      }

      if (subscription) {
        Alert.alert(
          t('subscription.success.title'),
          t('subscription.success.message'),
          [
            {
              text: t('common.ok'),
              onPress: () => {
                // Navigate back to main screen or subscriptions screen
                navigation.navigate('Main' as never);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      Alert.alert(t('errors.subscription.title'), t('errors.subscription.create'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tutor Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            {t('subscription.confirmation.yourTutor')}
          </Text>
          <View style={styles.tutorRow}>
            <Image
              source={
                tutor.avatar_url
                  ? { uri: tutor.avatar_url }
                  : require('../../../assets/icon.png')
              }
              style={styles.avatar}
            />
            <View style={styles.tutorInfo}>
              <Text style={[styles.tutorName, { color: theme.colors.onSurface }]}>
                {tutor.first_name || ''} {tutor.last_name || ''}
              </Text>
              <Text style={[styles.tutorMeta, { color: theme.colors.onSurfaceVariant }]}>
                ★ {tutor.average_rating?.toFixed(1) ?? '5.0'} ({tutor.total_reviews ?? 0} {t('tutorProfile.reviews')})
              </Text>
            </View>
          </View>
        </View>

        {/* Subscription Details */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            {t('subscription.confirmation.details')}
          </Text>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="translate"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('subscription.language')}:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {formatLanguageName(languageCode)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="calendar-month"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('subscription.plan')}:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {t(`subscription.plans.${selectedPlan.name.toLowerCase()}`)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('subscription.duration')}:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {t('subscription.durationMonths', { months: selectedPlan.duration_months })}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="book-open-variant"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('subscription.sessions')}:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {selectedPlan.sessions_count} × {selectedPlan.session_duration_minutes} min
            </Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            {t('subscription.confirmation.payment')}
          </Text>
          
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t(`subscription.plans.${selectedPlan.name.toLowerCase()}`)} {t('subscription.plan')}
            </Text>
            <Text style={[styles.paymentValue, { color: theme.colors.onSurface }]}>
              {formatCurrency(getTotalPrice())}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('subscription.pricePerSession')}
            </Text>
            <Text style={[styles.paymentValue, { color: theme.colors.onSurface }]}>
              {getPricePerSession()}
            </Text>
          </View>

          <View style={[styles.separator, { backgroundColor: theme.colors.outline }]} />

          <View style={styles.paymentRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>
              {t('subscription.total')}
            </Text>
            <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
              {formatCurrency(getTotalPrice())}
            </Text>
          </View>
        </View>

        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: theme.colors.surfaceVariant }]}>
          <MaterialCommunityIcons
            name="information"
            size={20}
            color={theme.colors.primary}
          />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.colors.onSurfaceVariant }]}>
              {t('subscription.confirmation.info.title')}
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
              {t('subscription.confirmation.info.description')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <Button
          mode="contained"
          onPress={handleSubscribe}
          loading={isLoading}
          style={styles.subscribeButton}
          labelStyle={[styles.subscribeButtonText, { fontFamily: 'Baloo2_600SemiBold' }]}
        >
          {t('subscription.subscribe')} - {formatCurrency(getTotalPrice())}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardTitle: {
    fontFamily: 'Baloo2_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tutorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ddd',
  },
  tutorInfo: {
    flex: 1,
  },
  tutorName: {
    fontFamily: 'Baloo2_600SemiBold',
    fontSize: 18,
    fontWeight: '600',
  },
  tutorMeta: {
    fontFamily: 'Baloo2_400Regular',
    fontSize: 14,
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  detailLabel: {
    fontFamily: 'Baloo2_400Regular',
    fontSize: 14,
    minWidth: 80,
  },
  detailValue: {
    fontFamily: 'Baloo2_500Medium',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontFamily: 'Baloo2_400Regular',
    fontSize: 14,
  },
  paymentValue: {
    fontFamily: 'Baloo2_500Medium',
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontFamily: 'Baloo2_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 18,
    fontWeight: '700',
  },
  infoBanner: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontFamily: 'Baloo2_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontFamily: 'Baloo2_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  subscribeButton: {
    paddingVertical: 12,
  },
  subscribeButtonText: {
    fontSize: 16,
  },
});

export default SubscriptionBookingConfirmationScreen;
