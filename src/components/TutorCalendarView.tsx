import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';

import { getTutorAvailabilityView, getEffectiveAvailability } from '../services/availability';
import { TutorAvailabilityView, EffectiveAvailability } from '../types/database';

interface TutorCalendarViewProps {
  tutorId: string;
  onClose: () => void;
}

interface CalendarDay {
  date: Date;
  dateString: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  availableSlots: { start_time: string; end_time: string }[];
  unavailableSlots: { start_time?: string; end_time?: string; is_full_day: boolean }[];
}

const TutorCalendarView: React.FC<TutorCalendarViewProps> = ({ tutorId, onClose }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadAvailabilityData();
  }, [tutorId]);

  const loadAvailabilityData = async () => {
    try {
      setIsLoading(true);
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 14);
      
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];
      
      // Get effective availability data with automatic subtraction from Supabase
      const { data: effectiveData, error } = await getEffectiveAvailability(
        tutorId,
        startDateString,
        endDateString
      );
      
      if (error) {
        console.error('Error loading effective availability data:', error);
        throw error;
      }
      
      // Create a map of effective availability by date
      const effectiveByDate = new Map<string, EffectiveAvailability>();
      effectiveData?.forEach(item => {
        effectiveByDate.set(item.date_actual, item);
      });
      
      const days: CalendarDay[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        const isToday = currentDate.toDateString() === new Date().toDateString();
        
        const dayEffective = effectiveByDate.get(dateString);
        
        // Use effective availability (already has subtraction applied)
        const availableSlots = dayEffective?.available_slots || [];
        const unavailableSlots: { start_time?: string; end_time?: string; is_full_day: boolean }[] = [];
        
        days.push({
          date: new Date(currentDate),
          dateString,
          isToday,
          isCurrentMonth: true,
          availableSlots,
          unavailableSlots,
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setCalendarData(days);
    } catch (error) {
      console.error('Error loading availability data:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'short' });
  };

  const getDateNumber = (date: Date) => {
    return date.getDate();
  };

  const getAvailabilityStatus = (day: CalendarDay) => {
    if (day.unavailableSlots.some(slot => slot.is_full_day)) {
      return 'unavailable';
    }
    if (day.availableSlots.length === 0) {
      return 'no-availability';
    }
    if (day.unavailableSlots.length > 0) {
      return 'partial';
    }
    return 'available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#4CAF50';
      case 'partial':
        return '#FF9800';
      case 'unavailable':
        return '#F44336';
      case 'no-availability':
        return '#E0E0E0';
      default:
        return theme.colors.surface;
    }
  };

  const renderDay = (day: CalendarDay) => {
    const status = getAvailabilityStatus(day);
    const statusColor = getStatusColor(status);
    const isSelected = selectedDate?.toDateString() === day.date.toDateString();

    return (
      <TouchableOpacity
        key={day.dateString}
        style={[
          styles.dayContainer,
          {
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
            borderColor: day.isToday ? theme.colors.primary : 'transparent',
          }
        ]}
        onPress={() => setSelectedDate(isSelected ? null : day.date)}
      >
        <Text style={[
          styles.dayName,
          { 
            color: isSelected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
            fontFamily: 'Baloo2_400Regular' 
          }
        ]}>
          {getDayName(day.date)}
        </Text>
        <Text style={[
          styles.dayNumber,
          { 
            color: isSelected ? theme.colors.onPrimary : theme.colors.onSurface,
            fontFamily: 'Baloo2_600SemiBold'
          }
        ]}>
          {getDateNumber(day.date)}
        </Text>
        
        {/* Afficher les créneaux libres */}
        <View style={styles.availableSlotsContainer}>
          {day.availableSlots.length === 0 ? (
            <Text style={[
              styles.noSlotsText, 
              { 
                color: isSelected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                fontFamily: 'Baloo2_400Regular'
              }
            ]}>
              {status === 'unavailable' ? t('calendar.unavailable') : t('calendar.noSlots')}
            </Text>
          ) : (
            day.availableSlots.slice(0, 2).map((slot, index) => (
              <Text 
                key={index} 
                style={[
                  styles.slotText, 
                  { 
                    color: isSelected ? theme.colors.onPrimary : '#4CAF50',
                    fontFamily: 'Baloo2_400Regular'
                  }
                ]}
              >
                {formatTime(slot.start_time)}-{formatTime(slot.end_time)}
              </Text>
            ))
          )}
          {day.availableSlots.length > 2 && (
            <Text style={[
              styles.moreText, 
              { 
                color: isSelected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                fontFamily: 'Baloo2_400Regular'
              }
            ]}>
              +{day.availableSlots.length - 2}
            </Text>
          )}
        </View>
        
        {day.isToday && (
          <View style={[styles.todayIndicator, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.todayText, { color: theme.colors.onPrimary, fontFamily: 'Baloo2_400Regular' }]}>
              {t('calendar.today')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderDayDetails = (day: CalendarDay) => {
    const status = getAvailabilityStatus(day);
    
    return (
      <View style={[styles.dayDetails, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.detailsDate, { color: theme.colors.onSurface, fontFamily: 'Baloo2_600SemiBold' }]}>
          {day.date.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        {status === 'unavailable' && (
          <View style={styles.statusSection}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#F44336" />
            <Text style={[styles.statusText, { color: theme.colors.onSurface, fontFamily: 'Baloo2_400Regular' }]}>
              {t('calendar.unavailableFullDay')}
            </Text>
          </View>
        )}
        
        {status === 'no-availability' && (
          <View style={styles.statusSection}>
            <MaterialCommunityIcons name="calendar-remove" size={20} color="#E0E0E0" />
            <Text style={[styles.statusText, { color: theme.colors.onSurfaceVariant, fontFamily: 'Baloo2_400Regular' }]}>
              {t('calendar.noAvailability')}
            </Text>
          </View>
        )}
        
        {(status === 'available' || status === 'partial') && (
          <>
            {day.availableSlots.length > 0 && (
              <View style={styles.slotsSection}>
                <Text style={[styles.slotsTitle, { color: theme.colors.primary, fontFamily: 'Baloo2_600SemiBold' }]}>
                  {t('calendar.availableSlots')}
                </Text>
                {day.availableSlots.map((slot, index) => (
                  <View key={index} style={styles.slotItem}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#4CAF50" />
                    <Text style={[styles.slotTime, { color: theme.colors.onSurface, fontFamily: 'Baloo2_400Regular' }]}>
                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            
            {day.unavailableSlots.length > 0 && (
              <View style={styles.slotsSection}>
                <Text style={[styles.slotsTitle, { color: '#F44336', fontFamily: 'Baloo2_600SemiBold' }]}>
                  {t('calendar.unavailableSlots')}
                </Text>
                {day.unavailableSlots.map((slot, index) => (
                  <View key={index} style={styles.slotItem}>
                    <MaterialCommunityIcons name="close-circle-outline" size={16} color="#F44336" />
                    <Text style={[styles.slotTime, { color: theme.colors.onSurface, fontFamily: 'Baloo2_400Regular' }]}>
                      {slot.is_full_day 
                        ? t('calendar.fullDay')
                        : `${formatTime(slot.start_time!)} - ${formatTime(slot.end_time!)}`
                      }
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onSurface, fontFamily: 'Baloo2_600SemiBold' }]}>
          {t('calendar.tutorAvailability')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Legend */}
        <View style={[styles.legend, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.legendTitle, { color: theme.colors.onSurface, fontFamily: 'Baloo2_600SemiBold' }]}>
            {t('calendar.legend')}
          </Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
              <Text style={[styles.legendText, { color: theme.colors.onSurface, fontFamily: 'Baloo2_400Regular' }]}>
                {t('calendar.available')}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
              <Text style={[styles.legendText, { color: theme.colors.onSurface, fontFamily: 'Baloo2_400Regular' }]}>
                {t('calendar.partiallyAvailable')}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
              <Text style={[styles.legendText, { color: theme.colors.onSurface, fontFamily: 'Baloo2_400Regular' }]}>
                {t('calendar.unavailable')}
              </Text>
            </View>
          </View>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.calendarGrid}>
              {calendarData.map(day => renderDay(day))}
            </View>
          </ScrollView>
        </View>

        {/* Selected Day Details */}
        {selectedDate && (
          <View style={styles.detailsContainer}>
            {renderDayDetails(calendarData.find(day => 
              day.date.toDateString() === selectedDate.toDateString()
            )!)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  legend: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
  },
  calendar: {
    marginHorizontal: 16,
  },
  calendarGrid: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  dayContainer: {
    width: 100,
    minHeight: 120,
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 8,
  },
  dayName: {
    fontSize: 12,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  todayIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayText: {
    fontSize: 10,
    fontWeight: '500',
  },
  detailsContainer: {
    margin: 16,
  },
  dayDetails: {
    padding: 16,
    borderRadius: 12,
  },
  detailsDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
  },
  slotsSection: {
    marginBottom: 16,
  },
  slotsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  slotTime: {
    fontSize: 14,
  },
  availableSlotsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    minHeight: 40,
  },
  noSlotsText: {
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  slotText: {
    fontSize: 10,
    textAlign: 'center',
    marginVertical: 1,
  },
  moreText: {
    fontSize: 9,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default TutorCalendarView;
