/**
 * Authentication Hook
 *
 * Provides authentication state and methods to components
 */

import { useCallback, useEffect, useState } from 'react';
import * as authService from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  /**
   * Login with credentials
   */
  const login = useCallback(async (email, password, rememberMe = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await authService.login(email, password, rememberMe);
      setUser(data.user);
      setError(null);
      return data;
    } catch (err) {
      const errorMessage = err.message;
      setError(errorMessage);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const refreshToken = authService.getRefreshToken();
      await authService.logout(refreshToken);
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh access token
   */
  const refreshToken = useCallback(async () => {
    const currentRefreshToken = authService.getRefreshToken();
    if (!currentRefreshToken) {
      const error = new Error('No refresh token available');
      setError(error.message);
      throw error;
    }

    try {
      await authService.refreshAccessToken(currentRefreshToken);
      setError(null);
    } catch (err) {
      // If refresh fails, logout user
      const errorMessage = err.message;
      setError(errorMessage);
      setUser(null);
      throw err;
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    refreshToken,
  };
}
