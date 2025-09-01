import { supabase } from './supabase';
import { 
  WithdrawalRequest, 
  WithdrawalRequestWithDetails, 
  CreateWithdrawalRequestData,
  ApiResponse 
} from '../types/database';

// Create a new withdrawal request
export const createWithdrawalRequest = async (
  data: CreateWithdrawalRequestData
): Promise<ApiResponse<WithdrawalRequest>> => {
  try {
    const { data: withdrawal, error } = await supabase
      .from('withdrawal_requests')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    return { data: withdrawal, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get withdrawal requests for a tutor
export const getTutorWithdrawalRequests = async (
  tutorId: string,
  filters?: {
    status?: 'pending' | 'done' | 'rejected';
    startDate?: string;
    endDate?: string;
  }
): Promise<ApiResponse<WithdrawalRequest[]>> => {
  try {
    let query = supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
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

// Get withdrawal requests with details
export const getWithdrawalRequestsWithDetails = async (
  filters?: {
    tutorId?: string;
    status?: 'pending' | 'done' | 'rejected';
    startDate?: string;
    endDate?: string;
  }
): Promise<ApiResponse<WithdrawalRequestWithDetails[]>> => {
  try {
    let query = supabase
      .from('withdrawal_requests')
      .select(`
        *,
        tutor:profiles!tutor_id(*),
        payment_method:tutor_payment_methods!payment_method_id(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.tutorId) {
      query = query.eq('tutor_id', filters.tutorId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
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

// Update withdrawal request status
export const updateWithdrawalRequestStatus = async (
  withdrawalId: string,
  status: 'pending' | 'done' | 'rejected',
  notes?: string
): Promise<ApiResponse<WithdrawalRequest>> => {
  try {
    const updateData: any = { status };
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data, error } = await supabase
      .from('withdrawal_requests')
      .update(updateData)
      .eq('id', withdrawalId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Upload payment proof
export const uploadPaymentProof = async (
  withdrawalId: string,
  file: File,
  fileName: string
): Promise<ApiResponse<{ url: string }>> => {
  try {
    // Upload file to payment_proofs bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('payment_proofs')
      .upload(`${withdrawalId}/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('payment_proofs')
      .getPublicUrl(uploadData.path);

    // Update withdrawal request with proof URL
    const { error: updateError } = await supabase
      .from('withdrawal_requests')
      .update({
        payment_proof_url: urlData.publicUrl,
        payment_proof_uploaded_at: new Date().toISOString()
      })
      .eq('id', withdrawalId);

    if (updateError) throw updateError;

    return { data: { url: urlData.publicUrl }, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get withdrawal request by ID
export const getWithdrawalRequestById = async (
  id: string
): Promise<ApiResponse<WithdrawalRequest>> => {
  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get withdrawal summary for a tutor
export const getTutorWithdrawalSummary = async (
  tutorId: string
): Promise<ApiResponse<{
  totalWithdrawn: number;
  pendingWithdrawals: number;
  completedWithdrawals: number;
  rejectedWithdrawals: number;
}>> => {
  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('amount, status')
      .eq('tutor_id', tutorId);

    if (error) throw error;

    const summary = (data || []).reduce((acc, withdrawal) => {
      if (withdrawal.status === 'done') {
        acc.totalWithdrawn += withdrawal.amount;
        acc.completedWithdrawals += withdrawal.amount;
      } else if (withdrawal.status === 'pending') {
        acc.pendingWithdrawals += withdrawal.amount;
      } else if (withdrawal.status === 'rejected') {
        acc.rejectedWithdrawals += withdrawal.amount;
      }
      return acc;
    }, {
      totalWithdrawn: 0,
      pendingWithdrawals: 0,
      completedWithdrawals: 0,
      rejectedWithdrawals: 0,
    });

    return { data: summary, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
