# API Specification

## Overview

This document defines the API surface required for the OpenPortal platform. All endpoints follow RESTful principles with JSON payloads.

## Base URL

```
https://api.example.com/v1
```

## Authentication APIs

### POST /auth/login
Authenticate user with credentials.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "dGhpc2lz...",
  "expiresIn": 3600,
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refreshToken": "dGhpc2lz..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbG...",
  "expiresIn": 3600
}
```

### POST /auth/logout
Invalidate current session.

**Request:**
```json
{
  "refreshToken": "dGhpc2lz..."
}
```

**Response:**
```json
{
  "success": true
}
```

### GET /auth/oauth/providers
Get available OAuth providers.

**Response:**
```json
{
  "providers": [
    {
      "id": "google",
      "name": "Google",
      "authUrl": "https://accounts.google.com/o/oauth2/v2/auth",
      "clientId": "your-client-id"
    },
    {
      "id": "microsoft",
      "name": "Microsoft",
      "authUrl": "https://login.microsoftonline.com/oauth2/v2.0/authorize",
      "clientId": "your-client-id"
    }
  ]
}
```

## Tenant Management APIs

### GET /tenants
List all tenants (admin only).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "tenants": [
    {
      "id": "tenant-001",
      "name": "Default Tenant",
      "subdomain": "app",
      "domain": "localhost",
      "isActive": true,
      "featureFlags": {
        "darkMode": true,
        "notifications": true,
        "analytics": true,
        "websockets": true
      },
      "metadata": {
        "industry": "Technology",
        "size": "small"
      },
      "createdAt": "2026-01-25T21:32:30.201Z",
      "updatedAt": "2026-01-25T21:32:30.201Z"
    }
  ]
}
```

### GET /tenants/:id
Get tenant details.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "id": "tenant-001",
  "name": "Default Tenant",
  "subdomain": "app",
  "domain": "localhost",
  "isActive": true,
  "featureFlags": {
    "darkMode": true,
    "notifications": true,
    "analytics": true,
    "websockets": true
  },
  "metadata": {
    "industry": "Technology",
    "size": "small"
  },
  "createdAt": "2026-01-25T21:32:30.201Z",
  "updatedAt": "2026-01-25T21:32:30.201Z"
}
```

### POST /tenants
Create a new tenant (admin only).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "name": "Acme Corporation",
  "subdomain": "acme",
  "domain": "acme.example.com",
  "featureFlags": {
    "darkMode": true,
    "notifications": true,
    "analytics": false,
    "websockets": true
  },
  "metadata": {
    "industry": "Manufacturing",
    "size": "large"
  }
}
```

**Response:**
```json
{
  "id": "tenant-002",
  "name": "Acme Corporation",
  "subdomain": "acme",
  "domain": "acme.example.com",
  "isActive": true,
  "featureFlags": {
    "darkMode": true,
    "notifications": true,
    "analytics": false,
    "websockets": true
  },
  "metadata": {
    "industry": "Manufacturing",
    "size": "large"
  },
  "createdAt": "2026-01-25T21:33:07.576Z",
  "updatedAt": "2026-01-25T21:33:07.576Z"
}
```

### PATCH /tenants/:id
Update tenant (admin only).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "name": "Acme Corporation Updated",
  "featureFlags": {
    "analytics": true
  }
}
```

**Response:**
```json
{
  "id": "tenant-002",
  "name": "Acme Corporation Updated",
  "subdomain": "acme",
  "domain": "acme.example.com",
  "isActive": true,
  "featureFlags": {
    "darkMode": true,
    "notifications": true,
    "analytics": true,
    "websockets": true
  },
  "metadata": {
    "industry": "Manufacturing",
    "size": "large"
  },
  "createdAt": "2026-01-25T21:32:30.201Z",
  "updatedAt": "2026-01-25T21:33:12.308Z"
}
```

### DELETE /tenants/:id
Deactivate tenant (admin only).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "Tenant deactivated successfully"
}
```

## Tenant Identification

