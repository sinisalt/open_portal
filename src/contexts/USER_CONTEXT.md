# User Context Documentation

## Overview

The User Context provides a unified interface for accessing user information, permissions, and tenant data throughout the application. It integrates Bootstrap data with authentication state to provide a comprehensive user management solution.

## Architecture

```
┌─────────────────┐
│  UserContext    │ ← Unified user interface
└────────┬────────┘
         │
    ┌────┴────────────┐
    │                 │
┌───▼──────────┐  ┌──▼────────┐
│ Bootstrap    │  │  useAuth  │
│ Context      │  │  Hook     │
└──────────────┘  └───────────┘
    │                 │
    │                 │
┌───▼──────────┐  ┌──▼────────┐
│ Bootstrap    │  │  Auth     │
│ Service      │  │  Service  │
└──────────────┘  └───────────┘
```

## Installation

The UserContext is automatically available when you wrap your application with the providers:

```tsx
import { BootstrapProvider } from '@/contexts/BootstrapContext';
import { UserProvider } from '@/contexts/UserContext';

function App() {
  return (
    <BootstrapProvider>
      <UserProvider>
        {/* Your app components */}
      </UserProvider>
    </BootstrapProvider>
  );
}
```

**Note:** The `UserProvider` must be nested inside the `BootstrapProvider` because it depends on bootstrap data.

## Available Hooks

### `useUserContext()`

Get the full user context value with all user, permissions, and tenant data.

```tsx
import { useUserContext } from '@/contexts/UserContext';

function MyComponent() {
  const {
    user,
    permissions,
    tenant,
    isAuthenticated,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    logout,
  } = useUserContext();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!isAuthenticated) return <p>Please log in</p>;

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Organization: {tenant?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### `useUser()`

Convenience hook to get only the current user information.

```tsx
import { useUser } from '@/contexts/UserContext';

function UserProfile() {
  const user = useUser();

  if (!user) {
    return <p>Not logged in</p>;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <p>Roles: {user.roles.join(', ')}</p>
    </div>
  );
}
```

### `usePermissions()`

Get the user's permissions array.

```tsx
import { usePermissions } from '@/contexts/UserContext';

