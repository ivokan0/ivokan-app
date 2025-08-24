import { supabase } from './supabase';

export interface PaymentMethod {
  id: string;
  tutor_id: string;
  payment_type: 'orange_money' | 'wave' | 'mtn_money' | 'moov_money' | 'bank_transfer';
  account_number: string;
  account_name: string;
  is_default: boolean;
  bank_name?: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethodData {
  payment_type: PaymentMethod['payment_type'];
  account_number: string;
  account_name: string;
  is_default: boolean;
  bank_name?: string;
  country: string;
}

export interface UpdatePaymentMethodData extends Partial<CreatePaymentMethodData> {
  id: string;
}

export const paymentMethodsService = {
  // Get all payment methods for a tutor
  async getPaymentMethods(tutorId: string): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('tutor_payment_methods')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch payment methods: ${error.message}`);
    }

    return data || [];
  },

  // Create a new payment method
  async createPaymentMethod(tutorId: string, paymentMethod: CreatePaymentMethodData): Promise<PaymentMethod> {
    const { data, error } = await supabase
      .from('tutor_payment_methods')
      .insert([{ ...paymentMethod, tutor_id: tutorId }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create payment method: ${error.message}`);
    }

    return data;
  },

  // Update a payment method
  async updatePaymentMethod(paymentMethod: UpdatePaymentMethodData): Promise<PaymentMethod> {
    const { id, ...updateData } = paymentMethod;
    
    const { data, error } = await supabase
      .from('tutor_payment_methods')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update payment method: ${error.message}`);
    }

    return data;
  },

  // Delete a payment method
  async deletePaymentMethod(id: string): Promise<void> {
    const { error } = await supabase
      .from('tutor_payment_methods')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete payment method: ${error.message}`);
    }
  },

  // Set a payment method as default
  async setDefaultPaymentMethod(tutorId: string, paymentMethodId: string): Promise<void> {
    // First, set all payment methods to not default
    const { error: updateError } = await supabase
      .from('tutor_payment_methods')
      .update({ is_default: false })
      .eq('tutor_id', tutorId);

    if (updateError) {
      throw new Error(`Failed to update payment methods: ${updateError.message}`);
    }

    // Then set the specified payment method as default
    const { error: setDefaultError } = await supabase
      .from('tutor_payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId)
      .eq('tutor_id', tutorId);

    if (setDefaultError) {
      throw new Error(`Failed to set default payment method: ${setDefaultError.message}`);
    }
  }
};