The system supports multiple methods for identifying the tenant context:

1. **X-Tenant-ID Header** (Highest Priority)
   ```
   X-Tenant-ID: tenant-002
   ```

2. **Subdomain** (Second Priority)
   - Request to `acme.example.com` resolves to tenant with `subdomain: "acme"`

3. **Domain** (Third Priority)
   - Request to `acme.example.com` resolves to tenant with `domain: "acme.example.com"`

4. **Default Fallback** (Lowest Priority)
   - Falls back to default tenant (`tenant-001`) if no match found

## UI Bootstrap API

### GET /ui/bootstrap
Get initial application configuration after authentication.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://cdn.example.com/avatars/user123.jpg"
  },
  "tenant": {
    "id": "tenant456",
    "name": "Acme Corp",
    "domain": "acme.example.com",
    "brandingVersion": "1.2.0"
  },
  "permissions": [
    "dashboard.view",
    "profile.edit",
    "listings.create",
    "reports.view"
  ],
  "menu": [
    {
      "id": "dashboard",
      "label": "Dashboard",
      "icon": "home",
      "route": "/dashboard",
      "order": 1
    },
    {
      "id": "listings",
      "label": "Listings",
      "icon": "list",
      "route": "/listings",
      "order": 2
    }
  ],
  "defaultRoute": "/dashboard",
  "uiConfigVersion": "v1.2.3",
  "schemaVersion": "1.0",
  "branding": {
    "version": "1.2.0",
    "url": "/ui/branding?tenantId=tenant456"
  },
  "featureFlags": {
    "newDashboard": true,
    "betaFeatures": false
  },
  "routes": [
    {
      "pattern": "/dashboard",
      "pageId": "dashboard-page",
      "metadata": {
        "title": "Dashboard",
        "icon": "dashboard"
      }
    },
    {
      "pattern": "/user/:id",
      "pageId": "user-profile",
      "permissions": ["user.view"],
      "metadata": {
        "title": "User Profile"
      }
    },
    {
      "pattern": "/admin/:section",
      "pageId": "admin-panel",
      "permissions": ["admin.access"],
      "priority": 10
    }
  ]
}
```

**Note:** The `routes` array is optional. If not provided, the application falls back to static routing.

## Route Resolution API

### GET /ui/routes/resolve

Resolve a URL path to page configuration using route patterns. This endpoint is optional and used when dynamic route resolution is needed server-side.

**Query Parameters:**
- `path` (required): The URL path to resolve (e.g., `/dashboard`, `/user/123`)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "pageId": "user-profile",
  "params": {
    "id": "123"
  },
  "metadata": {
    "title": "User Profile",
    "icon": "user"
  },
  "hasPermission": true,
  "route": {
    "pattern": "/user/:id",
    "pageId": "user-profile",
    "permissions": ["user.view"],
    "metadata": {
      "title": "User Profile",
      "icon": "user"
    }
  }
}
```

**Response (404 Not Found):**
```json
{
  "error": "Route not found",
  "message": "No route configuration matches path: /non-existent",
  "path": "/non-existent"
}
```

**Response (403 Forbidden):**
```json
{
  "error": "Insufficient permissions",
  "message": "User does not have required permissions for this route",
  "path": "/admin/users",
  "requiredPermissions": ["admin.access"],
  "userPermissions": []
}
```

**Route Configuration in Bootstrap:**

The `routes` array in the bootstrap response provides client-side route configuration. Each route object supports:

```typescript
{
  pattern: string;        // Route pattern (e.g., "/user/:id")
  pageId: string;         // Page identifier to load
  permissions?: string[]; // Required permissions (all must match)
  redirect?: string;      // Redirect to another route
  exact?: boolean;        // Exact match required
  priority?: number;      // Matching priority (higher = first)
  metadata?: {            // Route metadata
    title?: string;
    description?: string;
    icon?: string;
    [key: string]: unknown;
  };
}
```

