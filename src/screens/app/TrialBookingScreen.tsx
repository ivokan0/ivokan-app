import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import {
  getAvailableTrialSlots,
  createTrialBooking,
  convertTimeBetweenTimezones,
  getUserTimezone,
} from '../../services/trialBookings';
import { getTrialLessons } from '../../services/trialLessons';
import { getTutorProfile } from '../../services/profiles';
import { TrialLesson, AvailableTrialSlot } from '../../types/database';

interface RouteParams {
  tutorId: string;
}

interface TimeSlot {
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

const TrialBookingScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { profile } = useAuth();
  const { updateUserProfile } = useProfile();
  
  const { tutorId } = route.params as RouteParams;

  // State
  const [trialLessons, setTrialLessons] = useState<TrialLesson[]>([]);
  const [selectedTrialLesson, setSelectedTrialLesson] = useState<TrialLesson | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableTrialSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [studentNotes, setStudentNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tutorProfile, setTutorProfile] = useState<any>(null);
  const [studentTimezone, setStudentTimezone] = useState(getUserTimezone());



  useEffect(() => {
    loadInitialData();
  }, [tutorId]);

  useEffect(() => {
    if (selectedTrialLesson) {
      loadAvailableSlots();
    }
  }, [selectedTrialLesson, selectedDate]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      // Load trial lessons
       const { data: lessonsData, error: lessonsError } = await getTrialLessons();
      if (lessonsError) {
        console.error('Error loading trial lessons:', lessonsError);
      } else {
        setTrialLessons(lessonsData || []);
        if (lessonsData && lessonsData.length > 0) {
           // Sélectionner 50 min par défaut
           const defaultLesson = lessonsData.find(lesson => lesson.duration_minutes === 50) || lessonsData[0];
           setSelectedTrialLesson(defaultLesson);
        }
      }

      // Load tutor profile
      const { data: tutorData, error: tutorError } = await getTutorProfile(tutorId);
      if (tutorError) {
        console.error('Error loading tutor profile:', tutorError);
      } else {
        setTutorProfile(tutorData);
        // Set default language if tutor has taught languages
        if (tutorData?.taught_languages && tutorData.taught_languages.length > 0) {
          setSelectedLanguage(tutorData.taught_languages[0]);
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedTrialLesson) return;

    try {
      setIsLoading(true);

      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data: slotsData, error } = await getAvailableTrialSlots(
        tutorId,
        selectedTrialLesson.id,
        startDate,
        endDate,
        studentTimezone
      );

      if (error) {
        console.error('Error loading available slots:', error);
      } else {
        setAvailableSlots(slotsData || []);
        // If no date selected yet, preselect the first available day
        if ((!selectedDate || selectedDate.length === 0) && slotsData && slotsData.length > 0) {
          setSelectedDate(slotsData[0].date_actual);
        }
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedTrialLesson || !selectedDate || !selectedTimeSlot || !selectedLanguage || !profile) {
      Alert.alert(t('errors.validation.title'), t('errors.validation.selectAllFields'));
      return;
    }

    try {
      setIsLoading(true);

      // Calculate end time based on duration
      const startTime = new Date(`2000-01-01T${selectedTimeSlot.start_time}:00`);
      const endTime = new Date(startTime.getTime() + selectedTrialLesson.duration_minutes * 60000);
      const endTimeString = endTime.toTimeString().slice(0, 5);

      const bookingData = {
        student_id: profile.user_id,
        tutor_id: tutorId,
        trial_lesson_id: selectedTrialLesson.id,
        language_id: selectedLanguage,
        booking_date: selectedDate,
        start_time: selectedTimeSlot.start_time,
        end_time: endTimeString,
        student_timezone: studentTimezone,
        tutor_timezone: tutorProfile?.timezone || 'UTC',
        student_notes: studentNotes.trim() || undefined,
      };

      // Naviguer vers l'écran de confirmation sans créer la réservation
      (navigation as any).navigate('TrialBookingConfirmation', {
        tutor: {
          first_name: tutorProfile?.first_name,
          last_name: tutorProfile?.last_name,
          avatar_url: tutorProfile?.avatar_url,
          average_rating: tutorProfile?.tutor_stats?.average_rating,
          total_reviews: tutorProfile?.tutor_stats?.total_reviews,
        },
        booking: {
          date: selectedDate,
          start_time: selectedTimeSlot.start_time,
          end_time: endTimeString,
          duration_minutes: selectedTrialLesson.duration_minutes,
          price_eur: selectedTrialLesson.price_eur,
          price_fcfa: selectedTrialLesson.price_fcfa,
          language_id: selectedLanguage,
        },
        bookingData: bookingData, // Passer les données de réservation
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert(t('errors.booking.title'), t('errors.booking.create'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const formatTimeSlot = (slot: TimeSlot) => {
    const startTime = formatTime(slot.start_time);
    const endTime = formatTime(slot.end_time);
    return `${startTime} - ${endTime}`;
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

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { weekday: 'short' });
  };

  const getDateNumber = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const getAvailableTimeSlots = (dateString: string): TimeSlot[] => {
    const daySlots = availableSlots.find(slot => slot.date_actual === dateString);
    const availableWindows = daySlots?.available_slots || [];
    
    if (!selectedTrialLesson || availableWindows.length === 0) {
      return [];
    }

    const duration = selectedTrialLesson.duration_minutes;
    const breakMinutes = typeof tutorProfile?.break_duration_minutes === 'number' ? tutorProfile.break_duration_minutes : 15;
    const minNoticeMinutes = tutorProfile?.minimum_time_notice || 120; // 2 heures par défaut
    const discreteSlots: TimeSlot[] = [];

    // Calculer le seuil minimum (maintenant + délai minimum)
    const now = new Date();
    const minThreshold = new Date(now.getTime() + minNoticeMinutes * 60000);

    for (const window of availableWindows) {
      // Convertir les heures en minutes pour faciliter les calculs
      const windowStartMinutes = parseInt(window.start_time.split(':')[0]) * 60 + parseInt(window.start_time.split(':')[1]);
      const windowEndMinutes = parseInt(window.end_time.split(':')[0]) * 60 + parseInt(window.end_time.split(':')[1]);
      
      // Générer des créneaux de la durée sélectionnée
      let currentStartMinutes = windowStartMinutes;
      
      while (currentStartMinutes + duration <= windowEndMinutes) {
        const slotStartMinutes = currentStartMinutes;
        const slotEndMinutes = currentStartMinutes + duration;
        
        // Vérifier le délai minimum
        const slotDateTime = new Date(`${dateString}T${Math.floor(slotStartMinutes / 60).toString().padStart(2, '0')}:${(slotStartMinutes % 60).toString().padStart(2, '0')}:00`);
        
        if (slotDateTime >= minThreshold) {
          // Convertir en format HH:MM
          const startTime = `${Math.floor(slotStartMinutes / 60).toString().padStart(2, '0')}:${(slotStartMinutes % 60).toString().padStart(2, '0')}`;
          const endTime = `${Math.floor(slotEndMinutes / 60).toString().padStart(2, '0')}:${(slotEndMinutes % 60).toString().padStart(2, '0')}`;
          
          discreteSlots.push({
            start_time: startTime,
            end_time: endTime,
            duration_minutes: duration
          });
        }
        
        // Passer au créneau suivant avec un intervalle (pause) configurable
        currentStartMinutes += duration + breakMinutes;
      }
    }

    return discreteSlots;
  };



  const renderDurationTabs = () => (
    <View style={styles.durationTabsContainer}>
      {trialLessons.map((lesson) => (
        <TouchableOpacity
          key={lesson.id}
          style={[
            styles.durationTab,
            selectedTrialLesson?.id === lesson.id && [styles.durationTabActive, { backgroundColor: theme.colors.primary }],
            selectedTrialLesson?.id !== lesson.id && { backgroundColor: '#f5f5f5' }
          ]}
          onPress={() => setSelectedTrialLesson(lesson)}
        >
          <Text style={[
            styles.durationTabText,
            selectedTrialLesson?.id === lesson.id 
              ? { color: '#fff', fontFamily: 'Baloo2_600SemiBold' }
              : { color: theme.colors.onSurface, fontFamily: 'Baloo2_500Medium' }
          ]}>
            {lesson.duration_minutes} min
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderLanguageSelection = () => {
    if (!tutorProfile?.taught_languages || tutorProfile.taught_languages.length === 0) {
      return null;
    }

    return (
      <View style={styles.languageContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, fontFamily: 'Baloo2_600SemiBold' }]}>
          {t('booking.selectLanguage')}
        </Text>
        
        <View style={styles.languageTabs}>
          {tutorProfile.taught_languages.map((lang: string, index: number) => {
            const proficiency = (tutorProfile.proficiency_taught_lan as any)?.[lang]?.level;
            const languageName = lang.charAt(0).toUpperCase() + lang.slice(1);
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.languageTab,
                  selectedLanguage === lang && [styles.languageTabActive, { backgroundColor: theme.colors.primary }],
                  selectedLanguage !== lang && { backgroundColor: '#f5f5f5' }
                ]}
                onPress={() => setSelectedLanguage(lang)}
              >
                <Text style={[
                  styles.languageTabText,
                  selectedLanguage === lang 
                    ? { color: '#fff', fontFamily: 'Baloo2_600SemiBold' }
                    : { color: theme.colors.onSurface, fontFamily: 'Baloo2_500Medium' }
                ]}>
                  {languageName}
                </Text>
                {proficiency && (
                  <Text style={[
                    styles.languageProficiency,
                    selectedLanguage === lang 
                      ? { color: '#fff', fontFamily: 'Baloo2_400Regular' }
                      : { color: theme.colors.onSurfaceVariant, fontFamily: 'Baloo2_400Regular' }
                  ]}>
                    {t(`languages.levels.${proficiency}`)}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderCalendarHeader = () => {
    if (!selectedTrialLesson) return null;

    const calendarDates = availableSlots.slice(0, 14); // Show first 14 days (2 weeks)

    // Calculate the month range to display
    const getMonthRangeTitle = () => {
      if (!availableSlots || availableSlots.length === 0) {
        return new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      }
      
      const firstDate = new Date(availableSlots[0].date_actual);
      const lastDate = new Date(availableSlots[availableSlots.length - 1].date_actual);
      
      const firstMonth = firstDate.toLocaleDateString('fr-FR', { month: 'long' });
      const lastMonth = lastDate.toLocaleDateString('fr-FR', { month: 'long' });
      const year = lastDate.getFullYear();
      
      if (firstMonth === lastMonth) {
        return `${firstMonth} ${year}`;
      } else {
        return `${firstMonth}-${lastMonth} ${year}`;
      }
    };

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.monthYearContainer}>
          <Text style={[styles.monthYearText, { color: theme.colors.onSurface, fontFamily: 'Baloo2_600SemiBold' }]}>
            {getMonthRangeTitle()}
          </Text>
          <TouchableOpacity onPress={() => {
            const today = new Date().toISOString().split('T')[0];
            setSelectedDate(today);
          }}>
            <Text style={[styles.todayButton, { color: theme.colors.primary, fontFamily: 'Baloo2_500Medium' }]}>{t('calendar.today')}</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={calendarDates}
          keyExtractor={(item) => item.date_actual}
          renderItem={({ item }) => {
            const dayName = getDayName(item.date_actual);
            const dayNumber = getDateNumber(item.date_actual);
            const isSelected = selectedDate === item.date_actual;
            const isTodayDate = isToday(item.date_actual);
            
            return (
              <TouchableOpacity
                style={[
                  styles.calendarDay,
                  isSelected && [styles.calendarDaySelected, { backgroundColor: theme.colors.primary }],
                  isTodayDate && !isSelected && { backgroundColor: theme.colors.primaryContainer }
                ]}
                onPress={() => setSelectedDate(item.date_actual)}
              >
                <Text style={[
                  styles.calendarDayName,
                  isSelected 
                    ? { color: '#fff', fontFamily: 'Baloo2_500Medium' }
                    : { color: theme.colors.onSurface, fontFamily: 'Baloo2_400Regular' }
                ]}>
                  {dayName}
                </Text>
                <Text style={[
                  styles.calendarDayNumber,
                  isSelected 
                    ? { color: '#fff', fontFamily: 'Baloo2_600SemiBold' }
                    : { color: theme.colors.onSurface, fontFamily: 'Baloo2_600SemiBold' }
                ]}>
                  {dayNumber}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.calendarList}
        />
      </View>
    );
  };

  const renderTimezone = () => (
    <View style={styles.timezoneContainer}>
      <Text style={[styles.timezoneText, { color: theme.colors.onSurfaceVariant, fontFamily: 'Baloo2_400Regular' }]}>
        {t('booking.inYourTimezone')} {studentTimezone}
      </Text>
    </View>
  );

  const renderTimeSlots = () => {
    if (!selectedDate) return null;

    const timeSlots = getAvailableTimeSlots(selectedDate);
    
    if (timeSlots.length === 0) {
      return (
        <View style={styles.noSlotsContainer}>
          <Text style={[styles.noSlotsText, { color: theme.colors.onSurfaceVariant, fontFamily: 'Baloo2_400Regular' }]}>
            {t('booking.noSlotsForDate')}
          </Text>
        </View>
      );
    }

    // Group time slots by period
    const morningSlots = timeSlots.filter(slot => {
      const hour = parseInt(slot.start_time.split(':')[0]);
      return hour < 12;
    });

    const afternoonSlots = timeSlots.filter(slot => {
      const hour = parseInt(slot.start_time.split(':')[0]);
      return hour >= 12 && hour < 18;
    });

    const eveningSlots = timeSlots.filter(slot => {
      const hour = parseInt(slot.start_time.split(':')[0]);
      return hour >= 18;
    });

    const renderSlotGroup = (title: string, slots: TimeSlot[]) => {
      if (slots.length === 0) return null;

      return (
        <View style={styles.slotGroup}>
          <Text style={[styles.slotGroupTitle, { color: theme.colors.onSurface, fontFamily: 'Baloo2_600SemiBold' }]}>
            {title}
          </Text>
          <View style={styles.slotsGrid}>
            {slots.map((slot, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeSlot,
                  selectedTimeSlot?.start_time === slot.start_time && [styles.timeSlotSelected, { backgroundColor: theme.colors.primary }],
                  { backgroundColor: selectedTimeSlot?.start_time === slot.start_time ? theme.colors.primary : '#f5f5f5' }
                ]}
                onPress={() => setSelectedTimeSlot(slot)}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedTimeSlot?.start_time === slot.start_time 
                    ? { color: '#fff', fontFamily: 'Baloo2_500Medium' }
                    : { color: theme.colors.onSurface, fontFamily: 'Baloo2_500Medium' }
                ]}>
                  {formatTimeSlot(slot)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    };

    return (
      <ScrollView style={styles.timeSlotsContainer}>
        {renderSlotGroup(t('booking.morning'), morningSlots)}
        {renderSlotGroup(t('booking.afternoon'), afternoonSlots)}
        {renderSlotGroup(t('booking.evening'), eveningSlots)}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface, fontFamily: 'Baloo2_600SemiBold' }]}>
            {selectedTrialLesson ? `${selectedTrialLesson.duration_minutes} min de cours` : 'Cours d\'essai'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant, fontFamily: 'Baloo2_400Regular' }]}>
            Pour discuter de vos objectifs
          </Text>
        </View>
      </View>

      {/* Duration Tabs */}
      {renderDurationTabs()}

      {/* Language Selection */}
      {renderLanguageSelection()}

      {/* Calendar */}
      {renderCalendarHeader()}

      {/* Timezone */}
      {renderTimezone()}

      {/* Time Slots */}
      {renderTimeSlots()}

      {/* Book Button - Fixed at bottom */}
      <View style={styles.bottomContainer}>
        <Button
          mode="contained"
          onPress={handleCreateBooking}
          loading={isLoading}
          disabled={!selectedTrialLesson || !selectedDate || !selectedTimeSlot || !selectedLanguage}
          style={styles.bookButton}
          labelStyle={{ fontFamily: 'Baloo2_600SemiBold', fontSize: 16 }}
        >
          Continuer
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 24,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  durationTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
    justifyContent: 'center',
  },
  durationTab: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  durationTabActive: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  durationTabText: {
    fontSize: 18,
    fontWeight: '600',
  },
  languageContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  languageTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  languageTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageTabActive: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  languageTabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  languageProficiency: {
    fontSize: 12,
    marginTop: 2,
  },
  calendarContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  monthYearContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthYearText: {
    fontSize: 18,
  },
  todayButton: {
    fontSize: 16,
  },
  calendarList: {
    paddingRight: 16,
  },
  calendarDay: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 80,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
  },
  calendarDaySelected: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  calendarDayName: {
    fontSize: 12,
    marginBottom: 4,
  },
  calendarDayNumber: {
    fontSize: 18,
  },
  timezoneContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  timezoneText: {
    fontSize: 14,
    textAlign: 'center',
  },
  timeSlotsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  slotGroup: {
    marginBottom: 24,
  },
  slotGroupTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    width: '48%', // Pour avoir 2 créneaux par ligne avec un petit espace
    alignItems: 'center',
  },
  timeSlotSelected: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timeSlotText: {
    fontSize: 14,
  },
  noSlotsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noSlotsText: {
    fontSize: 16,
    textAlign: 'center',
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  bookButton: {
    paddingVertical: 12,
  },
  // Modal styles (kept for compatibility)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalItemSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  modalItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  todayBadge: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default TrialBookingScreen;
