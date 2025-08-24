import { supabase } from './supabase';
import { Profile, TutorStats, ApiResponse, TutorWithStats } from '../types/database';

// Get all tutors with their stats
export const getTutorsWithStats = async (): Promise<ApiResponse<TutorWithStats[]>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        tutor_stats(*)
      `)
      .eq('profile_type', 'tutor')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    // Transform the data to match TutorWithStats interface
    const tutorsWithStats: TutorWithStats[] = data?.map(tutor => ({
      ...tutor,
      tutor_stats: tutor.tutor_stats || {
        id: '',
        tutor_id: tutor.user_id,
        total_reviews: 0,
        average_rating: 0,
        total_students: 0,
        total_lessons: 0,
        created_at: tutor.created_at,
        updated_at: tutor.updated_at
      },
      reviews: [],
      payment_methods: []
    })) || [];

    return { data: tutorsWithStats, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get tutors with filters
export const getTutorsWithFilters = async (filters?: {
  language?: string;
  minRating?: number;
  superTutor?: boolean;
}): Promise<ApiResponse<TutorWithStats[]>> => {
  try {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        tutor_stats(*)
      `)
      .eq('profile_type', 'tutor');

    // Apply filters
    if (filters?.language) {
      query = query.contains('taught_languages', [filters.language]);
    }

    if (filters?.superTutor) {
      query = query.eq('super_tutor', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    // Transform and filter by rating if needed
    let tutorsWithStats: TutorWithStats[] = data?.map(tutor => ({
      ...tutor,
      tutor_stats: tutor.tutor_stats || {
        id: '',
        tutor_id: tutor.user_id,
        total_reviews: 0,
        average_rating: 0,
        total_students: 0,
        total_lessons: 0,
        created_at: tutor.created_at,
        updated_at: tutor.updated_at
      },
      reviews: [],
      payment_methods: []
    })) || [];

    // Filter by minimum rating if specified
    if (filters?.minRating) {
      tutorsWithStats = tutorsWithStats.filter(tutor => 
        tutor.tutor_stats.average_rating >= filters.minRating!
      );
    }

    return { data: tutorsWithStats, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