**Supported Route Patterns:**
- Static: `/dashboard`
- Dynamic parameters: `/user/:id`
- Optional parameters: `/search/:term?`
- Wildcard: `/docs/*`
- Nested: `/settings/profile`



## Branding API

### GET /ui/branding
Get tenant-specific branding configuration (logos, colors, typography, theme).

**Query Parameters:**
- `tenantId` (required): The tenant identifier

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "tenantId": "tenant456",
  "version": "1.2.0",
  "lastUpdated": "2026-01-15T10:30:00Z",
  "branding": {
    "logos": {
      "primary": {
        "url": "https://cdn.example.com/tenants/acme/logo-primary.svg",
        "altText": "Acme Corporation",
        "width": 180,
        "height": 50
      },
      "login": {
        "url": "https://cdn.example.com/tenants/acme/logo-login.svg",
        "altText": "Acme Corporation",
        "width": 300,
        "height": 100
      },
      "favicon": {
        "url": "https://cdn.example.com/tenants/acme/favicon.ico"
      },
      "mobileIcons": {
        "icon192": "https://cdn.example.com/tenants/acme/icon-192.png",
        "icon512": "https://cdn.example.com/tenants/acme/icon-512.png"
      }
    },
    "colors": {
      "primary": {
        "50": "#e3f2fd",
        "500": "#2196f3",
        "900": "#0d47a1"
      },
      "secondary": {
        "50": "#fce4ec",
        "500": "#e91e63",
        "900": "#880e4f"
      },
      "success": "#4caf50",
      "warning": "#ff9800",
      "error": "#f44336",
      "info": "#2196f3",
      "background": {
        "default": "#ffffff",
        "paper": "#f5f5f5"
      },
      "text": {
        "primary": "#212121",
        "secondary": "#757575"
      }
    },
    "typography": {
      "fontFamily": {
        "primary": "'Roboto', sans-serif",
        "secondary": "'Open Sans', sans-serif"
      },
      "googleFonts": [
        {
          "name": "Roboto",
          "weights": [300, 400, 500, 700]
        },
        {
          "name": "Open Sans",
          "weights": [400, 600]
        }
      ],
      "sizes": {
        "h1": "2.5rem",
        "h2": "2rem",
        "body1": "1rem",
        "body2": "0.875rem"
      }
    },
    "spacing": {
      "unit": 8,
      "scale": [0, 4, 8, 16, 24, 32, 48, 64]
    },
    "borderRadius": {
      "small": "4px",
      "medium": "8px",
      "large": "16px"
    }
  },
  "cacheControl": "public, max-age=3600",
  "etag": "W/\"1.2.0-tenant456\""
}
```

**Response (Default Branding - No Custom Tenant Branding):**
```json
{
  "tenantId": "default",
  "version": "1.0.0",
  "isDefault": true,
  "branding": {
    "logos": {
      "primary": {
        "url": "https://cdn.example.com/default/logo-primary.svg",
        "altText": "OpenPortal",
        "width": 180,
        "height": 50
      },
      "login": {
        "url": "https://cdn.example.com/default/logo-login.svg",
        "altText": "OpenPortal",
        "width": 300,
        "height": 100
      }
    },
    "colors": {
      "primary": {
        "500": "#1976d2"
      }
    }
  }
}
```

**Cache Headers:**
```
ETag: W/"1.2.0-tenant456"
Cache-Control: public, max-age=3600
```

**Error Response (Tenant Not Found - Fallback to Default):**
```json
{
  "tenantId": "default",
  "version": "1.0.0",
  "isDefault": true,
  "message": "Tenant branding not found, using default",
  "branding": { /* default branding */ }
}
```

## Route Resolution API

### GET /ui/routes/resolve
Resolve a route path to page configuration.

**Query Parameters:**
- `path` (required): The route path to resolve (e.g., `/profile/123`)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request:**
```
GET /ui/routes/resolve?path=/profile/123
```

**Response:**
```json
{
  "pageId": "profile-page",
  "routeParams": {
    "id": "123"
  },
  "accessAllowed": true,
  "fallbackPageId": null
}
```

**Response (Access Denied):**
```json
{
  "pageId": null,
  "routeParams": {},
  "accessAllowed": false,
  "fallbackPageId": "access-denied-page",
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource"
  }
}
```

## Page Configuration API

### GET /ui/pages/:pageId
Get page configuration including layout, widgets, datasources, and actions.

**Headers:**
```
Authorization: Bearer <accessToken>
If-None-Match: "etag-value"
```

**Response:**
```json
{
  "pageId": "dashboard-page",
  "schemaVersion": "1.0",
  "configVersion": "v1.2.3-20240117",
  "title": "Dashboard",
  "description": "Main dashboard view",
  "layout": {
    "type": "grid",
    "grid": {
      "columns": 12,
      "gap": "md",
      "breakpoints": {
        "xs": 12,
        "sm": 12,
        "md": 12,
        "lg": 12
      }
    }
  },
  "widgets": [
    {
      "id": "kpi-section",
      "type": "Section",
      "props": {
        "title": "Key Metrics"
      },
      "children": [
        {
          "id": "revenue-kpi",
          "type": "KPI",
          "props": {
            "label": "Total Revenue",
            "format": "currency"
          },
          "datasourceId": "revenue-data",
          "bindings": {
            "value": {
              "dataPath": "datasources.revenue-data.value"
            }
          }
        }
      ]
    },
    {
      "id": "sales-chart",
      "type": "Chart",
      "props": {
        "chartType": "line",
        "height": 400
      },
      "datasourceId": "sales-data",
      "bindings": {
        "data": {
          "dataPath": "datasources.sales-data.series"
        }
      }
    }
  ],
  "datasources": [
    {
      "id": "revenue-data",
      "kind": "http",
      "fetchPolicy": {
        "mode": "onMount"
      },
      "http": {
        "method": "GET",
        "url": "/api/kpi/revenue"
      }
    },
    {
      "id": "sales-data",
      "kind": "http",
      "fetchPolicy": {
        "mode": "onMount"
      },
      "http": {
        "method": "GET",
        "url": "/api/sales/chart-data"
      }
    }
  ],
  "actions": [],
  "events": [
    {
      "on": "onLoad",
      "do": ["fetchRevenue", "fetchSales"]
    }
  ],
  "generatedAt": "2024-01-17T12:00:00Z"
}
```

**Response Headers:**
```
ETag: "v1.2.3-20240117-abc123"
Last-Modified: Wed, 17 Jan 2024 12:00:00 GMT
Cache-Control: private, max-age=3600
```

**304 Not Modified Response:**
When `If-None-Match` matches current ETag, return empty body with 304 status.

## Data Query API

### POST /ui/data/query
Unified endpoint for data fetching.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "datasourceId": "user-listings",
  "filters": {
    "status": "active",
    "userId": "user123"
  },
  "pagination": {
    "page": 1,
    "pageSize": 20
  },
  "sorting": {
    "field": "createdAt",
    "direction": "desc"
  }
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "listing1",
      "title": "Modern Apartment",
      "status": "active",
      "price": 2500,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3
  }
}
```

