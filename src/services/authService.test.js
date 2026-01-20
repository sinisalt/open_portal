/**
 * Authentication Service Tests
 */

import * as authService from './authService';

// Mock fetch
global.fetch = jest.fn();

describe('authService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('login', () => {
    it('should login successfully and store tokens', async () => {
      const mockResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authService.login('test@example.com', 'password123', false);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      );

      expect(result).toEqual(mockResponse);
      expect(sessionStorage.getItem('accessToken')).toBe('mock-access-token');
      expect(sessionStorage.getItem('refreshToken')).toBe('mock-refresh-token');
    });

    it('should store tokens in localStorage when rememberMe is true', async () => {
      const mockResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await authService.login('test@example.com', 'password123', true);

      expect(localStorage.getItem('accessToken')).toBe('mock-access-token');
      expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token');
    });

    it('should throw error on failed login', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      });

      await expect(authService.login('test@example.com', 'wrong-password', false)).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('logout', () => {
    it('should clear all tokens from storage', async () => {
      localStorage.setItem('accessToken', 'token1');
      localStorage.setItem('refreshToken', 'token2');
      sessionStorage.setItem('accessToken', 'token3');

      fetch.mockResolvedValueOnce({ ok: true });

      await authService.logout('token2');

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(sessionStorage.getItem('accessToken')).toBeNull();
    });

    it('should clear storage even if API call fails', async () => {
      localStorage.setItem('accessToken', 'token1');
      localStorage.setItem('refreshToken', 'token2');
      sessionStorage.setItem('accessToken', 'token3');

      // Mock fetch to return error response (not reject)
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });

      // Should not throw - should resolve normally
      await authService.logout('token2');

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(sessionStorage.getItem('accessToken')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when access token exists', () => {
      localStorage.setItem('accessToken', 'token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false when no access token exists', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user object when user is stored', () => {
      const user = { id: '1', email: 'test@example.com', name: 'Test User' };
      localStorage.setItem('user', JSON.stringify(user));

      expect(authService.getCurrentUser()).toEqual(user);
    });

    it('should return null when no user is stored', () => {
      expect(authService.getCurrentUser()).toBeNull();
    });

    it('should return null when user data is invalid JSON', () => {
      localStorage.setItem('user', 'invalid-json');
      expect(authService.getCurrentUser()).toBeNull();
    });
  });

  describe('getOAuthProviders', () => {
    it('should fetch and return OAuth providers', async () => {
      const mockProviders = [
        {
          id: 'google',
          name: 'Google',
          authUrl: 'https://google.com/oauth',
          clientId: 'client-id',
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ providers: mockProviders }),
      });

      const result = await authService.getOAuthProviders();

      expect(result).toEqual(mockProviders);
    });

    it('should throw error when fetch fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(authService.getOAuthProviders()).rejects.toThrow(
        'Failed to fetch OAuth providers'
      );
    });
  });
});
