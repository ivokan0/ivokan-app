import { TrialBooking, SubscriptionBooking, Language } from '../types/database';

// Interface unifiée pour les deux types de réservations
export interface UnifiedBooking {
  id: string;
  student_id: string;
  tutor_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  student_timezone: string;
  tutor_timezone: string;
  student_notes?: string;
  tutor_notes?: string;
  // Champs spécifiques aux trial bookings
  trial_lesson_id?: string;
  language_id?: string;
  // Champs spécifiques aux subscription bookings
  student_subscriptions_id?: string;
  lesson_documents_urls?: string[];
  // Champs calculés
  isTrial: boolean;
  duration_minutes?: number;
}

/**
 * Convertit une réservation trial en format unifié
 */
export const convertTrialBookingToUnified = (trialBooking: TrialBooking, durationMinutes?: number): UnifiedBooking => {
  return {
    id: trialBooking.id,
    student_id: trialBooking.student_id,
    tutor_id: trialBooking.tutor_id,
    booking_date: trialBooking.booking_date,
    start_time: trialBooking.start_time,
    end_time: trialBooking.end_time,
    status: trialBooking.status,
    student_timezone: trialBooking.student_timezone,
    tutor_timezone: trialBooking.tutor_timezone,
    student_notes: trialBooking.student_notes,
    tutor_notes: trialBooking.tutor_notes,
    trial_lesson_id: trialBooking.trial_lesson_id,
    language_id: trialBooking.language_id,
    isTrial: true,
    duration_minutes: durationMinutes,
  };
};

/**
 * Convertit une réservation subscription en format unifié
 */
export const convertSubscriptionBookingToUnified = (subscriptionBooking: SubscriptionBooking, durationMinutes?: number): UnifiedBooking => {
  return {
    id: subscriptionBooking.id,
    student_id: subscriptionBooking.student_id,
    tutor_id: subscriptionBooking.tutor_id,
    booking_date: subscriptionBooking.booking_date,
    start_time: subscriptionBooking.start_time,
    end_time: subscriptionBooking.end_time,
    status: subscriptionBooking.status,
    student_timezone: subscriptionBooking.student_timezone,
    tutor_timezone: subscriptionBooking.tutor_timezone,
    student_notes: subscriptionBooking.student_notes,
    tutor_notes: subscriptionBooking.tutor_notes,
    student_subscriptions_id: subscriptionBooking.student_subscriptions_id,
    lesson_documents_urls: subscriptionBooking.lesson_documents_urls,
    isTrial: false,
    duration_minutes: durationMinutes,
  };
};

/**
 * Calcule la durée en minutes entre start_time et end_time
 */
export const calculateDurationMinutes = (startTime: string, endTime: string): number => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60));
};

/**
 * Vérifie si une réservation est un trial booking
 */
export const isTrialBooking = (booking: any): booking is TrialBooking => {
  return 'trial_lesson_id' in booking;
};

/**
 * Vérifie si une réservation est un subscription booking
 */
export const isSubscriptionBooking = (booking: any): booking is SubscriptionBooking => {
  return 'student_subscriptions_id' in booking;
};
