# Bootstrap API Integration

## Overview

The Bootstrap API integration provides a comprehensive system for fetching and managing application initialization data after user authentication. This includes user information, permissions, tenant context, menu configuration, and feature flags.

## Architecture

The bootstrap system consists of three main layers:

1. **Service Layer** (`bootstrapService.ts`) - Handles API communication, caching, and retry logic
2. **Hook Layer** (`useBootstrap.ts`) - Provides React hooks for state management
3. **Context Layer** (`BootstrapContext.tsx`) - Global state provider for the entire application

## Features

- ✅ Automatic bootstrap data fetching after authentication
- ✅ Intelligent caching with 5-minute TTL (sessionStorage)
- ✅ Automatic retry with exponential backoff (3 retries)
- ✅ Response validation
- ✅ Error handling with proper error types
- ✅ Permission checking utilities
- ✅ Feature flag support
- ✅ Menu filtering based on permissions
- ✅ Comprehensive test coverage (53 tests)

## Quick Start

### 1. Wrap Your Application with BootstrapProvider

```tsx
import { BootstrapProvider } from '@/contexts/BootstrapContext';
import { AuthProvider } from '@/components/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <BootstrapProvider>
        {/* Your app components */}
      </BootstrapProvider>
    </AuthProvider>
  );
}
```

### 2. Access Bootstrap Data in Components

```tsx
import { useBootstrapContext } from '@/contexts/BootstrapContext';

function Dashboard() {
  const { user, permissions, loading, error } = useBootstrapContext();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
    </div>
  );
}
```

### 3. Check Permissions

```tsx
import { useHasPermission } from '@/contexts/BootstrapContext';

function EditButton() {
  const canEdit = useHasPermission('users.edit');

  if (!canEdit) return null;

  return <button>Edit User</button>;
}
```

### 4. Use Feature Flags

```tsx
import { useFeatureFlag } from '@/contexts/BootstrapContext';

function DashboardPage() {
  const showNewDashboard = useFeatureFlag('newDashboard');

  return showNewDashboard ? <NewDashboard /> : <LegacyDashboard />;
}
```

## API Reference

### Bootstrap Service

#### `fetchBootstrap(useCache?: boolean): Promise<BootstrapResponse>`

Fetches bootstrap data from `/ui/bootstrap` endpoint.

**Parameters:**
- `useCache` (optional, default: `true`) - Whether to use cached data if available

**Returns:** Promise resolving to `BootstrapResponse`

**Throws:** `BootstrapError` on failure

**Example:**
```typescript
import { fetchBootstrap } from '@/services/bootstrapService';

// Fetch with cache
const data = await fetchBootstrap();

// Force fresh fetch
const freshData = await fetchBootstrap(false);
```

#### `clearBootstrapCache(): void`

Clears cached bootstrap data from sessionStorage.

**Example:**
```typescript
import { clearBootstrapCache } from '@/services/bootstrapService';

clearBootstrapCache();
```

#### `hasPermission(bootstrap: BootstrapResponse | null, permission: string): boolean`

Checks if user has a specific permission.

**Parameters:**
- `bootstrap` - Bootstrap response data
- `permission` - Permission string to check

**Returns:** `true` if user has the permission

**Example:**
```typescript
import { hasPermission } from '@/services/bootstrapService';

if (hasPermission(bootstrapData, 'users.edit')) {
  // User can edit
}
```

#### `isFeatureEnabled(bootstrap: BootstrapResponse | null, featureFlag: string): boolean`

Checks if a feature flag is enabled.

**Parameters:**
- `bootstrap` - Bootstrap response data
- `featureFlag` - Feature flag name

**Returns:** `true` if feature is enabled

**Example:**
```typescript
import { isFeatureEnabled } from '@/services/bootstrapService';

if (isFeatureEnabled(bootstrapData, 'newDashboard')) {
  // Show new dashboard
}
```

#### `getFilteredMenu(bootstrap: BootstrapResponse | null): MenuItem[]`

Returns menu items filtered by user permissions.

**Parameters:**
- `bootstrap` - Bootstrap response data

**Returns:** Array of menu items the user can access

**Example:**
```typescript
import { getFilteredMenu } from '@/services/bootstrapService';

const menuItems = getFilteredMenu(bootstrapData);
```

### Bootstrap Hook

#### `useBootstrap()`

React hook for managing bootstrap data lifecycle.

**Returns:** Bootstrap state and control methods