function PermissionsList() {
  const permissions = usePermissions();

  return (
    <div>
      <h2>Your Permissions</h2>
      <ul>
        {permissions.map(p => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
```

### `useTenant()`

Get the current tenant/organization information.

```tsx
import { useTenant } from '@/contexts/UserContext';

function TenantInfo() {
  const tenant = useTenant();

  if (!tenant) {
    return <p>No tenant information available</p>;
  }

  return (
    <div>
      <h2>{tenant.name}</h2>
      <p>ID: {tenant.id}</p>
      <p>Branding Version: {tenant.brandingVersion}</p>
    </div>
  );
}
```

### `useHasPermission(permission)`

Check if the user has a specific permission.

```tsx
import { useHasPermission } from '@/contexts/UserContext';

function EditButton() {
  const canEdit = useHasPermission('users.edit');

  if (!canEdit) {
    return null; // Don't show button if no permission
  }

  return <button>Edit User</button>;
}
```

### `useHasAnyPermission(permissions)`

Check if the user has at least one of the given permissions.

```tsx
import { useHasAnyPermission } from '@/contexts/UserContext';

function AdminPanel() {
  // User needs either full admin or read-only admin access
  const isAdmin = useHasAnyPermission(['admin.full', 'admin.read']);

  if (!isAdmin) {
    return <p>Access denied</p>;
  }

  return <AdminDashboard />;
}
```

### `useHasAllPermissions(permissions)`

Check if the user has all of the given permissions.

```tsx
import { useHasAllPermissions } from '@/contexts/UserContext';

function SuperAdminPanel() {
  // User needs all three permissions
  const isSuperAdmin = useHasAllPermissions([
    'admin.full',
    'users.manage',
    'settings.write',
  ]);

  if (!isSuperAdmin) {
    return <p>Insufficient permissions</p>;
  }

  return <SuperAdminDashboard />;
}
```

## Context Value Interface

```typescript
interface UserContextValue {
  // User data (from Bootstrap)
  user: BootstrapUser | null;
  permissions: string[];
  tenant: BootstrapTenant | null;

  // Auth state
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Permission checking utilities
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;

  // Auth actions
  logout: () => Promise<void>;
}
```

## Type Definitions

### BootstrapUser

```typescript
interface BootstrapUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roles: string[];
}
```

### BootstrapTenant

```typescript
interface BootstrapTenant {
  id: string;
  name: string;
  brandingVersion: string;
}
```

## Common Patterns

### Conditional Rendering Based on Permissions

```tsx
function DocumentActions() {
  const canEdit = useHasPermission('documents.edit');
  const canDelete = useHasPermission('documents.delete');

  return (
    <div>
      {canEdit && <button>Edit</button>}
      {canDelete && <button>Delete</button>}
    </div>
  );
}
```

### Route Guards

```tsx
import { useUserContext } from '@/contexts/UserContext';
import { Navigate } from '@tanstack/react-router';

function ProtectedRoute({ permission, children }) {
  const { hasPermission, isLoading } = useUserContext();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!hasPermission(permission)) {
    return <Navigate to="/access-denied" />;
  }

  return children;
}
```

### Multi-Permission Checks

```tsx
function ContentEditor() {
  const canEdit = useHasPermission('content.edit');
  const canPublish = useHasPermission('content.publish');
  const canDelete = useHasPermission('content.delete');

  // Can only proceed if user can at least edit
  if (!canEdit) {
    return <p>You don't have permission to edit content</p>;
  }

  return (
    <div>
      <Editor />
      {canPublish && <button>Publish</button>}
      {canDelete && <button>Delete</button>}
    </div>
  );
}
```

### Display User Avatar

```tsx
function UserAvatar() {
  const user = useUser();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
      <span>{user.name}</span>
    </div>
  );
}
```

### Tenant-Specific Branding

```tsx
function BrandedHeader() {
  const tenant = useTenant();

  if (!tenant) return null;

  return (
    <header>
      <h1>{tenant.name}</h1>
      <p>Branding Version: {tenant.brandingVersion}</p>
    </header>
  );
}
```

## Performance Considerations

### Avoiding Unnecessary Re-renders

The UserContext uses React Context, which can cause re-renders when the context value changes. To optimize:

1. **Use specific hooks**: Instead of `useUserContext()`, use more specific hooks like `useUser()` or `useHasPermission()` to reduce dependencies.

```tsx
// ✅ Good - only re-renders when user changes
function UserName() {
  const user = useUser();
  return <p>{user?.name}</p>;
}

// ❌ Less optimal - re-renders when any context value changes
function UserName() {
  const { user } = useUserContext();
  return <p>{user?.name}</p>;
}
```

2. **Memoize permission checks**: For complex permission logic, use `useMemo`:

```tsx
import { useMemo } from 'react';
import { usePermissions } from '@/contexts/UserContext';

function ComplexPermissionCheck() {
  const permissions = usePermissions();

  const hasComplexAccess = useMemo(() => {
    // Complex logic here
    return permissions.some(p => p.startsWith('admin.'));
  }, [permissions]);

  return hasComplexAccess ? <AdminPanel /> : null;
}
```

## Testing

### Testing Components that Use UserContext

When testing components that use the UserContext, wrap them with the providers:

```tsx
import { render } from '@testing-library/react';
import { BootstrapProvider } from '@/contexts/BootstrapContext';
import { UserProvider } from '@/contexts/UserContext';

function renderWithContext(ui) {
  return render(
    <BootstrapProvider>
      <UserProvider>{ui}</UserProvider>
    </BootstrapProvider>
  );
}

test('shows user name', () => {
  const { getByText } = renderWithContext(<UserProfile />);
  expect(getByText(/John Doe/i)).toBeInTheDocument();
});
```

### Mocking UserContext

For unit tests, you can mock the context:

```tsx
jest.mock('@/contexts/UserContext', () => ({
  useUser: () => ({
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    roles: ['admin'],
  }),
  useHasPermission: () => true,
}));
```

## Error Handling

The UserContext will throw an error if used outside of a UserProvider:

```tsx
// ❌ This will throw an error
function BadComponent() {
  const user = useUser(); // Error: must be inside UserProvider
  return <div>{user?.name}</div>;
}

// ✅ This works correctly
function App() {
  return (
    <UserProvider>
      <GoodComponent />
    </UserProvider>
  );
}

function GoodComponent() {
  const user = useUser(); // ✓ Works
  return <div>{user?.name}</div>;
}
```

## Integration with Bootstrap

The UserContext depends on the Bootstrap API (`/ui/bootstrap`) which provides:

- User information
- Permissions array
- Tenant data
- Menu configuration
- Feature flags
- Application defaults

The Bootstrap data is automatically fetched when the user is authenticated and cached for 5 minutes.

## Security Considerations

1. **Client-Side Checks Only**: The permission checks in UserContext are for UI purposes only. Always enforce permissions on the backend.

2. **Token Management**: The authentication state is managed by the token manager, which stores tokens securely in sessionStorage or localStorage.

3. **Context Clearing**: When the user logs out, all context data is cleared, including the bootstrap cache.

## Best Practices

1. **Use Specific Hooks**: Prefer specific hooks (`useUser()`, `usePermissions()`) over `useUserContext()` to reduce re-renders.

2. **Early Returns**: Use early returns for permission checks to improve readability:

```tsx
function EditForm() {
  const canEdit = useHasPermission('forms.edit');

  if (!canEdit) {
    return <AccessDenied />;
  }

  return <FormEditor />;
}
```

3. **Combine with Loading States**: Always handle loading and error states:

```tsx
function UserDashboard() {
  const { user, isLoading, error } = useUserContext();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!user) return <LoginPrompt />;

  return <Dashboard user={user} />;
}
```

4. **Permission Hierarchies**: Use consistent permission naming:
   - `resource.action` (e.g., `users.edit`, `reports.view`)
   - Group related permissions (e.g., `admin.full`, `admin.read`)

## Troubleshooting

### Context is undefined

**Problem:** `useUserContext must be used within a UserProvider` error.

**Solution:** Ensure your component is wrapped with both `BootstrapProvider` and `UserProvider`:

```tsx
<BootstrapProvider>
  <UserProvider>
    <YourComponent />
  </UserProvider>
</BootstrapProvider>
```

### User data is null

**Problem:** `user` is null even after login.

**Possible causes:**
1. Bootstrap API hasn't been called yet (check `isLoading`)
2. User is not authenticated (check `isAuthenticated`)
3. Bootstrap API returned an error (check `error`)

**Solution:**

```tsx
const { user, isLoading, isAuthenticated, error } = useUserContext();

if (isLoading) return <p>Loading...</p>;
if (!isAuthenticated) return <p>Please log in</p>;
if (error) return <p>Error: {error}</p>;
if (!user) return <p>User data not available</p>;
```

### Permissions not updating

**Problem:** Permission checks return outdated values.

**Solution:** Refresh the bootstrap data:

```tsx
import { useBootstrapContext } from '@/contexts/BootstrapContext';

function RefreshButton() {
  const { refresh } = useBootstrapContext();

  return <button onClick={refresh}>Refresh</button>;
}
```

## Related Documentation

- [Bootstrap Context Documentation](./BOOTSTRAP_CONTEXT.md)
- [Authentication Documentation](../services/README.md#authentication)
- [Permissions System](../../documentation/permissions.md)
- [API Specification](../../documentation/api-specification.md)
