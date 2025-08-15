'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { User, LoginCredentials, RegisterData } from '@/types';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = Cookies.get('auth_token');
    const userData = Cookies.get('user_data');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        Cookies.remove('auth_token');
        Cookies.remove('user_data');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      console.log('Attempting login with:', credentials);
      const response = await authAPI.login(credentials);
      console.log('Login response:', response.data);

      const { user: userData, token } = response.data;

      // Store auth data
      Cookies.set('auth_token', token, { expires: 7 }); // 7 days
      Cookies.set('user_data', JSON.stringify(userData), { expires: 7 });

      setUser(userData);
      toast.success('Đăng nhập thành công!');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      toast.error(message);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      console.log('Attempting register with:', data);
      const response = await authAPI.register(data);
      console.log('Register response:', response.data);

      const { user: userData, token } = response.data;

      // Store auth data
      Cookies.set('auth_token', token, { expires: 7 });
      Cookies.set('user_data', JSON.stringify(userData), { expires: 7 });

      setUser(userData);
      toast.success('Đăng ký thành công!');
      return true;
    } catch (error: any) {
      console.error('Register error:', error);
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      toast.error(message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      // Clear auth data
      Cookies.remove('auth_token');
      Cookies.remove('user_data');
      setUser(null);
      toast.success('Đã đăng xuất');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getUser();
      const userData = response.data.data || response.data;
      console.log('Refreshed user data:', userData);

      setUser(userData);
      Cookies.set('user_data', JSON.stringify(userData), { expires: 7 });
    } catch (error) {
      console.error('Error refreshing user:', error);
      logout();
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
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
