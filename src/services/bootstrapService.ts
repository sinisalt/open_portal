/**
 * Bootstrap Service
 *
 * Service for fetching and managing bootstrap data from the /ui/bootstrap API endpoint
 */

import type { BootstrapError, BootstrapResponse } from '@/types/bootstrap.types';
import { BootstrapErrorType } from '@/types/bootstrap.types';
import { get } from './httpClient';

/**
 * Bootstrap service configuration
 */
const BOOTSTRAP_CONFIG = {
  endpoint: '/ui/bootstrap',
  maxRetries: 3,
  retryDelay: 1000, // Initial retry delay in ms
  cacheKey: 'bootstrap_data',
  cacheExpiryKey: 'bootstrap_data_expiry',
  cacheDuration: 5 * 60 * 1000, // 5 minutes in ms
};

/**
 * Validates bootstrap response structure
 */
function validateBootstrapResponse(data: unknown): data is BootstrapResponse {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const response = data as Partial<BootstrapResponse>;

  // Validate required top-level properties
  if (!response.user || typeof response.user !== 'object') return false;
  if (!Array.isArray(response.permissions)) return false;
  if (!response.tenant || typeof response.tenant !== 'object') return false;
  if (!Array.isArray(response.menu)) return false;
  if (!response.defaults || typeof response.defaults !== 'object') return false;
  if (!response.featureFlags || typeof response.featureFlags !== 'object') return false;

  // Validate user object
  const user = response.user;
  if (
    typeof user.id !== 'string' ||
    typeof user.name !== 'string' ||
    typeof user.email !== 'string' ||
    !Array.isArray(user.roles)
  ) {
    return false;
  }

  // Validate tenant object
  const tenant = response.tenant;
  if (
    typeof tenant.id !== 'string' ||
    typeof tenant.name !== 'string' ||
    typeof tenant.brandingVersion !== 'string'
  ) {
    return false;
  }

  // Validate defaults object
  const defaults = response.defaults;
  if (typeof defaults.homePage !== 'string' || typeof defaults.theme !== 'string') {
    return false;
  }

  return true;
}

/**
 * Create a bootstrap error with appropriate type
 */
function createBootstrapError(
  message: string,
  type: BootstrapErrorType,
  originalError?: Error
): BootstrapError {
  const error = new Error(message) as BootstrapError;
  error.name = 'BootstrapError';
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
 * Get cached bootstrap data if still valid
 */
function getCachedBootstrap(): BootstrapResponse | null {
  try {
    const cached = sessionStorage.getItem(BOOTSTRAP_CONFIG.cacheKey);
    const expiry = sessionStorage.getItem(BOOTSTRAP_CONFIG.cacheExpiryKey);

    if (!cached || !expiry) {
      return null;
    }

    const expiryTime = Number.parseInt(expiry, 10);
    if (Date.now() > expiryTime) {
      // Cache expired
      sessionStorage.removeItem(BOOTSTRAP_CONFIG.cacheKey);
      sessionStorage.removeItem(BOOTSTRAP_CONFIG.cacheExpiryKey);
      return null;
    }

    const data = JSON.parse(cached);
    if (validateBootstrapResponse(data)) {
      return data;
    }

    return null;
  } catch (_error) {
    // If cache retrieval fails, just return null
    return null;
  }
}

/**
 * Cache bootstrap data
 */
function cacheBootstrap(data: BootstrapResponse): void {
  try {
    const expiry = Date.now() + BOOTSTRAP_CONFIG.cacheDuration;
    sessionStorage.setItem(BOOTSTRAP_CONFIG.cacheKey, JSON.stringify(data));
    sessionStorage.setItem(BOOTSTRAP_CONFIG.cacheExpiryKey, expiry.toString());
  } catch (error) {
    // If caching fails, it's not critical - just log and continue
    console.warn('Failed to cache bootstrap data:', error);
  }
}

/**
 * Clear cached bootstrap data
 */
export function clearBootstrapCache(): void {
  try {
    sessionStorage.removeItem(BOOTSTRAP_CONFIG.cacheKey);
    sessionStorage.removeItem(BOOTSTRAP_CONFIG.cacheExpiryKey);
  } catch (error) {
    console.warn('Failed to clear bootstrap cache:', error);
  }
}

/**
 * Fetch bootstrap data from the API with retry logic
 *
 * @param useCache - Whether to use cached data if available (default: true)
 * @returns Promise resolving to bootstrap data
 * @throws BootstrapError on failure
 */
export async function fetchBootstrap(useCache = true): Promise<BootstrapResponse> {
  // Check cache first if enabled
  if (useCache) {
    const cached = getCachedBootstrap();
    if (cached) {
      return cached;
    }
  }

  let lastError: Error | null = null;

  // Retry logic with exponential backoff
  for (let attempt = 0; attempt < BOOTSTRAP_CONFIG.maxRetries; attempt++) {
    try {
      // Add delay for retries (exponential backoff)
      if (attempt > 0) {
        const delay = BOOTSTRAP_CONFIG.retryDelay * 2 ** (attempt - 1);
        await sleep(delay);
      }

      // Make the API request
      const response = await get(BOOTSTRAP_CONFIG.endpoint);

      // Validate the response
      if (!validateBootstrapResponse(response)) {
        throw createBootstrapError(
          'Invalid bootstrap response structure',
          BootstrapErrorType.INVALID_RESPONSE
        );
      }

      // Cache the successful response
      cacheBootstrap(response);

      return response;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes('401')) {
        throw createBootstrapError(
          'Authentication failed. Please log in again.',
          BootstrapErrorType.AUTH_ERROR,
          error
        );
      }

      // Don't retry on validation errors
      if (
        error instanceof Error &&
        error.name === 'BootstrapError' &&
        (error as BootstrapError).type === BootstrapErrorType.INVALID_RESPONSE
      ) {
        throw error;
      }

      // Continue to retry for other errors
      console.warn(
        `Bootstrap fetch attempt ${attempt + 1} failed:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // All retries exhausted
  throw createBootstrapError(
    `Failed to fetch bootstrap data after ${BOOTSTRAP_CONFIG.maxRetries} attempts: ${
      lastError?.message || 'Unknown error'
    }`,
    BootstrapErrorType.NETWORK_ERROR,
    lastError || undefined
  );
}

/**
 * Check if user has a specific permission
 *
 * @param bootstrap - Bootstrap response data
 * @param permission - Permission to check
 * @returns True if user has the permission
 */
export function hasPermission(bootstrap: BootstrapResponse | null, permission: string): boolean {
  if (!bootstrap || !bootstrap.permissions) {
    return false;
  }
  return bootstrap.permissions.includes(permission);
}

/**
 * Check if a feature flag is enabled
 *
 * @param bootstrap - Bootstrap response data
 * @param featureFlag - Feature flag to check
 * @returns True if feature is enabled
 */
export function isFeatureEnabled(
  bootstrap: BootstrapResponse | null,
  featureFlag: string
): boolean {
  if (!bootstrap || !bootstrap.featureFlags) {
    return false;
  }
  return bootstrap.featureFlags[featureFlag] === true;
}

/**
 * Get filtered menu items based on user permissions
 *
 * @param bootstrap - Bootstrap response data
 * @returns Filtered menu items
 */
export function getFilteredMenu(bootstrap: BootstrapResponse | null): BootstrapResponse['menu'] {
  if (!bootstrap || !bootstrap.menu) {
    return [];
  }

  // Filter menu items based on permissions
  return bootstrap.menu.filter(item => {
    if (!item.permission) {
      return true; // No permission required
    }
    return hasPermission(bootstrap, item.permission);
  });
}
