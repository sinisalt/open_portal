# Authentication Scenarios

## Overview

This document provides detailed authentication scenarios with complete API call examples, including headers, payloads, and response flows for the OpenPortal platform.

---

## Scenario 1: Username/Password Login

### User Story
As a user, I want to log in to the application using my email and password so that I can access my personalized dashboard.

### Flow Diagram
```
User → Login Page → Enter Credentials → POST /auth/login → Receive Tokens → Redirect to Dashboard
```

### Step-by-Step Flow

#### Step 1: User Navigates to Login Page
**URL:** `https://app.example.com/login`

The login page is rendered from a static page configuration or a hardcoded component (as this is pre-authentication).

#### Step 2: User Enters Credentials and Submits

**Frontend Action:**
```javascript
// User fills form and clicks "Login"
const credentials = {
  email: "john.doe@example.com",
  password: "SecureP@ssw0rd123"
};
```

#### Step 3: Frontend Calls Login API

**HTTP Request:**
```http
POST /api/v1/auth/login HTTP/1.1
Host: api.example.com
Content-Type: application/json
Accept: application/json
User-Agent: OpenPortal-Web/1.0
X-Client-Version: 1.2.3
X-Request-ID: req_login_abc123xyz

{
  "email": "john.doe@example.com",
  "password": "SecureP@ssw0rd123"
}
```

#### Step 4: Backend Validates Credentials

**Success Response (200 OK):**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
Pragma: no-cache
X-Request-ID: req_login_abc123xyz
X-RateLimit-Remaining: 9

{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiaWF0IjoxNzA1NDkxNjAwLCJleHAiOjE3MDU0OTUyMDB9.4Hb8-XyN9kZvQ2fL3mP8rTwVbNcJ5sY7",
  "refreshToken": "rt_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "user123",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://cdn.example.com/avatars/user123.jpg",
    "emailVerified": true,
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "tenant": {
    "id": "tenant456",
    "name": "Acme Corporation",
    "domain": "acme.example.com"
  }
}
```

**Error Response (401 Unauthorized):**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json
X-Request-ID: req_login_abc123xyz

{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "timestamp": "2024-01-17T12:00:00Z",
    "requestId": "req_login_abc123xyz"
  }
}
```

**Error Response (429 Too Many Requests):**
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 300
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705492200

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many login attempts. Please try again in 5 minutes.",
    "timestamp": "2024-01-17T12:00:00Z",
    "requestId": "req_login_abc123xyz",
    "retryAfter": 300
  }
}
```

#### Step 5: Frontend Stores Tokens

```javascript
// Store tokens securely
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('refreshToken', response.refreshToken);
localStorage.setItem('tokenExpiry', Date.now() + (response.expiresIn * 1000));
localStorage.setItem('user', JSON.stringify(response.user));
```

#### Step 6: Frontend Calls Bootstrap API

**HTTP Request:**
```http
GET /api/v1/ui/bootstrap HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
X-Client-Version: 1.2.3
X-Request-ID: req_bootstrap_def456uvw
```

**Success Response (200 OK):**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: private, max-age=300
ETag: "bootstrap-v1.2.3-user123"
X-Request-ID: req_bootstrap_def456uvw

{
  "user": {
    "id": "user123",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://cdn.example.com/avatars/user123.jpg",
    "role": "admin",
    "department": "Engineering"
  },
  "tenant": {
    "id": "tenant456",
    "name": "Acme Corporation",
    "domain": "acme.example.com",
    "logo": "https://cdn.example.com/tenants/tenant456/logo.png",
    "theme": {
      "primaryColor": "#1890ff",
      "logoUrl": "https://cdn.example.com/tenants/tenant456/logo.png"
    }
  },
  "permissions": [
    "dashboard.view",
    "profile.view",
    "profile.edit",
    "users.view",
    "users.create",
    "users.edit",
    "listings.view",
    "listings.create",
    "listings.edit",
    "listings.delete",
    "reports.view",
    "reports.export",
    "settings.view",
    "settings.edit"
  ],
  "menu": [
    {
      "id": "dashboard",
      "label": "Dashboard",
      "icon": "DashboardOutlined",
      "route": "/dashboard",
      "order": 1,
      "permission": "dashboard.view"
    },
    {
      "id": "listings",
      "label": "Listings",
      "icon": "UnorderedListOutlined",
      "route": "/listings",
      "order": 2,
      "permission": "listings.view",
      "children": [
        {
          "id": "listings-active",
          "label": "Active Listings",
          "route": "/listings/active",
          "order": 1
        },
        {
          "id": "listings-archived",
          "label": "Archived",
          "route": "/listings/archived",
          "order": 2
        }
      ]
    },
    {
      "id": "users",
      "label": "Users",
      "icon": "UserOutlined",
      "route": "/users",
      "order": 3,
      "permission": "users.view"
    },
    {
      "id": "reports",
      "label": "Reports",
      "icon": "BarChartOutlined",
      "route": "/reports",
      "order": 4,
      "permission": "reports.view"
    },
    {
      "id": "settings",
      "label": "Settings",
      "icon": "SettingOutlined",
      "route": "/settings",
      "order": 5,
      "permission": "settings.view"
    }
  ],
  "defaultRoute": "/dashboard",
  "uiConfigVersion": "v1.2.3",
  "schemaVersion": "1.0",
  "featureFlags": {
    "newDashboard": true,
    "advancedReports": true,
    "betaFeatures": false,
    "aiAssistant": true
  },
  "preferences": {
    "locale": "en-US",
    "timezone": "America/New_York",
    "dateFormat": "MM/DD/YYYY",
    "timeFormat": "12h"
  }
}
```

