import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import BookingCard from '../../components/BookingCard';
import ScheduleScreenSkeleton from '../../components/ui/ScheduleScreenSkeleton';
import { useAuth } from '../../hooks/useAuth';
import { getTutorProfile } from '../../services/profiles';
import { getStudentTrialBookings } from '../../services/trialBookings';
import { getStudentSubscriptionBookings } from '../../services/subscriptionBookings';
import { getStudentSubscriptionByIdWithDetails } from '../../services/studentSubscriptions';
import { TrialBooking, SubscriptionBooking, Profile, Language } from '../../types/database';
import { 
  UnifiedBooking, 
  convertTrialBookingToUnified, 
  convertSubscriptionBookingToUnified,
  calculateDurationMinutes 
} from '../../utils/bookingUtils';

type TabType = 'upcoming' | 'completed' | 'cancelled';

interface BookingWithTutor extends UnifiedBooking {
  tutorName?: string;
  tutorAvatar?: string | null;
  language?: Language;
}

const ScheduleScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { profile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [bookings, setBookings] = useState<BookingWithTutor[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { key: 'upcoming', label: t('booking.tabs.upcoming') },
    { key: 'completed', label: t('booking.tabs.completed') },
    { key: 'cancelled', label: t('booking.tabs.cancelled') },
  ] as const;

  const loadBookings = async () => {
    if (!profile?.user_id) return;

    try {
      setLoading(true);
      
      // Load trial bookings
      const { data: trialBookingsData, error: trialError } = await getStudentTrialBookings(profile.user_id, profile.user_id);
      if (trialError) {
        console.error('Error loading trial bookings:', trialError);
        Alert.alert(t('errors.booking.title'), trialError.message);
        return;
      }

      // Load subscription bookings
      const { data: subscriptionBookingsData, error: subscriptionError } = await getStudentSubscriptionBookings(profile.user_id, profile.user_id);
      if (subscriptionError) {
        console.error('Error loading subscription bookings:', subscriptionError);
        Alert.alert(t('errors.booking.title'), subscriptionError.message);
        return;
      }

      const allBookings: BookingWithTutor[] = [];

      // Process trial bookings
      if (trialBookingsData) {
        for (const trialBooking of trialBookingsData) {
          try {
            const { data: tutorProfile } = await getTutorProfile(trialBooking.tutor_id);
            const durationMinutes = calculateDurationMinutes(trialBooking.start_time, trialBooking.end_time);
            
            const unifiedBooking = convertTrialBookingToUnified(trialBooking, durationMinutes);
            
            allBookings.push({
              ...unifiedBooking,
              tutorName: tutorProfile ? `${tutorProfile.first_name || ''} ${tutorProfile.last_name || ''}`.trim() : undefined,
              tutorAvatar: tutorProfile?.avatar_url,
              language: trialBooking.language_id ? { id: trialBooking.language_id, name: trialBooking.language_id, code: trialBooking.language_id, created_at: new Date().toISOString() } : undefined,
            });
          } catch (error) {
            console.error('Error loading tutor profile for trial booking:', error);
          }
        }
      }

      // Process subscription bookings
      if (subscriptionBookingsData) {
        for (const subscriptionBooking of subscriptionBookingsData) {
          try {
            const { data: tutorProfile } = await getTutorProfile(subscriptionBooking.tutor_id);
            const { data: subscriptionDetails } = await getStudentSubscriptionByIdWithDetails(subscriptionBooking.student_subscriptions_id);
            const durationMinutes = calculateDurationMinutes(subscriptionBooking.start_time, subscriptionBooking.end_time);
            
            const unifiedBooking = convertSubscriptionBookingToUnified(subscriptionBooking, durationMinutes);
            
            allBookings.push({
              ...unifiedBooking,
              tutorName: tutorProfile ? `${tutorProfile.first_name || ''} ${tutorProfile.last_name || ''}`.trim() : undefined,
              tutorAvatar: tutorProfile?.avatar_url,
              language: subscriptionDetails?.language,
            });
          } catch (error) {
            console.error('Error loading subscription details:', error);
          }
        }
      }

      // Sort all bookings by date and time
      allBookings.sort((a, b) => {
        const dateA = new Date(`${a.booking_date}T${a.start_time}`);
        const dateB = new Date(`${b.booking_date}T${b.start_time}`);
        return dateA.getTime() - dateB.getTime();
      });

      setBookings(allBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert(t('errors.booking.title'), t('errors.booking.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadBookings();
    }, [profile?.user_id])
  );

  const getFilteredBookings = (): BookingWithTutor[] => {
    const now = new Date();
    
    switch (activeTab) {
      case 'upcoming':
        return bookings.filter(booking => {
          const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
          return (booking.status === 'pending' || booking.status === 'confirmed') && bookingDateTime >= now;
        });
      case 'completed':
        return bookings.filter(booking => booking.status === 'completed');
      case 'cancelled':
        return bookings.filter(booking => booking.status === 'cancelled');
      default:
        return [];
    }
  };

  const filteredBookings = getFilteredBookings();

  const renderBookingItem = ({ item }: { item: BookingWithTutor }) => (
    <BookingCard
      booking={item}
      tutorName={item.tutorName}
      tutorAvatar={item.tutorAvatar}
      language={item.language}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
        {activeTab === 'upcoming' && t('booking.empty.upcoming')}
        {activeTab === 'completed' && t('booking.empty.completed')}
        {activeTab === 'cancelled' && t('booking.empty.cancelled')}
      </Text>
    </View>
  );

  // Show skeleton while loading
  if (loading) {
    return <ScheduleScreenSkeleton />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>


      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && [styles.activeTab, { borderBottomColor: theme.colors.primary }]
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab.key ? theme.colors.primary : theme.colors.onSurfaceVariant },
                  activeTab === tab.key && styles.activeTabText
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
              {t('common.loading')}...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredBookings}
            keyExtractor={(item) => item.id}
            renderItem={renderBookingItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            refreshing={loading}
            onRefresh={loadBookings}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: 24,
  },

  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingTop: 16,
  },
  tabsContent: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  activeTabText: {
    fontFamily: 'Baloo2_600SemiBold',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    textAlign: 'center',
  },
});

export default ScheduleScreen;
