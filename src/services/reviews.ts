import { supabase } from './supabase';
import { Review, CreateReviewData, ReviewWithProfiles, ApiResponse } from '../types/database';

// Create a new review
export const createReview = async (data: CreateReviewData): Promise<ApiResponse<Review>> => {
  try {
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        tutor_id: data.tutor_id,
        student_id: data.student_id,
        rating: data.rating,
        comment: data.comment || null,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: review, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get reviews by tutor ID
export const getReviewsByTutorId = async (tutorId: string): Promise<ApiResponse<Review[]>> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get reviews with profiles (tutor and student info)
export const getReviewsWithProfiles = async (tutorId: string): Promise<ApiResponse<ReviewWithProfiles[]>> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        tutor:profiles!fk_reviews_tutor_id(*),
        student:profiles!fk_reviews_student_id(*)
      `)
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get review by ID
export const getReviewById = async (id: string): Promise<ApiResponse<Review>> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
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

// Update review (mainly for tutor reply)
export const updateReview = async (
  id: string, 
  updates: Partial<Pick<Review, 'reply'>>
): Promise<ApiResponse<Review>> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
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

// Delete review
export const deleteReview = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase
      .from('reviews')
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

// Check if student has already reviewed tutor
export const hasStudentReviewedTutor = async (studentId: string, tutorId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id')
      .eq('student_id', studentId)
      .eq('tutor_id', tutorId)
      .maybeSingle();

    if (error) {
      return false;
    }

    return !!data;
  } catch (error) {
    return false;
  }
};
