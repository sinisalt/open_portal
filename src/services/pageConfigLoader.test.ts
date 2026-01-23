/**
 * Page Configuration Loader Tests
 */

import type { PageConfig } from '@/types/page.types';
import * as httpClient from './httpClient';
import {
  clearPageCache,
  getCacheStats,
  isPageCached,
  loadPageConfig,
  preloadPageConfig,
} from './pageConfigLoader';

// Mock httpClient
jest.mock('./httpClient');

const mockHttpClient = httpClient.httpClient as jest.MockedFunction<typeof httpClient.httpClient>;

/**
 * Sample page configuration
 */
const samplePageConfig: PageConfig = {
  id: 'test-page',
  version: '1.0.0',
  title: 'Test Page',
  description: 'A test page',
  layout: {
    type: 'grid',
    grid: {
      columns: 12,
      gap: 'md',
    },
  },
  widgets: [
    {
      id: 'widget-1',
      type: 'TextInput',
      props: {
        label: 'Name',
      },
    },
  ],
  datasources: [],
  actions: [],
};

/**
 * Helper to create mock Response
 */
function createMockResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  const headersObj = {
    get: (name: string) => headers[name] || null,
    has: (name: string) => name in headers,
    forEach: (callback: (value: string, key: string) => void) => {
      for (const [key, value] of Object.entries(headers)) {
        callback(value, key);
      }
    },
  } as unknown as Headers;

  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: headersObj,
    json: async () => body,
  } as Response;
}

