# Route Resolver Documentation

## Overview

The Route Resolver system provides dynamic routing capabilities for OpenPortal, allowing routes to be configured via backend APIs and matched against URL patterns with permission-based access control.

## Architecture

The route resolver consists of several components:

1. **Type Definitions** (`src/types/route.types.ts`) - TypeScript interfaces for route configuration
2. **Route Resolver Service** (`src/services/routeResolver.ts`) - Core pattern matching and resolution logic
3. **Route Guards** (`src/hooks/useRouteGuard.ts`) - React hooks for protecting routes
4. **Bootstrap Integration** - Routes loaded from `/ui/bootstrap` API endpoint

## Route Configuration Schema

### RouteConfig Interface

```typescript
interface RouteConfig {
  /** Route pattern (e.g., "/profile/:id", "/dashboard") */
  pattern: string;

  /** Page identifier to load */
  pageId: string;

  /** Required permissions (all must be satisfied) */
  permissions?: string[];

  /** Redirect to another route */
  redirect?: string;

  /** Exact match required (no sub-paths) */
  exact?: boolean;

  /** Route metadata */
  metadata?: {
    title?: string;
    description?: string;
    icon?: string;
    [key: string]: unknown;
  };

  /** Route priority (higher values matched first, default: 0) */
  priority?: number;
}
```

### Example Route Configurations

```json
{
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
    },
    {
      "pattern": "/search/:term?",
      "pageId": "search-page"
    },
    {
      "pattern": "/docs/*",
      "pageId": "docs-page"
    },
    {
      "pattern": "/old-url",
      "pageId": "redirect-page",
      "redirect": "/new-url"
    }
  ]
}
```

## Route Pattern Syntax

### Static Routes
Simple paths with no parameters:
```
/dashboard
/settings/profile
/about
```

### Dynamic Parameters
Capture values from URL segments:
```
/user/:id              → matches /user/123, extracts { id: "123" }
/org/:orgId/user/:uid  → matches /org/acme/user/456, extracts { orgId: "acme", uid: "456" }
```

### Optional Parameters
Parameters that may or may not be present:
```
/search/:term?         → matches both /search and /search/test
/profile/:tab?         → matches /profile and /profile/settings
```

### Wildcard Routes
Match everything after a prefix:
```
/docs/*                → matches /docs/api/users, /docs/getting-started, etc.
/files/*               → matches any path under /files
```

### Nested Routes
Routes with multiple path segments:
```
/settings/profile
/admin/users/permissions
/org/:orgId/team/:teamId
```

## Route Matching Rules

### Priority Order

Routes are matched in the following order:

1. **Explicit priority** - Routes with higher `priority` values are checked first
2. **Specificity** - More specific routes are matched before generic ones:
   - Static segments > Dynamic parameters > Wildcard
   - `/users/profile` beats `/users/:id`
   - `/users/:id` beats `/users/*`

### Trailing Slashes

Trailing slashes are normalized and ignored:
- `/dashboard/` is treated the same as `/dashboard`
- `/user/123/` is treated the same as `/user/123`

### Case Sensitivity

Route patterns are case-sensitive by default.

## Permission Checking

### Required Permissions

Routes can require one or more permissions:

```typescript
{
  pattern: "/admin/users",
  pageId: "user-management",
  permissions: ["admin.access", "users.manage"]
}
```

**All** listed permissions must be present for the user to access the route.

### Permission Resolution

1. User permissions are loaded from the bootstrap endpoint
2. Route resolver checks if user has all required permissions
3. If insufficient permissions:
   - Without `includeUnauthorized`: Route is skipped, continues to next match
   - With `includeUnauthorized`: Route is returned with `hasPermission: false`

## Using Route Guards

### Basic Route Guard

Protect a route with authentication:

```typescript
import { createFileRoute, redirect } from '@tanstack/react-router';
import * as tokenManager from '@/services/tokenManager';

export const Route = createFileRoute('/protected')({
  component: ProtectedPage,
  beforeLoad: async ({ location }) => {
    if (!tokenManager.isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: { redirect: location.pathname }
      });
    }
  }
});
```

### Permission-Based Guard

Check specific permissions in the component:

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { useHasPermission } from '@/contexts/UserContext';

export const Route = createFileRoute('/admin')({
  component: AdminPage
});

function AdminPage() {
  const canAccessAdmin = useHasPermission('admin.access');

  if (!canAccessAdmin) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Panel</div>;
}
```

### Dynamic Route Guard

Use the bootstrap route configuration:

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { createDynamicRouteGuard } from '@/hooks/useRouteGuard';

export const Route = createFileRoute('/dynamic')({
  component: DynamicPage,
  beforeLoad: createDynamicRouteGuard()
});
```

## Route Resolution API

### resolveRoute()

Resolve a path to a route configuration:

```typescript
import { resolveRoute } from '@/services/routeResolver';

const routes: RouteConfig[] = [
  { pattern: '/user/:id', pageId: 'user-profile', permissions: ['user.view'] }
];

const resolution = resolveRoute('/user/123', routes, {
  permissions: ['user.view']
});

// Result:
// {
//   pageId: 'user-profile',
//   params: { id: '123' },
//   hasPermission: true,
//   route: { ... }
// }
```

### matchesPattern()

Check if a path matches a pattern:

```typescript
import { matchesPattern } from '@/services/routeResolver';

matchesPattern('/user/123', '/user/:id');     // true
matchesPattern('/dashboard', '/user/:id');    // false
matchesPattern('/search', '/search/:term?');  // true
```

