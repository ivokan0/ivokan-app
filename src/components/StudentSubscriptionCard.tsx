import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useTheme } from 'react-native-paper';

import { useCurrency } from '../hooks/useCurrency';
import { StudentSubscriptionWithDetails } from '../types/database';

interface StudentSubscriptionCardProps {
  subscription: StudentSubscriptionWithDetails;
  onPress?: () => void;
}

const StudentSubscriptionCard: React.FC<StudentSubscriptionCardProps> = ({ 
  subscription, 
  onPress 
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { formatCurrency } = useCurrency();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to subscription details
      (navigation as any).navigate('StudentSubscriptionDetails', { 
        subscriptionId: subscription.id 
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getProgressPercentage = () => {
    if (subscription.total_sessions === 0) return 0;
    const usedSessions = subscription.total_sessions - subscription.remaining_sessions;
    return (usedSessions / subscription.total_sessions) * 100;
  };

  const isExpiring = () => {
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  };

  const isExpired = () => {
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    return endDate < today || subscription.status === 'expired';
  };

  const formatLanguageName = (languageName?: string) => {
    if (!languageName) return '';
    return languageName.charAt(0).toUpperCase() + languageName.slice(1);
  };

  const getTutorName = () => {
    const firstName = subscription.tutor?.first_name || '';
    const lastInitial = subscription.tutor?.last_name ? `${subscription.tutor.last_name.charAt(0)}.` : '';
    return `${firstName} ${lastInitial}`.trim();
  };

  const getTutorInitial = () => {
    if (subscription.tutor?.first_name) return subscription.tutor.first_name.charAt(0).toUpperCase();
    if (subscription.tutor?.last_name) return subscription.tutor.last_name.charAt(0).toUpperCase();
    return '?';
  };

  const progressPercentage = getProgressPercentage();
  const expired = isExpired();
  const expiring = isExpiring();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: theme.colors.surface,
          borderColor: expired ? '#FF5252' : expiring ? '#FF9800' : theme.colors.outline,
        },
        expired && styles.expiredContainer,
      ]}
      onPress={handlePress}
    >
      {/* Status Badge */}
      {(expired || expiring) && (
        <View style={[
          styles.statusBadge,
          { backgroundColor: expired ? '#FF5252' : '#FF9800' }
        ]}>
          <Text style={styles.statusBadgeText}>
            {expired ? t('subscription.status.expired') : t('subscription.status.expiring')}
          </Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.tutorInfo}>
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
          
          <View style={styles.tutorDetails}>
            <Text style={[styles.tutorName, { color: theme.colors.onSurface }]}>
              {getTutorName()}
            </Text>
            <Text style={[styles.languageName, { color: theme.colors.primary }]}>
              {formatLanguageName(subscription.language?.name)}
            </Text>
          </View>
        </View>

        <View style={styles.planInfo}>
          <Text style={[styles.planName, { color: theme.colors.onSurface }]}>
            {t(`subscription.plans.${subscription.plan?.name?.toLowerCase()}`)}
          </Text>
          <Text style={[styles.planDuration, { color: theme.colors.onSurfaceVariant }]}>
            {t('subscription.duration', { months: subscription.plan?.duration_months })}
          </Text>
        </View>
      </View>

      {/* Sessions Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('subscription.sessionsProgress')}
          </Text>
          <Text style={[styles.progressCount, { color: theme.colors.onSurface }]}>
            {subscription.remaining_sessions} / {subscription.total_sessions}
          </Text>
        </View>
        
        <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: expired ? '#FF5252' : theme.colors.primary,
              }
            ]}
          />
        </View>
        
        <Text style={[styles.remainingText, { color: theme.colors.onSurfaceVariant }]}>
          {subscription.remaining_sessions > 0 
            ? t('subscription.sessionsRemaining', { count: subscription.remaining_sessions })
            : t('subscription.noSessionsRemaining')
          }
        </Text>
      </View>

      {/* Dates */}
      <View style={styles.datesSection}>
        <View style={styles.dateItem}>
          <MaterialCommunityIcons
            name="calendar-start"
            size={16}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={[styles.dateLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('subscription.startDate')}:
          </Text>
          <Text style={[styles.dateValue, { color: theme.colors.onSurface }]}>
            {formatDate(subscription.start_date)}
          </Text>
        </View>
        
        <View style={styles.dateItem}>
          <MaterialCommunityIcons
            name="calendar-end"
            size={16}
            color={expired ? '#FF5252' : theme.colors.onSurfaceVariant}
          />
          <Text style={[styles.dateLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('subscription.endDate')}:
          </Text>
          <Text style={[
            styles.dateValue, 
            { color: expired ? '#FF5252' : theme.colors.onSurface }
          ]}>
            {formatDate(subscription.end_date)}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.subscriptionId, { color: theme.colors.onSurfaceVariant }]}>
          ID: {subscription.id.slice(0, 8)}...
        </Text>
        
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={theme.colors.onSurfaceVariant}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  expiredContainer: {
    opacity: 0.7,
  },
  statusBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 11,
    borderBottomLeftRadius: 8,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tutorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
  },
  tutorDetails: {
    flex: 1,
  },
  tutorName: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
  },
  languageName: {
    fontSize: 14,
    fontFamily: 'Baloo2_500Medium',
    fontWeight: '500',
    marginTop: 2,
  },
  planInfo: {
    alignItems: 'flex-end',
  },
  planName: {
    fontSize: 14,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
  },
  planDuration: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
    marginTop: 2,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'Baloo2_500Medium',
    fontWeight: '500',
  },
  progressCount: {
    fontSize: 14,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  remainingText: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
  },
  datesSection: {
    marginBottom: 12,
    gap: 6,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
    minWidth: 60,
  },
  dateValue: {
    fontSize: 12,
    fontFamily: 'Baloo2_500Medium',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subscriptionId: {
    fontSize: 11,
    fontFamily: 'Baloo2_400Regular',
  },
});

export default StudentSubscriptionCard;
