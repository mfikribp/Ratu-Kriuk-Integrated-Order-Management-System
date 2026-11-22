'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiCall, {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
} from '@/lib/api';

export interface User {
  id: string;
  username: string;
  role: string;
  full_name: string;
}

interface LoginResponse {
  id: string;
  username: string;
  role: string;
  full_name: string;
  token: string;
}

interface MeResponse {
  data: {
    user_id: string;
    username: string;
    role: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiCall<MeResponse>('/auth/me');
      const stored = getStoredUser() as User | null;
      setUser({
        id: res.data.user_id,
        username: res.data.username,
        role: res.data.role,
        full_name: stored?.full_name ?? '',
      });
    } catch {
      clearAuthToken();
      clearStoredUser();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiCall<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        skipAuth: true,
      });

      const nextUser: User = {
        id: res.id,
        username: res.username,
        role: res.role,
        full_name: res.full_name,
      };

      setAuthToken(res.token);
      setStoredUser(nextUser);
      setUser(nextUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    clearStoredUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