#### Step 7: Frontend Navigates to Default Route

```javascript
// Navigate to default route from bootstrap response
window.location.href = response.defaultRoute; // "/dashboard"
```

---

## Scenario 2: OAuth/SSO Login

### User Story
As a user, I want to log in using my Google account so that I don't need to remember another password.

### Flow Diagram
```
User → Login Page → Click "Sign in with Google" → Redirect to Google → 
User Authenticates → Google Redirects Back → POST /auth/oauth/callback → 
Receive Tokens → Redirect to Dashboard
```

### Step-by-Step Flow

#### Step 1: User Navigates to Login Page
**URL:** `https://app.example.com/login`

#### Step 2: Frontend Fetches Available OAuth Providers

**HTTP Request:**
```http
GET /api/v1/auth/oauth/providers HTTP/1.1
Host: api.example.com
Accept: application/json
X-Client-Version: 1.2.3
```

**Success Response (200 OK):**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: public, max-age=3600

{
  "providers": [
    {
      "id": "google",
      "name": "Google",
      "displayName": "Sign in with Google",
      "icon": "https://cdn.example.com/icons/google.svg",
      "enabled": true,
      "authUrl": "https://accounts.google.com/o/oauth2/v2/auth",
      "clientId": "your-google-client-id.apps.googleusercontent.com",
      "scopes": ["openid", "email", "profile"]
    },
    {
      "id": "microsoft",
      "name": "Microsoft",
      "displayName": "Sign in with Microsoft",
      "icon": "https://cdn.example.com/icons/microsoft.svg",
      "enabled": true,
      "authUrl": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
      "clientId": "your-microsoft-client-id",
      "scopes": ["openid", "email", "profile"]
    },
    {
      "id": "azure-ad",
      "name": "Azure AD",
      "displayName": "Sign in with Azure AD (SSO)",
      "icon": "https://cdn.example.com/icons/azure.svg",
      "enabled": true,
      "authUrl": "https://login.microsoftonline.com/your-tenant-id/oauth2/v2.0/authorize",
      "clientId": "your-azure-client-id",
      "scopes": ["openid", "email", "profile"]
    }
  ]
}
```

#### Step 3: User Clicks "Sign in with Google"

**Frontend generates OAuth URL:**
```javascript
const provider = providers.find(p => p.id === 'google');
const state = generateRandomState(); // CSRF protection
const redirectUri = encodeURIComponent('https://app.example.com/auth/callback');
const scopes = encodeURIComponent(provider.scopes.join(' '));

