import { supabase } from './supabase';
import {
  TrialBooking,
  TrialBookingWithDetails,
  CreateTrialBookingData,
  UpdateTrialBookingData,
  AvailableTrialSlot,
  ApiResponse,
} from '../types/database';

// Get all trial bookings for a student
export const getStudentTrialBookings = async (studentId: string, currentUserId?: string): Promise<ApiResponse<TrialBooking[]>> => {
  try {
    // Application-level authorization: verify user is requesting their own bookings
    if (currentUserId && currentUserId !== studentId) {
      return { data: null, error: new Error('User can only view their own bookings') };
    }

    const { data, error } = await supabase
      .from('trial_bookings')
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

// Get all trial bookings for a tutor
export const getTutorTrialBookings = async (tutorId: string, currentUserId?: string): Promise<ApiResponse<TrialBooking[]>> => {
  try {
    // Application-level authorization: verify user is requesting their own bookings
    if (currentUserId && currentUserId !== tutorId) {
      return { data: null, error: new Error('User can only view their own bookings') };
    }

    const { data, error } = await supabase
      .from('trial_bookings')
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

// Get all trial bookings for a tutor with student details
export const getTutorTrialBookingsWithDetails = async (tutorId: string, currentUserId?: string): Promise<ApiResponse<TrialBookingWithDetails[]>> => {
  try {
    // Application-level authorization: verify user is requesting their own bookings
    if (currentUserId && currentUserId !== tutorId) {
      return { data: null, error: new Error('User can only view their own bookings') };
    }

    const { data, error } = await supabase
      .from('trial_bookings')
      .select(`
        *,
        student:profiles!student_id(*)
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

// Get available trial booking slots for a tutor
export const getAvailableTrialSlots = async (
  tutorId: string,
  trialLessonId: string,
  startDate?: string,
  endDate?: string,
  studentTimezone?: string
): Promise<ApiResponse<AvailableTrialSlot[]>> => {
  try {
    const { data, error } = await supabase.rpc('get_available_trial_slots', {
      p_tutor_id: tutorId,
      p_trial_lesson_id: trialLessonId,
      p_start_date: startDate || new Date().toISOString().split('T')[0],
      p_end_date: endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      p_student_timezone: studentTimezone || 'UTC'
    });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Create a new trial booking
export const createTrialBooking = async (
  bookingData: CreateTrialBookingData,
  currentUserId?: string
): Promise<ApiResponse<TrialBooking>> => {
  try {
    // Application-level authorization: verify user is creating booking for themselves
    if (currentUserId && currentUserId !== bookingData.student_id) {
      return { data: null, error: new Error('User can only create bookings for themselves') };
    }

    // Check minimum time notice
    const { data: minNoticeCheck, error: minNoticeError } = await supabase.rpc('check_minimum_time_notice', {
      p_tutor_id: bookingData.tutor_id,
      p_booking_date: bookingData.booking_date,
      p_start_time: bookingData.start_time
    });

    if (minNoticeError) throw minNoticeError;

    if (!minNoticeCheck) {
      return { data: null, error: new Error('Booking does not meet minimum time notice requirement') };
    }

    // Verify that the trial lesson exists (trial lessons are global, not tutor-specific)
    const { data: trialLesson, error: trialLessonError } = await supabase
      .from('trial_lessons')
      .select('id')
      .eq('id', bookingData.trial_lesson_id)
      .single();

    if (trialLessonError || !trialLesson) {
      return { data: null, error: new Error('Invalid trial lesson') };
    }

    const { data: booking, error } = await supabase
      .from('trial_bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) throw error;

    return { data: booking, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Update a trial booking
export const updateTrialBooking = async (
  bookingId: string,
  updateData: UpdateTrialBookingData,
  currentUserId?: string
): Promise<ApiResponse<TrialBooking>> => {
  try {
    // Application-level authorization: verify user is updating their own booking or a booking for them
    if (currentUserId) {
      const { data: existing, error: fetchError } = await supabase
        .from('trial_bookings')
        .select('student_id, tutor_id')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;
      
      if (!existing || (existing.student_id !== currentUserId && existing.tutor_id !== currentUserId)) {
        return { data: null, error: new Error('User can only update their own bookings or bookings for them') };
      }
    }

    const { data: booking, error } = await supabase
      .from('trial_bookings')
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

// Cancel a trial booking
export const cancelTrialBooking = async (
  bookingId: string,
  currentUserId?: string
): Promise<ApiResponse<TrialBooking>> => {
  try {
    return updateTrialBooking(bookingId, { status: 'cancelled' }, currentUserId);
  } catch (error) {
    return { data: null, error };
  }
};

// Confirm a trial booking (tutor only)
export const confirmTrialBooking = async (
  bookingId: string,
  currentUserId?: string
): Promise<ApiResponse<TrialBooking>> => {
  try {
    // Verify user is the tutor for this booking
    if (currentUserId) {
      const { data: existing, error: fetchError } = await supabase
        .from('trial_bookings')
        .select('tutor_id, status')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;
      
      if (!existing || existing.tutor_id !== currentUserId) {
        return { data: null, error: new Error('Only the tutor can confirm bookings') };
      }

      if (existing.status !== 'pending') {
        return { data: null, error: new Error('Only pending bookings can be confirmed') };
      }
    }

    return updateTrialBooking(bookingId, { status: 'confirmed' }, currentUserId);
  } catch (error) {
    return { data: null, error };
  }
};

// Get a specific trial booking
export const getTrialBooking = async (
  bookingId: string,
  currentUserId?: string
): Promise<ApiResponse<TrialBooking>> => {
  try {
    // Application-level authorization: verify user has access to this booking
    if (currentUserId) {
      const { data: existing, error: fetchError } = await supabase
        .from('trial_bookings')
        .select('student_id, tutor_id')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;
      
      if (!existing || (existing.student_id !== currentUserId && existing.tutor_id !== currentUserId)) {
        return { data: null, error: new Error('User does not have access to this booking') };
      }
    }

    const { data, error } = await supabase
      .from('trial_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Check if a specific time slot is available for booking
export const checkSlotAvailability = async (
  tutorId: string,
  bookingDate: string,
  startTime: string,
  endTime: string
): Promise<ApiResponse<boolean>> => {
  try {
    // Check if there's already a booking for this time slot
    const { data: existingBooking, error: bookingError } = await supabase
      .from('trial_bookings')
      .select('id')
      .eq('tutor_id', tutorId)
      .eq('booking_date', bookingDate)
      .or(`and(start_time.lte.${startTime},end_time.gt.${startTime}),and(start_time.lt.${endTime},end_time.gte.${endTime}),and(start_time.gte.${startTime},end_time.lte.${endTime})`)
      .single();

    if (bookingError && bookingError.code !== 'PGRST116') {
      throw bookingError;
    }

    // If there's an existing booking, slot is not available
    if (existingBooking) {
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

// Convert time between timezones
export const convertTimeBetweenTimezones = (
  time: string,
  fromTimezone: string,
  toTimezone: string
): string => {
  try {
    const date = new Date(`2000-01-01T${time}:00`);
    const fromDate = new Date(date.toLocaleString('en-US', { timeZone: fromTimezone }));
    const toDate = new Date(date.toLocaleString('en-US', { timeZone: toTimezone }));
    
    const offset = toDate.getTime() - fromDate.getTime();
    const convertedDate = new Date(date.getTime() + offset);
    
    return convertedDate.toTimeString().slice(0, 5);
  } catch (error) {
    console.error('Error converting timezone:', error);
    return time;
  }
};

// Get user's timezone
export const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error getting user timezone:', error);
    return 'UTC';
  }
};

// Check if student has an active trial booking for a specific language with a tutor
export const hasActiveTrialBooking = async (
  studentId: string, 
  tutorId: string, 
  languageId: string
): Promise<ApiResponse<boolean>> => {
  try {
    const { data, error } = await supabase
      .from('trial_bookings')
      .select('id')
      .eq('student_id', studentId)
      .eq('tutor_id', tutorId)
      .eq('language_id', languageId)
      .neq('status', 'cancelled')
      .limit(1);

    if (error) throw error;

    return { data: (data || []).length > 0, error: null };
  } catch (error) {
    return { data: null, error };
  }
};