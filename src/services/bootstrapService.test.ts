/**
 * Bootstrap Service Tests
 */

import type { BootstrapResponse } from '@/types/bootstrap.types';
import {
  clearBootstrapCache,
  fetchBootstrap,
  getFilteredMenu,
  hasPermission,
  isFeatureEnabled,
} from './bootstrapService';
import * as httpClient from './httpClient';

// Mock httpClient
jest.mock('./httpClient');

describe('bootstrapService', () => {
  const mockBootstrapResponse: BootstrapResponse = {
    user: {
      id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://example.com/avatar.jpg',
      roles: ['admin', 'user'],
    },
    permissions: ['dashboard.view', 'users.edit', 'reports.view', 'users.view'],
    tenant: {
      id: 'tenant456',
      name: 'Acme Corp',
      brandingVersion: '1.2.0',
    },
    menu: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'home',
        route: '/dashboard',
        order: 1,
      },
      {
        id: 'users',
        label: 'Users',
        icon: 'users',
        route: '/users',
        order: 2,
        permission: 'users.view',
      },
      {
        id: 'admin',
        label: 'Admin',
        icon: 'settings',
        route: '/admin',
        order: 3,
        permission: 'admin.access',
      },
    ],
    defaults: {
      homePage: '/dashboard',
      theme: 'light',
    },
    featureFlags: {
      newDashboard: true,
      betaFeatures: false,
    },
  };

  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();

    // Clear session storage
    sessionStorage.clear();

    // Mock console.warn to avoid noise in tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchBootstrap', () => {
    it('should fetch and return bootstrap data successfully', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBootstrapResponse);

      const result = await fetchBootstrap();

      expect(result).toEqual(mockBootstrapResponse);
      expect(httpClient.get).toHaveBeenCalledWith('/ui/bootstrap');
    });

    it('should cache bootstrap data in sessionStorage', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBootstrapResponse);

      await fetchBootstrap();

      const cached = sessionStorage.getItem('bootstrap_data');
      expect(cached).toBeTruthy();
      expect(JSON.parse(cached!)).toEqual(mockBootstrapResponse);

      const expiry = sessionStorage.getItem('bootstrap_data_expiry');
      expect(expiry).toBeTruthy();
    });

    it('should return cached data when available and valid', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBootstrapResponse);

      // First call to cache data
      await fetchBootstrap();
      expect(httpClient.get).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result = await fetchBootstrap();
      expect(result).toEqual(mockBootstrapResponse);
      expect(httpClient.get).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should bypass cache when useCache is false', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBootstrapResponse);

      // First call with cache
      await fetchBootstrap(true);
      expect(httpClient.get).toHaveBeenCalledTimes(1);

      // Second call bypassing cache
      await fetchBootstrap(false);
      expect(httpClient.get).toHaveBeenCalledTimes(2);
    });

    it('should fetch new data when cache is expired', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBootstrapResponse);

      // First call to cache data
      await fetchBootstrap();

      // Manually expire the cache
      const expiredTime = (Date.now() - 1000).toString();
      sessionStorage.setItem('bootstrap_data_expiry', expiredTime);

      // Second call should fetch new data
      await fetchBootstrap();
      expect(httpClient.get).toHaveBeenCalledTimes(2);
    });

    it('should retry on network errors', async () => {
      (httpClient.get as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockBootstrapResponse);

      const result = await fetchBootstrap(false);

      expect(result).toEqual(mockBootstrapResponse);
      expect(httpClient.get).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      (httpClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(fetchBootstrap(false)).rejects.toThrow(
        /Failed to fetch bootstrap data after 3 attempts/
      );
      expect(httpClient.get).toHaveBeenCalledTimes(3);
    });

    it('should not retry on authentication errors', async () => {
      const authError = new Error('401 Unauthorized');
      (httpClient.get as jest.Mock).mockRejectedValue(authError);

      await expect(fetchBootstrap(false)).rejects.toThrow(/Authentication failed/);
      expect(httpClient.get).toHaveBeenCalledTimes(1); // No retries
    });

    it('should throw error for invalid response structure', async () => {
      const invalidResponse = {
        user: { id: 'user123' }, // Missing required fields
        permissions: [],
      };
      (httpClient.get as jest.Mock).mockResolvedValue(invalidResponse);

      await expect(fetchBootstrap(false)).rejects.toThrow(/Invalid bootstrap response structure/);
    });

    it('should validate all required fields in bootstrap response', async () => {
      const incompleteResponse = {
        ...mockBootstrapResponse,
        defaults: undefined, // Missing required field
      };
      (httpClient.get as jest.Mock).mockResolvedValue(incompleteResponse);

      await expect(fetchBootstrap(false)).rejects.toThrow(/Invalid bootstrap response structure/);
    });

    it('should handle cache retrieval errors gracefully', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBootstrapResponse);

      // Mock sessionStorage.getItem to throw
      const originalGetItem = sessionStorage.getItem;
      sessionStorage.getItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should still fetch from API
      const result = await fetchBootstrap();
      expect(result).toEqual(mockBootstrapResponse);

      // Restore
      sessionStorage.getItem = originalGetItem;
    });

    it('should handle cache storage errors gracefully', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBootstrapResponse);

      // Mock sessionStorage.setItem to throw
      const originalSetItem = sessionStorage.setItem;
      sessionStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should still return data even if caching fails (doesn't throw)
      const result = await fetchBootstrap(false);
      expect(result).toEqual(mockBootstrapResponse);

      // Restore
      sessionStorage.setItem = originalSetItem;
    });
  });

  describe('clearBootstrapCache', () => {
    it('should clear cached bootstrap data', () => {
      sessionStorage.setItem('bootstrap_data', 'test');
      sessionStorage.setItem('bootstrap_data_expiry', '12345');

      clearBootstrapCache();

      expect(sessionStorage.getItem('bootstrap_data')).toBeNull();
      expect(sessionStorage.getItem('bootstrap_data_expiry')).toBeNull();
    });

    it('should handle cache clear errors gracefully', () => {
      const originalRemoveItem = sessionStorage.removeItem;
      sessionStorage.removeItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw even if storage operations fail
      expect(() => clearBootstrapCache()).not.toThrow();

      // Restore
      sessionStorage.removeItem = originalRemoveItem;
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has permission', () => {
      const result = hasPermission(mockBootstrapResponse, 'dashboard.view');
      expect(result).toBe(true);
    });

    it('should return false when user does not have permission', () => {
      const result = hasPermission(mockBootstrapResponse, 'admin.delete');
      expect(result).toBe(false);
    });

    it('should return false when bootstrap is null', () => {
      const result = hasPermission(null, 'dashboard.view');
      expect(result).toBe(false);
    });

    it('should return false when permissions array is missing', () => {
      const bootstrap = { ...mockBootstrapResponse, permissions: undefined };
      const result = hasPermission(bootstrap as any, 'dashboard.view');
      expect(result).toBe(false);
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return true when feature flag is enabled', () => {
      const result = isFeatureEnabled(mockBootstrapResponse, 'newDashboard');
      expect(result).toBe(true);
    });

    it('should return false when feature flag is disabled', () => {
      const result = isFeatureEnabled(mockBootstrapResponse, 'betaFeatures');
      expect(result).toBe(false);
    });

    it('should return false when feature flag does not exist', () => {
      const result = isFeatureEnabled(mockBootstrapResponse, 'nonExistent');
      expect(result).toBe(false);
    });

    it('should return false when bootstrap is null', () => {
      const result = isFeatureEnabled(null, 'newDashboard');
      expect(result).toBe(false);
    });

    it('should return false when featureFlags object is missing', () => {
      const bootstrap = { ...mockBootstrapResponse, featureFlags: undefined };
      const result = isFeatureEnabled(bootstrap as any, 'newDashboard');
      expect(result).toBe(false);
    });
  });

  describe('getFilteredMenu', () => {
    it('should return all menu items when no permissions required', () => {
      const bootstrap = {
        ...mockBootstrapResponse,
        menu: [
          {
            id: 'dashboard',
            label: 'Dashboard',
            route: '/dashboard',
            order: 1,
          },
          { id: 'profile', label: 'Profile', route: '/profile', order: 2 },
        ],
      };

      const result = getFilteredMenu(bootstrap);
      expect(result).toHaveLength(2);
    });

    it('should filter menu items based on permissions', () => {
      const result = getFilteredMenu(mockBootstrapResponse);

      // Should include dashboard (no permission) and users (has permission)
      // Should exclude admin (no permission)
      expect(result).toHaveLength(2);
      expect(result.map(item => item.id)).toEqual(['dashboard', 'users']);
    });

    it('should return empty array when bootstrap is null', () => {
      const result = getFilteredMenu(null);
      expect(result).toEqual([]);
    });

    it('should return empty array when menu is missing', () => {
      const bootstrap = { ...mockBootstrapResponse, menu: undefined };
      const result = getFilteredMenu(bootstrap as any);
      expect(result).toEqual([]);
    });

    it('should include items without permission requirements', () => {
      const bootstrap = {
        ...mockBootstrapResponse,
        permissions: [],
        menu: [
          {
            id: 'public',
            label: 'Public',
            route: '/public',
            order: 1,
          },
          {
            id: 'restricted',
            label: 'Restricted',
            route: '/restricted',
            order: 2,
            permission: 'admin.access',
          },
        ],
      };

      const result = getFilteredMenu(bootstrap);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('public');
    });
  });
});
