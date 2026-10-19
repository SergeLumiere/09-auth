'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { checkSession, getMe } from '@/lib/api/clientApi';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const setUser = useAuthStore(state => state.setUser);
  const clearIsAuthenticated = useAuthStore(state => state.clearIsAuthenticated);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isSessionValid = await checkSession();

        if (isSessionValid) {
          const user = await getMe();
          setUser(user);
        } else {
          clearIsAuthenticated();
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        clearIsAuthenticated();
      }
    };

    void initializeAuth();
  }, [setUser, clearIsAuthenticated]);

  return <>{children}</>;
}
