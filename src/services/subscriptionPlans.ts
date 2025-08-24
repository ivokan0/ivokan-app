import { supabase } from './supabase';
import { SubscriptionPlan, ApiResponse } from '../types/database';

// Get all subscription plans
export const getSubscriptionPlans = async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('duration_months');

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get subscription plan by ID
export const getSubscriptionPlanById = async (id: string): Promise<ApiResponse<SubscriptionPlan>> => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
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

// Get subscription plan by name
export const getSubscriptionPlanByName = async (name: string): Promise<ApiResponse<SubscriptionPlan>> => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
