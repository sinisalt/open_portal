/**
 * Branding Service Tests
 */

import type { BrandingResponse } from '@/types/branding.types';
import {
  clearBrandingCache,
  fetchBranding,
  getCachedBrandingVersion,
  needsBrandingRefresh,
} from './brandingService';
import * as httpClient from './httpClient';

// Mock httpClient
jest.mock('./httpClient');

describe('brandingService', () => {
  const mockBrandingResponse: BrandingResponse = {
    tenantId: 'tenant456',
    version: '1.2.0',
    lastUpdated: '2026-01-15T10:30:00Z',
    branding: {
      logos: {
        primary: {
          url: 'https://cdn.example.com/tenants/acme/logo-primary.svg',
          altText: 'Acme Corporation',
          width: 180,
          height: 50,
        },
        login: {
          url: 'https://cdn.example.com/tenants/acme/logo-login.svg',
          altText: 'Acme Corporation',
          width: 300,
          height: 100,
        },
        favicon: {
          url: 'https://cdn.example.com/tenants/acme/favicon.ico',
        },
      },
      colors: {
        primary: {
          50: '#e3f2fd',
          500: '#2196f3',
          900: '#0d47a1',
        },
        secondary: {
          50: '#fce4ec',
          500: '#e91e63',
          900: '#880e4f',
        },
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3',
        background: {
          default: '#ffffff',
          paper: '#f5f5f5',
        },
        text: {
          primary: '#212121',
          secondary: '#757575',
        },
      },
      typography: {
        fontFamily: {
          primary: "'Roboto', sans-serif",
          secondary: "'Open Sans', sans-serif",
        },
        googleFonts: [
          {
            name: 'Roboto',
            weights: [300, 400, 500, 700],
          },
        ],
        sizes: {
          h1: '2.5rem',
          body1: '1rem',
        },
      },
      spacing: {
        unit: 8,
        scale: [0, 4, 8, 16, 24, 32],
      },
      borderRadius: {
        small: '4px',
        medium: '8px',
        large: '16px',
      },
    },
  };

  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();

    // Clear localStorage
    localStorage.clear();

    // Mock console.warn to avoid noise in tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchBranding', () => {
    it('should fetch and return branding data successfully', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBrandingResponse);

      const result = await fetchBranding('tenant456');

      expect(result).toEqual(mockBrandingResponse);
      expect(httpClient.get).toHaveBeenCalledWith('/ui/branding?tenantId=tenant456');
    });

    it('should cache branding data in localStorage', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBrandingResponse);

      await fetchBranding('tenant456');

      const cached = localStorage.getItem('branding_data');
      expect(cached).toBeTruthy();

      const cachedData = JSON.parse(cached!);
      expect(cachedData.data).toEqual(mockBrandingResponse);
      expect(cachedData.version).toBe('1.2.0');
      expect(cachedData.timestamp).toBeDefined();
    });

    it('should return cached data when available and valid', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBrandingResponse);

      // First call to cache data
      await fetchBranding('tenant456');
      expect(httpClient.get).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result = await fetchBranding('tenant456');
      expect(result).toEqual(mockBrandingResponse);
      expect(httpClient.get).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should bypass cache when useCache is false', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBrandingResponse);

      // First call with cache
      await fetchBranding('tenant456', undefined, true);
      expect(httpClient.get).toHaveBeenCalledTimes(1);

      // Second call bypassing cache
      await fetchBranding('tenant456', undefined, false);
      expect(httpClient.get).toHaveBeenCalledTimes(2);
    });

    it('should invalidate cache when expected version does not match', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBrandingResponse);

      // First call to cache version 1.2.0
      await fetchBranding('tenant456');
      expect(httpClient.get).toHaveBeenCalledTimes(1);

      // Update mock to return new version
      const updatedResponse = { ...mockBrandingResponse, version: '2.0.0' };
      (httpClient.get as jest.Mock).mockResolvedValue(updatedResponse);

      // Second call with different expected version should fetch new data
      const result = await fetchBranding('tenant456', '2.0.0');
      expect(result.version).toBe('2.0.0');
      expect(httpClient.get).toHaveBeenCalledTimes(2);
    });

    it('should fetch new data when cache is expired', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBrandingResponse);

      // First call to cache data
      await fetchBranding('tenant456');

      // Manually set expired timestamp
      const cached = localStorage.getItem('branding_data');
      const cachedData = JSON.parse(cached!);
      cachedData.timestamp = Date.now() - 61 * 60 * 1000; // 61 minutes ago (expired)
      localStorage.setItem('branding_data', JSON.stringify(cachedData));

      // Second call should fetch new data
      await fetchBranding('tenant456');
      expect(httpClient.get).toHaveBeenCalledTimes(2);
    });

    it('should retry on network errors', async () => {
      (httpClient.get as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockBrandingResponse);

      const result = await fetchBranding('tenant456', undefined, false);

      expect(result).toEqual(mockBrandingResponse);
      expect(httpClient.get).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      (httpClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(fetchBranding('tenant456', undefined, false)).rejects.toThrow(
        /Failed to fetch branding data after 3 attempts/
      );
      expect(httpClient.get).toHaveBeenCalledTimes(3);
    });

    it('should not retry on authentication errors', async () => {
      const authError = new Error('401 Unauthorized');
      (httpClient.get as jest.Mock).mockRejectedValue(authError);

      await expect(fetchBranding('tenant456', undefined, false)).rejects.toThrow(
        /Authentication failed/
      );
      expect(httpClient.get).toHaveBeenCalledTimes(1); // No retries
    });

    it('should not retry on tenant not found errors', async () => {
      const notFoundError = new Error('404 Not Found');
      (httpClient.get as jest.Mock).mockRejectedValue(notFoundError);

      await expect(fetchBranding('tenant456', undefined, false)).rejects.toThrow(
        /Tenant branding not found/
      );
      expect(httpClient.get).toHaveBeenCalledTimes(1); // No retries
    });

    it('should throw error for invalid response structure', async () => {
      const invalidResponse = {
        tenantId: 'tenant456',
        version: '1.0.0',
        branding: {
          logos: {}, // Invalid - missing required fields
        },
      };
      (httpClient.get as jest.Mock).mockResolvedValue(invalidResponse);

      await expect(fetchBranding('tenant456', undefined, false)).rejects.toThrow(
        /Invalid branding response structure/
      );
    });

    it('should validate all required fields in branding response', async () => {
      const incompleteResponse = {
        ...mockBrandingResponse,
        branding: {
          ...mockBrandingResponse.branding,
          typography: undefined, // Missing required field
        },
      };
      (httpClient.get as jest.Mock).mockResolvedValue(incompleteResponse);

      await expect(fetchBranding('tenant456', undefined, false)).rejects.toThrow(
        /Invalid branding response structure/
      );
    });

    it('should handle cache retrieval errors gracefully', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBrandingResponse);

      // Mock localStorage.getItem to throw
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should still fetch from API
      const result = await fetchBranding('tenant456');
      expect(result).toEqual(mockBrandingResponse);

      // Restore
      localStorage.getItem = originalGetItem;
    });

    it('should handle cache storage errors gracefully', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBrandingResponse);

      // Mock localStorage.setItem to throw
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should still return data even if caching fails (doesn't throw)
      const result = await fetchBranding('tenant456', undefined, false);
      expect(result).toEqual(mockBrandingResponse);

      // Restore
      localStorage.setItem = originalSetItem;
    });

    it('should properly encode tenant ID in query parameter', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBrandingResponse);

      await fetchBranding('tenant with spaces');

      expect(httpClient.get).toHaveBeenCalledWith('/ui/branding?tenantId=tenant%20with%20spaces');
    });
  });

  describe('clearBrandingCache', () => {
    it('should clear cached branding data', () => {
      localStorage.setItem('branding_data', 'test');

      clearBrandingCache();

      expect(localStorage.getItem('branding_data')).toBeNull();
    });

    it('should handle cache clear errors gracefully', () => {
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw even if storage operations fail
      expect(() => clearBrandingCache()).not.toThrow();

      // Restore
      localStorage.removeItem = originalRemoveItem;
    });
  });

  describe('getCachedBrandingVersion', () => {
    it('should return cached version when available', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBrandingResponse);

      await fetchBranding('tenant456');

      const version = getCachedBrandingVersion();
      expect(version).toBe('1.2.0');
    });

    it('should return null when cache is empty', () => {
      const version = getCachedBrandingVersion();
      expect(version).toBeNull();
    });

    it('should return null on cache retrieval errors', () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      const version = getCachedBrandingVersion();
      expect(version).toBeNull();

      // Restore
      localStorage.getItem = originalGetItem;
    });
  });

  describe('needsBrandingRefresh', () => {
    it('should return true when cached version does not match bootstrap version', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBrandingResponse);

      await fetchBranding('tenant456');

      const needsRefresh = needsBrandingRefresh('2.0.0');
      expect(needsRefresh).toBe(true);
    });

    it('should return false when cached version matches bootstrap version', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue(mockBrandingResponse);

      await fetchBranding('tenant456');

      const needsRefresh = needsBrandingRefresh('1.2.0');
      expect(needsRefresh).toBe(false);
    });

    it('should return true when cache is empty', () => {
      const needsRefresh = needsBrandingRefresh('1.2.0');
      expect(needsRefresh).toBe(true);
    });
  });
});
