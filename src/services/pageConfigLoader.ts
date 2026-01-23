/**
 * Page Configuration Loader Service
 *
 * Service for loading page configurations with:
 * - ETag-based caching
 * - Cache management (IndexedDB)
 * - Stale-while-revalidate strategy
 * - Error handling and retry logic
 * - Configuration validation
 */

import { env } from '@/config/env';
import {
  type CachedPageConfig,
  type PageConfig,
  PageLoadError,
  PageLoadErrorType,
  type PageLoaderOptions,
  type PageLoaderResult,
} from '@/types/page.types';
import { httpClient } from './httpClient';

/**
 * Environment flag for development mode (no caching)
 */
const isDevelopment = env.MODE === 'development';

/**
 * Default cache TTL in seconds (1 hour)
 */
const DEFAULT_CACHE_TTL = 3600;

/**
 * Request tracking for concurrent requests to same page
 */
const activeRequests = new Map<string, Promise<PageLoaderResult>>();

/**
 * Load page configuration from server
 */
async function fetchPageConfig(
  pageId: string,
  etag?: string,
  options: PageLoaderOptions = {}
): Promise<{ config?: PageConfig; etag?: string; notModified: boolean }> {
  try {
    const headers: HeadersInit = {};

    // Add If-None-Match header if we have an ETag
    if (etag) {
      headers['If-None-Match'] = etag;
    }

    const response = await httpClient(`/ui/pages/${pageId}`, {
      method: 'GET',
      headers,
      signal: options.signal,
    });

    // Handle 304 Not Modified
    if (response.status === 304) {
      return { notModified: true };
    }

    // Handle error responses
    if (!response.ok) {
      if (response.status === 404) {
        throw new PageLoadError(
          `Page configuration not found: ${pageId}`,
          PageLoadErrorType.NOT_FOUND,
          pageId
        );
      }

      if (response.status === 403) {
        throw new PageLoadError(
          `Insufficient permissions for page: ${pageId}`,
          PageLoadErrorType.FORBIDDEN,
          pageId
        );
      }

      // Other errors
      throw new PageLoadError(
        `Failed to load page configuration: ${response.statusText}`,
        PageLoadErrorType.NETWORK_ERROR,
        pageId
      );
    }

    // Parse response
    const config = (await response.json()) as PageConfig;

    // Get ETag from response headers
    const responseEtag = response.headers.get('ETag') || undefined;

    // Validate configuration
    validatePageConfig(config, pageId);

    return {
      config,
      etag: responseEtag,
      notModified: false,
    };
  } catch (error) {
    // Re-throw PageLoadError as-is
    if (error instanceof PageLoadError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new PageLoadError(
        `Network error loading page configuration: ${pageId}`,
        PageLoadErrorType.NETWORK_ERROR,
        pageId,
        error
      );
    }

    // Wrap other errors
    throw new PageLoadError(
      `Unknown error loading page: ${pageId}`,
      PageLoadErrorType.UNKNOWN,
      pageId,
      error
    );
  }
}

/**
 * Validate page configuration structure
 */
function validatePageConfig(config: PageConfig, pageId: string): void {
  if (!config.id || config.id !== pageId) {
    throw new PageLoadError(
      `Invalid page configuration: id mismatch (expected: ${pageId}, got: ${config.id})`,
      PageLoadErrorType.INVALID_CONFIG,
      pageId
    );
  }

  if (!config.version) {
    throw new PageLoadError(
      `Invalid page configuration: missing version`,
      PageLoadErrorType.INVALID_CONFIG,
      pageId
    );
  }

  if (!config.layout) {
    throw new PageLoadError(
      `Invalid page configuration: missing layout`,
      PageLoadErrorType.INVALID_CONFIG,
      pageId
    );
  }

  if (!Array.isArray(config.widgets)) {
    throw new PageLoadError(
      `Invalid page configuration: widgets must be an array`,
      PageLoadErrorType.INVALID_CONFIG,
      pageId
    );
  }
}

/**
 * Get cache instance (to be implemented with IndexedDB)
 * For now, returns a simple in-memory cache
 */
function getCacheInstance() {
  const cache = new Map<string, CachedPageConfig>();

  return {
    async get(pageId: string): Promise<CachedPageConfig | null> {
      return cache.get(pageId) || null;
    },

    async set(pageId: string, cachedConfig: CachedPageConfig): Promise<void> {
      cache.set(pageId, cachedConfig);
    },

    async delete(pageId: string): Promise<void> {
      cache.delete(pageId);
    },

    async clear(): Promise<void> {
      cache.clear();
    },

    async getStats() {
      return {
        count: cache.size,
        size: 0, // Not calculated for in-memory cache
        hitRate: 0, // Not tracked yet
      };
    },
  };
}

/**
 * Global cache instance
 */
const cache = getCacheInstance();

