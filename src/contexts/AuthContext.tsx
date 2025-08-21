import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth as useClerkAuth, useUser, useSignIn, useSignUp, useOAuth } from '@clerk/clerk-expo';
import { createProfile, getProfile, profileExists, type Profile } from '../services/profiles';
import * as WebBrowser from 'expo-web-browser';

type AuthContextValue = {
  user: any | null;
  profile: Profile | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signIn: (args: { email: string; password: string }) => Promise<{ error?: Error }>;
  signUp: (args: { 
    email: string; 
    password: string; 
    firstName?: string; 
    lastName?: string; 
  }) => Promise<{ error?: Error; needsEmailConfirmation?: boolean }>;
  signInWithGoogle: () => Promise<{ error?: Error }>;
  signOut: () => Promise<{ error?: Error }>;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { user } = useUser();
  const { signIn: clerkSignIn } = useSignIn();
  const { signUp: clerkSignUp } = useSignUp();
  const { signOut: clerkSignOut } = useClerkAuth();
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const [profile, setProfile] = useState<Profile | null>(null);

  // Récupérer les informations utilisateur depuis Clerk
  const getUserInfoFromClerk = useCallback((clerkUser: any) => {
    if (!clerkUser) return { firstName: undefined, lastName: undefined };

    // Essayer de récupérer depuis les données OAuth
    const oauthAccounts = clerkUser.externalAccounts || [];
    const googleAccount = oauthAccounts.find((acc: any) => acc.provider === 'oauth_google');

    let firstName = clerkUser.firstName;
    let lastName = clerkUser.lastName;

    // Si pas de noms dans les données principales, essayer depuis les comptes OAuth
    if (!firstName && !lastName) {
      if (googleAccount) {
        firstName = googleAccount.firstName;
        lastName = googleAccount.lastName;
      }
    }

    return { firstName, lastName };
  }, []);

  // Charger le profil utilisateur
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data: userProfile, error } = await getProfile(userId);
      if (!error && userProfile) {
        setProfile(userProfile);
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du profil:', error);
    }
  }, []);

  // Créer un profil pour un nouvel utilisateur
  const createUserProfile = useCallback(async (userId: string, firstName?: string, lastName?: string) => {
    try {
      const exists = await profileExists(userId);
      if (!exists) {
        const { data: newProfile, error } = await createProfile({
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
        });
        
        if (!error && newProfile) {
          setProfile(newProfile);
          console.log('Profil créé avec succès:', newProfile);
        } else {
          console.error('Erreur lors de la création du profil:', error);
        }
      }
    } catch (error) {
      console.warn('Erreur lors de la création du profil:', error);
    }
  }, []);

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Charger le profil existant
      loadProfile(user.id);
      
      // Vérifier si un profil existe, sinon le créer
      const checkAndCreateProfile = async () => {
        const exists = await profileExists(user.id);
        if (!exists) {
          const { firstName, lastName } = getUserInfoFromClerk(user);
          await createUserProfile(user.id, firstName, lastName);
        }
      };
      
      checkAndCreateProfile();
    } else {
      setProfile(null);
    }
  }, [isLoaded, isSignedIn, user, loadProfile, createUserProfile, getUserInfoFromClerk]);

  const signIn = useCallback(async ({ email, password }: { email: string; password: string }) => {
    try {
      if (!clerkSignIn) {
        return { error: new Error('Service de connexion non disponible') };
      }
      
      const result = await clerkSignIn.create({
        identifier: email,
        password,
      });
      
      if (result.status === 'complete') {
        return { error: undefined };
      } else {
        return { error: new Error('Échec de la connexion') };
      }
    } catch (error: any) {
      return { error: error as Error };
    }
  }, [clerkSignIn]);

  const signUp = useCallback(async ({ 
    email, 
    password, 
    firstName, 
    lastName 
  }: { 
    email: string; 
    password: string; 
    firstName?: string; 
    lastName?: string; 
  }) => {
    try {
      if (!clerkSignUp) {
        return { error: new Error('Service d\'inscription non disponible') };
      }
      
      const result = await clerkSignUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });
      
      if (result.status === 'complete' && result.createdUserId) {
        // Créer le profil dans Supabase
        await createUserProfile(result.createdUserId, firstName, lastName);
        return { error: undefined, needsEmailConfirmation: false };
      } else if (result.status === 'missing_requirements') {
        return { error: undefined, needsEmailConfirmation: true };
      } else {
        return { error: new Error('Échec de l\'inscription') };
      }
    } catch (error: any) {
      return { error: error as Error };
    }
  }, [clerkSignUp, createUserProfile]);

  const signInWithGoogle = useCallback(async () => {
    try {
      if (!startGoogleOAuth) {
        return { error: new Error('Service Google OAuth non disponible') };
      }

      const { createdSessionId, setActive, signIn, signUp } = await startGoogleOAuth();
      
      if (createdSessionId && setActive) {
        setActive({ session: createdSessionId });
        return { error: undefined };
      } else if (signIn || signUp) {
        // L'utilisateur doit compléter le processus d'authentification
        return { error: undefined };
      }
      
      return { error: new Error('Échec de la connexion Google') };
    } catch (error: any) {
      console.error('Erreur Google OAuth:', error);
      return { error: error as Error };
    }
  }, [startGoogleOAuth]);

  const signOut = useCallback(async () => {
    try {
      if (!clerkSignOut) {
        return { error: new Error('Service de déconnexion non disponible') };
      }
      
      await clerkSignOut();
      setProfile(null);
      return { error: undefined };
    } catch (error: any) {
      return { error: error as Error };
    }
  }, [clerkSignOut]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user.id);
    }
  }, [user, loadProfile]);

  const value = useMemo(
    () => ({ 
      user, 
      profile, 
      isLoaded, 
      isSignedIn: isSignedIn ?? false, 
      signIn, 
      signUp, 
      signInWithGoogle, 
      signOut, 
      refreshProfile 
    }),
    [user, profile, isLoaded, isSignedIn, signIn, signUp, signInWithGoogle, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};


