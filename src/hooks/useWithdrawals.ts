import { useState, useEffect } from 'react';

import { useAuth } from './useAuth';
import { 
  getTutorWithdrawalRequests, 
  getWithdrawalRequestsWithDetails,
  getTutorWithdrawalSummary,
  createWithdrawalRequest,
  updateWithdrawalRequestStatus
} from '../services/withdrawals';
import { WithdrawalRequest, WithdrawalRequestWithDetails, CreateWithdrawalRequestData } from '../types/database';

export const useWithdrawals = () => {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [withdrawalsWithDetails, setWithdrawalsWithDetails] = useState<WithdrawalRequestWithDetails[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Load withdrawals
      const { data: withdrawalsData, error: withdrawalsError } = await getTutorWithdrawalRequests(user.id);
      if (withdrawalsError) {
        console.error('Error loading withdrawals:', withdrawalsError);
        setError('Failed to load withdrawals');
      } else {
        setWithdrawals(withdrawalsData || []);
      }

      // Load withdrawals with details
      const { data: detailsData, error: detailsError } = await getWithdrawalRequestsWithDetails({
        tutorId: user.id
      });
      if (detailsError) {
        console.error('Error loading withdrawal details:', detailsError);
        setError('Failed to load withdrawal details');
      } else {
        setWithdrawalsWithDetails(detailsData || []);
      }

      // Load summary
      const { data: summaryData, error: summaryError } = await getTutorWithdrawalSummary(user.id);
      if (summaryError) {
        console.error('Error loading withdrawal summary:', summaryError);
        setError('Failed to load withdrawal summary');
      } else {
        setSummary(summaryData);
      }
    } catch (error) {
      console.error('Error loading withdrawal data:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createWithdrawal = async (data: CreateWithdrawalRequestData) => {
    try {
      setError(null);
      const { data: withdrawal, error } = await createWithdrawalRequest(data);
      
      if (error) {
        setError('Failed to create withdrawal request');
        return { data: null, error };
      }

      // Reload data to include the new withdrawal
      await loadData();
      
      return { data: withdrawal, error: null };
    } catch (error) {
      setError('An unexpected error occurred');
      return { data: null, error };
    }
  };

  const updateWithdrawal = async (
    withdrawalId: string, 
    status: 'pending' | 'done' | 'rejected', 
    notes?: string
  ) => {
    try {
      setError(null);
      const { data: withdrawal, error } = await updateWithdrawalRequestStatus(withdrawalId, status, notes);
      
      if (error) {
        setError('Failed to update withdrawal request');
        return { data: null, error };
      }

      // Reload data to reflect the changes
      await loadData();
      
      return { data: withdrawal, error: null };
    } catch (error) {
      setError('An unexpected error occurred');
      return { data: null, error };
    }
  };

  const refresh = async () => {
    await loadData();
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  return {
    withdrawals,
    withdrawalsWithDetails,
    summary,
    loading,
    error,
    createWithdrawal,
    updateWithdrawal,
    refresh,
  };
};
