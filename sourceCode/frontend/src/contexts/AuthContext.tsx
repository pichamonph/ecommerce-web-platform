'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import api from '@/lib/api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string;
  isBanned?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isSeller: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = authService.getAccessToken();
      console.log('🔑 [AuthContext] Access token (first 50 chars):', token ? token.substring(0, 50) + '...' : 'missing');
      console.log('🔑 [AuthContext] Full token length:', token ? token.length : 0);

      if (authService.isAuthenticated()) {
        console.log('📡 [AuthContext] Fetching user from /users/me...');
        const response = await api.get<User>('/users/me');
        console.log('✅ [AuthContext] User fetched successfully:');
        console.log('   - User ID:', response.data.id);
        console.log('   - Username:', response.data.username);
        console.log('   - Email:', response.data.email);
        console.log('   - Role:', response.data.role);
        setUser(response.data);
      } else {
        console.log('❌ [AuthContext] Not authenticated - no token');
        setUser(null);
      }
    } catch (error: any) {
      console.error('❌ [AuthContext] Failed to fetch user:', error);
      console.error('   - Error details:', error.response?.data);
      console.error('   - Error status:', error.response?.status);
      // If token is invalid, clear it
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // Listen for localStorage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' && e.oldValue !== e.newValue) {
        console.warn('⚠️ [AuthContext] Token changed in another tab/window!');
        console.log('   - Old token (first 20 chars):', e.oldValue ? e.oldValue.substring(0, 20) + '...' : 'null');
        console.log('   - New token (first 20 chars):', e.newValue ? e.newValue.substring(0, 20) + '...' : 'null');

        // Token changed (login/logout in another tab) - reload user
        if (e.newValue) {
          console.log('🔄 [AuthContext] New login detected, refreshing user data...');
          fetchUser();
        } else {
          console.log('🚪 [AuthContext] Logout detected, clearing user data...');
          setUser(null);
          window.location.href = '/login';
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔐 Attempting login...');
    const result = await authService.login({ email, password });
    console.log('✅ Login API success, tokens saved');
    console.log('📡 Fetching user data...');
    await fetchUser();
    console.log('✅ User data loaded, login complete');
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isSeller: user?.role === 'SELLER' || user?.role === 'ROLE_SELLER' || user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN',
    isAdmin: user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN',
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
