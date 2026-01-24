# UI Configuration Endpoints - API Documentation

## Overview

The UI configuration endpoints provide the frontend with all necessary configuration data including bootstrap settings, branding, routes, and page configurations. These endpoints support ETag-based caching, permission filtering, and tenant isolation.

## Base URL

```
http://localhost:4000/ui
```

## Authentication

All endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. GET /ui/bootstrap

Get initial application configuration including user info, permissions, menu, and defaults.

**Request:**
```bash
GET /ui/bootstrap
Authorization: Bearer <jwt_token>
```

**Response:** (200 OK)
```json
{
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "roles": ["admin", "user"]
  },
  "permissions": [
    "dashboard.view",
    "users.view",
    "users.create",
    "settings.view"
  ],
  "tenant": {
    "id": "tenant-001",
    "name": "OpenPortal",
    "brandingVersion": "1.0.0"
  },
  "menu": {
    "items": [
      {
        "id": "home",
        "label": "Home",
        "icon": "home",
        "path": "/",
        "order": 0
      },
      {
        "id": "dashboard",
        "label": "Dashboard",
        "icon": "dashboard",
        "path": "/dashboard",
        "order": 1,
        "permissions": ["dashboard.view"]
      }
    ]
  },
  "defaults": {
    "homePage": "/",
    "theme": "light"
  },
  "featureFlags": {
    "darkMode": true,
    "notifications": true,
    "analytics": true
  }
}
```

**Caching:**
- ETag: Generated from configuration hash
- Cache-Control: `private, max-age=300` (5 minutes)
- Returns 304 Not Modified if ETag matches

**Errors:**
- 401: Authentication required
- 404: User configuration not found

---

### 2. GET /ui/branding

Get tenant branding configuration including colors, typography, spacing, and logos.

**Request:**
```bash
GET /ui/branding?tenantId=tenant-001
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `tenantId` (optional): Tenant ID (defaults to authenticated user's tenant)

**Response:** (200 OK)
```json
{
  "version": "1.0.0",
  "tenantId": "tenant-001",
  "colors": {
    "primary": "#1e40af",
    "secondary": "#64748b",
    "success": "#16a34a",
    "warning": "#ca8a04",
    "error": "#dc2626",
    "background": "#ffffff",
    "surface": "#f8fafc",
    "text": "#0f172a"
  },
  "typography": {
    "fontFamily": "'Inter', sans-serif",
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem"
    },
    "fontWeight": {
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    }
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem"
  },
  "logos": {
    "primary": "/logo.svg",
    "secondary": "/logo-light.svg",
    "favicon": "/favicon.ico"
  },
  "customCSS": "/* Optional custom CSS */"
}
```

**Caching:**
- ETag: Generated from configuration hash
- Cache-Control: `public, max-age=3600` (1 hour)
- Returns 304 Not Modified if ETag matches

**Errors:**
- 400: Tenant ID is required
- 401: Authentication required
- 403: Access denied to tenant branding
- 404: Branding configuration not found

---

### 3. GET /ui/routes/resolve

Resolve a route path to its corresponding page ID and metadata.

**Request:**
```bash
GET /ui/routes/resolve?path=/dashboard
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `path` (required): Route path to resolve (e.g., "/dashboard")

**Response:** (200 OK)
```json
{
  "pageId": "dashboard",
  "params": {},
  "metadata": {
    "title": "Dashboard",
    "permissions": ["dashboard.view"]
  }
}
```

**Response with Parameters:**
```json
{
  "pageId": "user-detail",
  "params": {
    "id": "123"
  },
  "metadata": {
    "title": "User Details",
    "permissions": ["users.view"]
  }
}
```

**Permission Filtering:**
- Returns 404 if user lacks required permissions
- Routes are sorted by priority (descending)
- Supports exact and prefix matching

**Errors:**
- 400: Path parameter is required
- 401: Authentication required
- 404: Route not found or access denied

---

### 4. GET /ui/pages/:pageId

Get full page configuration including widgets, datasources, and actions.

