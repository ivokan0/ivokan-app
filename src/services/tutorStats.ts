import { supabase } from './supabase';
import { TutorStats, ApiResponse } from '../types/database';

// Get tutor stats by tutor ID
export const getTutorStats = async (tutorId: string): Promise<ApiResponse<TutorStats>> => {
  try {
    const { data, error } = await supabase
      .from('tutor_stats')
      .select('*')
      .eq('tutor_id', tutorId)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Create or update tutor stats
export const upsertTutorStats = async (tutorId: string, stats: Partial<TutorStats>): Promise<ApiResponse<TutorStats>> => {
  try {
    const { data, error } = await supabase
      .from('tutor_stats')
      .upsert({
        tutor_id: tutorId,
        total_reviews: stats.total_reviews || 0,
        average_rating: stats.average_rating || 0,
        total_students: stats.total_students || 0,
        total_lessons: stats.total_lessons || 0,
      })
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

// Update tutor stats
export const updateTutorStats = async (
  tutorId: string, 
  updates: Partial<Pick<TutorStats, 'total_reviews' | 'average_rating' | 'total_students' | 'total_lessons'>>
): Promise<ApiResponse<TutorStats>> => {
  try {
    const { data, error } = await supabase
      .from('tutor_stats')
      .update(updates)
      .eq('tutor_id', tutorId)
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

// Increment total students
export const incrementTotalStudents = async (tutorId: string): Promise<ApiResponse<TutorStats>> => {
  try {
    const { data, error } = await supabase
      .from('tutor_stats')
      .update({ 
        total_students: supabase.raw('total_students + 1')
      })
      .eq('tutor_id', tutorId)
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

// Increment total lessons
export const incrementTotalLessons = async (tutorId: string): Promise<ApiResponse<TutorStats>> => {
  try {
    const { data, error } = await supabase
      .from('tutor_stats')
      .update({ 
        total_lessons: supabase.raw('total_lessons + 1')
      })
      .eq('tutor_id', tutorId)
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

// Get top rated tutors
export const getTopRatedTutors = async (limit: number = 10): Promise<ApiResponse<TutorStats[]>> => {
  try {
    const { data, error } = await supabase
      .from('tutor_stats')
      .select('*')
      .gte('average_rating', 4.0)
      .order('average_rating', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get tutors with most reviews
export const getTutorsWithMostReviews = async (limit: number = 10): Promise<ApiResponse<TutorStats[]>> => {
  try {
    const { data, error } = await supabase
      .from('tutor_stats')
      .select('*')
      .gte('total_reviews', 1)
      .order('total_reviews', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get super tutors stats
export const getSuperTutorsStats = async (): Promise<ApiResponse<TutorStats[]>> => {
  try {
    const { data, error } = await supabase
      .from('tutor_stats')
      .select(`
        *,
        tutor:profiles!tutor_stats_tutor_id_fkey(*)
      `)
      .gte('average_rating', 4.5)
      .gte('total_reviews', 10)
      .order('average_rating', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
