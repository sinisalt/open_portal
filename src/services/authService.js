/**
 * Authentication Service
 *
 * Handles all authentication-related API calls including:
 * - Username/password login
 * - OAuth authentication
 * - Token refresh
 * - Logout
 */

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

  // Store tokens based on rememberMe preference
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem('accessToken', data.accessToken);
  storage.setItem('refreshToken', data.refreshToken);
  storage.setItem('user', JSON.stringify(data.user));

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

  // Update access token in storage
  const storage = localStorage.getItem('accessToken') ? localStorage : sessionStorage;
  storage.setItem('accessToken', data.accessToken);

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
    // Always clear local storage regardless of API response
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
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
  // Store the intended redirect URL for after OAuth completes
  sessionStorage.setItem('oauthRedirect', redirectUrl);

  // Redirect to OAuth provider
  // In production, this would construct the full OAuth URL with state, nonce, etc.
  const callbackUrl = `${window.location.origin}/auth/callback`;
  window.location.href = `${API_BASE_URL}/auth/oauth/${providerId}?redirect_uri=${encodeURIComponent(
    callbackUrl
  )}`;
}

/**
 * Get current access token
 * @returns {string|null}
 */
export function getAccessToken() {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
}

/**
 * Get current refresh token
 * @returns {string|null}
 */
export function getRefreshToken() {
  return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
}

/**
 * Get current user data
 * @returns {object|null}
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getAccessToken();
}
