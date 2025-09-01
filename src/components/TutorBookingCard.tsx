import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme, Button, Chip } from 'react-native-paper';

import { TrialBooking, TrialBookingWithDetails, SubscriptionBookingWithDetails } from '../types/database';

interface TutorBookingCardProps {
  booking: TrialBookingWithDetails | SubscriptionBookingWithDetails;
  onConfirm?: () => void;
  onComplete?: () => void;
  actionLoading?: boolean;
}

const TutorBookingCard: React.FC<TutorBookingCardProps> = ({ 
  booking, 
  onConfirm, 
  onComplete, 
  actionLoading 
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState<string>('');

  const isTrialBooking = 'language_id' in booking;
  const student = isTrialBooking ? booking.student : booking.student;
  const language = isTrialBooking ? undefined : booking.subscription?.language?.name;

  const formatDateTime = () => {
    const bookingDate = new Date(`${booking.booking_date}T${booking.start_time}`);
    const weekday = bookingDate.toLocaleDateString('fr-FR', { weekday: 'long' });
    const date = bookingDate.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long' 
    });
    const time = `${booking.start_time.slice(0, 5)} - ${booking.end_time.slice(0, 5)}`;
    
    return {
      weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
      date,
      time
    };
  };

  const calculateCountdown = () => {
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return '';
    }

    const now = new Date();
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
    const diff = bookingDateTime.getTime() - now.getTime();

    if (diff <= 0) {
      return t('booking.countdown.started');
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return t('booking.countdown.days', { days, hours });
    } else if (hours > 0) {
      return t('booking.countdown.hours', { hours, minutes });
    } else {
      return t('booking.countdown.minutes', { minutes });
    }
  };

  useEffect(() => {
    if (booking.status === 'pending' || booking.status === 'confirmed') {
      const updateCountdown = () => {
        setCountdown(calculateCountdown());
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [booking.booking_date, booking.start_time, booking.status]);

  const getStatusColor = () => {
    switch (booking.status) {
      case 'confirmed':
        return theme.colors.primary;
      case 'pending':
        return theme.colors.tertiary;
      case 'cancelled':
        return theme.colors.error;
      case 'completed':
        return theme.colors.secondary;
      default:
        return theme.colors.outline;
    }
  };

  const getStatusIcon = () => {
    switch (booking.status) {
      case 'confirmed':
        return 'check-circle';
      case 'pending':
        return 'clock-outline';
      case 'cancelled':
        return 'cancel';
      case 'completed':
        return 'check-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return t('tutor.agenda.statusPending');
      case 'confirmed':
        return t('tutor.agenda.statusConfirmed');
      case 'completed':
        return t('tutor.agenda.statusCompleted');
      case 'cancelled':
        return t('tutor.agenda.statusCancelled');
      default:
        return status;
    }
  };

  const { weekday, date, time } = formatDateTime();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.studentInfo}>
          {student?.avatar_url ? (
            <Image source={{ uri: student.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.avatarInitial, { color: theme.colors.onPrimary }]}>
                {student ? `${student.first_name?.charAt(0) || ''}${student.last_name?.charAt(0) || ''}`.toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <View style={styles.nameContainer}>
            <Text style={[styles.studentName, { color: theme.colors.onSurface }]}>
              {student ? `${student.first_name} ${student.last_name}` : t('common.unknown')}
            </Text>
            <Text style={[styles.lessonType, { color: theme.colors.onSurfaceVariant }]}>
              {isTrialBooking ? t('tutor.agenda.trialLesson') : t('tutor.agenda.subscriptionLesson')}
              {language && (
                <Text style={[styles.languageText, { color: theme.colors.primary }]}>
                  {' • '}{language}
                </Text>
              )}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <MaterialCommunityIcons
            name={getStatusIcon()}
            size={20}
            color={getStatusColor()}
          />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText(booking.status)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons
              name="calendar"
              size={18}
              color={theme.colors.primary}
            />
            <Text style={[styles.dateText, { color: theme.colors.onSurface }]}>
              {weekday}, {date}
            </Text>
          </View>
          
          <View style={styles.timeContainer}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text style={[styles.timeText, { color: theme.colors.onSurface }]}>
              {time}
            </Text>
            <Text style={[styles.timezoneText, { color: theme.colors.onSurfaceVariant }]}>
              ({booking.student_timezone || t('common.localTime')})
            </Text>
          </View>
        </View>

        {countdown && (
          <View style={styles.countdownContainer}>
            <MaterialCommunityIcons
              name="timer-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text style={[styles.countdownText, { color: theme.colors.primary }]}>
              {countdown}
            </Text>
          </View>
        )}

        {/* Notes */}
        {booking.student_notes && (
          <View style={styles.notesContainer}>
            <MaterialCommunityIcons
              name="note-text"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={[styles.notes, { color: theme.colors.onSurfaceVariant }]}>
              {t('tutor.agenda.studentNotes')}: {booking.student_notes}
            </Text>
          </View>
        )}
        
        {booking.tutor_notes && (
          <View style={styles.notesContainer}>
            <MaterialCommunityIcons
              name="note-text"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={[styles.notes, { color: theme.colors.onSurfaceVariant }]}>
              {t('tutor.agenda.tutorNotes')}: {booking.tutor_notes}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {booking.status === 'pending' && onConfirm && (
          <Button
            mode="contained"
            onPress={onConfirm}
            loading={actionLoading}
            disabled={actionLoading}
            style={styles.actionButton}
          >
            {t('tutor.agenda.confirmTrial')}
          </Button>
        )}

        {booking.status === 'confirmed' && onComplete && (
          <Button
            mode="contained"
            onPress={onComplete}
            loading={actionLoading}
            disabled={actionLoading}
            style={styles.actionButton}
          >
            {t('tutor.agenda.completeLesson')}
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ddd',
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontFamily: 'Baloo2_600SemiBold',
  },
  nameContainer: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 2,
  },
  lessonType: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  languageText: {
    fontSize: 14,
    fontFamily: 'Baloo2_600SemiBold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Baloo2_500Medium',
    textTransform: 'capitalize',
  },
  content: {
    gap: 8,
  },
  dateTimeContainer: {
    gap: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Baloo2_500Medium',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Baloo2_500Medium',
  },
  timezoneText: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
    fontStyle: 'italic',
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  countdownText: {
    fontSize: 14,
    fontFamily: 'Baloo2_600SemiBold',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 4,
  },
  notes: {
    fontSize: 13,
    fontFamily: 'Baloo2_400Regular',
    flex: 1,
  },
  actionButton: {
    marginTop: 8,
  },
});

export default TutorBookingCard;
