/**
 * Authentication Service
 *
 * Handles all authentication-related API calls including:
 * - Username/password login
 * - OAuth authentication
 * - Token refresh
 * - Logout
 */

import * as tokenManager from './tokenManager';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/v1';

/**
 * Login with username/email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Whether to persist the session
 * @returns {Promise<{accessToken: string, refreshToken: string, expiresIn: number, user: object}>}
 */
export async function login(email, password, rememberMe = false) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message || 'Invalid credentials');
  }

  const data = await response.json();

  // Use token manager to store tokens
  tokenManager.storeTokens(
    data.accessToken,
    data.refreshToken,
    data.expiresIn,
    data.user,
    rememberMe
  );

  return data;
}

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<{accessToken: string, expiresIn: number}>}
 */
export async function refreshAccessToken(refreshToken) {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  const data = await response.json();

  // Use token manager to update access token
  tokenManager.updateAccessToken(data.accessToken, data.expiresIn);

  return data;
}

/**
 * Logout user
 * @param {string} refreshToken - Refresh token to invalidate
 * @returns {Promise<void>}
 */
export async function logout(refreshToken) {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
  } finally {
    // Always clear tokens using token manager
    tokenManager.clearTokens();
  }
}

/**
 * Get OAuth providers
 * @returns {Promise<Array<{id: string, name: string, authUrl: string, clientId: string}>>}
 */
export async function getOAuthProviders() {
  const response = await fetch(`${API_BASE_URL}/auth/oauth/providers`);

  if (!response.ok) {
    throw new Error('Failed to fetch OAuth providers');
  }

  const data = await response.json();
  return data.providers;
}

/**
 * Initiate OAuth authentication
 * @param {string} providerId - OAuth provider ID (e.g., 'google', 'microsoft')
 * @param {string} redirectUrl - URL to redirect after authentication
 */
export function initiateOAuth(providerId, redirectUrl) {
  // Generate state parameter for CSRF protection
  const state = generateRandomString(32);
  sessionStorage.setItem('oauthState', state);

  // Store the intended redirect URL for after OAuth completes
  sessionStorage.setItem('oauthRedirect', redirectUrl);

  // Redirect to OAuth provider
  // In production, this would construct the full OAuth URL with state, nonce, etc.
  const callbackUrl = `${window.location.origin}/auth/callback`;
  window.location.href = `${API_BASE_URL}/auth/oauth/${providerId}?redirect_uri=${encodeURIComponent(
    callbackUrl
  )}&state=${encodeURIComponent(state)}`;
}

/**
 * Handle OAuth callback
 * @param {string} code - Authorization code from OAuth provider
 * @param {string} state - State parameter for CSRF validation
 * @param {boolean} rememberMe - Whether to persist the session
 * @returns {Promise<{accessToken: string, refreshToken: string, expiresIn: number, user: object}>}
 */
export async function handleOAuthCallback(code, state, rememberMe = false) {
  // Validate state parameter to prevent CSRF attacks
  const storedState = sessionStorage.getItem('oauthState');
  if (!storedState || storedState !== state) {
    throw new Error('Invalid state parameter. Possible CSRF attack.');
  }

  try {
    // Exchange authorization code for tokens
    const response = await fetch(`${API_BASE_URL}/auth/oauth/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'OAuth authentication failed' }));
      throw new Error(error.message || 'OAuth authentication failed');
    }

    const data = await response.json();

    // Use token manager to store tokens
    tokenManager.storeTokens(
      data.accessToken,
      data.refreshToken,
      data.expiresIn,
      data.user,
      rememberMe
    );

    return data;
  } finally {
    // Always clear state from storage to prevent reuse
    sessionStorage.removeItem('oauthState');
  }
}

/**
 * Generate a random string for state parameter
 * @param {number} length - Length of the random string
 * @returns {string}
 */
function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }

  return result;
}

/**
 * Get current access token
 * @returns {string|null}
 */
export function getAccessToken() {
  return tokenManager.getAccessToken();
}

/**
 * Get current refresh token
 * @returns {string|null}
 */
export function getRefreshToken() {
  return tokenManager.getRefreshToken();
}

/**
 * Get current user data
 * @returns {object|null}
 */
export function getCurrentUser() {
  return tokenManager.getCurrentUser();
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return tokenManager.isAuthenticated();
}
