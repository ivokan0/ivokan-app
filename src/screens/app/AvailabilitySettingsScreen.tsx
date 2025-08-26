import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, Divider, Button, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AppButton from '../../components/ui/AppButton';
import TutorCalendarView from '../../components/TutorCalendarView';
import { AvailabilitySlot, UnavailabilityPeriod, TutorAvailability } from '../../types/database';
import {
  getWeeklyAvailability,
  getUnavailabilityPeriods,
  deleteAvailability,
} from '../../services/availability';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dimanche' },
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
];

const AvailabilitySettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const { profile } = useAuth();
  const { updateUserProfile } = useProfile();
  
  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([]);
  const [unavailabilities, setUnavailabilities] = useState<UnavailabilityPeriod[]>([]);
  const [minimumTimeNotice, setMinimumTimeNotice] = useState(profile?.minimum_time_notice?.toString() || '120');
  const [isLoading, setIsLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadAvailabilityData();
    }, [profile?.user_id])
  );

  const loadAvailabilityData = async () => {
    if (!profile?.user_id) return;

    try {
      setIsLoading(true);
      
      // Load weekly availability
      const { data: weeklyData, error: weeklyError } = await getWeeklyAvailability(profile.user_id);
      if (weeklyError) {
        console.error('Error loading weekly availability:', weeklyError);
      } else {
        // Convert TutorAvailability to AvailabilitySlot format
        const slots: AvailabilitySlot[] = weeklyData?.map(item => ({
          id: item.id,
          day_of_week: item.day_of_week!,
          start_time: item.start_time!,
          end_time: item.end_time!,
        })) || [];
        setAvailabilities(slots);
      }

      // Load unavailability periods
      const { data: unavailabilityData, error: unavailabilityError } = await getUnavailabilityPeriods(profile.user_id);
      if (unavailabilityError) {
        console.error('Error loading unavailability periods:', unavailabilityError);
      } else {
        // Convert TutorAvailability to UnavailabilityPeriod format
        const periods: UnavailabilityPeriod[] = unavailabilityData?.map(item => ({
          id: item.id,
          start_date: item.start_date!,
          end_date: item.end_date!,
          start_time: item.start_time || undefined,
          end_time: item.end_time || undefined,
          is_full_day: item.is_full_day!,
        })) || [];
        setUnavailabilities(periods);
      }
    } catch (error) {
      console.error('Error loading availability data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMinimumTimeNotice = async () => {
    if (!profile?.user_id) return;

    try {
      setIsLoading(true);
      await updateUserProfile({
        minimum_time_notice: parseInt(minimumTimeNotice, 10),
      });

      Alert.alert(t('common.success'), t('profile.saveSuccess.message'));
    } catch (error) {
      console.error('Error saving minimum time notice:', error);
      Alert.alert(t('common.error'), t('errors.save.message'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWeeklySlot = () => {
    (navigation as any).navigate('AvailabilitySlot', {
      mode: 'add',
      type: 'weekly_availability'
    });
  };

  const handleEditWeeklySlot = (slot: TutorAvailability) => {
    (navigation as any).navigate('AvailabilitySlot', {
      mode: 'edit',
      type: 'weekly_availability',
      availabilityId: slot.id,
      initialData: slot
    });
  };

  const handleAddUnavailability = () => {
    (navigation as any).navigate('AvailabilitySlot', {
      mode: 'add',
      type: 'unavailability'
    });
  };

  const handleEditUnavailability = (unavailability: TutorAvailability) => {
    (navigation as any).navigate('AvailabilitySlot', {
      mode: 'edit',
      type: 'unavailability',
      availabilityId: unavailability.id,
      initialData: unavailability
    });
  };

  const handleDeleteSlot = (id: string) => {
    Alert.alert(
      t('settings.availability.deleteConfirmation'),
      t('settings.availability.deleteMessage'),
      [
        { text: t('settings.availability.cancel'), style: 'cancel' },
        { 
          text: t('settings.availability.delete'), 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);

              const { error } = await deleteAvailability(id, profile?.user_id);

              if (error) {
                throw error;
              }

            setAvailabilities(availabilities.filter(slot => slot.id !== id));
            } catch (error) {
              console.error('Error deleting availability slot:', error);
              Alert.alert(
                t('errors.save.title'),
                t('errors.save.message'),
                [{ text: 'OK' }]
              );
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteUnavailability = (id: string) => {
    Alert.alert(
      t('settings.availability.deleteConfirmation'),
      t('settings.availability.deleteUnavailabilityMessage'),
      [
        { text: t('settings.availability.cancel'), style: 'cancel' },
        { 
          text: t('settings.availability.delete'), 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);

              const { error } = await deleteAvailability(id, profile?.user_id);

              if (error) {
                throw error;
              }

              setUnavailabilities(unavailabilities.filter(period => period.id !== id));
            } catch (error) {
              console.error('Error deleting unavailability period:', error);
              Alert.alert(
                t('errors.save.title'),
                t('errors.save.message'),
                [{ text: 'OK' }]
              );
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    const month = dateObj.toLocaleDateString(locale, { month: 'short' });
    const year = dateObj.getFullYear();
    return `${day} ${month}. ${year}`;
  };

  const getDayLabel = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(day => day.value === dayOfWeek)?.label || '';
  };

  const sortedAvailabilities = [...availabilities].sort((a, b) => {
    if (a.day_of_week !== b.day_of_week) {
      return a.day_of_week - b.day_of_week;
    }
    return a.start_time.localeCompare(b.start_time);
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.onSurface, fontFamily: 'Baloo2_600SemiBold' }]}>
          {t('settings.availability.title')}
        </Text>

        {/* Minimum Time Notice */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, fontFamily: 'Baloo2_500Medium' }]}>
            {t('settings.availability.minimumTimeNotice')}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant, fontFamily: 'Baloo2_400Regular' }]}>
            {t('settings.availability.minimumTimeNoticeDescription')}
          </Text>
          <TextInput
            value={minimumTimeNotice}
            onChangeText={setMinimumTimeNotice}
            style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
            keyboardType="numeric"
            placeholder="120"
          />
          <Button
            mode="contained"
            onPress={handleSaveMinimumTimeNotice}
            loading={isLoading}
            style={styles.saveButton}
          >
            {t('profile.save')}
          </Button>
        </View>

        {/* Weekly Availability */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, fontFamily: 'Baloo2_500Medium' }]}>
              {t('settings.availability.mySlots')}
            </Text>
            <TouchableOpacity
              onPress={handleAddWeeklySlot}
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={theme.colors.onPrimary}
              />
            </TouchableOpacity>
          </View>

          {availabilities.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant, fontFamily: 'Baloo2_400Regular' }]}>
              {t('settings.availability.noSlots')}
            </Text>
          ) : (
            <View style={styles.availabilityList}>
              {sortedAvailabilities.map((slot, index) => (
                <React.Fragment key={slot.id}>
                  <View style={styles.availabilityItem}>
                    <View style={styles.availabilityInfo}>
                      <Text style={[styles.dayText, { color: theme.colors.onSurface, fontFamily: 'Baloo2_500Medium' }]}>
                        {getDayLabel(slot.day_of_week)}
                      </Text>
                      <Text style={[styles.timeText, { color: theme.colors.onSurfaceVariant, fontFamily: 'Baloo2_400Regular' }]}>
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </Text>
                    </View>
                    <View style={styles.availabilityActions}>
                      <TouchableOpacity
                        onPress={() => handleEditWeeklySlot(slot as any)}
                        style={styles.actionButton}
                      >
                        <MaterialCommunityIcons
                          name="pencil"
                          size={20}
                          color={theme.colors.primary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteSlot(slot.id!)}
                        style={styles.actionButton}
                      >
                        <MaterialCommunityIcons
                          name="delete"
                          size={20}
                          color={theme.colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {index < availabilities.length - 1 && <Divider style={styles.itemDivider} />}
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        {/* Unavailability */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, fontFamily: 'Baloo2_500Medium' }]}>
              {t('settings.availability.unavailability')}
            </Text>
                  <TouchableOpacity
              onPress={handleAddUnavailability}
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={theme.colors.onPrimary}
              />
                  </TouchableOpacity>
            </View>

          {unavailabilities.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant, fontFamily: 'Baloo2_400Regular' }]}>
              {t('settings.availability.noUnavailability')}
            </Text>
          ) : (
            <View style={styles.availabilityList}>
              {unavailabilities.map((period, index) => (
                <React.Fragment key={period.id}>
                  <View style={styles.availabilityItem}>
                    <View style={styles.availabilityInfo}>
                      <Text style={[styles.dayText, { color: theme.colors.onSurface, fontFamily: 'Baloo2_500Medium' }]}>
                        {formatDate(period.start_date)} - {formatDate(period.end_date)}
                      </Text>
                      <Text style={[styles.timeText, { color: theme.colors.onSurfaceVariant, fontFamily: 'Baloo2_400Regular' }]}>
                        {period.is_full_day 
                          ? t('settings.availability.fullDay')
                          : `${formatTime(period.start_time!)} - ${formatTime(period.end_time!)}`
                        }
                      </Text>
                      {period.is_full_day && (
                        <Text style={[styles.fullDayBadge, { color: theme.colors.error, fontFamily: 'Baloo2_400Regular' }]}>
                          {t('settings.availability.fullDayBadge')}
                        </Text>
                      )}
                    </View>
                    <View style={styles.availabilityActions}>
                      <TouchableOpacity
                        onPress={() => handleEditUnavailability(period as any)}
                        style={styles.actionButton}
                      >
                        <MaterialCommunityIcons
                          name="pencil"
                          size={20}
                          color={theme.colors.primary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteUnavailability(period.id!)}
                        style={styles.actionButton}
                      >
                        <MaterialCommunityIcons
                          name="delete"
                          size={20}
                          color={theme.colors.error}
                        />
                      </TouchableOpacity>
              </View>
                  </View>
                  {index < unavailabilities.length - 1 && <Divider style={styles.itemDivider} />}
                </React.Fragment>
              ))}
            </View>
          )}
            </View>

        {/* Calendar View Button */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, fontFamily: 'Baloo2_500Medium' }]}>
            {t('settings.availability.calendarView')}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant, fontFamily: 'Baloo2_400Regular' }]}>
            {t('settings.availability.calendarViewDescription')}
          </Text>
              <Button 
                mode="contained" 
            onPress={() => setShowCalendar(true)}
            style={styles.calendarButton}
              >
            {t('settings.availability.viewCalendar')}
              </Button>
            </View>
          </View>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface, fontFamily: 'Baloo2_600SemiBold' }]}>
              {t('settings.availability.calendarView')}
            </Text>
            <TouchableOpacity
              onPress={() => setShowCalendar(false)}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>
          <TutorCalendarView 
            tutorId={profile?.user_id || ''}
            onClose={() => setShowCalendar(false)}
        />
      </View>
      </Modal>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availabilityList: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
  },
  availabilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  availabilityInfo: {
    flex: 1,
  },
  dayText: {
    fontSize: 16,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
  },
  fullDayBadge: {
    fontSize: 12,
    marginTop: 4,
  },
  availabilityActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  itemDivider: {
    marginHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 16,
  },
  calendarButton: {
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
  },
  closeButton: {
    padding: 4,
  },
});

export default AvailabilitySettingsScreen;