## Actions API

### POST /ui/actions/execute
Execute a backend-defined action.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "actionId": "save-profile",
  "context": {
    "formValues": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "routeParams": {
      "id": "user123"
    },
    "selection": null
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "result": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "updatedAt": "2024-01-17T12:00:00Z"
  },
  "patches": [
    {
      "op": "set",
      "path": "profile.name",
      "value": "John Doe"
    }
  ],
  "messages": [
    {
      "type": "success",
      "text": "Profile updated successfully"
    }
  ],
  "navigate": null,
  "modal": null
}
```

**Response (Error):**
```json
{
  "success": false,
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Validation failed",
      "fieldErrors": [
        {
          "path": "values.email",
          "message": "Email address is already in use",
          "severity": "error"
        }
      ]
    }
  ]
}
```

**Response (With Navigation):**
```json
{
  "success": true,
  "result": {
    "id": "listing789"
  },
  "navigate": {
    "to": "/listings/listing789",
    "replace": false
  },
  "messages": [
    {
      "type": "success",
      "text": "Listing created successfully"
    }
  ]
}
```

**Response (With Modal):**
```json
{
  "success": true,
  "modal": {
    "modalPageId": "confirm-delete-modal",
    "props": {
      "itemId": "listing123",
      "itemTitle": "Modern Apartment"
    }
  }
}
```

## Validation API

### POST /ui/validate
Validate form data server-side.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "formId": "profile-form",
  "values": {
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": {
      "city": "New York",
      "zipCode": "10001"
    }
  },
  "context": {
    "userId": "user123"
  }
}
```

