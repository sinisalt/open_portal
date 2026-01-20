/**
 * HTTP Client with Token Management
 *
 * Provides a fetch wrapper with:
 * - Automatic token injection
 * - Automatic token refresh on 401
 * - Request queuing during refresh
 */

import * as tokenManager from './tokenManager';
import * as authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/v1';

// Queue for requests waiting for token refresh
let isRefreshing = false;
let refreshQueue = [];

/**
 * Process queued requests after token refresh
 * @param {Error|null} error - Error from refresh attempt
 * @param {string|null} token - New access token
 */
function processQueue(error, token = null) {
  refreshQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  refreshQueue = [];
}

/**
 * Refresh token and retry request
 * @returns {Promise<string>} New access token
 */
async function refreshTokenAndRetry() {
  if (!isRefreshing) {
    isRefreshing = true;

    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const data = await authService.refreshAccessToken(refreshToken);
      processQueue(null, data.accessToken);
      return data.accessToken;
    } catch (error) {
      processQueue(error, null);
      // Clear tokens and redirect to login
      tokenManager.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw error;
    } finally {
      isRefreshing = false;
    }
  }

  // If already refreshing, queue this request
  return new Promise((resolve, reject) => {
    refreshQueue.push({ resolve, reject });
  });
}

/**
 * Enhanced fetch with automatic token management
 * @param {string} url - URL to fetch (relative to API base or absolute)
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function httpClient(url, options = {}) {
  // Resolve relative URLs
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  // Get current access token
  let accessToken = tokenManager.getAccessToken();

  // Check if token needs refresh before making request
  if (accessToken && tokenManager.shouldRefreshToken()) {
    try {
      accessToken = await refreshTokenAndRetry();
    } catch (error) {
      // If refresh fails, continue with existing token (might still work)
      console.warn('Proactive token refresh failed:', error);
    }
  }

  // Add authorization header if token exists
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Make the request
  let response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - token might be expired
  if (response.status === 401 && !options.skipAuth) {
    try {
      // Refresh token and retry
      const newToken = await refreshTokenAndRetry();

      // Retry the original request with new token
      response = await fetch(fullUrl, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    } catch (error) {
      // Refresh failed, throw original 401 error
      throw new Error('Authentication failed. Please login again.');
    }
  }

  return response;
}

/**
 * GET request helper
 * @param {string} url - URL to fetch
 * @param {RequestInit} options - Additional fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
export async function get(url, options = {}) {
  const response = await httpClient(url, {
    ...options,
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * POST request helper
 * @param {string} url - URL to fetch
 * @param {any} data - Request body
 * @param {RequestInit} options - Additional fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
export async function post(url, data, options = {}) {
  const response = await httpClient(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * PUT request helper
 * @param {string} url - URL to fetch
 * @param {any} data - Request body
 * @param {RequestInit} options - Additional fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
export async function put(url, data, options = {}) {
  const response = await httpClient(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * DELETE request helper
 * @param {string} url - URL to fetch
 * @param {RequestInit} options - Additional fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
export async function del(url, options = {}) {
  const response = await httpClient(url, {
    ...options,
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  // DELETE might return empty response
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

/**
 * Get current refresh state (for testing)
 * @returns {boolean}
 */
export function getRefreshState() {
  return {
    isRefreshing,
    queueLength: refreshQueue.length,
  };
}

/**
 * Reset refresh state (for testing)
 */
export function resetRefreshState() {
  isRefreshing = false;
  refreshQueue = [];
}