**Properties:**
- `data: BootstrapResponse | null` - Full bootstrap data
- `loading: boolean` - Loading state
- `error: string | null` - Error message if any
- `loaded: boolean` - Whether data has been successfully loaded
- `reload: (useCache?: boolean) => Promise<void>` - Reload data
- `refresh: () => Promise<void>` - Refresh data (bypass cache)
- `clear: () => void` - Clear data and cache
- `user: BootstrapUser | null` - Current user
- `permissions: string[]` - User permissions
- `tenant: BootstrapTenant | null` - Tenant info
- `menu: MenuItem[]` - Menu configuration
- `defaults: BootstrapDefaults | null` - App defaults
- `featureFlags: Record<string, boolean>` - Feature flags

**Example:**
```typescript
import { useBootstrap } from '@/hooks/useBootstrap';

function MyComponent() {
  const {
    user,
    permissions,
    loading,
    error,
    refresh,
  } = useBootstrap();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

### Bootstrap Context

#### `useBootstrapContext()`

Hook to access bootstrap context. Must be used within `BootstrapProvider`.

**Returns:** `BootstrapContextValue`

**Throws:** Error if used outside of `BootstrapProvider`

**Example:**
```typescript
import { useBootstrapContext } from '@/contexts/BootstrapContext';

function MyComponent() {
  const { user, permissions, tenant } = useBootstrapContext();

  return (
    <div>
      <p>User: {user?.name}</p>
      <p>Tenant: {tenant?.name}</p>
      <p>Permissions: {permissions.length}</p>
    </div>
  );
}
```

#### `useHasPermission(permission: string): boolean`

Convenience hook to check a specific permission.

**Parameters:**
- `permission` - Permission string to check

**Returns:** `true` if user has the permission

**Example:**
```typescript
import { useHasPermission } from '@/contexts/BootstrapContext';

function EditButton() {
  const canEdit = useHasPermission('users.edit');
  
  return canEdit ? <button>Edit</button> : null;
}
```

#### `useFeatureFlag(featureFlag: string): boolean`

Convenience hook to check a feature flag.

**Parameters:**
- `featureFlag` - Feature flag name

**Returns:** `true` if feature is enabled

**Example:**
```typescript
import { useFeatureFlag } from '@/contexts/BootstrapContext';

function Dashboard() {
  const useNewUI = useFeatureFlag('newDashboard');
  
  return useNewUI ? <NewDashboard /> : <OldDashboard />;
}
```

## Response Schema

### BootstrapResponse

```typescript
interface BootstrapResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    roles: string[];
  };
  permissions: string[];
  tenant: {
    id: string;
    name: string;
    brandingVersion: string;
  };
  menu: MenuItem[];
  defaults: {
    homePage: string;
    theme: string;
  };
  featureFlags: Record<string, boolean>;
}
```

### MenuItem

```typescript
interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  route: string;
  order: number;
  permission?: string;
  children?: MenuItem[];
}
```

## Caching Strategy

- **Storage:** sessionStorage (per-session cache)
- **TTL:** 5 minutes
- **Key:** `bootstrap_data`
- **Expiry Key:** `bootstrap_data_expiry`
- **Invalidation:** Manual via `clearBootstrapCache()` or automatic on expiry

### Cache Behavior

1. **First Request:** Fetches from API, caches in sessionStorage
2. **Subsequent Requests (within 5 min):** Returns cached data
3. **After 5 Minutes:** Fetches fresh data from API
4. **Manual Refresh:** Bypasses cache via `refresh()` method

## Error Handling

### Error Types

```typescript
enum BootstrapErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
```

### Retry Logic

- **Max Retries:** 3
- **Initial Delay:** 1 second
- **Backoff:** Exponential (1s, 2s, 4s)
- **No Retry On:** Authentication errors (401), validation errors

### Error Examples

```typescript
try {
  const data = await fetchBootstrap();
} catch (error) {
  if (error instanceof BootstrapError) {
    switch (error.type) {
      case 'AUTH_ERROR':
        // Redirect to login
        break;
      case 'NETWORK_ERROR':
        // Show network error message
        break;
      case 'INVALID_RESPONSE':
        // Log error, show generic message
        break;
    }
  }
}
```

## Integration Examples

### Basic Integration

```tsx
// App.tsx
import { BootstrapProvider } from '@/contexts/BootstrapContext';
import { AuthProvider } from '@/components/AuthProvider';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';

function App() {
  return (
    <AuthProvider>
      <BootstrapProvider>
        <RouterProvider router={router} />
      </BootstrapProvider>
    </AuthProvider>
  );
}