**Response:**
```json
{
  "valid": false,
  "errors": [
    {
      "path": "values.email",
      "message": "This email is already registered",
      "severity": "error"
    },
    {
      "path": "values.phone",
      "message": "Phone number format may be invalid",
      "severity": "warning"
    }
  ],
  "computedValues": {
    "address.country": "United States"
  },
  "visibilityChanges": {
    "internationalShipping": true
  }
}
```

## WebSocket API

### Connection
```
wss://api.example.com/v1/ui/ws?token=<accessToken>
```

### Subscribe to Topic
```json
{
  "action": "subscribe",
  "topic": "tenant:tenant456:dashboard"
}
```

### Unsubscribe from Topic
```json
{
  "action": "unsubscribe",
  "topic": "tenant:tenant456:dashboard"
}
```

### Receive Update
```json
{
  "type": "update",
  "topic": "tenant:tenant456:dashboard",
  "data": {
    "datasourceId": "revenue-data",
    "value": 125000,
    "change": "+5.2%"
  },
  "timestamp": "2024-01-17T12:00:00Z"
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "timestamp": "2024-01-17T12:00:00Z",
    "requestId": "req_abc123"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` (401): Authentication required or invalid token
- `FORBIDDEN` (403): User lacks required permissions
- `NOT_FOUND` (404): Requested resource not found
- `VALIDATION_ERROR` (400): Input validation failed
- `CONFLICT` (409): Resource conflict (e.g., duplicate)
- `INTERNAL_ERROR` (500): Server error
- `SERVICE_UNAVAILABLE` (503): Service temporarily unavailable

---

## WebSocket API

### WebSocket Connection

**Endpoint:** `ws://api.example.com/ws?token={jwt_token}`

**Authentication:**
- JWT token must be provided as a query parameter
- Token is validated on connection
- Connection is rejected if token is invalid or expired

**Message Format:**
All messages are JSON with the following structure:
```json
{
  "type": "message_type",
  "topic": "optional_topic",
  "data": {},
  "timestamp": 1234567890,
  "messageId": "unique_id"
}
```

### Message Types

#### Client to Server

**1. SUBSCRIBE**
Subscribe to a topic to receive messages.

```json
{
  "type": "subscribe",
  "topic": "dashboard-updates"
}
```

**Response:**
```json
{
  "type": "subscribed",
  "topic": "dashboard-updates",
  "data": {
    "presenceCount": 5
  },
  "timestamp": 1234567890
}
```

**2. UNSUBSCRIBE**
Unsubscribe from a topic.

```json
{
  "type": "unsubscribe",
  "topic": "dashboard-updates"
}
```

**Response:**
```json
{
  "type": "unsubscribed",
  "topic": "dashboard-updates",
  "timestamp": 1234567890
}
```

**3. PUBLISH**
Publish a message to a topic.

```json
{
  "type": "publish",
  "topic": "user-activity",
  "data": {
    "action": "update",
    "resourceId": "123"
  }
}
```

**4. PING**
Heartbeat to keep connection alive.

```json
{
  "type": "ping"
}
```

**Response:**
```json
{
  "type": "pong",
  "timestamp": 1234567890
}
```

#### Server to Client

**1. MESSAGE**
Message published to a subscribed topic.

