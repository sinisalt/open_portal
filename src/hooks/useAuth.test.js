/**
 * useAuth Hook Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import * as authService from '../services/authService';

// Mock the authService
jest.mock('../services/authService');

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with user from storage', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      authService.getCurrentUser.mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should initialize with null user when not authenticated', async () => {
      authService.getCurrentUser.mockReturnValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      authService.getCurrentUser.mockReturnValue(null);
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      const mockResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
        user: mockUser,
      };
      authService.login.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123', false);
      });

      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123', false);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(loginResult).toEqual(mockResponse);
    });

    it('should handle login error', async () => {
      authService.getCurrentUser.mockReturnValue(null);
      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let thrownError;
      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrong-password', false);
        } catch (err) {
          thrownError = err;
        }
      });

      expect(thrownError).toBeDefined();
      expect(thrownError.message).toBe('Invalid credentials');
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      authService.getCurrentUser.mockReturnValue(mockUser);
      authService.getRefreshToken.mockReturnValue('refresh-token');
      authService.logout.mockResolvedValue();

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(authService.logout).toHaveBeenCalledWith('refresh-token');
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      authService.getCurrentUser.mockReturnValue({ id: '1' });
      authService.getRefreshToken.mockReturnValue('refresh-token');
      authService.refreshAccessToken.mockResolvedValue({
        accessToken: 'new-token',
        expiresIn: 3600,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshToken();
      });

      expect(authService.refreshAccessToken).toHaveBeenCalledWith('refresh-token');
    });

    it('should logout user when refresh fails', async () => {
      authService.getCurrentUser.mockReturnValue({ id: '1' });
      authService.getRefreshToken.mockReturnValue('refresh-token');
      authService.refreshAccessToken.mockRejectedValue(new Error('Refresh failed'));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let thrownError;
      await act(async () => {
        try {
          await result.current.refreshToken();
        } catch (err) {
          thrownError = err;
        }
      });

      expect(thrownError).toBeDefined();
      expect(thrownError.message).toBe('Refresh failed');
      expect(result.current.user).toBeNull();
    });

    it('should throw error when no refresh token available', async () => {
      authService.getCurrentUser.mockReturnValue({ id: '1' });
      authService.getRefreshToken.mockReturnValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.refreshToken();
        })
      ).rejects.toThrow('No refresh token available');
    });
  });
});
