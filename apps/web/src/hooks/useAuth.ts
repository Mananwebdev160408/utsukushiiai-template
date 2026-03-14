'use client';

import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api/client';
import type { LoginRequest, RegisterRequest } from '@/types';

/**
 * Custom hook for authentication actions.
 * Wraps the auth store with API calls and loading/error state management.
 */
export function useAuth() {
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    login: storeLogin,
    logout: storeLogout,
    setLoading,
    setError,
  } = useAuthStore();

  const login = useCallback(async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.auth.login(credentials);
      if (response.success && response.data) {
        storeLogin(response.data.user, {
          accessToken: response.data.accessToken || response.data.token,
          refreshToken: response.data.refreshToken || response.data.token,
        });
        return true;
      }
      setError('Login failed');
      return false;
    } catch (err: any) {
      setError(err?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [storeLogin, setLoading, setError]);

  const register = useCallback(async (userData: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.auth.register(userData);
      if (response.success && response.data) {
        storeLogin(response.data.user, {
          accessToken: response.data.accessToken || response.data.token,
          refreshToken: response.data.refreshToken || response.data.token,
        });
        return true;
      }
      setError('Registration failed');
      return false;
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [storeLogin, setLoading, setError]);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      storeLogout();
    }
  }, [storeLogout]);

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
  };
}
