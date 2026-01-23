/**
 * Route Guard Hook
 *
 * React hook for protecting routes based on permissions and route configuration
 */

import { redirect } from '@tanstack/react-router';
import { useBootstrap } from '@/contexts/BootstrapContext';
import { resolveRoute } from '@/services/routeResolver';
import type { RouteResolution } from '@/types/route.types';

/**
 * Hook for checking if current user can access a route
 */
export function useRouteAccess(path: string): {
  canAccess: boolean;
  resolution: RouteResolution | null;
  loading: boolean;
  error: Error | null;
} {
  const { data: bootstrap, loading, error: bootstrapError } = useBootstrap();

  if (loading) {
    return {
      canAccess: false,
      resolution: null,
      loading: true,
      error: null,
    };
  }

  if (bootstrapError) {
    return {
      canAccess: false,
      resolution: null,
      loading: false,
      error: new Error(bootstrapError),
    };
  }

  if (!bootstrap || !bootstrap.routes || bootstrap.routes.length === 0) {
    // No routes configured, allow access (fallback to static routing)
    return {
      canAccess: true,
      resolution: null,
      loading: false,
      error: null,
    };
  }

  try {
    const resolution = resolveRoute(path, bootstrap.routes, {
      permissions: bootstrap.permissions,
      includeUnauthorized: false,
    });

    return {
      canAccess: resolution.hasPermission,
      resolution,
      loading: false,
      error: null,
    };
  } catch (error) {
    return {
      canAccess: false,
      resolution: null,
      loading: false,
      error: error as Error,
    };
  }
}

/**
 * Route guard function for TanStack Router beforeLoad
 *
 * Usage in route file:
 * ```typescript
 * export const Route = createFileRoute('/protected')({
 *   beforeLoad: routeGuard({ permissions: ['admin.access'] }),
 *   component: ProtectedPage,
 * });
 * ```
 */
export function routeGuard(
  options: { permissions?: string[]; redirectTo?: string; requireAuth?: boolean } = {}
) {
  return async ({
    location,
  }: {
    location: { pathname: string; search: Record<string, unknown> };
  }) => {
    const { permissions = [], redirectTo = '/login', requireAuth = true } = options;

    // Check authentication first if required
    if (requireAuth) {
      const tokenManager = await import('@/services/tokenManager');
      if (!tokenManager.isAuthenticated()) {
        throw redirect({
          to: redirectTo,
          search: { redirect: location.pathname },
        });
      }
    }

    // If specific permissions are declared, note that this guard does not enforce them.
    // -------------------------------------------------------------------------------
    // IMPORTANT:
    // - `routeGuard` is intentionally limited to authentication checks (`requireAuth`).
    // - Permission enforcement is handled either by:
    //     1) `createDynamicRouteGuard`, which uses bootstrap configuration +
    //        `resolveRoute` to evaluate permissions, or
    //     2) Component-level permission checks based on bootstrap/user data.
    // - The `permissions` option here is currently a declarative contract for route
    //   configuration and does not block navigation by itself.
    //
    // This design keeps this guard lightweight and avoids introducing additional
    // bootstrap dependencies or circular imports in simple routes.
    if (permissions.length > 0) {
      // No-op: see explanation above. Permission-aware routes should use
      // `createDynamicRouteGuard` or perform checks in the rendered component.
    }
  };
}

/**
 * Create a dynamic route resolver guard
 * This uses the bootstrap route configuration to determine access
 */
export function createDynamicRouteGuard() {
  return async ({
    location,
  }: {
    location: { pathname: string; search: Record<string, unknown> };
  }) => {
    // Import dependencies dynamically to avoid circular deps
    const tokenManager = await import('@/services/tokenManager');
    const { getBootstrapData } = await import('@/contexts/BootstrapContext');

    // Check authentication first
    if (!tokenManager.isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: { redirect: location.pathname },
      });
    }

    // Get bootstrap data to access routes and permissions
    const bootstrap = await getBootstrapData();

    if (!bootstrap || !bootstrap.routes || bootstrap.routes.length === 0) {
      // No routes configured, allow access
      return;
    }

    try {
      const { resolveRoute: resolver } = await import('@/services/routeResolver');
      const resolution = resolver(location.pathname, bootstrap.routes, {
        permissions: bootstrap.permissions,
        includeUnauthorized: false,
      });

      // Check if user has permission
      if (!resolution.hasPermission) {
        throw redirect({
          to: '/forbidden',
          search: { from: location.pathname },
        });
      }

      // Handle redirects
      if (resolution.redirect) {
        throw redirect({
          to: resolution.redirect,
        });
      }

      // Return resolved route data for use in component
      return { routeResolution: resolution };
    } catch (error) {
      // Route not found - let it fall through to 404 handler
      if (error instanceof Error && error.message.includes('No route found')) {
        // Continue to 404 page
        return;
      }
      throw error;
    }
  };
}
