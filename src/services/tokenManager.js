/**
 * Token Manager Service
 *
 * Handles token lifecycle management including:
 * - Token storage and retrieval
 * - Token expiration tracking
 * - Token validation
 * - Automatic token refresh scheduling
 */

const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // Refresh 5 minutes before expiry

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  TOKEN_EXPIRY: 'tokenExpiry',
  USER: 'user',
};

/**
 * Get the appropriate storage based on token presence
 * @returns {Storage}
 */
function getStorage() {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ? localStorage : sessionStorage;
}

/**
 * Store tokens with expiry information
 * @param {string} accessToken - Access token
 * @param {string} refreshToken - Refresh token
 * @param {number} expiresIn - Seconds until token expires
 * @param {object} user - User data
 * @param {boolean} rememberMe - Whether to persist across sessions
 */
export function storeTokens(accessToken, refreshToken, expiresIn, user, rememberMe = false) {
  const storage = rememberMe ? localStorage : sessionStorage;
  const expiryTime = Date.now() + expiresIn * 1000;

  storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  storage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
  storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

/**
 * Get access token
 * @returns {string|null}
 */
export function getAccessToken() {
  return (
    localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  );
}

/**
 * Get refresh token
 * @returns {string|null}
 */
export function getRefreshToken() {
  return (
    localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  );
}

/**
 * Get token expiry time
 * @returns {number|null} Timestamp in milliseconds or null
 */
export function getTokenExpiry() {
  const expiry =
    localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY) ||
    sessionStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
  return expiry ? parseInt(expiry, 10) : null;
}

/**
 * Get current user
 * @returns {object|null}
 */
export function getCurrentUser() {
  const userStr =
    localStorage.getItem(STORAGE_KEYS.USER) || sessionStorage.getItem(STORAGE_KEYS.USER);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (_e) {
    return null;
  }
}

/**
 * Check if token is expired
 * @returns {boolean}
 */
export function isTokenExpired() {
  const expiry = getTokenExpiry();
  if (!expiry) return true;

  return Date.now() >= expiry;
}

/**
 * Check if token needs refresh (within threshold of expiry)
 * @returns {boolean}
 */
export function shouldRefreshToken() {
  const expiry = getTokenExpiry();
  if (!expiry) return false;

  const timeUntilExpiry = expiry - Date.now();
  return timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD && timeUntilExpiry > 0;
}

/**
 * Get time until token expires (in milliseconds)
 * @returns {number} Milliseconds until expiry, or 0 if expired
 */
export function getTimeUntilExpiry() {
  const expiry = getTokenExpiry();
  if (!expiry) return 0;

  const timeRemaining = expiry - Date.now();
  return Math.max(0, timeRemaining);
}

/**
 * Update access token (after refresh)
 * @param {string} accessToken - New access token
 * @param {number} expiresIn - Seconds until token expires
 */
export function updateAccessToken(accessToken, expiresIn) {
  const storage = getStorage();
  const expiryTime = Date.now() + expiresIn * 1000;

  storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  storage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
}

/**
 * Clear all tokens and user data
 */
export function clearTokens() {
  // Clear from both storages to be safe
  [localStorage, sessionStorage].forEach(storage => {
    storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    storage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    storage.removeItem(STORAGE_KEYS.USER);
  });
}

/**
 * Check if user is authenticated (has valid token)
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getAccessToken() && !isTokenExpired();
}

/**
 * Validate token format (basic check)
 * @param {string} token
 * @returns {boolean}
 */
export function isValidTokenFormat(token) {
  if (!token || typeof token !== 'string') return false;

  // Basic JWT format check (3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  // Check that each part is base64url encoded (allows base64url characters)
  // Base64url alphabet: A-Z, a-z, 0-9, -, _ (and optionally = for padding)
  try {
    parts.forEach(part => {
      if (!/^[A-Za-z0-9_-]+(=){0,2}$/.test(part)) {
        throw new Error('Invalid base64url');
      }
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Decode JWT token payload (without verification)
 * @param {string} token
 * @returns {object|null}
 */
export function decodeToken(token) {
  if (!isValidTokenFormat(token)) return null;

  try {
    const payload = token.split('.')[1];
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const decoded = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Get token expiry from JWT token itself
 * @param {string} token
 * @returns {number|null} Expiry timestamp in milliseconds or null
 */
export function getTokenExpiryFromJWT(token) {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return null;

  // JWT exp is in seconds, convert to milliseconds
  return payload.exp * 1000;
}
