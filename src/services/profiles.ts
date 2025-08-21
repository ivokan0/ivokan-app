import { supabase } from './supabase';
import * as Location from 'expo-location';

export interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileData {
  user_id: string;
  first_name?: string;
  last_name?: string;
  timezone?: string;
}

// Détecter le fuseau horaire de l'utilisateur
export const detectTimezone = async (): Promise<string> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission de localisation non accordée, utilisation du fuseau horaire système');
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    }

    const location = await Location.getCurrentPositionAsync({});
    const timezone = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (timezone.length > 0 && timezone[0].timezone) {
      console.log('Fuseau horaire détecté:', timezone[0].timezone);
      return timezone[0].timezone;
    }
  } catch (error) {
    console.warn('Erreur lors de la détection du fuseau horaire:', error);
  }

  // Fallback vers le fuseau horaire du système
  const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  console.log('Utilisation du fuseau horaire système:', systemTimezone);
  return systemTimezone;
};

// Créer un nouveau profil
export const createProfile = async (data: CreateProfileData): Promise<{ data: Profile | null; error: any }> => {
  try {
    console.log('Création du profil pour user_id:', data.user_id);
    console.log('Données du profil:', { first_name: data.first_name, last_name: data.last_name });
    
    const timezone = data.timezone || await detectTimezone();
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        user_id: data.user_id,
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        timezone,
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase lors de la création du profil:', error);
      return { data: null, error };
    }

    console.log('Profil créé avec succès:', profile);
    return { data: profile, error: null };
  } catch (error) {
    console.error('Erreur lors de la création du profil:', error);
    return { data: null, error };
  }
};

// Récupérer un profil par user_id
export const getProfile = async (userId: string): Promise<{ data: Profile | null; error: any }> => {
  try {
    console.log('Récupération du profil pour user_id:', userId);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Erreur Supabase lors de la récupération du profil:', error);
      return { data: null, error };
    }

    if (!profile) {
      // 0 ligne retournée: ce n'est pas une erreur, simplement aucun profil encore
      return { data: null, error: null };
    }

    console.log('Profil récupéré:', profile);
    return { data: profile, error: null };
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return { data: null, error };
  }
};

// Mettre à jour un profil
export const updateProfile = async (
  userId: string, 
  updates: Partial<Pick<Profile, 'first_name' | 'last_name' | 'timezone'>>
): Promise<{ data: Profile | null; error: any }> => {
  try {
    console.log('Mise à jour du profil pour user_id:', userId, 'avec:', updates);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase lors de la mise à jour du profil:', error);
      return { data: null, error };
    }

    console.log('Profil mis à jour:', profile);
    return { data: profile, error: null };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return { data: null, error };
  }
};

// Vérifier si un profil existe
export const profileExists = async (userId: string): Promise<boolean> => {
  try {
    console.log('Vérification de l\'existence du profil pour user_id:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Erreur Supabase lors de la vérification du profil:', error);
      return false;
    }

    const exists = !!data;
    console.log('Profil existe:', exists);
    return exists;
  } catch (error) {
    console.log('Profil n\'existe pas (erreur attendue):', error);
    return false;
  }
};
