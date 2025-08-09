// Supabase client initialization
// Uses public env variables embedded by Expo (EXPO_PUBLIC_*). These are safe to expose in the client.

import { createClient } from '@supabase/supabase-js';

// Env variables should be defined in `.env` and start with EXPO_PUBLIC_ to be available in the app bundle.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Provide an early error to help developers set up environment variables correctly
  // In production, you may want to handle this differently
  console.warn('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: false, // We implement our own persistence in AuthContext using AsyncStorage
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});


