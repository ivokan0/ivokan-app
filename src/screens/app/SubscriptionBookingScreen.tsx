import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useTheme, Button } from 'react-native-paper';

import { useCurrency } from '../../hooks/useCurrency';
import { getTutorProfile } from '../../services/profiles';
import { getSubscriptionPlans } from '../../services/subscriptionPlans';
import { SubscriptionPlan } from '../../types/database';

interface RouteParams {
  tutorId: string;
  languageCode: string;
  tutorName: string;
}

const SubscriptionBookingScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { currency, formatCurrency } = useCurrency();
  
  const { tutorId, languageCode, tutorName } = route.params as RouteParams;

  // State
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tutorProfile, setTutorProfile] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load subscription plans
      const { data: plansData, error: plansError } = await getSubscriptionPlans();
      if (plansError) {
        console.error('Error loading subscription plans:', plansError);
        Alert.alert(t('common.error'), t('errors.subscription.loadPlans'));
      } else {
        setSubscriptionPlans(plansData || []);
      }

      // Load tutor profile
      const { data: tutorData, error: tutorError } = await getTutorProfile(tutorId);
      if (tutorError) {
        console.error('Error loading tutor profile:', tutorError);
      } else {
        setTutorProfile(tutorData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(t('common.error'), t('errors.subscription.loadPlans'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (!selectedPlan) {
      Alert.alert(t('errors.validation.title'), t('errors.validation.selectPlan'));
      return;
    }

    // Navigate to confirmation screen
    (navigation as any).navigate('SubscriptionBookingConfirmation', {
      tutor: {
        id: tutorId,
        first_name: tutorProfile?.first_name,
        last_name: tutorProfile?.last_name,
        avatar_url: tutorProfile?.avatar_url,
        average_rating: tutorProfile?.tutor_stats?.average_rating,
        total_reviews: tutorProfile?.tutor_stats?.total_reviews,
      },
      languageCode,
      selectedPlan,
      tutorName,
    });
  };

  const formatLanguageName = (code: string) => {
    return code.charAt(0).toUpperCase() + code.slice(1);
  };

  const getTotalPrice = (plan: SubscriptionPlan) => {
    const monthlyPrice = currency === 'FCFA' ? plan.price_fcfa : plan.price_eur;
    return monthlyPrice * plan.duration_months;
  };

  const getPricePerSession = (plan: SubscriptionPlan) => {
    const totalPrice = getTotalPrice(plan);
    const pricePerSession = totalPrice / plan.sessions_count;
    return formatCurrency(pricePerSession);
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isSelected = selectedPlan?.id === plan.id;
    const totalPrice = getTotalPrice(plan);
    const pricePerSession = getPricePerSession(plan);
    
    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
          },
          isSelected && styles.planCardSelected,
        ]}
        onPress={() => setSelectedPlan(plan)}
      >
        <View style={styles.planHeader}>
          <View style={styles.planTitleContainer}>
            <Text style={[styles.planTitle, { color: theme.colors.onSurface }]}>
              {t(`subscription.plans.${plan.name.toLowerCase()}`)}
            </Text>
            <Text style={[styles.planDuration, { color: theme.colors.onSurfaceVariant }]}>
              {t('subscription.duration', { months: plan.duration_months })}
            </Text>
          </View>
          
          {isSelected && (
            <View style={[styles.selectedBadge, { backgroundColor: theme.colors.primary }]}>
              <MaterialCommunityIcons name="check" size={16} color={theme.colors.onPrimary} />
            </View>
          )}
        </View>

        <View style={styles.planDetails}>
          <View style={styles.planDetailRow}>
            <MaterialCommunityIcons 
              name="calendar-month" 
              size={16} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text style={[styles.planDetailText, { color: theme.colors.onSurfaceVariant }]}>
              {t('subscription.sessionsCount', { count: plan.sessions_count })}
            </Text>
          </View>
          
          <View style={styles.planDetailRow}>
            <MaterialCommunityIcons 
              name="clock-outline" 
              size={16} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text style={[styles.planDetailText, { color: theme.colors.onSurfaceVariant }]}>
              {t('subscription.sessionDuration', { minutes: plan.session_duration_minutes })}
            </Text>
          </View>
        </View>

        <View style={styles.planPricing}>
          <Text style={[styles.planPrice, { color: theme.colors.onSurface }]}>
            {formatCurrency(totalPrice)}
          </Text>
          <Text style={[styles.planPricePerSession, { color: theme.colors.onSurfaceVariant }]}>
            {t('subscription.perSession', { price: pricePerSession })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>


      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={[styles.descriptionTitle, { color: theme.colors.onSurface }]}>
            {t('subscription.chooseYourPlan')}
          </Text>
          <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
            {t('subscription.description')}
          </Text>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {subscriptionPlans.map(renderPlanCard)}
        </View>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <Text style={[styles.benefitsTitle, { color: theme.colors.onSurface }]}>
            {t('subscription.benefits.title')}
          </Text>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.primary} />
              <Text style={[styles.benefitText, { color: theme.colors.onSurface }]}>
                {t('subscription.benefits.regularSessions')}
              </Text>
            </View>
            
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.primary} />
              <Text style={[styles.benefitText, { color: theme.colors.onSurface }]}>
                {t('subscription.benefits.discountPrice')}
              </Text>
            </View>
            
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.primary} />
              <Text style={[styles.benefitText, { color: theme.colors.onSurface }]}>
                {t('subscription.benefits.flexibleScheduling')}
              </Text>
            </View>
            
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.primary} />
              <Text style={[styles.benefitText, { color: theme.colors.onSurface }]}>
                {t('subscription.benefits.personalizedLearning')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <Button
          mode="contained"
          onPress={handleContinue}
          loading={isLoading}
          disabled={!selectedPlan}
          style={styles.continueButton}
          labelStyle={[styles.continueButtonText, { fontFamily: 'Baloo2_600SemiBold' }]}
        >
          {t('common.continue')}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },

  content: {
    flex: 1,
  },
  descriptionContainer: {
    padding: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    lineHeight: 24,
  },
  plansContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  planCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 8,
  },
  planCardSelected: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planTitleContainer: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
  },
  planDuration: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    marginTop: 2,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planDetails: {
    gap: 8,
    marginBottom: 16,
  },
  planDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planDetailText: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 24,
    fontFamily: 'Baloo2_700Bold',
    fontWeight: '700',
  },
  planPricePerSession: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
    marginTop: 2,
  },
  benefitsContainer: {
    padding: 16,
    marginTop: 24,
  },
  benefitsTitle: {
    fontSize: 18,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    flex: 1,
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  continueButton: {
    paddingVertical: 12,
  },
  continueButtonText: {
    fontSize: 16,
  },
});

export default SubscriptionBookingScreen;
