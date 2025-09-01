import { useState, useEffect } from 'react';

import { useAuth } from './useAuth';
import { getTutorEarningsSummary, getEarningsWithDetails } from '../services/earnings';
import { EarningWithDetails } from '../types/database';

export const useEarnings = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [earnings, setEarnings] = useState<EarningWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Load summary
      const { data: summaryData, error: summaryError } = await getTutorEarningsSummary(user.id);
      if (summaryError) {
        console.error('Error loading earnings summary:', summaryError);
        setError('Failed to load earnings summary');
      } else {
        setSummary(summaryData);
      }

      // Load earnings with details
      const { data: earningsData, error: earningsError } = await getEarningsWithDetails({
        tutorId: user.id
      });
      if (earningsError) {
        console.error('Error loading earnings:', earningsError);
        setError('Failed to load earnings');
      } else {
        setEarnings(earningsData || []);
      }
    } catch (error) {
      console.error('Error loading earnings data:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await loadData();
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  return {
    summary,
    earnings,
    loading,
    error,
    refresh,
  };
};
