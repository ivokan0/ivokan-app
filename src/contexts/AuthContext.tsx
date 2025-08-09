import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isRestoring: boolean;
  signIn: (args: { email: string; password: string }) => Promise<{ error?: Error }>;
  signUp: (args: { email: string; password: string }) => Promise<{
    error?: Error;
    needsEmailConfirmation?: boolean;
  }>;
  signOut: () => Promise<{ error?: Error }>;
  signInWithGoogle: () => Promise<{ error?: Error }>;
  signInWithApple: () => Promise<{ error?: Error }>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_KEY = 'supabase.session';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(true);
  const isMountedRef = useRef(true);

  // Restore session from AsyncStorage on app start
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (raw) {
          const saved: Session = JSON.parse(raw);
          // Set the session to Supabase client
          await supabase.auth.setSession({ access_token: saved.access_token, refresh_token: saved.refresh_token });
          const {
            data: { session: fresh },
          } = await supabase.auth.getSession();
          if (fresh) {
            setSession(fresh);
            setUser(fresh.user);
          }
        }
      } catch (e) {
        console.warn('Failed to restore session', e);
      } finally {
        if (isMountedRef.current) setIsRestoring(false);
      }
    };
    restoreSession();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Listen to Supabase auth state changes and persist session
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      try {
        if (newSession) {
          await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
        } else {
          await AsyncStorage.removeItem(SESSION_KEY);
        }
      } catch (e) {
        console.warn('Failed to persist session', e);
      }
    });
    return () => {
      listener.subscription?.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async ({ email, password }: { email: string; password: string }) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ?? undefined };
    } catch (e: unknown) {
      return { error: e as Error };
    }
  }, []);

  const signUp = useCallback(async ({ email, password }: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      // If session is null after sign up, email confirmation is required
      const needsEmailConfirmation = !data?.session;
      return { error: error ?? undefined, needsEmailConfirmation };
    } catch (e: unknown) {
      return { error: e as Error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ?? undefined };
    } catch (e: unknown) {
      return { error: e as Error };
    }
  }, []);

  // OAuth using Supabase
  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // For Expo Go and native builds we use a deep link; configure scheme in app.json if needed.
          skipBrowserRedirect: false,
        },
      });
      return { error: error ?? undefined };
    } catch (e: unknown) {
      return { error: e as Error };
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          skipBrowserRedirect: false,
        },
      });
      return { error: error ?? undefined };
    } catch (e: unknown) {
      return { error: e as Error };
    }
  }, []);

  const value = useMemo(
    () => ({ user, session, isRestoring, signIn, signUp, signOut, signInWithGoogle, signInWithApple }),
    [user, session, isRestoring, signIn, signUp, signOut, signInWithGoogle, signInWithApple],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};


