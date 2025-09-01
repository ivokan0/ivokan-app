import { supabase } from './supabase';
import { 
  Earning, 
  EarningWithDetails, 
  CreateEarningData, 
  Policy,
  ApiResponse 
} from '../types/database';

// Get policy value
export const getPolicyValue = async (key: string): Promise<ApiResponse<string>> => {
  try {
    const { data, error } = await supabase
      .from('policies')
      .select('value')
      .eq('key', key)
      .single();

    if (error) throw error;

    return { data: data?.value || null, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get all policies
export const getPolicies = async (): Promise<ApiResponse<Policy[]>> => {
  try {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .order('key');

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Calculate net amount using commission percentage
export const calculateNetAmount = async (grossAmount: number): Promise<number> => {
  try {
    const { data: commissionStr } = await getPolicyValue('platform_commission_percentage');
    const commissionPercentage = commissionStr ? parseFloat(commissionStr) : 25;
    
    const netAmount = grossAmount * (100 - commissionPercentage) / 100;
    return Math.round(netAmount * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating net amount:', error);
    // Default to 25% commission if there's an error
    return Math.round(grossAmount * 0.75 * 100) / 100;
  }
};

// Create a new earning record
export const createEarning = async (data: CreateEarningData): Promise<ApiResponse<Earning>> => {
  try {
    // Calculate net amount if not provided
    let netAmount = data.net_amount;
    if (!netAmount) {
      netAmount = await calculateNetAmount(data.gross_amount);
    }

    const earningData = {
      tutor_id: data.tutor_id,
      student_id: data.student_id,
      type: data.type,
      student_subscriptions_id: data.student_subscriptions_id,
      trial_bookings_id: data.trial_bookings_id,
      gross_amount: data.gross_amount,
      net_amount: netAmount,
      status: data.status || 'pending',
    };

    const { data: earning, error } = await supabase
      .from('earnings')
      .insert(earningData)
      .select()
      .single();

    if (error) throw error;

    return { data: earning, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get earnings for a tutor
export const getTutorEarnings = async (
  tutorId: string,
  filters?: {
    status?: 'pending' | 'gained' | 'refunded';
    type?: 'trial' | 'plan';
    startDate?: string;
    endDate?: string;
  }
): Promise<ApiResponse<Earning[]>> => {
  try {
    let query = supabase
      .from('earnings')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get earnings for a student (their payments)
export const getStudentEarnings = async (
  studentId: string,
  filters?: {
    status?: 'pending' | 'gained' | 'refunded';
    type?: 'trial' | 'plan';
    startDate?: string;
    endDate?: string;
  }
): Promise<ApiResponse<Earning[]>> => {
  try {
    let query = supabase
      .from('earnings')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get earnings with details (including related records)
export const getEarningsWithDetails = async (
  filters?: {
    tutorId?: string;
    studentId?: string;
    status?: 'pending' | 'gained' | 'refunded';
    type?: 'trial' | 'plan';
    startDate?: string;
    endDate?: string;
  }
): Promise<ApiResponse<EarningWithDetails[]>> => {
  try {
    let query = supabase
      .from('earnings')
      .select(`
        *,
        tutor:profiles!tutor_id(*),
        student:profiles!student_id(*),
        subscription:student_subscriptions!student_subscriptions_id(
          *,
          language:languages!language_id(*)
        ),
        trial_booking:trial_bookings!trial_bookings_id(
          *,
          trial_lesson:trial_lessons!trial_lesson_id(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.tutorId) {
      query = query.eq('tutor_id', filters.tutorId);
    }

    if (filters?.studentId) {
      query = query.eq('student_id', filters.studentId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Update earning status
export const updateEarningStatus = async (
  earningId: string,
  status: 'pending' | 'gained' | 'refunded'
): Promise<ApiResponse<Earning>> => {
  try {
    const { data, error } = await supabase
      .from('earnings')
      .update({ status })
      .eq('id', earningId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get earning by ID
export const getEarningById = async (id: string): Promise<ApiResponse<Earning>> => {
  try {
    const { data, error } = await supabase
      .from('earnings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get total earnings summary for a tutor
export const getTutorEarningsSummary = async (
  tutorId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<ApiResponse<{
  totalGross: number;
  totalNet: number;
  pendingAmount: number;
  gainedAmount: number;
  refundedAmount: number;
  trialEarnings: number;
  planEarnings: number;
}>> => {
  try {
    let query = supabase
      .from('earnings')
      .select('gross_amount, net_amount, status, type')
      .eq('tutor_id', tutorId);

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const summary = (data || []).reduce((acc, earning) => {
      acc.totalGross += earning.gross_amount;
      acc.totalNet += earning.net_amount;

      if (earning.status === 'pending') {
        acc.pendingAmount += earning.net_amount;
      } else if (earning.status === 'gained') {
        acc.gainedAmount += earning.net_amount;
      } else if (earning.status === 'refunded') {
        acc.refundedAmount += earning.net_amount;
      }

      if (earning.type === 'trial') {
        acc.trialEarnings += earning.net_amount;
      } else if (earning.type === 'plan') {
        acc.planEarnings += earning.net_amount;
      }

      return acc;
    }, {
      totalGross: 0,
      totalNet: 0,
      pendingAmount: 0,
      gainedAmount: 0,
      refundedAmount: 0,
      trialEarnings: 0,
      planEarnings: 0,
    });

    return { data: summary, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
