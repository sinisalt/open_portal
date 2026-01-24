import { createHash } from 'node:crypto';
import type { PageConfig } from '../models/database.js';
import { db } from '../models/database.js';

/**
 * UI Configuration Service
 * Handles UI configuration retrieval with permission filtering, tenant isolation, and caching
 */
export class UiConfigService {
  /**
   * Get bootstrap configuration for the authenticated user
   */
  getBootstrapConfig(userId: string): {
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
    menu: unknown;
    defaults: {
      homePage: string;
      theme: string;
    };
    featureFlags: Record<string, boolean>;
  } | null {
    const user = db.getUserById(userId);
    if (!user || !user.isActive) {
      return null;
    }

    // Get tenant branding version
    const branding = db.getTenantBrandingByTenantId(user.tenantId);

    // Get menu config based on user's primary role
    const primaryRole = user.roles[0] || 'user';
    const menuConfig = db.getMenuConfigByTenantAndRole(user.tenantId, primaryRole);

    // Filter menu items by permissions
    const menu = menuConfig
      ? this.filterMenuByPermissions(menuConfig.config, this.getUserPermissions(user))
      : { items: [] };

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatarUrl,
        roles: user.roles,
      },
      permissions: this.getUserPermissions(user),
      tenant: {
        id: user.tenantId,
        name: 'OpenPortal', // In production, this would come from tenant data
        brandingVersion: branding?.version || '1.0.0',
      },
      menu,
      defaults: {
        homePage: '/',
        theme: 'light',
      },
      featureFlags: {
        darkMode: true,
        notifications: true,
        analytics: user.roles.includes('admin'),
      },
    };
  }

  /**
   * Get branding configuration for a tenant
   */
  getBrandingConfig(tenantId: string): {
    version: string;
    tenantId: string;
    colors: unknown;
    typography: unknown;
    spacing: unknown;
    logos: unknown;
    customCSS?: string;
  } | null {
    const branding = db.getTenantBrandingByTenantId(tenantId);
    if (!branding) {
      return null;
    }

    const config = branding.config as {
      colors?: unknown;
      typography?: unknown;
      spacing?: unknown;
      logos?: unknown;
      customCSS?: string;
    };

    return {
      version: branding.version,
      tenantId: branding.tenantId,
      colors: config.colors || {},
      typography: config.typography || {},
      spacing: config.spacing || {},
      logos: config.logos || {},
      customCSS: config.customCSS,
    };
  }

  /**
   * Resolve route path to page configuration
   */
  resolveRoute(
    path: string,
    tenantId: string,
    userPermissions: string[],
  ): {
    pageId: string;
    params: Record<string, string>;
    metadata: {
      title?: string;
      permissions?: string[];
    };
  } | null {
    const routes = db.getRouteConfigsByTenant(tenantId);

    for (const route of routes) {
      const match = this.matchRoute(route.pattern, path, route.exact);
      if (match) {
        // Check permissions
        if (route.permissions.length > 0) {
          const hasPermission = route.permissions.some((perm) => userPermissions.includes(perm));
          if (!hasPermission) {
            return null; // Access denied
          }
        }

        return {
          pageId: route.pageId,
          params: match.params,
          metadata: {
            title: (route.metadata as { title?: string })?.title,
            permissions: route.permissions,
          },
        };
      }
    }

    return null;
  }

  /**
   * Get page configuration by page ID
   */
  getPageConfig(pageId: string, tenantId: string, userPermissions: string[]): PageConfig | null {
    const pageConfig = db.getPageConfigByPageId(pageId, tenantId);
    if (!pageConfig || !pageConfig.isActive) {
      return null;
    }

    // Check permissions
    if (pageConfig.permissions.length > 0) {
      const hasPermission = pageConfig.permissions.some((perm) => userPermissions.includes(perm));
      if (!hasPermission) {
        return null; // Access denied
      }
    }

    return pageConfig;
  }

  /**
   * Generate ETag for configuration
   */
  generateETag(config: unknown): string {
    const hash = createHash('sha256');
    hash.update(JSON.stringify(config));
    return `"${hash.digest('hex')}"`;
  }

  /**
   * Filter menu items by user permissions
   */
  private filterMenuByPermissions(menuConfig: unknown, userPermissions: string[]): unknown {
    const config = menuConfig as {
      items?: Array<{
        permissions?: string[];
        children?: Array<{ permissions?: string[] }>;
        [key: string]: unknown;
      }>;
    };

    if (!config.items) {
      return menuConfig;
    }

    const filteredItems = config.items
      .filter((item) => {
        // If item has permissions, check if user has at least one
        if (item.permissions && item.permissions.length > 0) {
          return item.permissions.some((perm) => userPermissions.includes(perm));
        }
        return true;
      })
      .map((item) => {
        // Filter children as well
        if (item.children) {
          const filteredChildren = item.children.filter((child) => {
            if (child.permissions && child.permissions.length > 0) {
              return child.permissions.some((perm) => userPermissions.includes(perm));
            }
            return true;
          });
          return { ...item, children: filteredChildren };
        }
        return item;
      });

    return { ...config, items: filteredItems };
  }

  /**
   * Get user permissions based on roles
   */
  private getUserPermissions(user: { roles: string[] }): string[] {
    // In production, this would query a permissions table based on roles
    // For now, we'll use a simple mapping
    const rolePermissions: Record<string, string[]> = {
      admin: [
        'dashboard.view',
        'users.view',
        'users.create',
        'users.edit',
        'users.delete',
        'settings.view',
        'settings.edit',
        'admin.access',
        'admin.users.manage',
        'admin.settings.manage',
      ],
      user: ['dashboard.view', 'users.view', 'settings.view'],
    };

    const permissions = new Set<string>();
    for (const role of user.roles) {
      const perms = rolePermissions[role] || [];
      for (const perm of perms) {
        permissions.add(perm);
      }
    }

    return Array.from(permissions);
  }

  /**
   * Match route pattern against path
   */
  private matchRoute(
    pattern: string,
    path: string,
    exact: boolean,
  ): { params: Record<string, string> } | null {
    // Simple route matching - in production, use a proper router library
    const params: Record<string, string> = {};

    // Handle exact match
    if (exact) {
      if (pattern === path) {
        return { params };
      }
      return null;
    }

    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    const hasParams = patternParts.some((part) => part.startsWith(':'));

    // For non-parameterized routes, allow simple prefix matching
    if (!hasParams) {
      if (path.startsWith(pattern)) {
        return { params };
      }
      return null;
    }

    // Handle parameterized routes (e.g., /users/:id)
    if (patternParts.length !== pathParts.length) {
      return null;
    }

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(':')) {
        // It's a parameter
        const paramName = patternPart.slice(1);
        params[paramName] = pathPart;
      } else if (patternPart !== pathPart) {
        return null;
      }
    }

    return { params };
  }
}
