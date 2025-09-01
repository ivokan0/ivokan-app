import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useTheme } from 'react-native-paper';

import { useAuth } from '../hooks/useAuth';
import { getActiveSubscriptionsForTutor } from '../services/studentSubscriptions';
import { StudentSubscriptionWithDetails } from '../types/database';

const TutorStudentSubscriptionsSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<StudentSubscriptionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    loadSubscriptions();
  }, [user?.id]);

  const handleViewAllSubscriptions = () => {
    if (user?.id) {
      (navigation as any).navigate('TutorSubscriptions');
    }
  };

  const handleViewSubscriptionDetails = (subscription: StudentSubscriptionWithDetails) => {
    (navigation as any).navigate('TutorStudentSubscriptionDetails', {
      subscriptionId: subscription.id,
      subscription: subscription
    });
  };

  const getStudentInitial = (subscription: StudentSubscriptionWithDetails) => {
    if (!subscription.student) return '?';
    if (subscription.student.first_name) return subscription.student.first_name.charAt(0).toUpperCase();
    if (subscription.student.last_name) return subscription.student.last_name.charAt(0).toUpperCase();
    return '?';
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            {t('common.loading')}
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          {t('tutor.subscriptions.title')}
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          {t('tutor.subscriptions.subtitle')}
        </Text>
      </View>

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
          <ScrollView 
            style={styles.subscriptionsContainer}
            showsVerticalScrollIndicator={false}
            horizontal
          >
            {subscriptions.slice(0, 3).map((subscription) => (
              <TouchableOpacity
                key={subscription.id}
                style={[styles.subscriptionCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleViewSubscriptionDetails(subscription)}
              >
                <View style={styles.subscriptionHeader}>
                  <View style={styles.studentAvatarContainer}>
                    {subscription.student?.avatar_url ? (
                      <Image
                        source={{ uri: subscription.student.avatar_url }}
                        style={styles.studentAvatar}
                      />
                    ) : (
                      <View style={[styles.studentAvatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                        <Text style={[styles.studentAvatarText, { color: theme.colors.onPrimary }]}>
                          {getStudentInitial(subscription)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={[styles.studentName, { color: theme.colors.onSurface }]}>
                      {subscription.student?.first_name} {subscription.student?.last_name}
                    </Text>
                    <Text style={[styles.languageName, { color: theme.colors.primary }]}>
                      {subscription.language?.name}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>
                
                <View style={styles.subscriptionDetails}>
                  <Text style={[styles.planName, { color: theme.colors.onSurfaceVariant }]}>
                    {subscription.plan?.name}
                  </Text>
                  <Text style={[styles.sessionsInfo, { color: theme.colors.onSurfaceVariant }]}>
                    {subscription.remaining_sessions} {t('tutor.subscriptions.sessionsRemaining')}
                  </Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: subscription.status === 'active' 
                      ? theme.colors.primary 
                      : theme.colors.surfaceVariant 
                  }]}>
                    <Text style={[styles.statusText, { 
                      color: subscription.status === 'active' 
                        ? theme.colors.onPrimary 
                        : theme.colors.onSurfaceVariant 
                    }]}>
                      {t(`tutor.subscriptions.status.${subscription.status}`)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {subscriptions.length > 3 && (
            <TouchableOpacity
              style={[styles.viewAllButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleViewAllSubscriptions}
            >
              <Text style={[styles.viewAllText, { color: theme.colors.onPrimary }]}>
                {t('tutor.subscriptions.viewAll', { count: subscriptions.length })}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={theme.colors.onPrimary}
              />
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    fontWeight: '400',
  },
  subscriptionsContainer: {
    paddingHorizontal: 16,
  },
  subscriptionCard: {
    width: 280,
    padding: 16,
    borderRadius: 12,
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 4,
  },
  languageName: {
    fontSize: 14,
    fontFamily: 'Baloo2_500Medium',
  },
  subscriptionDetails: {
    gap: 8,
  },
  planName: {
    fontSize: 14,
    fontFamily: 'Baloo2_500Medium',
  },
  sessionsInfo: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Baloo2_500Medium',
    textTransform: 'capitalize',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  viewAllText: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
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
  studentAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  studentAvatar: {
    width: '100%',
    height: '100%',
  },
  studentAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  studentAvatarText: {
    fontSize: 20,
    fontFamily: 'Baloo2_600SemiBold',
  },
});

export default TutorStudentSubscriptionsSection;
