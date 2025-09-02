import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import { useTheme, Button } from 'react-native-paper';

import StudentSubscriptionDetailsScreenSkeleton from '../../components/ui/StudentSubscriptionDetailsScreenSkeleton';
import { useCurrency } from '../../hooks/useCurrency';
import { getStudentSubscriptionByIdWithDetails } from '../../services/studentSubscriptions';
import { StudentSubscriptionWithDetails } from '../../types/database';

interface RouteParams {
  subscriptionId: string;
}

const StudentSubscriptionDetailsScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { formatCurrency } = useCurrency();
  
  const { subscriptionId } = route.params as RouteParams;
  
  const [subscription, setSubscription] = useState<StudentSubscriptionWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, [subscriptionId]);

  const loadSubscription = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await getStudentSubscriptionByIdWithDetails(subscriptionId);
      
      if (error) {
        console.error('Error loading subscription:', error);
        Alert.alert(t('common.error'), t('errors.subscription.loadFailed'));
        navigation.goBack();
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      Alert.alert(t('common.error'), t('errors.subscription.loadFailed'));
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatLanguageName = (languageName?: string) => {
    if (!languageName) return '';
    return languageName.charAt(0).toUpperCase() + languageName.slice(1);
  };

  const getTutorName = () => {
    if (!subscription?.tutor) return '';
    const firstName = subscription.tutor.first_name || '';
    const lastInitial = subscription.tutor.last_name ? `${subscription.tutor.last_name.charAt(0)}.` : '';
    return `${firstName} ${lastInitial}`.trim();
  };

  const getTutorInitial = () => {
    if (!subscription?.tutor) return '?';
    if (subscription.tutor.first_name) return subscription.tutor.first_name.charAt(0).toUpperCase();
    if (subscription.tutor.last_name) return subscription.tutor.last_name.charAt(0).toUpperCase();
    return '?';
  };

  const getProgressPercentage = () => {
    if (!subscription || subscription.total_sessions === 0) return 0;
    const usedSessions = subscription.total_sessions - subscription.remaining_sessions;
    return (usedSessions / subscription.total_sessions) * 100;
  };

  const isExpired = () => {
    if (!subscription) return false;
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    return endDate < today || subscription.status === 'expired';
  };

  const isExpiring = () => {
    if (!subscription) return false;
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  };

  const getTotalPrice = () => {
    if (!subscription?.plan) return 0;
    return subscription.plan.price_eur * subscription.plan.duration_months;
  };

  const getPricePerSession = () => {
    if (!subscription?.plan) return 0;
    const totalPrice = getTotalPrice();
    return totalPrice / subscription.plan.sessions_count;
  };

  const handleContactTutor = () => {
    // Navigate to messages with this tutor
    (navigation as any).navigate('Main', {
      screen: 'Messages',
      params: { tutorId: subscription?.tutor?.user_id }
    });
  };

  const handleViewTutorProfile = () => {
    if (subscription?.tutor) {
      (navigation as any).navigate('TutorProfile', { 
        tutor: subscription.tutor 
      });
    }
  };

  // Show skeleton while loading
  if (isLoading) {
    return <StudentSubscriptionDetailsScreenSkeleton />;
  }

  if (!subscription) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {t('errors.subscription.notFound')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const expired = isExpired();
  const expiring = isExpiring();
  const progressPercentage = getProgressPercentage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.headerButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            {t('subscription.details.title')}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        {(expired || expiring) && (
          <View style={[
            styles.statusBanner,
            { backgroundColor: expired ? '#FFE1E1' : '#FFF3E0' }
          ]}>
            <MaterialCommunityIcons
              name={expired ? 'alert-circle' : 'clock-alert'}
              size={20}
              color={expired ? '#F44336' : '#FF9800'}
            />
            <Text style={[
              styles.statusBannerText,
              { color: expired ? '#F44336' : '#FF9800' }
            ]}>
              {expired 
                ? t('subscription.status.expiredMessage') 
                : t('subscription.status.expiringMessage')
              }
            </Text>
          </View>
        )}

        {/* Tutor Information */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            {t('subscription.details.tutorInfo')}
          </Text>
          
          <View style={styles.tutorRow}>
            {subscription.tutor?.avatar_url ? (
              <Image
                source={{ uri: subscription.tutor.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.avatarInitial, { color: theme.colors.onPrimary }]}>
                  {getTutorInitial()}
                </Text>
              </View>
            )}
            
            <View style={styles.tutorInfo}>
              <Text style={[styles.tutorName, { color: theme.colors.onSurface }]}>
                {getTutorName()}
              </Text>
              <Text style={[styles.languageName, { color: theme.colors.primary }]}>
                {t('subscription.teaching')} {formatLanguageName(subscription.language?.name)}
              </Text>
            </View>
          </View>

          <View style={styles.tutorActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleContactTutor}
            >
              <MaterialCommunityIcons name="message" size={16} color={theme.colors.onPrimary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
                {t('subscription.details.contactTutor')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton, { borderColor: theme.colors.primary }]}
              onPress={handleViewTutorProfile}
            >
              <MaterialCommunityIcons name="account" size={16} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                {t('subscription.details.viewProfile')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription Details */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            {t('subscription.details.subscriptionInfo')}
          </Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('subscription.plan')}:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {t(`subscription.plans.${subscription.plan?.name?.toLowerCase()}`)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('subscription.duration')}:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {subscription.plan?.duration_months} {t('subscription.months')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('subscription.details.totalSessions')}:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {subscription.total_sessions}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('subscription.details.sessionDuration')}:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {subscription.plan?.session_duration_minutes} {t('subscription.minutes')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('subscription.details.totalPaid')}:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.primary }]}>
              {formatCurrency(getTotalPrice())}
            </Text>
          </View>
        </View>

        {/* Sessions Progress */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            {t('subscription.details.sessionsProgress')}
          </Text>

          <View style={styles.progressHeader}>
            <Text style={[styles.progressCount, { color: theme.colors.onSurface }]}>
              {subscription.remaining_sessions} / {subscription.total_sessions}
            </Text>
            <Text style={[styles.progressPercentage, { color: theme.colors.onSurfaceVariant }]}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>

          <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: expired ? '#F44336' : theme.colors.primary,
                }
              ]}
            />
          </View>

          <Text style={[styles.progressDescription, { color: theme.colors.onSurfaceVariant }]}>
            {subscription.remaining_sessions > 0 
              ? t('subscription.details.sessionsRemaining', { count: subscription.remaining_sessions })
              : t('subscription.details.allSessionsUsed')
            }
          </Text>
        </View>

        {/* Dates */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            {t('subscription.details.validity')}
          </Text>

          <View style={styles.dateRow}>
            <MaterialCommunityIcons
              name="calendar-start"
              size={20}
              color={theme.colors.primary}
            />
            <View style={styles.dateInfo}>
              <Text style={[styles.dateLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('subscription.details.startDate')}
              </Text>
              <Text style={[styles.dateValue, { color: theme.colors.onSurface }]}>
                {formatDate(subscription.start_date)}
              </Text>
            </View>
          </View>

          <View style={styles.dateRow}>
            <MaterialCommunityIcons
              name="calendar-end"
              size={20}
              color={expired ? '#F44336' : theme.colors.primary}
            />
            <View style={styles.dateInfo}>
              <Text style={[styles.dateLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('subscription.details.endDate')}
              </Text>
              <Text style={[
                styles.dateValue, 
                { color: expired ? '#F44336' : theme.colors.onSurface }
              ]}>
                {formatDate(subscription.end_date)}
              </Text>
            </View>
          </View>
        </View>

        {/* Subscription ID */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            {t('subscription.details.subscriptionId')}
          </Text>
          <Text style={[styles.subscriptionId, { color: theme.colors.onSurfaceVariant }]}>
            {subscription.id}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  statusBannerText: {
    fontSize: 14,
    fontFamily: 'Baloo2_500Medium',
    fontWeight: '500',
    flex: 1,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
    marginBottom: 12,
  },
  tutorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  avatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarInitial: {
    fontSize: 24,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
  },
  tutorInfo: {
    flex: 1,
  },
  tutorName: {
    fontSize: 20,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
  },
  languageName: {
    fontSize: 16,
    fontFamily: 'Baloo2_500Medium',
    fontWeight: '500',
    marginTop: 4,
  },
  tutorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressCount: {
    fontSize: 24,
    fontFamily: 'Baloo2_700Bold',
    fontWeight: '700',
  },
  progressPercentage: {
    fontSize: 16,
    fontFamily: 'Baloo2_500Medium',
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressDescription: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
  },
  dateValue: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
    marginTop: 2,
  },
  subscriptionId: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
});

export default StudentSubscriptionDetailsScreen;
