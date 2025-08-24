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
  countryOfBirth?: string;
  spokenLanguages?: string[];
  sortBy?: 'reviews' | 'rating' | null;
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

    if (filters?.countryOfBirth) {
      query = query.eq('country_birth', filters.countryOfBirth);
    }

    if (filters?.spokenLanguages && filters.spokenLanguages.length > 0) {
      query = query.overlaps('spoken_languages', filters.spokenLanguages);
    }

    // Apply sorting
    let orderBy = 'created_at';
    let ascending = false;
    if (filters?.sortBy === 'rating') {
      // We'll sort by tutor_stats.average_rating in client-side since we can't easily order by joined table
      orderBy = 'created_at';
    } else if (filters?.sortBy === 'reviews') {
      // We'll sort by tutor_stats.total_reviews in client-side since we can't easily order by joined table
      orderBy = 'created_at';
    }

    const { data, error } = await query.order(orderBy, { ascending });

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

    // Apply client-side sorting
    if (filters?.sortBy === 'rating') {
      tutorsWithStats.sort((a, b) => (b.tutor_stats?.average_rating || 0) - (a.tutor_stats?.average_rating || 0));
    } else if (filters?.sortBy === 'reviews') {
      tutorsWithStats.sort((a, b) => (b.tutor_stats?.total_reviews || 0) - (a.tutor_stats?.total_reviews || 0));
    }

    return { data: tutorsWithStats, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get all available taught languages from tutors
export const getAvailableTaughtLanguages = async (): Promise<ApiResponse<string[]>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('taught_languages')
      .eq('profile_type', 'tutor')
      .not('taught_languages', 'is', null);

    if (error) {
      return { data: null, error };
    }

    // Extract unique languages
    const allLanguages = data?.flatMap(profile => profile.taught_languages || []) || [];
    const uniqueLanguages = [...new Set(allLanguages)].sort();

    return { data: uniqueLanguages, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get all available countries from tutors
export const getAvailableCountries = async (): Promise<ApiResponse<string[]>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('country_birth')
      .eq('profile_type', 'tutor')
      .not('country_birth', 'is', null);

    if (error) {
      return { data: null, error };
    }

    // Extract unique countries
    const allCountries = data?.map(profile => profile.country_birth).filter(Boolean) || [];
    const uniqueCountries = [...new Set(allCountries)].sort();

    return { data: uniqueCountries, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
