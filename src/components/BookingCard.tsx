import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';

import { Language } from '../types/database';
import { UnifiedBooking } from '../utils/bookingUtils';

interface BookingCardProps {
  booking: UnifiedBooking;
  tutorName?: string;
  tutorAvatar?: string | null;
  language?: Language;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, tutorName, tutorAvatar, language }) => {
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

  const getLessonTypeText = () => {
    if (booking.isTrial) {
      return t('booking.trialLesson');
    } else {
      return t('booking.subscriptionLesson');
    }
  };

  const getDurationText = () => {
    if (booking.duration_minutes) {
      const hours = Math.floor(booking.duration_minutes / 60);
      const minutes = booking.duration_minutes % 60;
      
      if (hours > 0) {
        return minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`;
      } else {
        return `${minutes}min`;
      }
    }
    return '';
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
            <View style={styles.lessonInfo}>
              <Text style={[styles.lessonType, { color: theme.colors.onSurfaceVariant }]}>
                {getLessonTypeText()}
              </Text>
              {language && (
                <Text style={[styles.languageText, { color: theme.colors.primary }]}>
                  {' • '}{language.name}
                </Text>
              )}
              {getDurationText() && (
                <Text style={[styles.durationText, { color: theme.colors.onSurfaceVariant }]}>
                  {' • '}{getDurationText()}
                </Text>
              )}
            </View>
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

        {/* Notes Section */}
        {(booking.student_notes || booking.tutor_notes) && (
          <View style={styles.notesContainer}>
            <MaterialCommunityIcons
              name="note-text"
              size={18}
              color={theme.colors.primary}
            />
            <View style={styles.notesContent}>
              {booking.student_notes && (
                <Text style={[styles.noteText, { color: theme.colors.onSurface }]}>
                  <Text style={styles.noteLabel}>{t('booking.studentNotes')}: </Text>
                  {booking.student_notes}
                </Text>
              )}
              {booking.tutor_notes && (
                <Text style={[styles.noteText, { color: theme.colors.onSurface }]}>
                  <Text style={styles.noteLabel}>{t('booking.tutorNotes')}: </Text>
                  {booking.tutor_notes}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Documents Section */}
        {booking.lesson_documents_urls && booking.lesson_documents_urls.length > 0 && (
          <View style={styles.documentsContainer}>
            <MaterialCommunityIcons
              name="file-document"
              size={18}
              color={theme.colors.primary}
            />
            <View style={styles.documentsContent}>
              <Text style={[styles.documentsTitle, { color: theme.colors.onSurface }]}>
                {t('booking.documents')} ({booking.lesson_documents_urls.length})
              </Text>
              {booking.lesson_documents_urls.map((docUrl, index) => (
                <TouchableOpacity key={index} style={styles.documentItem}>
                  <MaterialCommunityIcons
                    name="file-pdf-box"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text style={[styles.documentText, { color: theme.colors.primary }]}>
                    {t('booking.document')} {index + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
  durationText: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  lessonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  notesContent: {
    flex: 1,
  },
  noteText: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  noteLabel: {
    fontSize: 14,
    fontFamily: 'Baloo2_600SemiBold',
  },
  documentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  documentsContent: {
    flex: 1,
  },
  documentsTitle: {
    fontSize: 14,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 4,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  documentText: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
});

export default BookingCard;
