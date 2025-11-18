// File: contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { router } from 'expo-router';
import authService from '@/services/api/authService';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking auth status...');
      const authenticated = await authService.isAuthenticated();
      console.log('✅ Is authenticated:', authenticated);
      
      if (authenticated) {
        const userData = await authService.getCurrentUser();
        console.log('👤 User data:', userData);
        setUser(userData);
      } else {
        console.log('❌ Not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
      console.log('✅ Auth check complete');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Signing in...');
      const response = await authService.login({ email, password });
      console.log('✅ Login successful');
      setUser(response.user);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('📝 Signing up...');
      const response = await authService.register({ email, password, name });
      console.log('✅ Registration successful');
      setUser(response.user);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...');
      await authService.logout();
      setUser(null);
      router.replace('/(auth)/login');
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setUser(null);
      router.replace('/(auth)/login');
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}