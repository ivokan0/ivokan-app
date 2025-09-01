import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Switch,
  Divider,
  useTheme,
} from 'react-native-paper';

import { useAuth } from '../../hooks/useAuth';
import {
  createAvailability,
  updateAvailability,
  getWeeklyAvailability,
  getUnavailabilityPeriods,
} from '../../services/availability';
import { TutorAvailability } from '../../types/database';

interface RouteParams {
  mode: 'add' | 'edit';
  type: 'weekly_availability' | 'unavailability';
  availabilityId?: string;
  initialData?: Partial<TutorAvailability>;
}

const AvailabilitySlotScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { profile } = useAuth();
  
  const { mode, type, availabilityId, initialData } = route.params as RouteParams;

  // Form state
  const [formData, setFormData] = useState({
    day_of_week: initialData?.day_of_week ?? 0,
    start_time: initialData?.start_time ?? '09:00',
    end_time: initialData?.end_time ?? '10:00',
    start_date: initialData?.start_date ?? new Date().toISOString().split('T')[0],
    end_date: initialData?.end_date ?? new Date().toISOString().split('T')[0],
    is_full_day: initialData?.is_full_day ?? false,
  });

  // Modal states
  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [showEndDateModal, setShowEndDateModal] = useState(false);
  const [showStartTimeModal, setShowStartTimeModal] = useState(false);
  const [showEndTimeModal, setShowEndTimeModal] = useState(false);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Day of week options
  const dayOptions = [
    { value: 0, label: t('settings.availability.sunday') },
    { value: 1, label: t('settings.availability.monday') },
    { value: 2, label: t('settings.availability.tuesday') },
    { value: 3, label: t('settings.availability.wednesday') },
    { value: 4, label: t('settings.availability.thursday') },
    { value: 5, label: t('settings.availability.friday') },
    { value: 6, label: t('settings.availability.saturday') },
  ];

  // Time options (every 30 minutes)
  const timeOptions = [
    '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
    '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
  ];

  // Date options (next 30 days)
  const getDateOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const formattedDate = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      options.push({ value: dateString, label: formattedDate });
    }
    return options;
  };

  const dateOptions = getDateOptions();

  // Validation function
  const validateForm = (): string | null => {
    if (type === 'weekly_availability') {
      if (formData.start_time >= formData.end_time) {
        return t('settings.availability.errors.endTimeAfterStart');
      }
    } else {
      if (formData.start_date > formData.end_date) {
        return t('settings.availability.errors.endDateAfterStart');
      }
      if (!formData.is_full_day && formData.start_time >= formData.end_time) {
        return t('settings.availability.errors.endTimeAfterStart');
      }
    }
    return null;
  };

  // Check for overlapping slots
  const checkOverlaps = async (): Promise<string | null> => {
    if (!profile?.user_id) return null;
    
    if (type === 'weekly_availability') {
      // Check weekly availability overlaps
      const { data: existingSlots } = await getWeeklyAvailability(profile.user_id);
      const overlappingSlot = existingSlots?.find(slot => 
        slot.id !== availabilityId && 
        slot.day_of_week === formData.day_of_week &&
        slot.start_time && slot.end_time &&
        ((slot.start_time <= formData.start_time && slot.end_time > formData.start_time) ||
         (slot.start_time < formData.end_time && slot.end_time >= formData.end_time) ||
         (slot.start_time >= formData.start_time && slot.end_time <= formData.end_time))
      );
      
      if (overlappingSlot) {
        return t('settings.availability.errors.weeklyOverlap', {
          day: dayOptions[formData.day_of_week].label,
          time: `${overlappingSlot.start_time}-${overlappingSlot.end_time}`
        });
      }
    } else {
      // Check unavailability overlaps
      const { data: existingUnavailability } = await getUnavailabilityPeriods(profile.user_id);
      const overlappingPeriod = existingUnavailability?.find(period => 
        period.id !== availabilityId &&
        period.start_date && period.end_date &&
        period.start_date <= formData.end_date &&
        period.end_date >= formData.start_date
      );
      
      if (overlappingPeriod) {
        return t('settings.availability.errors.unavailabilityOverlap', {
          dates: `${overlappingPeriod.start_date} - ${overlappingPeriod.end_date}`
        });
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert(t('common.error'), validationError);
      return;
    }

    setLoading(true);
    try {
      const overlapError = await checkOverlaps();
      if (overlapError) {
        Alert.alert(t('common.error'), overlapError);
        return;
      }

      const submitData: any = {
        tutor_id: profile!.user_id,
        type,
      };

      if (type === 'weekly_availability') {
        submitData.day_of_week = formData.day_of_week;
        submitData.start_time = formData.start_time;
        submitData.end_time = formData.end_time;
        // Set unavailability fields to undefined for weekly availability
        submitData.start_date = undefined;
        submitData.end_date = undefined;
        submitData.is_full_day = undefined;
      } else {
        submitData.start_date = formData.start_date;
        submitData.end_date = formData.end_date;
        submitData.is_full_day = formData.is_full_day;
        // Only include time fields if not full day
        if (!formData.is_full_day) {
          submitData.start_time = formData.start_time;
          submitData.end_time = formData.end_time;
        } else {
          submitData.start_time = undefined;
          submitData.end_time = undefined;
        }
        // Set weekly fields to undefined for unavailability
        submitData.day_of_week = undefined;
      }

              if (mode === 'add') {
          const { error } = await createAvailability(submitData, profile!.user_id);
          if (error) throw error;
          Alert.alert(t('common.success'), t('settings.availability.added'), [
            { text: t('common.ok'), onPress: () => navigation.goBack() }
          ]);
        } else {
          const { error } = await updateAvailability(availabilityId!, submitData, profile!.user_id);
          if (error) throw error;
          Alert.alert(t('common.success'), t('settings.availability.updated'), [
            { text: t('common.ok'), onPress: () => navigation.goBack() }
          ]);
        }
    } catch (error) {
      console.error('Error saving availability:', error);
      Alert.alert(t('common.error'), t('settings.availability.saveError'));
    } finally {
      setLoading(false);
    }
  };



  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Modal components
  const TimePickerModal = ({ visible, onDismiss, onSelect, currentValue, title }: {
    visible: boolean;
    onDismiss: () => void;
    onSelect: (time: string) => void;
    currentValue: string;
    title: string;
  }) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface, fontFamily: 'Baloo2_600SemiBold' }]}>
            {title}
          </Text>
          <ScrollView style={styles.modalScrollView}>
            {timeOptions.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.modalItem,
                  currentValue === time && { backgroundColor: theme.colors.primaryContainer }
                ]}
                onPress={() => {
                  onSelect(time);
                  onDismiss();
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  { color: currentValue === time ? theme.colors.onPrimaryContainer : theme.colors.onSurface, fontFamily: 'Baloo2_400Regular' }
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button mode="outlined" onPress={onDismiss} style={styles.modalButton}>
            {t('settings.availability.cancel')}
          </Button>
        </View>
      </View>
    </Modal>
  );

  const DatePickerModal = ({ visible, onDismiss, onSelect, currentValue, title }: {
    visible: boolean;
    onDismiss: () => void;
    onSelect: (date: string) => void;
    currentValue: string;
    title: string;
  }) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface, fontFamily: 'Baloo2_600SemiBold' }]}>
            {title}
          </Text>
          <ScrollView style={styles.modalScrollView}>
            {dateOptions.map((date) => (
              <TouchableOpacity
                key={date.value}
                style={[
                  styles.modalItem,
                  currentValue === date.value && { backgroundColor: theme.colors.primaryContainer }
                ]}
                onPress={() => {
                  onSelect(date.value);
                  onDismiss();
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  { color: currentValue === date.value ? theme.colors.onPrimaryContainer : theme.colors.onSurface, fontFamily: 'Baloo2_400Regular' }
                ]}>
                  {date.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button mode="outlined" onPress={onDismiss} style={styles.modalButton}>
            {t('settings.availability.cancel')}
          </Button>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface, fontFamily: 'Baloo2_600SemiBold' }]}>
            {mode === 'add' ? t('settings.availability.addTitle') : t('settings.availability.editTitle')}
          </Text>
          
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant, fontFamily: 'Baloo2_400Regular' }]}>
            {type === 'weekly_availability' ? t('settings.availability.weeklyType') : t('settings.availability.unavailabilityType')}
          </Text>

          <Divider style={styles.divider} />

          {type === 'weekly_availability' ? (
            // Weekly Availability Form
            <View>
              {/* Day of Week Selector */}
              <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface, fontFamily: 'Baloo2_500Medium' }]}>
                {t('settings.availability.dayOfWeek')}
              </Text>
              <View style={styles.daySelector}>
                {dayOptions.map((day) => (
                  <Button
                    key={day.value}
                    mode={formData.day_of_week === day.value ? 'contained' : 'outlined'}
                    onPress={() => setFormData(prev => ({ ...prev, day_of_week: day.value }))}
                    style={styles.dayButton}
                    labelStyle={{ fontFamily: 'Baloo2_400Regular' }}
                  >
                    {day.label}
                  </Button>
                ))}
              </View>

                              {/* Time Selectors */}
                <View style={styles.timeContainer}>
                  <View style={styles.timeInput}>
                    <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface, fontFamily: 'Baloo2_500Medium' }]}>
                      {t('settings.availability.startTime')}
                    </Text>
                    <Button
                      mode="outlined"
                      onPress={() => setShowStartTimeModal(true)}
                      style={styles.timeButton}
                      labelStyle={{ fontFamily: 'Baloo2_400Regular' }}
                    >
                      {formatTime(formData.start_time)}
                    </Button>
                  </View>

                  <View style={styles.timeInput}>
                    <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface, fontFamily: 'Baloo2_500Medium' }]}>
                      {t('settings.availability.endTime')}
                    </Text>
                    <Button
                      mode="outlined"
                      onPress={() => setShowEndTimeModal(true)}
                      style={styles.timeButton}
                      labelStyle={{ fontFamily: 'Baloo2_400Regular' }}
                    >
                      {formatTime(formData.end_time)}
                    </Button>
                  </View>
                </View>
            </View>
          ) : (
            // Unavailability Form
            <View>
              {/* Date Selectors */}
                              <View style={styles.dateContainer}>
                  <View style={styles.dateInput}>
                    <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface, fontFamily: 'Baloo2_500Medium' }]}>
                      {t('settings.availability.startDate')}
                    </Text>
                    <Button
                      mode="outlined"
                      onPress={() => setShowStartDateModal(true)}
                      style={styles.dateButton}
                      labelStyle={{ fontFamily: 'Baloo2_400Regular' }}
                    >
                      {formatDate(formData.start_date)}
                    </Button>
                  </View>

                  <View style={styles.dateInput}>
                    <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface, fontFamily: 'Baloo2_500Medium' }]}>
                      {t('settings.availability.endDate')}
                    </Text>
                    <Button
                      mode="outlined"
                      onPress={() => setShowEndDateModal(true)}
                      style={styles.dateButton}
                      labelStyle={{ fontFamily: 'Baloo2_400Regular' }}
                    >
                      {formatDate(formData.end_date)}
                    </Button>
                  </View>
                </View>

              {/* Full Day Toggle */}
              <View style={styles.fullDayContainer}>
                <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface, fontFamily: 'Baloo2_500Medium' }]}>
                  {t('settings.availability.fullDay')}
                </Text>
                <Switch
                  value={formData.is_full_day}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, is_full_day: value }))}
                />
              </View>

              {/* Time Selectors (only if not full day) */}
              {!formData.is_full_day && (
                <View style={styles.timeContainer}>
                  <View style={styles.timeInput}>
                    <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface, fontFamily: 'Baloo2_500Medium' }]}>
                      {t('settings.availability.startTime')}
                    </Text>
                    <Button
                      mode="outlined"
                      onPress={() => setShowStartTimeModal(true)}
                      style={styles.timeButton}
                      labelStyle={{ fontFamily: 'Baloo2_400Regular' }}
                    >
                      {formatTime(formData.start_time)}
                    </Button>
                  </View>

                  <View style={styles.timeInput}>
                    <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface, fontFamily: 'Baloo2_500Medium' }]}>
                      {t('settings.availability.endTime')}
                    </Text>
                    <Button
                      mode="outlined"
                      onPress={() => setShowEndTimeModal(true)}
                      style={styles.timeButton}
                      labelStyle={{ fontFamily: 'Baloo2_400Regular' }}
                    >
                      {formatTime(formData.end_time)}
                    </Button>
                  </View>
                </View>
              )}
            </View>
          )}

          <Divider style={styles.divider} />

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            labelStyle={{ fontFamily: 'Baloo2_500Medium' }}
          >
            {mode === 'add' ? t('settings.availability.add') : t('settings.availability.update')}
          </Button>
        </Card.Content>
                      </Card>

        {/* Modals */}
        <TimePickerModal
          visible={showStartTimeModal}
          onDismiss={() => setShowStartTimeModal(false)}
          onSelect={(time) => setFormData(prev => ({ ...prev, start_time: time }))}
          currentValue={formData.start_time}
          title={t('settings.availability.startTime')}
        />
        
        <TimePickerModal
          visible={showEndTimeModal}
          onDismiss={() => setShowEndTimeModal(false)}
          onSelect={(time) => setFormData(prev => ({ ...prev, end_time: time }))}
          currentValue={formData.end_time}
          title={t('settings.availability.endTime')}
        />
        
        <DatePickerModal
          visible={showStartDateModal}
          onDismiss={() => setShowStartDateModal(false)}
          onSelect={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
          currentValue={formData.start_date}
          title={t('settings.availability.startDate')}
        />
        
        <DatePickerModal
          visible={showEndDateModal}
          onDismiss={() => setShowEndDateModal(false)}
          onSelect={(date) => setFormData(prev => ({ ...prev, end_date: date }))}
          currentValue={formData.end_date}
          title={t('settings.availability.endDate')}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  label: {
    marginBottom: 8,
  },
  daySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayButton: {
    marginBottom: 8,
    minWidth: '30%',
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateInput: {
    marginBottom: 16,
  },
  dateButton: {
    marginTop: 4,
  },
  fullDayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeButton: {
    marginTop: 4,
  },
  submitButton: {
    marginTop: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 16,
  },
});

export default AvailabilitySlotScreen;
