import { supabase } from './supabase';
import {
  TutorAvailability,
  CreateTutorAvailabilityData,
  UpdateTutorAvailabilityData,
  TutorAvailabilityView,
  EffectiveAvailability,
  ApiResponse,
} from '../types/database';

// Get all availability for a tutor
export const getTutorAvailability = async (tutorId: string): Promise<ApiResponse<TutorAvailability[]>> => {
  try {
    const { data, error } = await supabase
      .from('tutor_availability')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get weekly availability slots for a tutor
export const getWeeklyAvailability = async (tutorId: string): Promise<ApiResponse<TutorAvailability[]>> => {
  try {
    const { data, error } = await supabase
      .from('tutor_availability')
      .select('*')
      .eq('tutor_id', tutorId)
      .eq('type', 'weekly_availability')
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get unavailability periods for a tutor
export const getUnavailabilityPeriods = async (tutorId: string): Promise<ApiResponse<TutorAvailability[]>> => {
  try {
    const { data, error } = await supabase
      .from('tutor_availability')
      .select('*')
      .eq('tutor_id', tutorId)
      .eq('type', 'unavailability')
      .order('start_date', { ascending: true });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Create new availability entry
export const createAvailability = async (
  data: CreateTutorAvailabilityData,
  currentUserId?: string
): Promise<ApiResponse<TutorAvailability>> => {
  try {
    // Application-level authorization: verify user is creating availability for themselves
    if (currentUserId && currentUserId !== data.tutor_id) {
      return { data: null, error: new Error('User can only create availability for themselves') };
    }

    const { data: availability, error } = await supabase
      .from('tutor_availability')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    return { data: availability, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Update availability entry
export const updateAvailability = async (
  id: string, 
  data: UpdateTutorAvailabilityData,
  currentUserId?: string
): Promise<ApiResponse<TutorAvailability>> => {
  try {
    // Application-level authorization: verify user is updating their own availability
    if (currentUserId) {
      const { data: existing, error: fetchError } = await supabase
        .from('tutor_availability')
        .select('tutor_id')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      
      if (!existing || existing.tutor_id !== currentUserId) {
        return { data: null, error: new Error('User can only update their own availability') };
      }
    }

    const { data: availability, error } = await supabase
      .from('tutor_availability')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data: availability, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Delete availability entry
export const deleteAvailability = async (id: string, currentUserId?: string): Promise<ApiResponse<boolean>> => {
  try {
    // Application-level authorization: verify user is deleting their own availability
    if (currentUserId) {
      const { data: existing, error: fetchError } = await supabase
        .from('tutor_availability')
        .select('tutor_id')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      
      if (!existing || existing.tutor_id !== currentUserId) {
        return { data: null, error: new Error('User can only delete their own availability') };
      }
    }

    const { error } = await supabase
      .from('tutor_availability')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get tutor availability view (today + 2 weeks)
export const getTutorAvailabilityView = async (
  tutorId: string,
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<TutorAvailabilityView[]>> => {
  try {
    let query = supabase
      .from('tutor_availability_view')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('date_actual', { ascending: true })
      .order('start_time', { ascending: true });

    if (startDate) {
      query = query.gte('date_actual', startDate);
    }

    if (endDate) {
      query = query.lte('date_actual', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get effective availability using the database function
export const getEffectiveAvailability = async (
  tutorId: string,
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<EffectiveAvailability[]>> => {
  try {
    const { data, error } = await supabase.rpc('get_tutor_effective_availability', {
      p_tutor_id: tutorId,
      p_date: startDate || new Date().toISOString().split('T')[0],
      p_end_date: endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Calculate effective availability by subtracting unavailability from weekly availability
export const calculateEffectiveAvailability = async (
  tutorId: string,
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<EffectiveAvailability[]>> => {
  try {
    // Get both weekly availability and unavailability
    const { data: weeklyData, error: weeklyError } = await getWeeklyAvailability(tutorId);
    if (weeklyError) throw weeklyError;

    const { data: unavailabilityData, error: unavailabilityError } = await getUnavailabilityPeriods(tutorId);
    if (unavailabilityError) throw unavailabilityError;

    // Calculate date range
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    
    const result: EffectiveAvailability[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();

      // Get weekly availability for this day
      const dayWeeklySlots = weeklyData?.filter(slot => slot.day_of_week === dayOfWeek) || [];

      // Get unavailability for this specific date
      const dayUnavailability = unavailabilityData?.filter(period => {
        const periodStart = new Date(period.start_date!);
        const periodEnd = new Date(period.end_date!);
        return currentDate >= periodStart && currentDate <= periodEnd;
      }) || [];

      // Check if full day unavailable
      const isFullDayUnavailable = dayUnavailability.some(period => period.is_full_day);

      let availableSlots: { start_time: string; end_time: string }[] = [];

      if (!isFullDayUnavailable && dayWeeklySlots.length > 0) {
        // Calculate available slots by properly subtracting partial unavailability
        availableSlots = [];
        
        for (const weeklySlot of dayWeeklySlots) {
          let currentSlots = [{
            start_time: weeklySlot.start_time!,
            end_time: weeklySlot.end_time!,
          }];
          
          // Apply each unavailability period to split the slots
          for (const unavail of dayUnavailability) {
            if (unavail.is_full_day) {
              currentSlots = []; // Full day unavailable, no slots left
              break;
            }
            
            const unavailStart = unavail.start_time!;
            const unavailEnd = unavail.end_time!;
            const newSlots: { start_time: string; end_time: string }[] = [];
            
            for (const slot of currentSlots) {
              // Check if unavailability overlaps with this slot
              if (unavailEnd <= slot.start_time || unavailStart >= slot.end_time) {
                // No overlap, keep the slot as is
                newSlots.push(slot);
              } else {
                // There is overlap, split the slot
                
                // Add part before unavailability (if any)
                if (slot.start_time < unavailStart) {
                  newSlots.push({
                    start_time: slot.start_time,
                    end_time: unavailStart,
                  });
                }
                
                // Add part after unavailability (if any)
                if (slot.end_time > unavailEnd) {
                  newSlots.push({
                    start_time: unavailEnd,
                    end_time: slot.end_time,
                  });
                }
              }
            }
            
            currentSlots = newSlots;
          }
          
          availableSlots.push(...currentSlots);
        }
        
        // Sort slots by start time
        availableSlots.sort((a, b) => a.start_time.localeCompare(b.start_time));
        

      }

      result.push({
        date_actual: dateString,
        available_slots: availableSlots,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Bulk create/update availability (useful for saving multiple slots at once)
export const bulkUpsertAvailability = async (
  tutorId: string,
  availabilityData: CreateTutorAvailabilityData[]
): Promise<ApiResponse<TutorAvailability[]>> => {
  try {
    // Add tutor_id to all entries
    const dataWithTutorId = availabilityData.map(item => ({
      ...item,
      tutor_id: tutorId
    }));

    const { data, error } = await supabase
      .from('tutor_availability')
      .upsert(dataWithTutorId)
      .select();

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Delete all weekly availability for a tutor (useful for resetting)
export const deleteAllWeeklyAvailability = async (tutorId: string): Promise<ApiResponse<boolean>> => {
  try {
    const { error } = await supabase
      .from('tutor_availability')
      .delete()
      .eq('tutor_id', tutorId)
      .eq('type', 'weekly_availability');

    if (error) throw error;

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Check for availability conflicts
export const checkAvailabilityConflicts = async (
  tutorId: string,
  type: 'weekly_availability' | 'unavailability',
  data: {
    day_of_week?: number;
    start_time?: string;
    end_time?: string;
    start_date?: string;
    end_date?: string;
  },
  excludeId?: string
): Promise<ApiResponse<TutorAvailability[]>> => {
  try {
    let query = supabase
      .from('tutor_availability')
      .select('*')
      .eq('tutor_id', tutorId);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    if (type === 'weekly_availability' && data.day_of_week !== undefined) {
      // Check for weekly availability conflicts on the same day
      query = query
        .eq('type', 'weekly_availability')
        .eq('day_of_week', data.day_of_week)
        .or(`and(start_time.lte.${data.start_time},end_time.gt.${data.start_time}),and(start_time.lt.${data.end_time},end_time.gte.${data.end_time}),and(start_time.gte.${data.start_time},end_time.lte.${data.end_time})`);
    } else if (type === 'unavailability' && data.start_date && data.end_date) {
      // Check for unavailability conflicts in the same date range
      query = query
        .eq('type', 'unavailability')
        .or(`and(start_date.lte.${data.start_date},end_date.gte.${data.start_date}),and(start_date.lte.${data.end_date},end_date.gte.${data.end_date}),and(start_date.gte.${data.start_date},end_date.lte.${data.end_date})`);
    }

    const { data: conflicts, error } = await query;

    if (error) throw error;

    return { data: conflicts || [], error: null };
  } catch (error) {
    return { data: null, error };
  }
};
