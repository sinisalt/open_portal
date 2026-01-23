/**
 * Branding Service
 *
 * Service for fetching and managing tenant-specific branding configuration
 */

import type { BrandingError, BrandingResponse, CachedBranding } from '@/types/branding.types';
import { BrandingErrorType } from '@/types/branding.types';
import { get } from './httpClient';

/**
 * Branding service configuration
 */
const BRANDING_CONFIG = {
  endpoint: '/ui/branding',
  maxRetries: 3,
  retryDelay: 1000, // Initial retry delay in ms
  cacheKey: 'branding_data',
  cacheDuration: 60 * 60 * 1000, // 1 hour in ms (longer than bootstrap)
};

/**
 * Validates branding response structure
 */
function validateBrandingResponse(data: unknown): data is BrandingResponse {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const response = data as Partial<BrandingResponse>;

  // Validate required top-level properties
  if (typeof response.tenantId !== 'string') return false;
  if (typeof response.version !== 'string') return false;
  if (!response.branding || typeof response.branding !== 'object') return false;

  const branding = response.branding;

  // Validate logos
  if (!branding.logos || typeof branding.logos !== 'object') return false;
  if (!branding.logos.primary || typeof branding.logos.primary !== 'object') return false;
  if (typeof branding.logos.primary.url !== 'string') return false;
  if (typeof branding.logos.primary.altText !== 'string') return false;

  // Validate colors
  if (!branding.colors || typeof branding.colors !== 'object') return false;
  if (!branding.colors.primary || typeof branding.colors.primary !== 'object') return false;
  if (typeof branding.colors.primary['500'] !== 'string') return false;

  // Validate typography
  if (!branding.typography || typeof branding.typography !== 'object') return false;
  if (!branding.typography.fontFamily || typeof branding.typography.fontFamily !== 'object')
    return false;
  if (typeof branding.typography.fontFamily.primary !== 'string') return false;

  return true;
}

/**
 * Create a branding error with appropriate type
 */
function createBrandingError(
  message: string,
  type: BrandingErrorType,
  originalError?: Error
): BrandingError {
  const error = new Error(message) as BrandingError;
  error.name = 'BrandingError';
  error.type = type;
  error.originalError = originalError;
  return error;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get cached branding data if still valid and version matches
 */
function getCachedBranding(expectedVersion?: string): BrandingResponse | null {
  try {
    const cached = localStorage.getItem(BRANDING_CONFIG.cacheKey);

    if (!cached) {
      return null;
    }

    const cachedData: CachedBranding = JSON.parse(cached);

    // Check if cache is expired
    if (Date.now() > cachedData.timestamp + BRANDING_CONFIG.cacheDuration) {
      localStorage.removeItem(BRANDING_CONFIG.cacheKey);
      return null;
    }

    // Check version if provided (from bootstrap)
    if (expectedVersion && cachedData.version !== expectedVersion) {
      localStorage.removeItem(BRANDING_CONFIG.cacheKey);
      return null;
    }

    // Validate cached data structure
    if (validateBrandingResponse(cachedData.data)) {
      return cachedData.data;
    }

    return null;
  } catch (_error) {
    // If cache retrieval fails, just return null
    return null;
  }
}

/**
 * Cache branding data
 */
function cacheBranding(data: BrandingResponse): void {
  try {
    const cachedData: CachedBranding = {
      data,
      version: data.version,
      timestamp: Date.now(),
    };
    localStorage.setItem(BRANDING_CONFIG.cacheKey, JSON.stringify(cachedData));
  } catch (error) {
    // If caching fails, it's not critical - just log and continue
    console.warn('Failed to cache branding data:', error);
  }
}

/**
 * Clear cached branding data
 */
export function clearBrandingCache(): void {
  try {
    localStorage.removeItem(BRANDING_CONFIG.cacheKey);
  } catch (error) {
    console.warn('Failed to clear branding cache:', error);
  }
}

/**
 * Fetch branding data from the API with retry logic
 *
 * @param tenantId - Tenant identifier
 * @param expectedVersion - Expected branding version (from bootstrap) for cache validation
 * @param useCache - Whether to use cached data if available (default: true)
 * @returns Promise resolving to branding data
 * @throws BrandingError on failure
 */
export async function fetchBranding(
  tenantId: string,
  expectedVersion?: string,
  useCache = true
): Promise<BrandingResponse> {
  // Check cache first if enabled
  if (useCache) {
    const cached = getCachedBranding(expectedVersion);
    if (cached) {
      return cached;
    }
  }

  let lastError: Error | null = null;

  // Retry logic with exponential backoff
  for (let attempt = 0; attempt < BRANDING_CONFIG.maxRetries; attempt++) {
    try {
      // Add delay for retries (exponential backoff)
      if (attempt > 0) {
        const delay = BRANDING_CONFIG.retryDelay * 2 ** (attempt - 1);
        await sleep(delay);
      }

      // Make the API request
      const url = `${BRANDING_CONFIG.endpoint}?tenantId=${encodeURIComponent(tenantId)}`;
      const response = await get(url);

      // Validate the response
      if (!validateBrandingResponse(response)) {
        throw createBrandingError(
          'Invalid branding response structure',
          BrandingErrorType.INVALID_RESPONSE
        );
      }

      // Cache the successful response
      cacheBranding(response);

      return response;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes('401')) {
        throw createBrandingError(
          'Authentication failed. Please log in again.',
          BrandingErrorType.AUTH_ERROR,
          error
        );
      }

      // Don't retry on validation errors
      if (
        error instanceof Error &&
        error.name === 'BrandingError' &&
        (error as BrandingError).type === BrandingErrorType.INVALID_RESPONSE
      ) {
        throw error;
      }

      // Don't retry on tenant not found (404)
      if (error instanceof Error && error.message.includes('404')) {
        throw createBrandingError(
          `Tenant branding not found: ${tenantId}`,
          BrandingErrorType.TENANT_NOT_FOUND,
          error
        );
      }

      // Continue to retry for other errors
      console.warn(
        `Branding fetch attempt ${attempt + 1} failed:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // All retries exhausted
  throw createBrandingError(
    `Failed to fetch branding data after ${BRANDING_CONFIG.maxRetries} attempts: ${
      lastError?.message || 'Unknown error'
    }`,
    BrandingErrorType.NETWORK_ERROR,
    lastError || undefined
  );
}

/**
 * Get branding version from cached data
 *
 * @returns Cached branding version or null if not cached
 */
export function getCachedBrandingVersion(): string | null {
  try {
    const cached = localStorage.getItem(BRANDING_CONFIG.cacheKey);
    if (!cached) {
      return null;
    }

    const cachedData: CachedBranding = JSON.parse(cached);
    return cachedData.version;
  } catch (_error) {
    return null;
  }
}

/**
 * Check if branding cache needs refresh based on bootstrap version
 *
 * @param bootstrapVersion - Branding version from bootstrap response
 * @returns True if cache needs refresh
 */
export function needsBrandingRefresh(bootstrapVersion: string): boolean {
  const cachedVersion = getCachedBrandingVersion();
  return cachedVersion !== bootstrapVersion;
}
