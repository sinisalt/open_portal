/**
 * Token Manager Tests
 */

import * as tokenManager from './tokenManager';

describe('Token Manager', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('storeTokens', () => {
    it('should store tokens in sessionStorage by default', () => {
      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-456';
      const expiresIn = 3600;
      const user = { id: 1, email: 'test@example.com' };

      tokenManager.storeTokens(accessToken, refreshToken, expiresIn, user, false);

      expect(sessionStorage.getItem('accessToken')).toBe(accessToken);
      expect(sessionStorage.getItem('refreshToken')).toBe(refreshToken);
      expect(sessionStorage.getItem('user')).toBe(JSON.stringify(user));
      expect(sessionStorage.getItem('tokenExpiry')).toBeTruthy();
    });

    it('should store tokens in localStorage when rememberMe is true', () => {
      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-456';
      const expiresIn = 3600;
      const user = { id: 1, email: 'test@example.com' };

      tokenManager.storeTokens(accessToken, refreshToken, expiresIn, user, true);

      expect(localStorage.getItem('accessToken')).toBe(accessToken);
      expect(localStorage.getItem('refreshToken')).toBe(refreshToken);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(user));
      expect(localStorage.getItem('tokenExpiry')).toBeTruthy();
    });

    it('should calculate and store correct expiry time', () => {
      const now = Date.now();
      const expiresIn = 3600; // 1 hour
      const expectedExpiry = now + expiresIn * 1000;

      jest.spyOn(Date, 'now').mockReturnValue(now);

      tokenManager.storeTokens('token', 'refresh', expiresIn, {}, false);

      const storedExpiry = parseInt(sessionStorage.getItem('tokenExpiry'), 10);
      expect(storedExpiry).toBe(expectedExpiry);
    });
  });

  describe('getAccessToken', () => {
    it('should return null when no token is stored', () => {
      expect(tokenManager.getAccessToken()).toBeNull();
    });

    it('should return token from localStorage', () => {
      localStorage.setItem('accessToken', 'local-token');
      expect(tokenManager.getAccessToken()).toBe('local-token');
    });

    it('should return token from sessionStorage', () => {
      sessionStorage.setItem('accessToken', 'session-token');
      expect(tokenManager.getAccessToken()).toBe('session-token');
    });

    it('should prioritize localStorage over sessionStorage', () => {
      localStorage.setItem('accessToken', 'local-token');
      sessionStorage.setItem('accessToken', 'session-token');
      expect(tokenManager.getAccessToken()).toBe('local-token');
    });
  });

  describe('getRefreshToken', () => {
    it('should return null when no token is stored', () => {
      expect(tokenManager.getRefreshToken()).toBeNull();
    });

    it('should return refresh token from storage', () => {
      localStorage.setItem('refreshToken', 'refresh-123');
      expect(tokenManager.getRefreshToken()).toBe('refresh-123');
    });
  });

  describe('getTokenExpiry', () => {
    it('should return null when no expiry is stored', () => {
      expect(tokenManager.getTokenExpiry()).toBeNull();
    });

    it('should return expiry timestamp as number', () => {
      const expiry = Date.now() + 3600000;
      localStorage.setItem('tokenExpiry', expiry.toString());
      expect(tokenManager.getTokenExpiry()).toBe(expiry);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user is stored', () => {
      expect(tokenManager.getCurrentUser()).toBeNull();
    });

    it('should parse and return user object', () => {
      const user = { id: 1, email: 'test@example.com', name: 'Test User' };
      localStorage.setItem('user', JSON.stringify(user));
      expect(tokenManager.getCurrentUser()).toEqual(user);
    });

    it('should return null for invalid JSON', () => {
      localStorage.setItem('user', 'invalid-json{');
      expect(tokenManager.getCurrentUser()).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return true when no expiry is stored', () => {
      expect(tokenManager.isTokenExpired()).toBe(true);
    });

    it('should return false when token is not expired', () => {
      const now = Date.now();
      const futureExpiry = now + 3600000; // 1 hour from now
      jest.spyOn(Date, 'now').mockReturnValue(now);
      localStorage.setItem('tokenExpiry', futureExpiry.toString());
      expect(tokenManager.isTokenExpired()).toBe(false);
    });

    it('should return true when token is expired', () => {
      const now = Date.now();
      const pastExpiry = now - 1000; // 1 second ago
      jest.spyOn(Date, 'now').mockReturnValue(now);
      localStorage.setItem('tokenExpiry', pastExpiry.toString());
      expect(tokenManager.isTokenExpired()).toBe(true);
    });

    it('should return true when token expires exactly now', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);
      localStorage.setItem('tokenExpiry', now.toString());
      expect(tokenManager.isTokenExpired()).toBe(true);
    });
  });

  describe('shouldRefreshToken', () => {
    it('should return false when no expiry is stored', () => {
      expect(tokenManager.shouldRefreshToken()).toBe(false);
    });

    it('should return false when token has plenty of time left', () => {
      const now = Date.now();
      const farFutureExpiry = now + 30 * 60 * 1000; // 30 minutes from now
      jest.spyOn(Date, 'now').mockReturnValue(now);
      localStorage.setItem('tokenExpiry', farFutureExpiry.toString());
      expect(tokenManager.shouldRefreshToken()).toBe(false);
    });

    it('should return true when token is within refresh threshold', () => {
      const now = Date.now();
      const nearExpiry = now + 4 * 60 * 1000; // 4 minutes from now
      jest.spyOn(Date, 'now').mockReturnValue(now);
      localStorage.setItem('tokenExpiry', nearExpiry.toString());
      expect(tokenManager.shouldRefreshToken()).toBe(true);
    });

    it('should return false when token is already expired', () => {
      const now = Date.now();
      const pastExpiry = now - 1000;
      jest.spyOn(Date, 'now').mockReturnValue(now);
      localStorage.setItem('tokenExpiry', pastExpiry.toString());
      expect(tokenManager.shouldRefreshToken()).toBe(false);
    });
  });

  describe('getTimeUntilExpiry', () => {
    it('should return 0 when no expiry is stored', () => {
      expect(tokenManager.getTimeUntilExpiry()).toBe(0);
    });

    it('should return correct time until expiry', () => {
      const now = Date.now();
      const timeUntilExpiry = 10 * 60 * 1000; // 10 minutes
      const expiry = now + timeUntilExpiry;

      jest.spyOn(Date, 'now').mockReturnValue(now);
      localStorage.setItem('tokenExpiry', expiry.toString());

      const result = tokenManager.getTimeUntilExpiry();
      expect(result).toBe(timeUntilExpiry);
    });

    it('should return 0 when token is expired', () => {
      const pastExpiry = Date.now() - 5000;
      localStorage.setItem('tokenExpiry', pastExpiry.toString());
      expect(tokenManager.getTimeUntilExpiry()).toBe(0);
    });
  });

  describe('updateAccessToken', () => {
    it('should update access token and expiry in correct storage', () => {
      // First store tokens in localStorage
      localStorage.setItem('accessToken', 'old-token');
      localStorage.setItem('tokenExpiry', '123456789');

      const now = Date.now();
      const expiresIn = 3600;
      jest.spyOn(Date, 'now').mockReturnValue(now);

      tokenManager.updateAccessToken('new-token', expiresIn);

      expect(localStorage.getItem('accessToken')).toBe('new-token');
      expect(parseInt(localStorage.getItem('tokenExpiry'), 10)).toBe(now + expiresIn * 1000);
    });
  });

  describe('clearTokens', () => {
    it('should clear all tokens from both storages', () => {
      localStorage.setItem('accessToken', 'token1');
      localStorage.setItem('refreshToken', 'token2');
      localStorage.setItem('tokenExpiry', '12345');
      localStorage.setItem('user', '{}');

      sessionStorage.setItem('accessToken', 'token3');
      sessionStorage.setItem('refreshToken', 'token4');
      sessionStorage.setItem('tokenExpiry', '67890');
      sessionStorage.setItem('user', '{}');

      tokenManager.clearTokens();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('tokenExpiry')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();

      expect(sessionStorage.getItem('accessToken')).toBeNull();
      expect(sessionStorage.getItem('refreshToken')).toBeNull();
      expect(sessionStorage.getItem('tokenExpiry')).toBeNull();
      expect(sessionStorage.getItem('user')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token is stored', () => {
      expect(tokenManager.isAuthenticated()).toBe(false);
    });

    it('should return false when token is expired', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('tokenExpiry', (now - 1000).toString());
      expect(tokenManager.isAuthenticated()).toBe(false);
    });

    it('should return true when token is valid and not expired', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('tokenExpiry', (now + 3600000).toString());
      expect(tokenManager.isAuthenticated()).toBe(true);
    });
  });

  describe('isValidTokenFormat', () => {
    it('should return false for null or undefined', () => {
      expect(tokenManager.isValidTokenFormat(null)).toBe(false);
      expect(tokenManager.isValidTokenFormat(undefined)).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(tokenManager.isValidTokenFormat(123)).toBe(false);
      expect(tokenManager.isValidTokenFormat({})).toBe(false);
    });

    it('should return false for tokens without 3 parts', () => {
      expect(tokenManager.isValidTokenFormat('invalid')).toBe(false);
      expect(tokenManager.isValidTokenFormat('only.two')).toBe(false);
      expect(tokenManager.isValidTokenFormat('too.many.parts.here')).toBe(false);
    });

    it('should return true for valid JWT format', () => {
      const validToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      expect(tokenManager.isValidTokenFormat(validToken)).toBe(true);
    });

    it('should return false for invalid base64 characters', () => {
      expect(tokenManager.isValidTokenFormat('invalid!.characters@.here#')).toBe(false);
    });
  });

  describe('decodeToken', () => {
    it('should return null for invalid token format', () => {
      expect(tokenManager.decodeToken('invalid')).toBeNull();
    });

    it('should decode valid JWT token', () => {
      const validToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const decoded = tokenManager.decodeToken(validToken);

      expect(decoded).toEqual({
        sub: '1234567890',
        name: 'John Doe',
        iat: 1516239022,
      });
    });

    it('should return null for malformed JWT payload', () => {
      const invalidToken = 'header.invalid-base64!.signature';
      expect(tokenManager.decodeToken(invalidToken)).toBeNull();
    });
  });

  describe('getTokenExpiryFromJWT', () => {
    it('should return null for invalid token', () => {
      expect(tokenManager.getTokenExpiryFromJWT('invalid')).toBeNull();
    });

    it('should return null when token has no exp claim', () => {
      const tokenWithoutExp =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Gfx6VO9tcxwk6xqx9yYzSfebfeakZp5JYIgP_edcw_A';
      expect(tokenManager.getTokenExpiryFromJWT(tokenWithoutExp)).toBeNull();
    });

    it('should return expiry in milliseconds from JWT token', () => {
      // JWT with exp: 1516239022 (in seconds)
      const tokenWithExp =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNTE2MjM5MDIyfQ.4Adcj0vAf8hP-P7hD-7AhYvS6PaW5blPPLU06GCpz3A';
      const expiry = tokenManager.getTokenExpiryFromJWT(tokenWithExp);

      expect(expiry).toBe(1516239022000); // Converted to milliseconds
    });
  });
});