// Store state for validation
sessionStorage.setItem('oauth_state', state);
sessionStorage.setItem('oauth_provider', 'google');

const authUrl = `${provider.authUrl}?` +
  `client_id=${provider.clientId}&` +
  `redirect_uri=${redirectUri}&` +
  `response_type=code&` +
  `scope=${scopes}&` +
  `state=${state}&` +
  `access_type=offline&` +
  `prompt=consent`;

// Redirect to Google
window.location.href = authUrl;
```

#### Step 4: User Authenticates with Google

User is redirected to Google's login page, authenticates, and grants permissions.

#### Step 5: Google Redirects Back to Application

**Callback URL:**
```
https://app.example.com/auth/callback?
  code=4/0AY0e-g7Z1xQ9W8Y6V5U4T3S2R1P0O9N8M7L6K5J4I3H2G1F0&
  state=abc123xyz789&
  scope=email%20profile%20openid
```

#### Step 6: Frontend Validates State and Exchanges Code

**Frontend Validation:**
```javascript
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');
const storedState = sessionStorage.getItem('oauth_state');
const provider = sessionStorage.getItem('oauth_provider');

if (state !== storedState) {
  throw new Error('Invalid state parameter - possible CSRF attack');
}
```

**HTTP Request to Backend:**
```http
POST /api/v1/auth/oauth/callback HTTP/1.1
Host: api.example.com
Content-Type: application/json
Accept: application/json
X-Client-Version: 1.2.3
X-Request-ID: req_oauth_callback_ghi789jkl

{
  "provider": "google",
  "code": "4/0AY0e-g7Z1xQ9W8Y6V5U4T3S2R1P0O9N8M7L6K5J4I3H2G1F0",
  "redirectUri": "https://app.example.com/auth/callback",
  "state": "abc123xyz789"
}
```

#### Step 7: Backend Exchanges Code with OAuth Provider

Backend makes request to Google to exchange authorization code for tokens.

**Backend's Request to Google:**
```http
POST /token HTTP/1.1
Host: oauth2.googleapis.com
Content-Type: application/x-www-form-urlencoded

code=4/0AY0e-g7Z1xQ9W8Y6V5U4T3S2R1P0O9N8M7L6K5J4I3H2G1F0&
client_id=your-google-client-id.apps.googleusercontent.com&
client_secret=your-google-client-secret&
redirect_uri=https://app.example.com/auth/callback&
grant_type=authorization_code
```

**Google's Response to Backend:**
```json
{
  "access_token": "ya29.a0AfH6SMBx...",
  "expires_in": 3599,
  "refresh_token": "1//0gZ1xQ9W8Y6V...",
  "scope": "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
  "token_type": "Bearer",
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjI3..."
}
```

#### Step 8: Backend Fetches User Info and Creates/Updates User

**Backend's Request to Google:**
```http
GET /oauth2/v2/userinfo HTTP/1.1
Host: www.googleapis.com
Authorization: Bearer ya29.a0AfH6SMBx...
```

**Google's Response:**
```json
{
  "id": "110169484474386276334",
  "email": "john.doe@example.com",
  "verified_email": true,
  "name": "John Doe",
  "given_name": "John",
  "family_name": "Doe",
  "picture": "https://lh3.googleusercontent.com/a-/AOh14Gh...",
  "locale": "en"
}
```

#### Step 9: Backend Returns OpenPortal Tokens

**Success Response (200 OK):**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
Pragma: no-cache
X-Request-ID: req_oauth_callback_ghi789jkl

{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "rt_oauth_a1b2c3d4e5f6g7h8i9j0",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "user123",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://lh3.googleusercontent.com/a-/AOh14Gh...",
    "emailVerified": true,
    "authProvider": "google",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "tenant": {
    "id": "tenant456",
    "name": "Acme Corporation",
    "domain": "acme.example.com"
  },
  "isNewUser": false
}
```

