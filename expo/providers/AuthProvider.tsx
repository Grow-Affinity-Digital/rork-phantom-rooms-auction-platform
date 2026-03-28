import React, { useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useUser, useOAuth } from '@clerk/clerk-expo';
import createContextHook from '@nkzw/create-context-hook';

export type AppRole = 'visitor' | 'buyer' | 'seller' | 'broker' | 'admin_staff' | 'superadmin';

interface AppUser {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  isSubscribed: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  setRole: (role: AppRole) => Promise<void>;
  setSubscribed: (isSubscribed: boolean) => Promise<void>;
  signInEmailMock: (email: string, role: AppRole) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook<AuthContextType>(() => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user: clerkUser, isLoaded } = useUser();
  const google = useOAuth({ strategy: 'oauth_google' });
  const apple = useOAuth({ strategy: 'oauth_apple' });

  const mountedRef = useRef<boolean>(false);
  
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;
    
    const init = async () => {
      console.log('[Auth] init called, isLoaded:', isLoaded, 'clerkUser:', !!clerkUser);
      try {
        if (isLoaded) {
          if (clerkUser) {
            const stored = await AsyncStorage.getItem('appUser');
            const parsed: AppUser | null = stored ? (JSON.parse(stored) as AppUser) : null;
            const pendingRoleRaw = await AsyncStorage.getItem('pendingRole');
            const pendingRole = (pendingRoleRaw as AppRole | null) ?? null;
            
            const email = clerkUser.primaryEmailAddress?.emailAddress ?? '';
            const name = clerkUser.fullName ?? clerkUser.firstName ?? (email ? email.split('@')[0] : 'User');
            const role: AppRole = parsed?.role ?? pendingRole ?? 'visitor';
            
            const nextUser: AppUser = {
              id: clerkUser.id,
              email,
              name,
              role,
              isSubscribed: parsed?.isSubscribed ?? false,
            };
            
            await AsyncStorage.setItem('appUser', JSON.stringify(nextUser));
            if (pendingRole) {
              await AsyncStorage.removeItem('pendingRole');
            }
            if (mountedRef.current) {
              setUser(nextUser);
            }
          } else {
            // No Clerk user, check for stored mock user
            const stored = await AsyncStorage.getItem('appUser');
            const parsed: AppUser | null = stored ? (JSON.parse(stored) as AppUser) : null;
            if (parsed && mountedRef.current) {
              setUser(parsed);
            } else if (mountedRef.current) {
              setUser(null);
            }
          }
        }
      } catch (e) {
        console.log('[Auth] init error', e);
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };
    
    init();
  }, [isLoaded, clerkUser?.id]);

  const setRole = async (role: AppRole) => {
    if (!mountedRef.current) return;
    
    setUser((prev) => {
      const next: AppUser | null = prev ? { ...prev, role } : null;
      if (next) {
        AsyncStorage.setItem('appUser', JSON.stringify(next)).catch((e) => console.log('[Auth] setRole persist error', e));
      }
      return next;
    });
  };

  const setSubscribed = async (isSubscribed: boolean) => {
    if (!mountedRef.current) return;
    
    setUser((prev) => {
      const next: AppUser | null = prev ? { ...prev, isSubscribed } : null;
      if (next) {
        AsyncStorage.setItem('appUser', JSON.stringify(next)).catch((e) => console.log('[Auth] setSubscribed persist error', e));
      }
      return next;
    });
  };

  const signInEmailMock = async (email: string, role: AppRole) => {
    if (!mountedRef.current) return;
    
    const newUser: AppUser = {
      id: Math.random().toString(36).slice(2),
      email,
      name: email.split('@')[0] ?? 'User',
      role,
      isSubscribed: false,
    };
    await AsyncStorage.setItem('appUser', JSON.stringify(newUser));
    if (mountedRef.current) {
      setUser(newUser);
    }
  };

  const signInWithGoogle = async () => {
    console.log('[Auth] Google OAuth start');
    try {
      const redirectUrl = Platform.select({ web: window.location.origin, default: 'exp://localhost' }) as string;
      await google.startOAuthFlow({ redirectUrl });
    } catch (e) {
      console.log('[Auth] Google OAuth error', e);
    }
  };

  const signInWithApple = async () => {
    console.log('[Auth] Apple OAuth start');
    try {
      const redirectUrl = Platform.select({ web: window.location.origin, default: 'exp://localhost' }) as string;
      await apple.startOAuthFlow({ redirectUrl });
    } catch (e) {
      console.log('[Auth] Apple OAuth error', e);
    }
  };

  const signOut = async () => {
    if (!mountedRef.current) return;
    
    try {
      await AsyncStorage.removeItem('appUser');
      // Note: Clerk sign out should be handled by Clerk components
    } catch (e) {
      console.log('[Auth] signOut error', e);
    }
    if (mountedRef.current) {
      setUser(null);
    }
  };

  return useMemo(
    () => ({ user, isLoading, setRole, setSubscribed, signInEmailMock, signOut, signInWithGoogle, signInWithApple }),
    [user, isLoading]
  );
});
