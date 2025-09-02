import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from 'react-native';
import { useTheme } from 'react-native-paper';

import TutorSubscriptionsScreenSkeleton from '../../components/ui/TutorSubscriptionsScreenSkeleton';
import { useAuth } from '../../hooks/useAuth';
import { getActiveSubscriptionsForTutor } from '../../services/studentSubscriptions';
import { StudentSubscriptionWithDetails } from '../../types/database';

const TutorSubscriptionsScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<StudentSubscriptionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptions();
  }, [user?.id]);

  const loadSubscriptions = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: subscriptionsError } = await getActiveSubscriptionsForTutor(user.id);
      
      if (subscriptionsError) {
        console.error('Error loading subscriptions:', subscriptionsError);
        setError('Failed to load subscriptions');
        return;
      }

      setSubscriptions(data || []);
    } catch (err) {
      console.error('Error loading subscriptions:', err);
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubscriptionDetails = (subscription: StudentSubscriptionWithDetails) => {
    (navigation as any).navigate('TutorStudentSubscriptionDetails', {
      subscriptionId: subscription.id,
      subscription: subscription
    });
  };

  const getStudentName = (subscription: StudentSubscriptionWithDetails) => {
    if (!subscription.student) return t('common.unknown');
    const firstName = subscription.student.first_name || '';
    const lastInitial = subscription.student.last_name ? `${subscription.student.last_name.charAt(0)}.` : '';
    return `${firstName} ${lastInitial}`.trim();
  };

  const getStudentInitial = (subscription: StudentSubscriptionWithDetails) => {
    if (!subscription.student) return '?';
    if (subscription.student.first_name) return subscription.student.first_name.charAt(0).toUpperCase();
    if (subscription.student.last_name) return subscription.student.last_name.charAt(0).toUpperCase();
    return '?';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.primary;
      case 'expired':
        return theme.colors.error;
      case 'cancelled':
        return theme.colors.outline;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  // Show skeleton while loading
  if (loading) {
    return <TutorSubscriptionsScreenSkeleton />;
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadSubscriptions}
          >
            <Text style={[styles.retryButtonText, { color: theme.colors.onPrimary }]}>
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
            {t('tutor.subscriptions.title')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            {t('tutor.subscriptions.subtitle')}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {subscriptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={64}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
              {t('tutor.subscriptions.noSubscriptions')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
              {t('tutor.subscriptions.noSubscriptionsDescription')}
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('tutor.subscriptions.activeSubscriptions', { count: subscriptions.length })}
            </Text>
            
            {subscriptions.map((subscription) => (
              <TouchableOpacity
                key={subscription.id}
                style={[styles.subscriptionCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleViewSubscriptionDetails(subscription)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.studentInfo}>
                    {subscription.student?.avatar_url ? (
                      <Image
                        source={{ uri: subscription.student.avatar_url }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={[styles.avatarFallback, { backgroundColor: theme.colors.primary }]}>
                        <Text style={[styles.avatarInitial, { color: theme.colors.onPrimary }]}>
                          {getStudentInitial(subscription)}
                        </Text>
                      </View>
                    )}
                    
                    <View style={styles.studentDetails}>
                      <Text style={[styles.studentName, { color: theme.colors.onSurface }]}>
                        {getStudentName(subscription)}
                      </Text>
                      <Text style={[styles.languageName, { color: theme.colors.primary }]}>
                        {subscription.language?.name}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscription.status) }]}>
                    <Text style={[styles.statusText, { color: theme.colors.onPrimary }]}>
                      {t(`tutor.subscriptions.status.${subscription.status}`)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                      {t('subscription.plan')}:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                      {subscription.plan?.name}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                      {t('tutor.subscriptions.sessionsRemaining')}:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.primary }]}>
                      {subscription.remaining_sessions} / {subscription.total_sessions}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                      {t('tutor.subscription.details.endDate')}:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                      {new Date(subscription.end_date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: theme.colors.primary }]}
                    onPress={() => handleViewSubscriptionDetails(subscription)}
                  >
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={theme.colors.primary}
                    />
                    <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                      {t('tutor.subscriptions.viewDetails')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  headerContent: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
    marginBottom: 16,
  },
  subscriptionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    fontSize: 20,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
    marginBottom: 4,
  },
  languageName: {
    fontSize: 14,
    fontFamily: 'Baloo2_500Medium',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Baloo2_500Medium',
    textTransform: 'capitalize',
  },
  cardDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  cardActions: {
    alignItems: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Baloo2_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TutorSubscriptionsScreen;
