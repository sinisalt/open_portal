/**
 * User Context
 *
 * Provides unified access to user information, permissions, and tenant data
 * Integrates Bootstrap data with authentication state
 */

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { BootstrapTenant, BootstrapUser } from '@/types/bootstrap.types';
import { useBootstrapContext } from './BootstrapContext';

/**
 * User context value type
 */
export interface UserContextValue {
  /** Current user information (from bootstrap) */
  user: BootstrapUser | null;

  /** User permissions array */
  permissions: string[];

  /** Tenant/organization information */
  tenant: BootstrapTenant | null;

  /** Whether user is authenticated */
  isAuthenticated: boolean;

  /** Whether user data is loading */
  isLoading: boolean;

  /** Error message if any */
  error: string | null;

  /** Check if user has a specific permission */
  hasPermission: (permission: string) => boolean;

  /** Check if user has any of the given permissions */
  hasAnyPermission: (permissions: string[]) => boolean;

  /** Check if user has all of the given permissions */
  hasAllPermissions: (permissions: string[]) => boolean;

  /** Logout function */
  logout: () => Promise<void>;
}

/**
 * User context
 */
const UserContext = createContext<UserContextValue | undefined>(undefined);

/**
 * User context provider props
 */
export interface UserProviderProps {
  children: ReactNode;
}

/**
 * User context provider
 *
 * Provides unified access to user, permissions, and tenant information
 * Combines Bootstrap data with authentication state
 *
 * @example
 * ```tsx
 * <UserProvider>
 *   <App />
 * </UserProvider>
 * ```
 */
export function UserProvider({ children }: UserProviderProps) {
  // Get authentication state
  const auth = useAuth();

  // Get bootstrap data (includes user, permissions, tenant)
  const bootstrap = useBootstrapContext();

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    return bootstrap.permissions.includes(permission);
  };

  /**
   * Check if user has any of the given permissions
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => bootstrap.permissions.includes(permission));
  };

  /**
   * Check if user has all of the given permissions
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => bootstrap.permissions.includes(permission));
  };

  const value: UserContextValue = {
    // User data from bootstrap
    user: bootstrap.user,
    permissions: bootstrap.permissions,
    tenant: bootstrap.tenant,

    // Authentication state from useAuth
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading || bootstrap.loading,
    error: auth.error || bootstrap.error,

    // Permission checking utilities
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Logout function
    logout: auth.logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Hook to access user context
 *
 * Must be used within a UserProvider
 *
 * @throws Error if used outside of UserProvider
 * @returns User context value with all user, permissions, and tenant data
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, permissions, tenant, isAuthenticated } = useUserContext();
 *
 *   if (!isAuthenticated) {
 *     return <LoginPrompt />;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user?.name}</p>
 *       <p>Organization: {tenant?.name}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUserContext(): UserContextValue {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }

  return context;
}

/**
 * Hook to get current user information
 *
 * Convenience hook that extracts just the user from context
 *
 * @returns Current user information or null if not authenticated
 *
 * @example
 * ```tsx
 * function UserProfile() {
 *   const user = useUser();
 *
 *   if (!user) {
 *     return <p>Not logged in</p>;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>{user.name}</h1>
 *       <p>{user.email}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUser(): BootstrapUser | null {
  const { user } = useUserContext();
  return user;
}

/**
 * Hook to get user permissions
 *
 * Convenience hook that extracts just the permissions array from context
 *
 * @returns Array of permission strings
 *
 * @example
 * ```tsx
 * function PermissionsList() {
 *   const permissions = usePermissions();
 *
 *   return (
 *     <ul>
 *       {permissions.map(p => <li key={p}>{p}</li>)}
 *     </ul>
 *   );
 * }
 * ```
 */
export function usePermissions(): string[] {
  const { permissions } = useUserContext();
  return permissions;
}

/**
 * Hook to get tenant information
 *
 * Convenience hook that extracts just the tenant from context
 *
 * @returns Tenant information or null if not available
 *
 * @example
 * ```tsx
 * function TenantInfo() {
 *   const tenant = useTenant();
 *
 *   if (!tenant) {
 *     return <p>No tenant information</p>;
 *   }
 *
 *   return (
 *     <div>
 *       <h2>{tenant.name}</h2>
 *       <p>ID: {tenant.id}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTenant(): BootstrapTenant | null {
  const { tenant } = useUserContext();
  return tenant;
}

/**
 * Hook to check if user has a specific permission
 *
 * @param permission - Permission to check
 * @returns True if user has the permission
 *
 * @example
 * ```tsx
 * function EditButton() {
 *   const canEdit = useHasPermission('users.edit');
 *
 *   if (!canEdit) {
 *     return null;
 *   }
 *
 *   return <button>Edit User</button>;
 * }
 * ```
 */
export function useHasPermission(permission: string): boolean {
  const { hasPermission } = useUserContext();
  return hasPermission(permission);
}

/**
 * Hook to check if user has any of the given permissions
 *
 * @param permissions - Array of permissions to check
 * @returns True if user has at least one of the permissions
 *
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const isAdmin = useHasAnyPermission(['admin.full', 'admin.read']);
 *
 *   if (!isAdmin) {
 *     return <p>Access denied</p>;
 *   }
 *
 *   return <AdminDashboard />;
 * }
 * ```
 */
export function useHasAnyPermission(permissions: string[]): boolean {
  const { hasAnyPermission } = useUserContext();
  return hasAnyPermission(permissions);
}

/**
 * Hook to check if user has all of the given permissions
 *
 * @param permissions - Array of permissions to check
 * @returns True if user has all of the permissions
 *
 * @example
 * ```tsx
 * function SuperAdminPanel() {
 *   const isSuperAdmin = useHasAllPermissions([
 *     'admin.full',
 *     'users.manage',
 *     'settings.write'
 *   ]);
 *
 *   if (!isSuperAdmin) {
 *     return <p>Insufficient permissions</p>;
 *   }
 *
 *   return <SuperAdminDashboard />;
 * }
 * ```
 */
export function useHasAllPermissions(permissions: string[]): boolean {
  const { hasAllPermissions } = useUserContext();
  return hasAllPermissions(permissions);
}