/**
 * Load page configuration with caching
 */
export async function loadPageConfig(
  pageId: string,
  options: PageLoaderOptions = {}
): Promise<PageLoaderResult> {
  // Development mode: skip cache
  const skipCache = isDevelopment || options.skipCache;

  // Check for concurrent request to same page
  const activeRequest = activeRequests.get(pageId);
  if (activeRequest) {
    return activeRequest;
  }

  // Create promise for this request
  const requestPromise = (async () => {
    try {
      // Try to load from cache first (unless skipCache)
      let cachedConfig: CachedPageConfig | null = null;

      if (!skipCache) {
        cachedConfig = await cache.get(pageId);

        // Check if cached config is still valid
        if (cachedConfig) {
          const now = Date.now();
          const isExpired = cachedConfig.expiresAt && cachedConfig.expiresAt < now;

          // If not expired, return cached config
          if (!isExpired) {
            return {
              config: cachedConfig.config,
              fromCache: true,
              etag: cachedConfig.etag,
              loadedAt: now,
            };
          }

          // If expired and stale-while-revalidate, return stale cache and revalidate in background
          if (isExpired && options.staleWhileRevalidate) {
            // Start background revalidation (don't await)
            void revalidateCache(pageId, cachedConfig.etag, options);

            return {
              config: cachedConfig.config,
              fromCache: true,
              etag: cachedConfig.etag,
              loadedAt: now,
            };
          }
        }
      }

      // Fetch from server
      const { config, etag, notModified } = await fetchPageConfig(
        pageId,
        cachedConfig?.etag,
        options
      );

      const now = Date.now();

      // If 304 Not Modified, return cached config
      if (notModified && cachedConfig) {
        // Update cache expiration
        const ttl = options.cacheTTL || DEFAULT_CACHE_TTL;
        await cache.set(pageId, {
          ...cachedConfig,
          cachedAt: now,
          expiresAt: now + ttl * 1000,
        });

        return {
          config: cachedConfig.config,
          fromCache: true,
          etag: cachedConfig.etag,
          loadedAt: now,
        };
      }

      // Store in cache
      if (!skipCache && config && etag) {
        const ttl = options.cacheTTL || DEFAULT_CACHE_TTL;
        await cache.set(pageId, {
          config,
          etag,
          cachedAt: now,
          expiresAt: now + ttl * 1000,
          version: config.version,
        });
      }

      if (!config) {
        throw new PageLoadError(PageLoadErrorType.INVALID_CONFIG, 'Page configuration is missing');
      }

      return {
        config,
        fromCache: false,
        etag,
        loadedAt: now,
      };
    } finally {
      // Remove from active requests
      activeRequests.delete(pageId);
    }
  })();

  // Track active request
  activeRequests.set(pageId, requestPromise);

  return requestPromise;
}

/**
 * Revalidate cached config in background
 */
async function revalidateCache(
  pageId: string,
  etag: string,
  options: PageLoaderOptions
): Promise<void> {
  try {
    const { config, etag: newEtag, notModified } = await fetchPageConfig(pageId, etag, options);

    const now = Date.now();

    if (!notModified && config && newEtag) {
      // Update cache with new config
      const ttl = options.cacheTTL || DEFAULT_CACHE_TTL;
      await cache.set(pageId, {
        config,
        etag: newEtag,
        cachedAt: now,
        expiresAt: now + ttl * 1000,
        version: config.version,
      });
    } else {
      // Just update expiration
      const cachedConfig = await cache.get(pageId);
      if (cachedConfig) {
        const ttl = options.cacheTTL || DEFAULT_CACHE_TTL;
        await cache.set(pageId, {
          ...cachedConfig,
          cachedAt: now,
          expiresAt: now + ttl * 1000,
        });
      }
    }
  } catch (error) {
    // Silently fail background revalidation
    console.warn(`Background revalidation failed for page ${pageId}:`, error);
  }
}

/**
 * Preload page configuration (for faster navigation)
 */
export async function preloadPageConfig(
  pageId: string,
  options: PageLoaderOptions = {}
): Promise<void> {
  try {
    await loadPageConfig(pageId, options);
  } catch (error) {
    // Silently fail preloading
    console.warn(`Failed to preload page ${pageId}:`, error);
  }
}

/**
 * Clear cached page configuration
 */
export async function clearPageCache(pageId?: string): Promise<void> {
  if (pageId) {
    await cache.delete(pageId);
  } else {
    await cache.clear();
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  return cache.getStats();
}

/**
 * Check if page is cached
 */
export async function isPageCached(pageId: string): Promise<boolean> {
  const cachedConfig = await cache.get(pageId);
  if (!cachedConfig) {
    return false;
  }

  // Check if expired
  const now = Date.now();
  return !cachedConfig.expiresAt || cachedConfig.expiresAt > now;
}
