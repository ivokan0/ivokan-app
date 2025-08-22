import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { getProfile, updateProfile, type Profile } from '../services/profiles';

export const useProfile = () => {
  const { user, profile, refreshProfile } = useAuth();

  const updateUserProfile = useCallback(async (
    updates: Partial<Pick<Profile, 'first_name' | 'last_name' | 'avatar_url' | 'timezone'>>
  ) => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const { data: updatedProfile, error } = await updateProfile(user.id, updates);
      if (error) {
        throw error;
      }
      
      // Rafraîchir le profil dans le contexte
      await refreshProfile();
      
      return updatedProfile;
    } catch (error) {
      throw error;
    }
  }, [user, refreshProfile]);

  const loadUserProfile = useCallback(async () => {
    if (!user) {
      return null;
    }

    try {
      const { data: userProfile, error } = await getProfile(user.id);
      if (error) {
        return null;
      }
      return userProfile;
    } catch (error) {
      return null;
    }
  }, [user]);

  return {
    profile,
    updateUserProfile,
    loadUserProfile,
    isLoading: !profile && !!user,
  };
};
