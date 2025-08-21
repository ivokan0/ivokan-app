import { ClerkProvider, useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Configuration Clerk
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
}

// Token cache pour Clerk
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

// Configuration du provider Clerk
export const ClerkConfig = {
  publishableKey,
  tokenCache,
};

// Hook personnalisé pour l'authentification
export const useAuth = () => {
  const { isLoaded, isSignedIn, signIn, signUp, signOut } = useClerkAuth();
  const { user } = useUser();

  return {
    isLoaded,
    isSignedIn,
    user,
    signIn,
    signUp,
    signOut,
  };
};

// Méthodes d'authentification spécifiques
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { signIn } = useClerkAuth();
    const result = await signIn.create({
      identifier: email,
      password,
    });
    return { error: null, result };
  } catch (error) {
    return { error, result: null };
  }
};

export const signUpWithEmail = async (email: string, password: string, firstName?: string, lastName?: string) => {
  try {
    const { signUp } = useClerkAuth();
    const result = await signUp.create({
      emailAddress: email,
      password,
      firstName,
      lastName,
    });
    return { error: null, result };
  } catch (error) {
    return { error, result: null };
  }
};

export const signInWithOAuth = async (strategy: 'oauth_google' | 'oauth_apple') => {
  try {
    const { signIn } = useClerkAuth();
    const result = await signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/',
    });
    return { error: null, result };
  } catch (error) {
    return { error, result: null };
  }
};
