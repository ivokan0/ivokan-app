import { supabase } from './supabase';
import * as Location from 'expo-location';

export interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  timezone: string;
  profile_type: 'student' | 'tutor';
  created_at: string;
  updated_at: string;
}

export interface CreateProfileData {
  user_id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  timezone?: string;
  profile_type?: 'student' | 'tutor';
}

// Détecter le fuseau horaire de l'utilisateur
export const detectTimezone = async (): Promise<string> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    }

    const location = await Location.getCurrentPositionAsync({});
    const timezone = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (timezone.length > 0 && timezone[0].timezone) {
      return timezone[0].timezone;
    }
  } catch (error) {
    // Erreur silencieuse, utilisation du fallback
  }

  // Fallback vers le fuseau horaire du système
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
};

// Créer un nouveau profil
export const createProfile = async (data: CreateProfileData): Promise<{ data: Profile | null; error: any }> => {
  try {
    const timezone = data.timezone || await detectTimezone();
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        user_id: data.user_id,
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        avatar_url: data.avatar_url || null,
        timezone,
        profile_type: data.profile_type ?? 'student',
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: profile, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Récupérer un profil par user_id
export const getProfile = async (userId: string): Promise<{ data: Profile | null; error: any }> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    if (!profile) {
      // 0 ligne retournée: ce n'est pas une erreur, simplement aucun profil encore
      return { data: null, error: null };
    }

    return { data: profile, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Mettre à jour un profil
export const updateProfile = async (
  userId: string, 
  updates: Partial<Pick<Profile, 'first_name' | 'last_name' | 'avatar_url' | 'timezone' | 'profile_type'>>
): Promise<{ data: Profile | null; error: any }> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: profile, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Vérifier si un profil existe
export const profileExists = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return false;
    }

    return !!data;
  } catch (error) {
    return false;
  }
};
