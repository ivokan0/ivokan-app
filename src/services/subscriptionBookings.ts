import { supabase } from './supabase';
import {
  SubscriptionBooking,
  CreateSubscriptionBookingData,
  UpdateSubscriptionBookingData,
  SubscriptionBookingWithDetails,
  ApiResponse,
} from '../types/database';

// Get all subscription bookings for a student
export const getStudentSubscriptionBookings = async (studentId: string, currentUserId?: string): Promise<ApiResponse<SubscriptionBooking[]>> => {
  try {
    // Application-level authorization: verify user is requesting their own bookings
    if (currentUserId && currentUserId !== studentId) {
      return { data: null, error: new Error('User can only view their own bookings') };
    }

    const { data, error } = await supabase
      .from('subscription_bookings')
      .select('*')
      .eq('student_id', studentId)
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get all subscription bookings for a tutor
export const getTutorSubscriptionBookings = async (tutorId: string, currentUserId?: string): Promise<ApiResponse<SubscriptionBooking[]>> => {
  try {
    // Application-level authorization: verify user is requesting their own bookings
    if (currentUserId && currentUserId !== tutorId) {
      return { data: null, error: new Error('User can only view their own bookings') };
    }

    const { data, error } = await supabase
      .from('subscription_bookings')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get subscription bookings with details for a tutor
export const getTutorSubscriptionBookingsWithDetails = async (tutorId: string, currentUserId?: string): Promise<ApiResponse<SubscriptionBookingWithDetails[]>> => {
  try {
    // Application-level authorization: verify user is requesting their own bookings
    if (currentUserId && currentUserId !== tutorId) {
      return { data: null, error: new Error('User can only view their own bookings') };
    }

    const { data, error } = await supabase
      .from('subscription_bookings')
      .select(`
        *,
        student:profiles!student_id(*),
        subscription:student_subscriptions!student_subscriptions_id(
          *,
          student:profiles!student_id(*),
          language:languages!language_id(*),
          plan:subscription_plans!plan_id(*)
        )
      `)
      .eq('tutor_id', tutorId)
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Create a new subscription booking
export const createSubscriptionBooking = async (
  bookingData: CreateSubscriptionBookingData,
  currentUserId?: string
): Promise<ApiResponse<SubscriptionBooking>> => {
  try {
    // Application-level authorization: verify user is creating booking for themselves or is the tutor
    if (currentUserId && currentUserId !== bookingData.student_id && currentUserId !== bookingData.tutor_id) {
      return { data: null, error: new Error('User can only create bookings for themselves or as the tutor') };
    }

    // Check if subscription has remaining sessions
    const { data: eligibilityCheck, error: eligibilityError } = await supabase.rpc('check_subscription_booking_eligibility', {
      p_student_subscriptions_id: bookingData.student_subscriptions_id
    });

    if (eligibilityError) throw eligibilityError;

    if (!eligibilityCheck) {
      return { data: null, error: new Error('Subscription does not have remaining sessions or is not active') };
    }

    // Verify that the subscription exists and belongs to the student
    const { data: subscription, error: subscriptionError } = await supabase
      .from('student_subscriptions')
      .select('student_id, tutor_id')
      .eq('id', bookingData.student_subscriptions_id)
      .single();

    if (subscriptionError || !subscription) {
      return { data: null, error: new Error('Invalid subscription') };
    }

    if (subscription.student_id !== bookingData.student_id) {
      return { data: null, error: new Error('Subscription does not belong to the student') };
    }

    if (subscription.tutor_id !== bookingData.tutor_id) {
      return { data: null, error: new Error('Subscription does not belong to the tutor') };
    }

    const { data: booking, error } = await supabase
      .from('subscription_bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) throw error;

    return { data: booking, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Update a subscription booking
export const updateSubscriptionBooking = async (
  bookingId: string,
  updateData: UpdateSubscriptionBookingData,
  currentUserId?: string
): Promise<ApiResponse<SubscriptionBooking>> => {
  try {
    // Application-level authorization: verify user is updating their own booking or a booking for them
    if (currentUserId) {
      const { data: existing, error: fetchError } = await supabase
        .from('subscription_bookings')
        .select('student_id, tutor_id')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;
      
      if (!existing || (existing.student_id !== currentUserId && existing.tutor_id !== currentUserId)) {
        return { data: null, error: new Error('User can only update their own bookings or bookings for them') };
      }
    }

    const { data: booking, error } = await supabase
      .from('subscription_bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;

    return { data: booking, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Cancel a subscription booking
export const cancelSubscriptionBooking = async (
  bookingId: string,
  currentUserId?: string
): Promise<ApiResponse<SubscriptionBooking>> => {
  try {
    return updateSubscriptionBooking(bookingId, { status: 'cancelled' }, currentUserId);
  } catch (error) {
    return { data: null, error };
  }
};

// Complete a subscription booking (tutor only)
export const completeSubscriptionBooking = async (
  bookingId: string,
  currentUserId?: string
): Promise<ApiResponse<SubscriptionBooking>> => {
  try {
    // Verify user is the tutor for this booking
    if (currentUserId) {
      const { data: existing, error: fetchError } = await supabase
        .from('subscription_bookings')
        .select('tutor_id')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;
      
      if (!existing || existing.tutor_id !== currentUserId) {
        return { data: null, error: new Error('Only the tutor can complete bookings') };
      }
    }

    return updateSubscriptionBooking(bookingId, { status: 'completed' }, currentUserId);
  } catch (error) {
    return { data: null, error };
  }
};

// Get a specific subscription booking
export const getSubscriptionBooking = async (
  bookingId: string,
  currentUserId?: string
): Promise<ApiResponse<SubscriptionBooking>> => {
  try {
    // Application-level authorization: verify user has access to this booking
    if (currentUserId) {
      const { data: existing, error: fetchError } = await supabase
        .from('subscription_bookings')
        .select('student_id, tutor_id')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;
      
      if (!existing || (existing.student_id !== currentUserId && existing.tutor_id !== currentUserId)) {
        return { data: null, error: new Error('User does not have access to this booking') };
      }
    }

    const { data, error } = await supabase
      .from('subscription_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get subscription booking with details
export const getSubscriptionBookingWithDetails = async (
  bookingId: string,
  currentUserId?: string
): Promise<ApiResponse<SubscriptionBookingWithDetails>> => {
  try {
    // Application-level authorization: verify user has access to this booking
    if (currentUserId) {
      const { data: existing, error: fetchError } = await supabase
        .from('subscription_bookings')
        .select('student_id, tutor_id')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;
      
      if (!existing || (existing.student_id !== currentUserId && existing.tutor_id !== currentUserId)) {
        return { data: null, error: new Error('User does not have access to this booking') };
      }
    }

    const { data, error } = await supabase
      .from('subscription_bookings')
      .select(`
        *,
        student:profiles!student_id(*),
        subscription:student_subscriptions!student_subscriptions_id(
          *,
          student:profiles!student_id(*),
          language:languages!language_id(*),
          plan:subscription_plans!plan_id(*)
        )
      `)
      .eq('id', bookingId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Check if a specific time slot is available for subscription booking
export const checkSubscriptionSlotAvailability = async (
  tutorId: string,
  bookingDate: string,
  startTime: string,
  endTime: string
): Promise<ApiResponse<boolean>> => {
  try {
    // Check if there's already a booking for this time slot (trial or subscription)
    const { data: existingTrialBooking, error: trialBookingError } = await supabase
      .from('trial_bookings')
      .select('id')
      .eq('tutor_id', tutorId)
      .eq('booking_date', bookingDate)
      .or(`and(start_time.lte.${startTime},end_time.gt.${startTime}),and(start_time.lt.${endTime},end_time.gte.${endTime}),and(start_time.gte.${startTime},end_time.lte.${endTime})`)
      .neq('status', 'cancelled')
      .single();

    if (trialBookingError && trialBookingError.code !== 'PGRST116') {
      throw trialBookingError;
    }

    // If there's an existing trial booking, slot is not available
    if (existingTrialBooking) {
      return { data: false, error: null };
    }

    // Check if there's already a subscription booking for this time slot
    const { data: existingSubscriptionBooking, error: subscriptionBookingError } = await supabase
      .from('subscription_bookings')
      .select('id')
      .eq('tutor_id', tutorId)
      .eq('booking_date', bookingDate)
      .or(`and(start_time.lte.${startTime},end_time.gt.${startTime}),and(start_time.lt.${endTime},end_time.gte.${endTime}),and(start_time.gte.${startTime},end_time.lte.${endTime})`)
      .neq('status', 'cancelled')
      .single();

    if (subscriptionBookingError && subscriptionBookingError.code !== 'PGRST116') {
      throw subscriptionBookingError;
    }

    // If there's an existing subscription booking, slot is not available
    if (existingSubscriptionBooking) {
      return { data: false, error: null };
    }

    // Check if there's an unavailability for this time slot
    const { data: unavailability, error: unavailabilityError } = await supabase
      .from('tutor_availability')
      .select('id')
      .eq('tutor_id', tutorId)
      .eq('type', 'unavailability')
      .eq('start_date', bookingDate)
      .eq('end_date', bookingDate)
      .or(`and(start_time.lte.${startTime},end_time.gt.${startTime}),and(start_time.lt.${endTime},end_time.gte.${endTime}),and(start_time.gte.${startTime},end_time.lte.${endTime})`)
      .single();

    if (unavailabilityError && unavailabilityError.code !== 'PGRST116') {
      throw unavailabilityError;
    }

    // If there's an unavailability, slot is not available
    if (unavailability) {
      return { data: false, error: null };
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
