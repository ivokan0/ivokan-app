import { supabase } from './supabase';
import { TutorResume, CreateTutorResumeData, UpdateTutorResumeData, ApiResponse } from '../types/database';

export const getTutorResume = async (tutorId: string): Promise<ApiResponse<TutorResume[]>> => {
  try {
    const { data, error } = await supabase
      .from('tutor_resume')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('start_year', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching tutor resume:', error);
    return { data: null, error };
  }
};

export const getTutorResumeByType = async (tutorId: string, type: string): Promise<ApiResponse<TutorResume[]>> => {
  try {
    const { data, error } = await supabase
      .from('tutor_resume')
      .select('*')
      .eq('tutor_id', tutorId)
      .eq('type', type)
      .order('start_year', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching tutor resume by type:', error);
    return { data: null, error };
  }
};

export const createTutorResume = async (resumeData: CreateTutorResumeData): Promise<ApiResponse<TutorResume>> => {
  try {
    const { data, error } = await supabase
      .from('tutor_resume')
      .insert([resumeData])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating tutor resume:', error);
    return { data: null, error };
  }
};

export const updateTutorResume = async (id: string, resumeData: UpdateTutorResumeData): Promise<ApiResponse<TutorResume>> => {
  try {
    const { data, error } = await supabase
      .from('tutor_resume')
      .update(resumeData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating tutor resume:', error);
    return { data: null, error };
  }
};

export const deleteTutorResume = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const { error } = await supabase
      .from('tutor_resume')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { data: null, error: null };
  } catch (error) {
    console.error('Error deleting tutor resume:', error);
    return { data: null, error };
  }
};

export const getTutorResumeById = async (id: string): Promise<ApiResponse<TutorResume>> => {
  try {
    const { data, error } = await supabase
      .from('tutor_resume')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching tutor resume by id:', error);
    return { data: null, error };
  }
};
