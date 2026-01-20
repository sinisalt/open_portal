# Token Management System

## Overview

The Token Management System provides secure, automatic handling of authentication tokens including:

- Token storage and retrieval
- Automatic token refresh before expiration
- Token validation and expiry tracking
- HTTP interceptors for seamless API integration
- Concurrent request handling during token refresh
- Automatic logout on token refresh failure

## Architecture

### Components

1. **Token Manager** (`tokenManager.js`)

   - Core token lifecycle management
   - Token storage (localStorage/sessionStorage)
   - Expiry tracking and validation
   - JWT token decoding utilities

2. **HTTP Client** (`httpClient.js`)

   - Fetch wrapper with interceptors
   - Automatic token injection
   - 401 response handling
   - Token refresh queue

3. **Auth Service** (`authService.js`)
   - Login/logout operations
   - OAuth integration
   - Token refresh API calls

## Token Storage

Tokens are stored based on user preference:

- **Remember Me = true**: `localStorage` (persistent across browser sessions)
- **Remember Me = false**: `sessionStorage` (cleared when browser closes)

### Stored Data

```javascript
{
  accessToken: string,      // JWT access token
  refreshToken: string,     // JWT refresh token
  tokenExpiry: number,      // Timestamp in milliseconds
  user: string              // JSON-serialized user object
}
```

## Token Refresh Flow

### Proactive Refresh

Tokens are automatically refreshed **5 minutes before expiration** to ensure seamless user experience.

```
┌─────────────────────────────────────────────────────────────┐
│                    Token Refresh Flow                         │
└─────────────────────────────────────────────────────────────┘

1. Request initiated
   ↓
2. Check if token needs refresh (< 5 min until expiry)
   ↓
3. If yes, refresh token proactively
   ↓
4. Make request with new token
   ↓
5. If 401 response, retry refresh
   ↓
6. If refresh fails, clear tokens & redirect to login
```

### Concurrent Request Handling

When multiple requests occur during a token refresh:

1. First request triggers the refresh
2. Subsequent requests are queued
3. All requests retry with new token
4. If refresh fails, all queued requests fail

## Usage

### Basic HTTP Requests

```javascript
import { get, post, put, del } from './services/httpClient';

// GET request
const users = await get('/api/users');

// POST request
const newUser = await post('/api/users', {
  name: 'John Doe',
  email: 'john@example.com',
});

// PUT request
const updated = await put('/api/users/1', { name: 'Jane Doe' });

// DELETE request
await del('/api/users/1');
```

### Custom Requests

```javascript
import { httpClient } from './services/httpClient';

// Custom fetch with automatic token management
const response = await httpClient('/api/custom', {
  method: 'PATCH',
  headers: {
    'X-Custom-Header': 'value',
  },
  body: JSON.stringify(data),
});
```

### Skip Authentication

For public endpoints:

```javascript
const response = await httpClient('/api/public', {
  skipAuth: true,
});
```

### Direct Token Management

```javascript
import * as tokenManager from './services/tokenManager';

// Check authentication status
const isAuth = tokenManager.isAuthenticated();

// Check if token needs refresh
const shouldRefresh = tokenManager.shouldRefreshToken();

// Get time until token expires
const timeRemaining = tokenManager.getTimeUntilExpiry();

// Get current user
const user = tokenManager.getCurrentUser();

// Manually clear tokens
tokenManager.clearTokens();
```

## Security Features

### Token Validation

- JWT format validation (3-part base64 structure)
- Expiry checking on every request
- Automatic token cleanup on logout

### CSRF Protection

- OAuth state parameter validation
- Secure random state generation
- State cleanup after use

### XSS Prevention

- Tokens never exposed in URLs
- No tokens in console logs
- Secure storage APIs only

### Token Rotation

- New access token on every refresh
- Refresh tokens can be single-use (backend implementation)

## Configuration

### Environment Variables

```bash
REACT_APP_API_URL=http://localhost:3001/v1
```

### Token Refresh Threshold

Default: 5 minutes before expiry

Can be modified in `tokenManager.js`:

```javascript
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // milliseconds
```

## Error Handling

### Automatic Handling