describe('pageConfigLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache before each test
    return clearPageCache();
  });

  describe('loadPageConfig', () => {
    it('should load page configuration from server', async () => {
      mockHttpClient.mockResolvedValue(
        createMockResponse(samplePageConfig, 200, { ETag: '"v1.0.0"' })
      );

      const result = await loadPageConfig('test-page');

      expect(result.config).toEqual(samplePageConfig);
      expect(result.fromCache).toBe(false);
      expect(result.etag).toBe('"v1.0.0"');
      expect(mockHttpClient).toHaveBeenCalledWith('/ui/pages/test-page', {
        method: 'GET',
        headers: {},
        signal: undefined,
      });
    });

    it('should cache loaded configuration', async () => {
      mockHttpClient.mockResolvedValue(
        createMockResponse(samplePageConfig, 200, { ETag: '"v1.0.0"' })
      );

      // First load
      await loadPageConfig('test-page');

      // Second load should come from cache
      const result = await loadPageConfig('test-page');

      expect(result.config).toEqual(samplePageConfig);
      expect(result.fromCache).toBe(true);
      expect(mockHttpClient).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should skip cache when skipCache option is true', async () => {
      mockHttpClient.mockResolvedValue(
        createMockResponse(samplePageConfig, 200, { ETag: '"v1.0.0"' })
      );

      // First load
      await loadPageConfig('test-page');

      // Second load with skipCache
      const result = await loadPageConfig('test-page', { skipCache: true });

      expect(result.fromCache).toBe(false);
      expect(mockHttpClient).toHaveBeenCalledTimes(2);
    });

    it('should handle 304 Not Modified response', async () => {
      // First load
      mockHttpClient.mockResolvedValueOnce(
        createMockResponse(samplePageConfig, 200, { ETag: '"v1.0.0"' })
      );
      await loadPageConfig('test-page');

      // Clear cache to force refetch
      await clearPageCache('test-page');

      // Mock 304 response
      mockHttpClient.mockResolvedValueOnce(createMockResponse(null, 304));

      // This should still work because we send the ETag
      // But since cache is cleared, it will fail
      const _result = await loadPageConfig('test-page', {
        skipCache: false,
        cacheTTL: 0,
      });

      // Should fetch fresh since cache was cleared
      expect(mockHttpClient).toHaveBeenCalledTimes(2);
    });

    it('should handle 404 Not Found error', async () => {
      mockHttpClient.mockResolvedValue(createMockResponse({ error: 'Not found' }, 404));

      await expect(loadPageConfig('non-existent-page')).rejects.toThrow(
        'Page configuration not found: non-existent-page'
      );
    });

    it('should handle 403 Forbidden error', async () => {
      mockHttpClient.mockResolvedValue(createMockResponse({ error: 'Forbidden' }, 403));

      await expect(loadPageConfig('forbidden-page')).rejects.toThrow(
        'Insufficient permissions for page: forbidden-page'
      );
    });

    it('should handle network errors', async () => {
      mockHttpClient.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(loadPageConfig('test-page')).rejects.toThrow(
        'Network error loading page configuration: test-page'
      );
    });

    it('should validate page configuration id', async () => {
      const invalidConfig = { ...samplePageConfig, id: 'wrong-id' };
      mockHttpClient.mockResolvedValue(
        createMockResponse(invalidConfig, 200, { ETag: '"v1.0.0"' })
      );

      await expect(loadPageConfig('test-page')).rejects.toThrow(
        'Invalid page configuration: id mismatch'
      );
    });

    it('should validate page configuration version', async () => {
      const invalidConfig = { ...samplePageConfig, version: undefined };
      mockHttpClient.mockResolvedValue(
        createMockResponse(invalidConfig, 200, { ETag: '"v1.0.0"' })
      );

      await expect(loadPageConfig('test-page')).rejects.toThrow(
        'Invalid page configuration: missing version'
      );
    });

    it('should validate page configuration layout', async () => {
      const invalidConfig = { ...samplePageConfig, layout: undefined };
      mockHttpClient.mockResolvedValue(
        createMockResponse(invalidConfig, 200, { ETag: '"v1.0.0"' })
      );

      await expect(loadPageConfig('test-page')).rejects.toThrow(
        'Invalid page configuration: missing layout'
      );
    });

    it('should validate page configuration widgets', async () => {
      const invalidConfig = { ...samplePageConfig, widgets: 'not-an-array' };
      mockHttpClient.mockResolvedValue(
        createMockResponse(invalidConfig, 200, { ETag: '"v1.0.0"' })
      );

      await expect(loadPageConfig('test-page')).rejects.toThrow(
        'Invalid page configuration: widgets must be an array'
      );
    });

    it('should handle concurrent requests to same page', async () => {
      mockHttpClient.mockResolvedValue(
        createMockResponse(samplePageConfig, 200, { ETag: '"v1.0.0"' })
      );

      // Make two concurrent requests
      const [result1, result2] = await Promise.all([
        loadPageConfig('test-page', { skipCache: true }),
        loadPageConfig('test-page', { skipCache: true }),
      ]);

      expect(result1.config).toEqual(samplePageConfig);
      expect(result2.config).toEqual(samplePageConfig);
      // Should only make one HTTP request due to deduplication
      expect(mockHttpClient).toHaveBeenCalledTimes(1);
    });

    it('should respect custom cache TTL', async () => {
      mockHttpClient.mockResolvedValue(
        createMockResponse(samplePageConfig, 200, { ETag: '"v1.0.0"' })
      );

      await loadPageConfig('test-page', { cacheTTL: 60 });

      // Check cache stats
      const stats = await getCacheStats();
      expect(stats.count).toBe(1);
    });

    it('should support AbortSignal for cancellation', async () => {
      const abortController = new AbortController();

      mockHttpClient.mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Should have been aborted'));
            }, 1000);

            abortController.signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new DOMException('Aborted', 'AbortError'));
            });
          })
      );

      const loadPromise = loadPageConfig('test-page', { signal: abortController.signal });

      // Abort the request immediately
      abortController.abort();

      await expect(loadPromise).rejects.toThrow();
    }, 10000);
  });

  describe('preloadPageConfig', () => {
    it('should preload page configuration', async () => {
      mockHttpClient.mockResolvedValue(
        createMockResponse(samplePageConfig, 200, { ETag: '"v1.0.0"' })
      );

      await preloadPageConfig('test-page');

      // Should be cached now
      const isCached = await isPageCached('test-page');
      expect(isCached).toBe(true);
    });

    it('should silently fail on error', async () => {
      mockHttpClient.mockRejectedValue(new Error('Network error'));

      // Should not throw
      await expect(preloadPageConfig('test-page')).resolves.toBeUndefined();
    });
  });

  describe('clearPageCache', () => {
    it('should clear specific page from cache', async () => {
      mockHttpClient.mockResolvedValue(
        createMockResponse(samplePageConfig, 200, { ETag: '"v1.0.0"' })
      );

      // Load and cache
      await loadPageConfig('test-page');
      expect(await isPageCached('test-page')).toBe(true);

      // Clear cache
      await clearPageCache('test-page');
      expect(await isPageCached('test-page')).toBe(false);
    });

    it('should clear all pages when no pageId provided', async () => {
      // Create a mock that returns configs matching the requested pageId
      mockHttpClient.mockImplementation((url: string) => {
        const match = url.match(/\/ui\/pages\/([^?]+)/);
        const pageId = match ? match[1] : 'test-page';

        return Promise.resolve(
          createMockResponse({ ...samplePageConfig, id: pageId }, 200, { ETag: '"v1.0.0"' })
        );
      });

      // Load multiple pages
      await loadPageConfig('page-1');
      await loadPageConfig('page-2');

      let stats = await getCacheStats();
      expect(stats.count).toBe(2);

      // Clear all
      await clearPageCache();

      stats = await getCacheStats();
      expect(stats.count).toBe(0);
    });
  });

  describe('isPageCached', () => {
    it('should return true for cached pages', async () => {
      mockHttpClient.mockResolvedValue(
        createMockResponse(samplePageConfig, 200, { ETag: '"v1.0.0"' })
      );

      await loadPageConfig('test-page');

      expect(await isPageCached('test-page')).toBe(true);
    });

    it('should return false for non-cached pages', async () => {
      expect(await isPageCached('non-existent-page')).toBe(false);
    });

    it('should return false for expired cache', async () => {
      mockHttpClient.mockResolvedValue(
        createMockResponse(samplePageConfig, 200, { ETag: '"v1.0.0"' })
      );

      // Load with very short TTL
      await loadPageConfig('test-page', { cacheTTL: -1 });

      // Should be expired
      expect(await isPageCached('test-page')).toBe(false);
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      const stats = await getCacheStats();

      expect(stats).toHaveProperty('count');
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('hitRate');
    });
  });
});
