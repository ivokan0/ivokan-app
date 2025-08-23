import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, Divider, Button, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import AppButton from '../../components/ui/AppButton';

interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

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
  const { t } = useTranslation();
  const theme = useTheme();
  const { profile } = useAuth();
  const { updateUserProfile } = useProfile();
  
  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([]);
  const [minimumTimeNotice, setMinimumTimeNotice] = useState(profile?.minimum_time_notice?.toString() || '120');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  
  // Form state for adding/editing
  const [formData, setFormData] = useState<AvailabilitySlot>({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:00',
  });

  useEffect(() => {
    // TODO: Load availabilities from API
    // For now, using mock data
    setAvailabilities([
      { id: '1', day_of_week: 1, start_time: '09:00', end_time: '12:00' },
      { id: '2', day_of_week: 2, start_time: '14:00', end_time: '18:00' },
    ]);
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Update minimum time notice
      await updateUserProfile({
        minimum_time_notice: parseInt(minimumTimeNotice),
      });

      // TODO: Save availabilities to API
      
      Alert.alert(
        t('profile.saveSuccess.title'),
        t('profile.saveSuccess.message'),
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        t('errors.save.title'),
        t('errors.save.message'),
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlot = () => {
    if (formData.start_time >= formData.end_time) {
      Alert.alert('Erreur', t('settings.availability.timeError'));
      return;
    }

    // Check for overlapping slots
    const hasOverlap = availabilities.some(slot => 
      slot.day_of_week === formData.day_of_week &&
      ((formData.start_time >= slot.start_time && formData.start_time < slot.end_time) ||
       (formData.end_time > slot.start_time && formData.end_time <= slot.end_time) ||
       (formData.start_time <= slot.start_time && formData.end_time >= slot.end_time))
    );

    if (hasOverlap) {
      Alert.alert('Erreur', t('settings.availability.overlapError'));
      return;
    }

    const newSlot: AvailabilitySlot = {
      id: Date.now().toString(), // Temporary ID
      ...formData,
    };

    setAvailabilities([...availabilities, newSlot]);
    setFormData({ day_of_week: 1, start_time: '09:00', end_time: '10:00' });
    setShowAddForm(false);
  };

  const handleEditSlot = () => {
    if (!editingSlot?.id) return;

    if (formData.start_time >= formData.end_time) {
      Alert.alert('Erreur', t('settings.availability.timeError'));
      return;
    }

    // Check for overlapping slots (excluding the current one being edited)
    const hasOverlap = availabilities.some(slot => 
      slot.id !== editingSlot.id &&
      slot.day_of_week === formData.day_of_week &&
      ((formData.start_time >= slot.start_time && formData.start_time < slot.end_time) ||
       (formData.end_time > slot.start_time && formData.end_time <= slot.end_time) ||
       (formData.start_time <= slot.start_time && formData.end_time >= slot.end_time))
    );

    if (hasOverlap) {
      Alert.alert('Erreur', t('settings.availability.overlapError'));
      return;
    }

    setAvailabilities(availabilities.map(slot => 
      slot.id === editingSlot.id 
        ? { ...slot, ...formData }
        : slot
    ));
    setEditingSlot(null);
    setFormData({ day_of_week: 1, start_time: '09:00', end_time: '10:00' });
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
          onPress: () => {
            setAvailabilities(availabilities.filter(slot => slot.id !== id));
          }
        }
      ]
    );
  };

  const startEditing = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setFormData({ ...slot });
  };

  const cancelEditing = () => {
    setEditingSlot(null);
    setShowAddForm(false);
    setFormData({ day_of_week: 1, start_time: '09:00', end_time: '10:00' });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
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
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {t('settings.availability.title')}
        </Text>

        {/* Minimum Time Notice */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            {t('settings.availability.minimumTimeNotice')}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            {t('settings.availability.minimumTimeNoticeDescription')}
          </Text>
          <TextInput
            value={minimumTimeNotice}
            onChangeText={setMinimumTimeNotice}
            keyboardType="numeric"
            style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
            placeholder="120"
          />
        </View>

        <Divider style={styles.divider} />

        {/* Availabilities List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('settings.availability.mySlots')}
            </Text>
            <Button
              mode="contained"
              onPress={() => setShowAddForm(true)}
              icon="plus"
              compact
            >
              {t('settings.availability.add')}
            </Button>
          </View>

          {sortedAvailabilities.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              {t('settings.availability.noSlots')}
            </Text>
          ) : (
            <View style={styles.availabilitiesList}>
              {sortedAvailabilities.map((slot, index) => (
                <React.Fragment key={slot.id}>
                  <View style={styles.availabilityItem}>
                    <View style={styles.availabilityInfo}>
                      <Text style={[styles.dayText, { color: theme.colors.onSurface }]}>
                        {getDayLabel(slot.day_of_week)}
                      </Text>
                      <Text style={[styles.timeText, { color: theme.colors.onSurfaceVariant }]}>
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </Text>
                    </View>
                    <View style={styles.availabilityActions}>
                      <TouchableOpacity
                        onPress={() => startEditing(slot)}
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
                  {index < sortedAvailabilities.length - 1 && <Divider style={styles.itemDivider} />}
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        {/* Add/Edit Form */}
        {(showAddForm || editingSlot) && (
          <View style={styles.formSection}>
            <Text style={[styles.formTitle, { color: theme.colors.onSurface }]}>
              {editingSlot ? t('settings.availability.editSlot') : t('settings.availability.addSlot')}
            </Text>
            
            <View style={styles.formRow}>
              <Text style={[styles.formLabel, { color: theme.colors.onSurface }]}>{t('settings.availability.day')} :</Text>
              <View style={styles.dayPicker}>
                {DAYS_OF_WEEK.map((day) => (
                  <TouchableOpacity
                    key={day.value}
                    style={[
                      styles.dayButton,
                      {
                        backgroundColor: formData.day_of_week === day.value 
                          ? theme.colors.primary 
                          : theme.colors.surfaceVariant
                      }
                    ]}
                    onPress={() => setFormData({ ...formData, day_of_week: day.value })}
                  >
                    <Text style={[
                      styles.dayButtonText,
                      { 
                        color: formData.day_of_week === day.value 
                          ? theme.colors.onPrimary 
                          : theme.colors.onSurfaceVariant
                      }
                    ]}>
                      {day.label.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.timeInput}>
                <Text style={[styles.formLabel, { color: theme.colors.onSurface }]}>{t('settings.availability.startTime')} :</Text>
                <TextInput
                  value={formData.start_time}
                  onChangeText={(text) => setFormData({ ...formData, start_time: text })}
                  style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
                  placeholder="09:00"
                />
              </View>
              <View style={styles.timeInput}>
                <Text style={[styles.formLabel, { color: theme.colors.onSurface }]}>{t('settings.availability.endTime')} :</Text>
                <TextInput
                  value={formData.end_time}
                  onChangeText={(text) => setFormData({ ...formData, end_time: text })}
                  style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
                  placeholder="10:00"
                />
              </View>
            </View>

            <View style={styles.formActions}>
              <Button mode="outlined" onPress={cancelEditing} style={styles.formButton}>
                {t('settings.availability.cancel')}
              </Button>
              <Button 
                mode="contained" 
                onPress={editingSlot ? handleEditSlot : handleAddSlot}
                style={styles.formButton}
              >
                {editingSlot ? t('settings.availability.edit') : t('settings.availability.add')}
              </Button>
            </View>
          </View>
        )}

        <AppButton
          label={t('profile.save')}
          onPress={handleSave}
          loading={isLoading}
          style={styles.saveButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 24,
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
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    marginBottom: 12,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: 'Baloo2_400Regular',
  },
  divider: {
    marginVertical: 16,
  },
  availabilitiesList: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  availabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  availabilityInfo: {
    flex: 1,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  availabilityActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  itemDivider: {
    marginHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    fontStyle: 'italic',
    padding: 24,
  },
  formSection: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 16,
  },
  formRow: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    marginBottom: 8,
  },
  dayPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 50,
    alignItems: 'center',
  },
  dayButtonText: {
    fontSize: 12,
    fontFamily: 'Baloo2_600SemiBold',
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  formButton: {
    minWidth: 100,
  },
  saveButton: {
    marginTop: 24,
  },
});

export default AvailabilitySettingsScreen;
