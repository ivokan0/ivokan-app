import { supabase } from './supabase';
import { 
  StudentSubscription, 
  CreateStudentSubscriptionData, 
  StudentSubscriptionWithDetails, 
  SubscriptionFilters,
  ApiResponse 
} from '../types/database';

// Create a new student subscription
export const createStudentSubscription = async (data: CreateStudentSubscriptionData): Promise<ApiResponse<StudentSubscription>> => {
  try {
    const { data: subscription, error } = await supabase
      .from('student_subscriptions')
      .insert({
        student_id: data.student_id,
        tutor_id: data.tutor_id,
        language_id: data.language_id,
        plan_id: data.plan_id,
        start_date: data.start_date,
        end_date: data.end_date,
        total_sessions: data.total_sessions,
        remaining_sessions: data.remaining_sessions,
        status: data.status,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: subscription, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get student subscriptions with filters
export const getStudentSubscriptions = async (filters?: SubscriptionFilters): Promise<ApiResponse<StudentSubscription[]>> => {
  try {
    let query = supabase
      .from('student_subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.student_id) {
      query = query.eq('student_id', filters.student_id);
    }

    if (filters?.tutor_id) {
      query = query.eq('tutor_id', filters.tutor_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.language_id) {
      query = query.eq('language_id', filters.language_id);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get student subscriptions with details (tutor, language, plan info)
export const getStudentSubscriptionsWithDetails = async (filters?: SubscriptionFilters): Promise<ApiResponse<StudentSubscriptionWithDetails[]>> => {
  try {
    let query = supabase
      .from('student_subscriptions')
      .select(`
        *,
        tutor:profiles!tutor_id(*),
        language:languages!language_id(*),
        plan:subscription_plans!plan_id(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.student_id) {
      query = query.eq('student_id', filters.student_id);
    }

    if (filters?.tutor_id) {
      query = query.eq('tutor_id', filters.tutor_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.language_id) {
      query = query.eq('language_id', filters.language_id);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get subscription by ID
export const getStudentSubscriptionById = async (id: string): Promise<ApiResponse<StudentSubscription>> => {
  try {
    const { data, error } = await supabase
      .from('student_subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get subscription by ID with details
export const getStudentSubscriptionByIdWithDetails = async (id: string): Promise<ApiResponse<StudentSubscriptionWithDetails>> => {
  try {
    const { data, error } = await supabase
      .from('student_subscriptions')
      .select(`
        *,
        tutor:profiles!tutor_id(*),
        language:languages!language_id(*),
        plan:subscription_plans!plan_id(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Update subscription
export const updateStudentSubscription = async (
  id: string, 
  updates: Partial<Pick<StudentSubscription, 'remaining_sessions' | 'status'>>
): Promise<ApiResponse<StudentSubscription>> => {
  try {
    const { data, error } = await supabase
      .from('student_subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Decrement remaining sessions
export const decrementRemainingSessions = async (id: string): Promise<ApiResponse<StudentSubscription>> => {
  try {
    const { data, error } = await supabase
      .from('student_subscriptions')
      .update({ 
        remaining_sessions: supabase.raw('remaining_sessions - 1'),
        status: supabase.raw('CASE WHEN remaining_sessions - 1 <= 0 THEN \'expired\' ELSE status END')
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Delete subscription
export const deleteStudentSubscription = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase
      .from('student_subscriptions')
      .delete()
      .eq('id', id);

    if (error) {
      return { data: null, error };
    }

    return { data: null, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get active subscriptions for a student
export const getActiveSubscriptionsForStudent = async (studentId: string): Promise<ApiResponse<StudentSubscriptionWithDetails[]>> => {
  try {
    const { data, error } = await supabase
      .from('student_subscriptions')
      .select(`
        *,
        tutor:profiles!tutor_id(*),
        language:languages!language_id(*),
        plan:subscription_plans!plan_id(*)
      `)
      .eq('student_id', studentId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get active subscriptions for a tutor
export const getActiveSubscriptionsForTutor = async (tutorId: string): Promise<ApiResponse<StudentSubscriptionWithDetails[]>> => {
  try {
    const { data, error } = await supabase
      .from('student_subscriptions')
      .select(`
        *,
        tutor:profiles!tutor_id(*),
        language:languages!language_id(*),
        plan:subscription_plans!plan_id(*)
      `)
      .eq('tutor_id', tutorId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Check if student has an active subscription for a specific language with a tutor
export const hasActiveSubscription = async (
  studentId: string, 
  tutorId: string, 
  languageCode: string
): Promise<ApiResponse<boolean>> => {
  try {
    // First get the language ID from the language code
    const { data: language, error: langError } = await supabase
      .from('languages')
      .select('id')
      .eq('code', languageCode)
      .single();

    if (langError || !language) {
      return { data: false, error: null };
    }

    const { data, error } = await supabase
      .from('student_subscriptions')
      .select('id')
      .eq('student_id', studentId)
      .eq('tutor_id', tutorId)
      .eq('language_id', language.id)
      .eq('status', 'active')
      .limit(1);

    if (error) throw error;

    return { data: (data || []).length > 0, error: null };
  } catch (error) {
    return { data: null, error };
  }
};