```json
{
  "type": "message",
  "topic": "dashboard-updates",
  "data": {
    "metric": "sales",
    "value": 12345
  },
  "timestamp": 1234567890,
  "messageId": "msg-abc-123"
}
```

**2. PRESENCE**
Presence update for a topic (subscriber count changes).

```json
{
  "type": "presence",
  "topic": "dashboard-updates",
  "data": {
    "presenceCount": 6
  },
  "timestamp": 1234567890
}
```

**3. ERROR**
Error message from server.

```json
{
  "type": "error",
  "data": {
    "error": "Subscription failed"
  },
  "timestamp": 1234567890
}
```

### WebSocket HTTP Endpoints

#### GET /ws/stats
Get WebSocket server statistics.

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "topics": [
    {
      "topic": "dashboard-updates",
      "subscribers": 5
    },
    {
      "topic": "notifications",
      "subscribers": 12
    }
  ],
  "totalTopics": 2,
  "totalSubscribers": 17
}
```

#### POST /ws/publish
Publish a message to a topic via HTTP.

**Authentication:** Required (Bearer token)

**Request:**
```json
{
  "topic": "notifications",
  "data": {
    "title": "New Alert",
    "message": "System update completed"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message published to topic: notifications"
}
```

### Topic Naming Conventions

Topics should follow a hierarchical naming pattern:
- `<scope>:<resource>:<action>` - e.g., `dashboard:sales:update`
- `<resource>:<id>` - e.g., `user:123`
- Special topics:
  - `<topic>:presence` - Presence updates for a topic (automatic)

### Connection Management

**Reconnection:**
- Client should implement exponential backoff for reconnection
- Recommended: Start with 1s delay, max 30s delay
- Max reconnection attempts: 10

**Heartbeat:**
- Server pings clients every 30 seconds
- Client should respond with pong or connection will be terminated
- Client can also send ping messages for keep-alive

**Message Queuing:**
- Messages sent during disconnection should be queued (max 100 messages)
- Queue is flushed when connection is re-established
- Older messages are dropped when queue is full

### Usage Examples

#### JavaScript/TypeScript Client

```typescript
// Connect with authentication
const token = getAccessToken();
const ws = new WebSocket(`ws://api.example.com/ws?token=${token}`);

ws.onopen = () => {
  // Subscribe to topic
  ws.send(JSON.stringify({
    type: 'subscribe',
    topic: 'dashboard-updates'
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'message') {
    console.log('Received:', message.data);
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  // Implement reconnection logic
  setTimeout(() => reconnect(), 1000);
};
```

#### Using WebSocket Datasource

```typescript
// Configuration
const config: WebSocketDatasourceConfig = {
  id: 'dashboard-ws',
  type: 'websocket',
  config: {
    url: 'ws://api.example.com/ws',
    reconnect: true,
    reconnectDelay: 1000,
    onMessage: (data) => {
      console.log('Message received:', data);
    },
    onOpen: () => {
      console.log('Connected');
    },
    onClose: () => {
      console.log('Disconnected');
    }
  }
};

// Using the hook
const { isConnected, lastMessage, publish, subscribe } = useWebSocket({
  url: 'ws://api.example.com/ws',
  topic: 'dashboard-updates',
  onMessage: (data) => {
    console.log('Update:', data);
  }
});

// Publish message
publish('user-activity', { action: 'click', button: 'save' });
```

---

## Configuration Governance APIs

The Configuration Governance APIs provide version control, validation, deployment, and rollback capabilities for all configuration types (page, route, branding, menu).

### POST /config/validate

Validate a configuration against all applicable rules.

**Request:**
```json
{
  "configType": "page",
  "config": {
    "layout": { "type": "grid" },
    "widgets": [
      { "id": "widget-1", "type": "text" }
    ]
  }
}
```

**Response:**
```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    {
      "rule": "Naming Convention",
      "message": "Field 'pageId' should match naming convention",
      "path": "pageId"
    }
  ]
}
```

### POST /config/versions

Create a new configuration version.

**Request:**
```json
{
  "configType": "page",
  "configId": "dashboard-page",
  "config": {
    "layout": { "type": "grid" },
    "widgets": []
  },
  "environment": "dev",
  "changeDescription": "Updated dashboard layout"
}
```

**Response:**
```json
{
  "id": "version-123",
  "tenantId": "tenant-001",
  "configType": "page",
  "configId": "dashboard-page",
  "version": "1.0.1",
  "config": { ... },
  "changeDescription": "Updated dashboard layout",
  "changedBy": "user-123",
  "deploymentStatus": "draft",
  "environment": "dev",
  "validationStatus": "passed",
  "createdAt": "2026-01-25T12:00:00Z"
}
```

### GET /config/versions

List configuration versions with optional filters.

**Query Parameters:**
- `configType` (optional): Filter by config type (page, route, branding, menu)
- `configId` (optional): Filter by config ID
- `environment` (optional): Filter by environment (dev, staging, prod)

**Response:**
```json
{
  "versions": [
    {
      "id": "version-123",
      "version": "1.0.1",
      "deploymentStatus": "deployed",
      "validationStatus": "passed",
      ...
    }
  ]
}
```

### GET /config/versions/:id

Get a specific configuration version.

**Response:**
```json
{
  "id": "version-123",
  "tenantId": "tenant-001",
  "configType": "page",
  "configId": "dashboard-page",
  "version": "1.0.1",
  "config": { ... },
  "deploymentStatus": "deployed",
  "validationStatus": "passed",
  "createdAt": "2026-01-25T12:00:00Z"
}
```

### GET /config/diff

Get diff between two configuration versions.

**Query Parameters:**
- `fromVersion` (required): Source version ID
- `toVersion` (required): Target version ID

**Response:**
```json
{
  "configType": "page",
  "configId": "dashboard-page",
  "fromVersion": "1.0.0",
  "toVersion": "1.0.1",
  "changes": [
    {
      "path": "widgets",
      "type": "modified",
      "oldValue": [...],
      "newValue": [...]
    },
    {
      "path": "layout.columns",
      "type": "added",
      "newValue": 3
    }
  ]
}
```

### POST /config/deploy

Deploy one or more configuration versions. (Admin only)

**Request:**
```json
{
  "versionIds": ["version-123", "version-124"],
  "deploymentNotes": "Deploy dashboard and profile updates"
}
```

**Response:**
```json
{
  "id": "deployment-456",
  "tenantId": "tenant-001",
  "versionIds": ["version-123", "version-124"],
  "environment": "dev",
  "status": "deployed",
  "deployedBy": "admin-user-001",
  "deploymentNotes": "Deploy dashboard and profile updates",
  "createdAt": "2026-01-25T12:00:00Z",
  "deployedAt": "2026-01-25T12:00:05Z"
}
```

### POST /config/rollback

Rollback a deployment. (Admin only)

**Request:**
```json
{
  "deploymentId": "deployment-456"
}
```

**Response:**
```json
{
  "id": "deployment-789",
  "status": "rolled_back",
  "rollbackFromDeploymentId": "deployment-456",
  "deployedAt": "2026-01-25T12:10:00Z"
}
```

### POST /config/promote

Promote a configuration to the next environment. (Admin only)

**Request:**
```json
{
  "versionId": "version-123",
  "targetEnvironment": "staging"
}
```

**Response:**
```json
{
  "id": "version-234",
  "tenantId": "tenant-001",
  "configType": "page",
  "configId": "dashboard-page",
  "version": "1.0.0",
  "environment": "staging",
  "deploymentStatus": "draft",
  "validationStatus": "passed",
  "changeDescription": "Promoted from dev (version 1.0.1)",
  "createdAt": "2026-01-25T12:15:00Z"
}
```

**Promotion Rules:**
- dev → staging → prod (must follow this path)
- Cannot promote directly from dev to prod
- Configuration is re-validated in target environment

### GET /config/deployments

List deployments with optional filters.

**Query Parameters:**
- `environment` (optional): Filter by environment
- `status` (optional): Filter by status (pending, approved, deployed, rolled_back)

**Response:**
```json
{
  "deployments": [
    {
      "id": "deployment-456",
      "environment": "prod",
      "status": "deployed",
      "deployedAt": "2026-01-25T12:00:00Z",
      ...
    }
  ]
}
```

### GET /config/deployments/:id

Get a specific deployment.

**Response:**
```json
{
  "id": "deployment-456",
  "tenantId": "tenant-001",
  "versionIds": ["version-123"],
  "environment": "prod",
  "status": "deployed",
  "deployedBy": "admin-user-001",
  "deploymentNotes": "Production release",
  "createdAt": "2026-01-25T12:00:00Z",
  "deployedAt": "2026-01-25T12:00:05Z"
}
```

### POST /config/approve

Approve a pending deployment. (Admin only)

**Request:**
```json
{
  "deploymentId": "deployment-456"
}
```

**Response:**
```json
{
  "id": "deployment-456",
  "status": "approved",
  "approvedBy": "admin-user-001",
  "approvedAt": "2026-01-25T12:00:00Z"
}
```

### POST /config/reject

Reject a pending deployment. (Admin only)

**Request:**
```json
{
  "deploymentId": "deployment-456"
}
```

**Response:**
```json
{
  "id": "deployment-456",
  "status": "rejected"
}
```

### GET /config/audit

Get configuration audit trail.

**Query Parameters:**
- `configType` (optional): Filter by config type
- `configId` (optional): Filter by config ID
- `userId` (optional): Filter by user ID
- `action` (optional): Filter by action (create, update, deploy, rollback, approve, reject)
- `limit` (optional): Maximum number of entries to return

**Response:**
```json
{
  "entries": [
    {
      "id": "audit-123",
      "tenantId": "tenant-001",
      "configType": "page",
      "configId": "dashboard-page",
      "action": "deploy",
      "versionId": "version-123",
      "deploymentId": "deployment-456",
      "userId": "admin-user-001",
      "createdAt": "2026-01-25T12:00:00Z"
    }
  ]
}
```

### GET /config/rules

List validation rules. (Admin only)

**Query Parameters:**
- `configType` (optional): Filter by config type
- `isActive` (optional): Filter by active status (true/false)

**Response:**
```json
{
  "rules": [
    {
      "id": "rule-001",
      "name": "Page Configuration Schema",
      "description": "Validates required fields for page configs",
      "configType": "page",
      "ruleType": "schema",
      "severity": "error",
      "isActive": true
    }
  ]
}
```

### POST /config/rules

Create a validation rule. (Admin only)

**Request:**
```json
{
  "name": "Custom Validation",
  "description": "Validates custom fields",
  "configType": "page",
  "ruleType": "schema",
  "rule": {
    "required": ["customField"]
  },
  "severity": "warning"
}
```

**Response:**
```json
{
  "id": "rule-007",
  "name": "Custom Validation",
  "isActive": true,
  "createdAt": "2026-01-25T12:00:00Z"
}
```

### Configuration Governance Workflow

**Development Workflow:**
1. Developer creates/updates configuration locally
2. System validates configuration (`POST /config/validate`)
3. Developer creates version in dev environment (`POST /config/versions`)
4. Admin reviews and deploys to dev (`POST /config/deploy`)
5. If successful, promote to staging (`POST /config/promote`)
6. QA team validates in staging
7. Admin promotes to prod (`POST /config/promote`)
8. Admin deploys to production (`POST /config/deploy`)

**Rollback Workflow:**
1. Issue detected in production
2. Admin triggers rollback (`POST /config/rollback`)
3. System reverts to previous deployment
4. Audit trail records rollback action

**Approval Workflow (Optional):**
1. Developer creates deployment request (status: pending)
2. Admin reviews deployment (`POST /config/approve` or `/config/reject`)
3. If approved, deployment proceeds automatically or manually

---

**Version:** 1.2
**Last Updated:** January 2026