**Request:**
```bash
GET /ui/pages/home
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `pageId` (required): Page identifier

**Response:** (200 OK)
```json
{
  "id": "uuid",
  "pageId": "home",
  "version": "1.0.0",
  "config": {
    "pageId": "home",
    "schemaVersion": "1.0",
    "title": "Home",
    "widgets": [
      {
        "id": "page",
        "type": "Page",
        "props": {
          "title": "Welcome to OpenPortal"
        },
        "children": [
          {
            "id": "section-1",
            "type": "Section",
            "props": {
              "title": "Getting Started"
            },
            "children": [
              {
                "id": "card-1",
                "type": "Card",
                "props": {
                  "title": "Dashboard",
                  "description": "View your personalized dashboard"
                }
              }
            ]
          }
        ]
      }
    ]
  },
  "tenantId": "tenant-001",
  "permissions": [],
  "isActive": true,
  "createdAt": "2026-01-24T20:55:43.570Z",
  "updatedAt": "2026-01-24T20:55:43.570Z"
}
```

**Caching:**
- ETag: Generated from configuration hash
- Cache-Control: `private, max-age=600` (10 minutes)
- Returns 304 Not Modified if ETag matches

**Permission Filtering:**
- Returns 404 if user lacks required permissions
- Only active pages are returned
- Tenant-specific configurations override defaults

**Errors:**
- 401: Authentication required
- 404: Page configuration not found or access denied

---

## Security Features

### Authentication
- All endpoints require valid JWT token
- Token must be included in Authorization header
- Expired tokens return 403 Forbidden

### Permission Filtering
- Menu items filtered by user permissions
- Routes hidden if user lacks access
- Pages return 404 if permissions don't match
- Permissions evaluated based on user roles

### Tenant Isolation
- Users can only access their tenant's data
- Branding configuration restricted by tenant
- Routes and pages filtered by tenant ID
- Cross-tenant access returns 403 Forbidden

### ETag Caching
- SHA-256 hash generated for configurations
- Clients can use If-None-Match header
- 304 Not Modified reduces bandwidth
- Cache-Control headers guide client caching

---

## Usage Examples

### Example 1: Application Initialization

```javascript
// 1. Login to get JWT token
const loginResponse = await fetch('http://localhost:4000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin@example.com',
    password: 'admin123'
  })
});
const { token } = await loginResponse.json();

// 2. Get bootstrap configuration
const bootstrapResponse = await fetch('http://localhost:4000/ui/bootstrap', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const bootstrap = await bootstrapResponse.json();

// 3. Get branding
const brandingResponse = await fetch(
  `http://localhost:4000/ui/branding?tenantId=${bootstrap.tenant.id}`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const branding = await brandingResponse.json();

// 4. Resolve current route
const routeResponse = await fetch(
  'http://localhost:4000/ui/routes/resolve?path=/dashboard',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const route = await routeResponse.json();

// 5. Get page configuration
const pageResponse = await fetch(
  `http://localhost:4000/ui/pages/${route.pageId}`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const pageConfig = await pageResponse.json();
```

### Example 2: ETag Caching

```javascript
let etag = null;

// First request
let response = await fetch('http://localhost:4000/ui/pages/home', {
  headers: { 'Authorization': `Bearer ${token}` }
});
etag = response.headers.get('ETag');
const config = await response.json();

// Subsequent request with ETag
response = await fetch('http://localhost:4000/ui/pages/home', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'If-None-Match': etag
  }
});

if (response.status === 304) {
  console.log('Using cached configuration');
  // Use previously cached config
} else {
  etag = response.headers.get('ETag');
  const newConfig = await response.json();
  // Update cache with new config
}
```

### Example 3: Permission-Based Navigation

```javascript
// Get bootstrap with menu
const bootstrap = await fetch('http://localhost:4000/ui/bootstrap', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Filter menu items user can access
const accessibleMenuItems = bootstrap.menu.items.filter(item => {
  if (!item.permissions || item.permissions.length === 0) {
    return true; // Public menu item
  }
  // Check if user has any required permission
  return item.permissions.some(perm => 
    bootstrap.permissions.includes(perm)
  );
});

// Render navigation
renderNavigation(accessibleMenuItems);
```

---

## Testing

### cURL Examples

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@example.com","password":"admin123"}' \
  | jq -r '.token')

# Get bootstrap
curl -X GET http://localhost:4000/ui/bootstrap \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Get branding
curl -X GET "http://localhost:4000/ui/branding?tenantId=tenant-001" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Resolve route
curl -X GET "http://localhost:4000/ui/routes/resolve?path=/dashboard" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Get page config
curl -X GET http://localhost:4000/ui/pages/home \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Test ETag caching
ETAG=$(curl -s -i -X GET http://localhost:4000/ui/pages/home \
  -H "Authorization: Bearer $TOKEN" | grep -i "etag:" | cut -d':' -f2)
curl -i -X GET http://localhost:4000/ui/pages/home \
  -H "Authorization: Bearer $TOKEN" \
  -H "If-None-Match: $ETAG"
```

---

## Performance Considerations

### Caching Strategy
- Bootstrap: 5 minutes cache (frequently changes)
- Branding: 1 hour cache (rarely changes)
- Pages: 10 minutes cache (moderate changes)
- ETags reduce bandwidth for unchanged resources

### Response Times
- Bootstrap: ~10-50ms (includes menu filtering)
- Branding: ~5-20ms (simple config lookup)
- Route resolution: ~5-15ms (pattern matching)
- Page config: ~10-30ms (includes permission checks)

### Optimization Tips
1. Cache bootstrap config on client for session duration
2. Use ETags for all page config requests
3. Preload frequently accessed pages
4. Implement client-side route caching
5. Use service workers for offline support

---

## Related Documentation

- [Backend README](../backend/README.md)
- [API Specification](./api-specification.md)
- [JSON Schemas](./json-schemas.md)
- [Widget Catalog](./widget-catalog.md)
- [Architecture](./architecture.md)

---

**Version:** 1.0  
**Last Updated:** January 24, 2026  
**Issue:** #025
