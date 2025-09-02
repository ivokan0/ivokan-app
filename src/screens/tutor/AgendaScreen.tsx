import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme, Button, ActivityIndicator } from 'react-native-paper';

import CreateSubscriptionBookingModal from '../../components/CreateSubscriptionBookingModal';
import TutorBookingCard from '../../components/TutorBookingCard';
import AgendaScreenSkeleton from '../../components/ui/AgendaScreenSkeleton';
import { useAuth } from '../../hooks/useAuth';
import { getTutorSubscriptionBookingsWithDetails } from '../../services/subscriptionBookings';
import { completeSubscriptionBooking } from '../../services/subscriptionBookings';
import { getTutorTrialBookingsWithDetails } from '../../services/trialBookings';
import { confirmTrialBooking } from '../../services/trialBookings';
import { TrialBooking, TrialBookingWithDetails, SubscriptionBookingWithDetails } from '../../types/database';

type TabType = 'pending' | 'upcoming' | 'completed' | 'cancelled';

const TutorAgendaScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [loading, setLoading] = useState(true);
  const [trialBookings, setTrialBookings] = useState<TrialBookingWithDetails[]>([]);
  const [subscriptionBookings, setSubscriptionBookings] = useState<SubscriptionBookingWithDetails[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCreateBookingModal, setShowCreateBookingModal] = useState(false);

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'pending', label: t('tutor.agenda.pending'), icon: 'clock-outline' },
    { key: 'upcoming', label: t('tutor.agenda.upcoming'), icon: 'calendar-clock' },
    { key: 'completed', label: t('tutor.agenda.completed'), icon: 'check-circle-outline' },
    { key: 'cancelled', label: t('tutor.agenda.cancelled'), icon: 'close-circle-outline' },
  ];

  const loadBookings = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Load trial bookings
      const { data: trialData, error: trialError } = await getTutorTrialBookingsWithDetails(user.id, user.id);
      if (trialError) {
        console.error('Error loading trial bookings:', trialError);
      } else {
        setTrialBookings(trialData || []);
      }

      // Load subscription bookings
      const { data: subscriptionData, error: subscriptionError } = await getTutorSubscriptionBookingsWithDetails(user.id, user.id);
      if (subscriptionError) {
        console.error('Error loading subscription bookings:', subscriptionError);
      } else {
        setSubscriptionBookings(subscriptionData || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user?.id]);

  const getFilteredBookings = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (activeTab) {
      case 'pending':
        return {
          trial: trialBookings.filter(booking => booking.status === 'pending'),
          subscription: [] // Subscription bookings don't have pending status
        };
      case 'upcoming':
        return {
          trial: trialBookings.filter(booking => booking.status === 'confirmed' && booking.booking_date >= today),
          subscription: subscriptionBookings.filter(booking => booking.status === 'confirmed' && booking.booking_date >= today)
        };
      case 'completed':
        return {
          trial: trialBookings.filter(booking => booking.status === 'completed'),
          subscription: subscriptionBookings.filter(booking => booking.status === 'completed')
        };
      case 'cancelled':
        return {
          trial: trialBookings.filter(booking => booking.status === 'cancelled'),
          subscription: subscriptionBookings.filter(booking => booking.status === 'cancelled')
        };
      default:
        return { trial: [], subscription: [] };
    }
  };

  const handleConfirmTrialBooking = async (bookingId: string) => {
    if (!user?.id) return;

    try {
      setActionLoading(bookingId);
      const { data, error } = await confirmTrialBooking(bookingId, user.id);
      
      if (error) {
        Alert.alert(t('common.error'), error.message);
      } else {
        Alert.alert(t('common.success'), t('tutor.agenda.trialConfirmed'));
        loadBookings(); // Reload bookings
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('common.unexpectedError'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteSubscriptionBooking = async (bookingId: string) => {
    if (!user?.id) return;

    try {
      setActionLoading(bookingId);
      const { data, error } = await completeSubscriptionBooking(bookingId, user.id);
      
      if (error) {
        Alert.alert(t('common.error'), error.message);
      } else {
        Alert.alert(t('common.success'), t('tutor.agenda.subscriptionCompleted'));
        loadBookings(); // Reload bookings
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('common.unexpectedError'));
    } finally {
      setActionLoading(null);
    }
  };



  // Show skeleton while loading
  if (loading) {
    return <AgendaScreenSkeleton />;
  }

  const filteredBookings = getFilteredBookings();
  const hasBookings = filteredBookings.trial.length > 0 || filteredBookings.subscription.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && { backgroundColor: theme.colors.primaryContainer }
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <MaterialCommunityIcons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab.key ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant
                }
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Create Booking Button */}
      <View style={styles.createBookingContainer}>
        <Button
          mode="contained"
          onPress={() => setShowCreateBookingModal(true)}
          icon="plus"
          style={styles.createBookingButton}
        >
          {t('tutor.agenda.createBooking')}
        </Button>
      </View>

      {/* Bookings List */}
      <ScrollView style={styles.bookingsContainer} showsVerticalScrollIndicator={false}>
        {!hasBookings ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="calendar-blank"
              size={64}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              {t('tutor.agenda.noBookings')}
            </Text>
          </View>
        ) : (
          <>
            {/* Trial Bookings */}
            {filteredBookings.trial.map((booking) => (
              <TutorBookingCard
                key={`trial-${booking.id}`}
                booking={booking}
                onConfirm={booking.status === 'pending' ? () => handleConfirmTrialBooking(booking.id) : undefined}
                actionLoading={actionLoading === booking.id}
              />
            ))}
            
            {/* Subscription Bookings */}
            {filteredBookings.subscription.map((booking) => (
              <TutorBookingCard
                key={`subscription-${booking.id}`}
                booking={booking}
                onComplete={booking.status === 'confirmed' ? () => handleCompleteSubscriptionBooking(booking.id) : undefined}
                actionLoading={actionLoading === booking.id}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Create Subscription Booking Modal */}
      <CreateSubscriptionBookingModal
        visible={showCreateBookingModal}
        onClose={() => setShowCreateBookingModal(false)}
        onSuccess={loadBookings}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    minWidth: 100,
    justifyContent: 'center',
  },
  tabText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'Baloo2_500Medium',
  },
  bookingsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    marginTop: 16,
    textAlign: 'center',
  },
  createBookingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  createBookingButton: {
    borderRadius: 8,
  },
});

export default TutorAgendaScreen;
