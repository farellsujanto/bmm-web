'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { setInMemoryToken } from '@/src/utils/api/apiRequest';

interface User {
  id: number;
  name: string | null;
  phoneNumber: string;
  role: string;
  referralCode: string;
  maxReferralPercentage: string;
  globalDiscountPercentage: string;
}

interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Wrapper to sync token with apiRequest
  const setAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
    setInMemoryToken(token);
  }, []);

  // Try to refresh token on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await refreshAccessToken();
        if (!token) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback((token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
    setIsLoading(false);
  }, [setAccessToken]);

  const logout = useCallback(async () => {
    try {
      // Call logout API to clear refresh token cookie
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear in-memory state regardless of API call result
      setAccessToken(null);
      setUser(null);
      router.push('/login');
    }
  }, [router, setAccessToken]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        // Refresh failed, clear state
        setAccessToken(null);
        setUser(null);
        return null;
      }

      const data = await response.json();
      
      if (data.success && data.data?.accessToken) {
        setAccessToken(data.data.accessToken);
        // Set user data if available
        if (data.data.user) {
          setUser(data.data.user);
        }
        setIsLoading(false);
        return data.data.accessToken;
      }

      return null;
    } catch (error) {
      console.error('Token refresh error:', error);
      setAccessToken(null);
      setUser(null);
      return null;
    }
  }, [setAccessToken]);

  const value: AuthContextType = {
    accessToken,
    user,
    isAuthenticated: !!accessToken,
    isLoading,
    login,
    logout,
    refreshAccessToken,
    setAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