- **401 Unauthorized**: Automatic token refresh and retry
- **Refresh Failure**: Clear tokens and redirect to `/login`
- **Invalid Token**: Clear tokens and redirect to `/login`

### Manual Handling

```javascript
try {
  const data = await get('/api/protected');
} catch (error) {
  // Handle errors
  console.error('Request failed:', error.message);
}
```

## Testing

### Unit Tests

```bash
# Run all token management tests
npm test -- tokenManager.test.js

# Run HTTP client tests
npm test -- httpClient.test.js

# Run auth service tests
npm test -- authService.test.js
```

### Test Coverage

- Token storage and retrieval: ✅
- Token expiry detection: ✅
- Token refresh logic: ✅
- Concurrent request handling: ✅
- 401 retry logic: ✅
- Error handling: ✅
- JWT validation: ✅

## Best Practices

### Do's ✅

- Always use the httpClient for API requests
- Trust the automatic token refresh
- Use `isAuthenticated()` to check auth status
- Handle errors gracefully

### Don'ts ❌

- Don't manually manage tokens in components
- Don't bypass the HTTP client for authenticated requests
- Don't store tokens in component state
- Don't log tokens in production

## Integration Examples

### React Component

```javascript
import { useEffect, useState } from 'react';
import { get } from '../services/httpClient';
import * as tokenManager from '../services/tokenManager';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!tokenManager.isAuthenticated()) {
        // Not authenticated, redirect
        window.location.href = '/login';
        return;
      }

      try {
        const userData = await get('/api/user/profile');
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;

  return <div>Welcome, {user.name}!</div>;
}
```

### Protected Route

```javascript
import { Navigate } from 'react-router-dom';
import * as tokenManager from '../services/tokenManager';

function ProtectedRoute({ children }) {
  if (!tokenManager.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

## API Requirements

The backend API must provide these endpoints:

### POST /auth/login

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response:

```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "expiresIn": 3600,
  "user": { "id": 1, "email": "user@example.com" }
}
```

### POST /auth/refresh

```json
{
  "refreshToken": "refresh-token"
}
```

Response:

```json
{
  "accessToken": "new-jwt-token",
  "expiresIn": 3600
}
```

### POST /auth/logout

```json
{
  "refreshToken": "refresh-token"
}
```

Response:

```json
{
  "success": true
}
```

## Troubleshooting

### Token Refresh Loop

**Symptom**: Continuous token refresh requests

**Solution**: Check backend token expiry time. Ensure `expiresIn` is greater than refresh threshold (5 minutes).

### Immediate Logout After Login

**Symptom**: User is logged out immediately after successful login

**Solution**: Ensure token expiry is being set correctly. Check that backend returns `expiresIn` in seconds.

### 401 Errors Not Retried

**Symptom**: 401 errors don't trigger automatic retry

**Solution**: Ensure you're using the `httpClient` from `services/httpClient.js`, not plain `fetch`.

### Tokens Not Persisting

**Symptom**: User loses auth on browser refresh

**Solution**: Ensure "Remember Me" is set to `true` during login to use localStorage instead of sessionStorage.

## Migration Guide

### From Old Auth Service

1. Import the new HTTP client:

```javascript
// Old
import * as authService from './services/authService';
const token = authService.getAccessToken();
fetch(url, { headers: { Authorization: `Bearer ${token}` } });

// New
import { get } from './services/httpClient';
await get(url); // Token automatically injected
```

2. Update authentication checks:

```javascript
// Old
const isAuth = !!authService.getAccessToken();

// New
import * as tokenManager from './services/tokenManager';
const isAuth = tokenManager.isAuthenticated(); // Also checks expiry
```

3. Token storage is now automatic:

```javascript
// Old
localStorage.setItem('accessToken', token);

// New
// Done automatically by authService.login()
```

## Future Enhancements

- [ ] Activity-based session timeout
- [ ] Token refresh retry with exponential backoff
- [ ] Offline token validation
- [ ] Token encryption in storage
- [ ] PKCE support for OAuth
- [ ] Token revocation list support
- [ ] WebSocket token refresh
- [ ] Background token refresh worker

## License

Same as project license.
