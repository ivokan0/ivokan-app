import { supabase } from './supabase';
import { Language, ApiResponse } from '../types/database';

// Get all languages
export const getLanguages = async (): Promise<ApiResponse<Language[]>> => {
  try {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .order('name');

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get language by ID
export const getLanguageById = async (id: string): Promise<ApiResponse<Language>> => {
  try {
    const { data, error } = await supabase
      .from('languages')
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

// Get language by code
export const getLanguageByCode = async (code: string): Promise<ApiResponse<Language>> => {
  try {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
