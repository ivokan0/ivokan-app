import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from 'react-native-paper';

import { TrialBooking } from '../types/database';

interface BookingCardProps {
  booking: TrialBooking;
  tutorName?: string;
  tutorAvatar?: string | null;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, tutorName, tutorAvatar }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState<string>('');

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
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      case 'completed':
        return '#2196F3';
      default:
        return theme.colors.onSurfaceVariant;
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

  const { weekday, date, time } = formatDateTime();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.tutorInfo}>
          {tutorAvatar ? (
            <Image source={{ uri: tutorAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.avatarInitial, { color: theme.colors.onPrimary }]}>
                {tutorName ? tutorName.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <View style={styles.nameContainer}>
            <Text style={[styles.tutorName, { color: theme.colors.onSurface }]}>
              {tutorName || t('common.unknown')}
            </Text>
            <Text style={[styles.lessonType, { color: theme.colors.onSurfaceVariant }]}>
              {t('booking.trialLesson')}
              {booking.language_id && (
                <Text style={[styles.languageText, { color: theme.colors.primary }]}>
                  {' • '}{booking.language_id.charAt(0).toUpperCase() + booking.language_id.slice(1)}
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
            {t(`booking.status.${booking.status}`)}
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
  tutorInfo: {
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
  tutorName: {
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
});

export default BookingCard;