#### Step 10: Frontend Stores Tokens and Calls Bootstrap

Same as Steps 5-7 in Username/Password Login scenario.

---

## Scenario 3: Token Refresh

### User Story
As a logged-in user, I want my session to be automatically refreshed so that I don't get logged out while actively using the application.

### Flow Diagram
```
Access Token Expires → Frontend Detects → POST /auth/refresh → 
Receive New Access Token → Retry Original Request
```

### Step-by-Step Flow

#### Step 1: Access Token Expiration Detection

```javascript
// Before making any authenticated request
function isTokenExpired() {
  const expiry = localStorage.getItem('tokenExpiry');
  return Date.now() >= parseInt(expiry) - (60 * 1000); // Refresh 1 min before expiry
}

// Axios interceptor example
axios.interceptors.request.use(async (config) => {
  if (isTokenExpired()) {
    await refreshAccessToken();
  }
  config.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
  return config;
});
```

#### Step 2: Frontend Calls Refresh Token Endpoint

**HTTP Request:**
```http
POST /api/v1/auth/refresh HTTP/1.1
Host: api.example.com
Content-Type: application/json
Accept: application/json
X-Client-Version: 1.2.3
X-Request-ID: req_refresh_mno012pqr

{
  "refreshToken": "rt_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

**Success Response (200 OK):**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
Pragma: no-cache
X-Request-ID: req_refresh_mno012pqr

{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

**Error Response (401 Unauthorized - Refresh Token Expired):**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json
X-Request-ID: req_refresh_mno012pqr

{
  "error": {
    "code": "REFRESH_TOKEN_EXPIRED",
    "message": "Refresh token has expired. Please log in again.",
    "timestamp": "2024-01-17T12:00:00Z",
    "requestId": "req_refresh_mno012pqr"
  }
}
```

#### Step 3: Frontend Updates Stored Token

```javascript
// On success
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('tokenExpiry', Date.now() + (response.expiresIn * 1000));

// On error - redirect to login
if (response.error && response.error.code === 'REFRESH_TOKEN_EXPIRED') {
  localStorage.clear();
  window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
}
```

---

## Scenario 4: Logout

### User Story
As a logged-in user, I want to log out of the application to secure my account.

### Step-by-Step Flow

#### Step 1: User Clicks Logout

#### Step 2: Frontend Calls Logout API

**HTTP Request:**
```http
POST /api/v1/auth/logout HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Client-Version: 1.2.3
X-Request-ID: req_logout_stu345vwx

{
  "refreshToken": "rt_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

**Success Response (200 OK):**
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Request-ID: req_logout_stu345vwx

{
  "success": true,
  "message": "Successfully logged out"
}
```

#### Step 3: Frontend Clears Local Storage and Redirects

```javascript
// Clear all stored auth data
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
localStorage.removeItem('tokenExpiry');
localStorage.removeItem('user');
sessionStorage.clear();

// Redirect to login page
window.location.href = '/login';
```

---

## Security Considerations

### Token Storage
- **Access Token**: Store in memory or localStorage (short-lived, 15-60 minutes)
- **Refresh Token**: Store in localStorage or httpOnly cookie (longer-lived, days/weeks)
- **Never** expose tokens in URLs or logs

### HTTPS Only
All authentication endpoints **must** be served over HTTPS in production.

### Rate Limiting
- Login attempts: 5 per IP per 15 minutes
- Token refresh: 10 per user per hour
- OAuth callbacks: 3 per state token

### CSRF Protection
- Use state parameter in OAuth flows
- Implement CSRF tokens for cookie-based auth
- Validate Origin/Referer headers

### Token Security
- Access tokens: Short TTL (15-60 minutes)
- Refresh tokens: Longer TTL (7-30 days)
- Rotate refresh tokens on each use (optional)
- Implement token revocation endpoint

---

**Version:** 1.0
**Last Updated:** January 18, 2026
**Related Documents:**
- [API Specification](./api-specification.md)
- [User Profile Scenarios](./user-profile-scenarios.md)
- [Architecture](./architecture.md)