### extractParams()

Extract parameters from a path:

```typescript
import { extractParams } from '@/services/routeResolver';

const params = extractParams('/user/123', '/user/:id');
// { id: '123' }

const params2 = extractParams('/org/acme/user/456', '/org/:orgId/user/:userId');
// { orgId: 'acme', userId: '456' }
```

### buildPath()

Build a path from a pattern and parameters:

```typescript
import { buildPath } from '@/services/routeResolver';

const path = buildPath('/user/:id', { id: '123' });
// '/user/123'

const path2 = buildPath('/org/:orgId/user/:userId', { orgId: 'acme', userId: '456' });
// '/org/acme/user/456'
```

## Error Handling

### 404 - Route Not Found

When no route matches the path:

```typescript
try {
  const resolution = resolveRoute('/non-existent', routes);
} catch (error) {
  // RouteError with type: 'NOT_FOUND'
  console.error(error.message); // "No route found for path: /non-existent"
}
```

### 403 - Forbidden

When user lacks required permissions:

```typescript
const resolution = resolveRoute('/admin', routes, {
  permissions: [] // No permissions
});
// Throws error or skips route depending on options
```

### Circular Redirects

Detect circular redirect chains:

```typescript
import { detectCircularRedirects } from '@/services/routeResolver';

const routes = [
  { pattern: '/a', pageId: 'page-a', redirect: '/b' },
  { pattern: '/b', pageId: 'page-b', redirect: '/a' }
];

const circular = detectCircularRedirects(routes);
// ['/a']
```

## Bootstrap Integration

### Loading Routes from Bootstrap

Routes are loaded from the `/ui/bootstrap` endpoint:

```typescript
// Bootstrap response includes routes
interface BootstrapResponse {
  user: {...},
  permissions: string[],
  routes?: RouteConfig[], // Optional routes array
  ...
}
```

### Accessing Routes in Components

```typescript
import { useBootstrapContext } from '@/contexts/BootstrapContext';

function MyComponent() {
  const { data } = useBootstrapContext();
  const routes = data?.routes || [];
  
  // Use routes...
}
```

## Best Practices

### 1. Use Descriptive Page IDs

```typescript
// Good
{ pattern: '/user/:id', pageId: 'user-profile-page' }

// Avoid
{ pattern: '/user/:id', pageId: 'page1' }
```

### 2. Set Appropriate Priorities

```typescript
// Higher priority for more specific routes
{ pattern: '/admin/users', pageId: 'user-admin', priority: 10 }
{ pattern: '/admin/:section', pageId: 'admin-panel', priority: 5 }
```

### 3. Use Permissions Consistently

```typescript
// Good - consistent permission naming
{ pattern: '/admin', pageId: 'admin-panel', permissions: ['admin.access'] }
{ pattern: '/users', pageId: 'user-list', permissions: ['users.view'] }

// Avoid - inconsistent naming
{ pattern: '/admin', pageId: 'admin', permissions: ['ADMIN'] }
{ pattern: '/users', pageId: 'users', permissions: ['canViewUsers'] }
```

### 4. Validate Route Configuration

```typescript
import { validateRouteConfig } from '@/services/routeResolver';

const route = {
  pattern: '/dashboard',
  pageId: 'dashboard-page'
};

if (validateRouteConfig(route)) {
  // Route is valid
}
```

### 5. Handle Redirects Carefully

Avoid circular redirects:

```typescript
// Bad - circular redirect
{ pattern: '/a', pageId: 'page-a', redirect: '/b' }
{ pattern: '/b', pageId: 'page-b', redirect: '/a' }

// Good - linear redirect
{ pattern: '/old-url', pageId: 'redirect', redirect: '/new-url' }
{ pattern: '/new-url', pageId: 'page' }
```

## Testing

### Unit Tests

The route resolver has comprehensive unit tests covering:
- Static route matching
- Dynamic parameter extraction
- Optional parameters
- Wildcard routes
- Permission checking
- Route priority
- Circular redirect detection

Run tests:
```bash
npm test -- src/services/routeResolver.test.ts
```

### Integration Testing

Test routes in your application:

```typescript
import { render, screen } from '@testing-library/react';
import { RouterProvider, createRouter } from '@tanstack/react-router';

test('protected route redirects when not authenticated', async () => {
  // Setup router and test...
});
```

## Troubleshooting

### Route Not Matching

1. Check pattern syntax - parameters must start with `:`
2. Verify trailing slashes are normalized
3. Check route priority - higher priority routes are checked first
4. Ensure pattern is valid (starts with `/`)

### Permission Issues

1. Verify user permissions are loaded in bootstrap
2. Check permission names match exactly (case-sensitive)
3. Ensure all required permissions are present
4. Use `includeUnauthorized: true` for debugging

### Circular Redirects

1. Use `detectCircularRedirects()` to find problematic routes
2. Ensure redirect chains eventually terminate
3. Avoid redirecting to patterns that redirect back

## Future Enhancements

- Query parameter matching in patterns
- Route middleware/hooks
- Route preloading
- Route-based code splitting
- Route metadata validation
- Internationalized routes (i18n)
- Route analytics and tracking

## See Also

- [API Specification](./api-specification.md) - Backend API contracts
- [Bootstrap Service](../src/services/bootstrapService.ts) - Bootstrap data loading
- [User Context](../src/contexts/UserContext.tsx) - Permission checking
- [TanStack Router Documentation](https://tanstack.com/router) - Router library docs
