import { supabase } from './supabase';
import { TrialLesson, ApiResponse } from '../types/database';

// Get all trial lessons
export const getTrialLessons = async (): Promise<ApiResponse<TrialLesson[]>> => {
  try {
    const { data, error } = await supabase
      .from('trial_lessons')
      .select('*')
      .order('duration_minutes');

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get trial lesson by ID
export const getTrialLessonById = async (id: string): Promise<ApiResponse<TrialLesson>> => {
  try {
    const { data, error } = await supabase
      .from('trial_lessons')
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

// Get trial lesson by duration
export const getTrialLessonByDuration = async (durationMinutes: number): Promise<ApiResponse<TrialLesson>> => {
  try {
    const { data, error } = await supabase
      .from('trial_lessons')
      .select('*')
      .eq('duration_minutes', durationMinutes)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
