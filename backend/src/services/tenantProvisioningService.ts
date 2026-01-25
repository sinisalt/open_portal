import { randomUUID } from 'node:crypto';
import type { MenuConfig, PageConfig, RouteConfig, Tenant, TenantBranding } from '../models/database.js';
import { db } from '../models/database.js';

/**
 * Tenant Provisioning Service
 * Handles the creation and setup of new tenants with default configurations
 */
export class TenantProvisioningService {
  /**
   * Provision a new tenant with all default configurations
   */
  async provisionTenant(params: {
    name: string;
    subdomain?: string;
    domain?: string;
    featureFlags?: Record<string, boolean>;
    metadata?: Record<string, unknown>;
  }): Promise<Tenant> {
    const { name, subdomain, domain, featureFlags = {}, metadata = {} } = params;

    // Create tenant
    const tenant: Tenant = {
      id: randomUUID(),
      name,
      subdomain,
      domain,
      isActive: true,
      featureFlags: {
        darkMode: true,
        notifications: true,
        analytics: false,
        websockets: true,
        ...featureFlags,
      },
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.createTenant(tenant);

    // Initialize default configurations
    await this.initializeTenantConfigurations(tenant.id);

    return tenant;
  }

  /**
   * Initialize default configurations for a tenant
   */
  private async initializeTenantConfigurations(tenantId: string): Promise<void> {
    // Create default branding
    await this.createDefaultBranding(tenantId);

    // Create default routes
    await this.createDefaultRoutes(tenantId);

    // Create default menus
    await this.createDefaultMenus(tenantId);

    // Create default page configs
    await this.createDefaultPageConfigs(tenantId);
  }

  /**
   * Create default branding for a tenant
   */
  private async createDefaultBranding(tenantId: string): Promise<void> {
    const branding: TenantBranding = {
      id: randomUUID(),
      tenantId,
      version: '1.0.0',
      config: {
        logos: {
          primary: {
            url: '/default-logo.svg',
            altText: 'Logo',
            width: 180,
            height: 50,
          },
          login: {
            url: '/default-logo-login.svg',
            altText: 'Logo',
            width: 300,
            height: 100,
          },
        },
        colors: {
          primary: {
            500: '#2196f3',
            600: '#1e88e5',
            700: '#1976d2',
          },
          secondary: {
            500: '#e91e63',
          },
        },
        typography: {
          fontFamily: {
            sans: 'Inter, system-ui, sans-serif',
          },
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.createTenantBranding(branding);
  }

  /**
   * Create default routes for a tenant
   */
  private async createDefaultRoutes(tenantId: string): Promise<void> {
    const routes: RouteConfig[] = [
      {
        id: randomUUID(),
        pattern: '/',
        pageId: 'home',
        permissions: [],
        exact: true,
        tenantId,
        priority: 100,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        pattern: '/dashboard',
        pageId: 'dashboard',
        permissions: ['view_dashboard'],
        exact: true,
        tenantId,
        priority: 100,
        createdAt: new Date(),
      },
    ];

    for (const route of routes) {
      db.createRouteConfig(route);
    }
  }

  /**
   * Create default menus for a tenant
   */
  private async createDefaultMenus(tenantId: string): Promise<void> {
    // Admin menu
    const adminMenu: MenuConfig = {
      id: randomUUID(),
      tenantId,
      role: 'admin',
      config: {
        items: [
          {
            id: 'home',
            label: 'Home',
            icon: 'home',
            path: '/',
            permissions: [],
          },
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: 'dashboard',
            path: '/dashboard',
            permissions: ['view_dashboard'],
          },
          {
            id: 'settings',
            label: 'Settings',
            icon: 'settings',
            path: '/settings',
            permissions: ['manage_settings'],
          },
        ],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // User menu
    const userMenu: MenuConfig = {
      id: randomUUID(),
      tenantId,
      role: 'user',
      config: {
        items: [
          {
            id: 'home',
            label: 'Home',
            icon: 'home',
            path: '/',
            permissions: [],
          },
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: 'dashboard',
            path: '/dashboard',
            permissions: ['view_dashboard'],
          },
        ],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.createMenuConfig(adminMenu);
    db.createMenuConfig(userMenu);
  }

  /**
   * Create default page configs for a tenant
   */
  private async createDefaultPageConfigs(tenantId: string): Promise<void> {
    const homePageConfig: PageConfig = {
      id: randomUUID(),
      pageId: 'home',
      version: '1.0.0',
      config: {
        title: 'Welcome',
        layout: 'default',
        sections: [],
      },
      tenantId,
      permissions: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.createPageConfig(homePageConfig);
  }

  /**
   * Deprovision a tenant (deactivate and cleanup)
   */
  async deprovisionTenant(tenantId: string): Promise<void> {
    // Deactivate tenant
    db.updateTenant(tenantId, { isActive: false });

    // Note: In production, you might want to:
    // - Archive tenant data
    // - Revoke user access
    // - Clean up resources
    // - Send notifications
  }
}

export const tenantProvisioningService = new TenantProvisioningService();