export default App;
```

### Protected Route with Permission Check

```tsx
import { Navigate } from '@tanstack/react-router';
import { useBootstrapContext } from '@/contexts/BootstrapContext';

function ProtectedRoute({ permission, children }) {
  const { permissions, loaded, loading } = useBootstrapContext();

  if (loading) return <LoadingSpinner />;
  if (!loaded) return <Navigate to="/login" />;

  const hasPermission = permissions.includes(permission);
  if (!hasPermission) return <Navigate to="/unauthorized" />;

  return children;
}

// Usage
<ProtectedRoute permission="admin.access">
  <AdminPanel />
</ProtectedRoute>
```

### Dynamic Menu Rendering

```tsx
import { useBootstrapContext } from '@/contexts/BootstrapContext';
import { Link } from '@tanstack/react-router';

function Navigation() {
  const { menu, loading } = useBootstrapContext();

  if (loading) return <NavigationSkeleton />;

  return (
    <nav>
      {menu.map((item) => (
        <Link key={item.id} to={item.route}>
          <Icon name={item.icon} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
```

### Conditional Feature Rendering

```tsx
import { useFeatureFlag, useHasPermission } from '@/contexts/BootstrapContext';

function Dashboard() {
  const showNewDashboard = useFeatureFlag('newDashboard');
  const canViewReports = useHasPermission('reports.view');

  return (
    <div>
      {showNewDashboard ? <NewDashboard /> : <LegacyDashboard />}
      {canViewReports && <ReportsWidget />}
    </div>
  );
}
```

## Testing

### Service Tests (28 tests)

```bash
npm test -- src/services/bootstrapService.test.ts
```

Tests cover:
- Successful fetch and caching
- Cache retrieval and expiry
- Retry logic with exponential backoff
- Error handling (network, auth, validation)
- Helper functions (hasPermission, isFeatureEnabled, getFilteredMenu)

### Hook Tests (13 tests)

```bash
npm test -- src/hooks/useBootstrap.test.ts
```

Tests cover:
- Auto-fetch on mount
- Loading states
- Error handling
- Reload and refresh functionality
- Authentication integration

### Context Tests (12 tests)

```bash
npm test -- src/contexts/BootstrapContext.test.tsx
```

Tests cover:
- Provider rendering
- Context access
- useHasPermission hook
- useFeatureFlag hook
- Error boundaries

### Run All Bootstrap Tests

```bash
npm test -- bootstrap
```

## Troubleshooting

### Bootstrap Data Not Loading

1. **Check authentication:** Ensure user is authenticated before bootstrap fetches
2. **Check API endpoint:** Verify `/ui/bootstrap` endpoint is accessible
3. **Check token:** Ensure valid access token is present
4. **Check console:** Look for error messages in browser console

### Cache Not Working

1. **Check sessionStorage:** Verify browser supports sessionStorage
2. **Check cache expiry:** Ensure cache hasn't expired (5-minute TTL)
3. **Clear cache manually:** Use `clearBootstrapCache()` to reset

### Permission Checks Not Working

1. **Check bootstrap data:** Ensure bootstrap has loaded successfully
2. **Check permission format:** Verify permission strings match backend
3. **Check user roles:** Ensure user has appropriate roles

### Feature Flags Not Working

1. **Check bootstrap data:** Ensure featureFlags object is present
2. **Check flag name:** Verify flag name matches backend configuration
3. **Check flag type:** Ensure flag value is boolean (true/false)

## Performance

- **Initial Load:** ~100-200ms (network dependent)
- **Cached Load:** <1ms
- **Bundle Size:** ~12KB (service + hook + context)
- **Memory:** Minimal (single state object)

## Security

- ✅ Uses authenticated HTTP client with bearer tokens
- ✅ Validates response structure
- ✅ Clears tokens on authentication errors
- ✅ No sensitive data in logs
- ✅ Cache cleared on logout
- ✅ Permissions verified server-side

## Dependencies

- React 19.2.3+
- @/services/httpClient (from issue #009)
- @/services/tokenManager (from issue #009)
- @testing-library/react (for tests)

## Related Issues

- **Issue #009:** Token Management System (dependency)
- **Issue #007:** Login Page (integration point)
- **Issue #008:** OAuth Integration (integration point)

## Future Enhancements

- [ ] Background refresh on token renewal
- [ ] Optimistic updates
- [ ] Offline mode support
- [ ] Activity-based session timeout
- [ ] WebSocket support for live updates
- [ ] IndexedDB for persistent caching
- [ ] Retry with exponential backoff improvements

## License

Part of OpenPortal platform - See main LICENSE file
