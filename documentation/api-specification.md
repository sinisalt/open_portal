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
    "domain": "acme.example.com"
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
  "featureFlags": {
    "newDashboard": true,
    "betaFeatures": false
  }
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

**Version:** 1.0
**Last Updated:** January 2026
