import { db } from '../models/database';
import { TenantProvisioningService } from '../services/tenantProvisioningService';

describe('TenantProvisioningService', () => {
  let service: TenantProvisioningService;

  beforeEach(() => {
    service = new TenantProvisioningService();

    // Clear database before each test
    const tenants = db.getTenants();
    for (const tenant of tenants) {
      db.deleteTenant(tenant.id);
    }

    // Note: Other entities (pageConfigs, routes, menus, brandings) are not explicitly
    // cleared here as they don't have delete methods in the in-memory database.
    // In a production environment with a real database, these would be cascade-deleted
    // or explicitly cleaned up when a tenant is deleted.
  });

  describe('provisionTenant', () => {
    it('should create a new tenant with default feature flags', async () => {
      const params = {
        name: 'Test Corporation',
        subdomain: 'testcorp',
        domain: 'testcorp.example.com',
        metadata: {
          industry: 'Technology',
          size: 'medium',
        },
      };

      const tenant = await service.provisionTenant(params);

      expect(tenant).toBeDefined();
      expect(tenant.id).toBeDefined();
      expect(tenant.name).toBe('Test Corporation');
      expect(tenant.subdomain).toBe('testcorp');
      expect(tenant.domain).toBe('testcorp.example.com');
      expect(tenant.isActive).toBe(true);
      expect(tenant.metadata).toEqual({
        industry: 'Technology',
        size: 'medium',
      });
    });

    it('should merge custom feature flags with defaults', async () => {
      const params = {
        name: 'Custom Flags Corp',
        featureFlags: {
          analytics: true,
          customFeature: true,
        },
      };

      const tenant = await service.provisionTenant(params);

      expect(tenant.featureFlags).toEqual({
        darkMode: true, // default
        notifications: true, // default
        analytics: true, // overridden
        websockets: true, // default
        customFeature: true, // custom
      });
    });

    it('should create default branding configuration', async () => {
      const params = {
        name: 'Branding Test Corp',
        subdomain: 'branding',
      };

      const tenant = await service.provisionTenant(params);

      const branding = db.getTenantBrandingByTenantId(tenant.id);

      expect(branding).toBeDefined();
      expect(branding?.tenantId).toBe(tenant.id);
      expect(branding?.version).toBe('1.0.0');
      expect(branding?.config).toBeDefined();

      if (!branding) {
        throw new Error('Branding should be defined');
      }

      const config = branding.config as Record<string, unknown>;
      expect(config.logos).toBeDefined();
      const logos = config.logos as Record<string, unknown>;
      expect(logos.primary).toEqual({
        url: '/default-logo.svg',
        altText: 'Logo',
        width: 180,
        height: 50,
      });
      expect(config.colors).toBeDefined();
      expect(config.typography).toBeDefined();
    });

    it('should create default routes for tenant', async () => {
      const params = {
        name: 'Routes Test Corp',
        subdomain: 'routes',
      };

      const tenant = await service.provisionTenant(params);

      const routes = db.getRouteConfigsByTenant(tenant.id);

      expect(routes).toHaveLength(2);

      const homeRoute = routes.find((r) => r.pattern === '/');
      expect(homeRoute).toBeDefined();
      expect(homeRoute?.pageId).toBe('home');
      expect(homeRoute?.permissions).toEqual([]);
      expect(homeRoute?.exact).toBe(true);
      expect(homeRoute?.tenantId).toBe(tenant.id);

      const dashboardRoute = routes.find((r) => r.pattern === '/dashboard');
      expect(dashboardRoute).toBeDefined();
      expect(dashboardRoute?.pageId).toBe('dashboard');
      expect(dashboardRoute?.permissions).toEqual(['view_dashboard']);
      expect(dashboardRoute?.tenantId).toBe(tenant.id);
    });

    it('should create default menus for admin and user roles', async () => {
      const params = {
        name: 'Menus Test Corp',
        subdomain: 'menus',
      };

      const tenant = await service.provisionTenant(params);

      const adminMenu = db.getMenuConfigByTenantAndRole(tenant.id, 'admin');
      expect(adminMenu).toBeDefined();
      expect(adminMenu?.tenantId).toBe(tenant.id);
      expect(adminMenu?.role).toBe('admin');

      if (!adminMenu) {
        throw new Error('Admin menu should be defined');
      }

      const adminConfig = adminMenu.config as Record<string, unknown>;
      const adminItems = adminConfig.items as Array<{ id: string }>;
      expect(adminItems).toHaveLength(3);
      expect(adminItems[0].id).toBe('home');
      expect(adminItems[1].id).toBe('dashboard');
      expect(adminItems[2].id).toBe('settings');

      const userMenu = db.getMenuConfigByTenantAndRole(tenant.id, 'user');
      expect(userMenu).toBeDefined();
      expect(userMenu?.tenantId).toBe(tenant.id);
      expect(userMenu?.role).toBe('user');

      if (!userMenu) {
        throw new Error('User menu should be defined');
      }

      const userConfig = userMenu.config as Record<string, unknown>;
      const userItems = userConfig.items as Array<{ id: string }>;
      expect(userItems).toHaveLength(2);
      expect(userItems[0].id).toBe('home');
      expect(userItems[1].id).toBe('dashboard');
    });

    it('should create default page configurations', async () => {
      const params = {
        name: 'Pages Test Corp',
        subdomain: 'pages',
      };

      const tenant = await service.provisionTenant(params);

      const homePageConfig = db.getPageConfigByPageId('home', tenant.id);

      expect(homePageConfig).toBeDefined();
      expect(homePageConfig?.pageId).toBe('home');
      expect(homePageConfig?.tenantId).toBe(tenant.id);
      expect(homePageConfig?.version).toBe('1.0.0');
      expect(homePageConfig?.isActive).toBe(true);
      expect(homePageConfig?.permissions).toEqual([]);

      if (!homePageConfig) {
        throw new Error('Home page config should be defined');
      }

      const config = homePageConfig.config as Record<string, unknown>;
      expect(config.title).toBe('Welcome');
      expect(config.layout).toBe('default');
      expect(config.sections).toEqual([]);
    });

    it('should handle minimal parameters', async () => {
      const params = {
        name: 'Minimal Corp',
      };

      const tenant = await service.provisionTenant(params);

      expect(tenant).toBeDefined();
      expect(tenant.name).toBe('Minimal Corp');
      expect(tenant.subdomain).toBeUndefined();
      expect(tenant.domain).toBeUndefined();
      expect(tenant.isActive).toBe(true);
      expect(tenant.featureFlags).toEqual({
        darkMode: true,
        notifications: true,
        analytics: false,
        websockets: true,
      });
    });

    it('should create tenant that can be retrieved from database', async () => {
      const params = {
        name: 'Retrievable Corp',
        subdomain: 'retrievable',
      };

      const tenant = await service.provisionTenant(params);

      const retrieved = db.getTenantById(tenant.id);
      expect(retrieved).toEqual(tenant);

      const bySubdomain = db.getTenantBySubdomain('retrievable');
      expect(bySubdomain).toEqual(tenant);
    });

    it('should initialize all configurations in correct order', async () => {
      const params = {
        name: 'Order Test Corp',
        subdomain: 'order',
      };

      const tenant = await service.provisionTenant(params);

      // Verify all configurations are created
      expect(db.getTenantBrandingByTenantId(tenant.id)).toBeDefined();
      expect(db.getRouteConfigsByTenant(tenant.id).length).toBeGreaterThan(0);
      expect(db.getMenuConfigByTenantAndRole(tenant.id, 'admin')).toBeDefined();
      expect(db.getMenuConfigByTenantAndRole(tenant.id, 'user')).toBeDefined();
      expect(db.getPageConfigByPageId('home', tenant.id)).toBeDefined();
    });
  });

  describe('deprovisionTenant', () => {
    it('should deactivate an active tenant', async () => {
      // First provision a tenant
      const params = {
        name: 'To Be Deprovisioned',
        subdomain: 'deactivate',
      };

      const tenant = await service.provisionTenant(params);
      expect(tenant.isActive).toBe(true);

      // Deprovision the tenant
      await service.deprovisionTenant(tenant.id);

      // Verify tenant is deactivated
      const deactivated = db.getTenantById(tenant.id);
      expect(deactivated).toBeDefined();
      expect(deactivated?.isActive).toBe(false);
    });

    it('should not affect other tenant properties when deprovisioning', async () => {
      const params = {
        name: 'Preserve Properties Corp',
        subdomain: 'preserve',
        domain: 'preserve.example.com',
        featureFlags: {
          customFlag: true,
        },
        metadata: {
          data: 'important',
        },
      };

      const tenant = await service.provisionTenant(params);

      await service.deprovisionTenant(tenant.id);

      const deactivated = db.getTenantById(tenant.id);
      expect(deactivated?.name).toBe('Preserve Properties Corp');
      expect(deactivated?.subdomain).toBe('preserve');
      expect(deactivated?.domain).toBe('preserve.example.com');
      expect(deactivated?.featureFlags.customFlag).toBe(true);
      expect(deactivated?.metadata).toEqual({ data: 'important' });
    });

    it('should handle deprovisioning non-existent tenant gracefully', async () => {
      // This should not throw an error
      await expect(service.deprovisionTenant('non-existent-id')).resolves.not.toThrow();
    });

    it('should make deactivated tenant invisible to subdomain lookup', async () => {
      const params = {
        name: 'Lookup Test Corp',
        subdomain: 'lookup',
      };

      const tenant = await service.provisionTenant(params);

      // Verify tenant can be found by subdomain before deprovisioning
      const active = db.getTenantBySubdomain('lookup');
      expect(active).toBeDefined();
      expect(active?.id).toBe(tenant.id);

      // Deprovision the tenant
      await service.deprovisionTenant(tenant.id);

      // Verify tenant cannot be found by subdomain after deprovisioning
      const inactive = db.getTenantBySubdomain('lookup');
      expect(inactive).toBeUndefined();
    });

    it('should make deactivated tenant invisible to domain lookup', async () => {
      const params = {
        name: 'Domain Test Corp',
        domain: 'domaintest.example.com',
      };

      const tenant = await service.provisionTenant(params);

      // Verify tenant can be found by domain before deprovisioning
      const active = db.getTenantByDomain('domaintest.example.com');
      expect(active).toBeDefined();

      // Deprovision the tenant
      await service.deprovisionTenant(tenant.id);

      // Verify tenant cannot be found by domain after deprovisioning
      const inactive = db.getTenantByDomain('domaintest.example.com');
      expect(inactive).toBeUndefined();
    });

    it('should allow reactivation after deprovisioning', async () => {
      const params = {
        name: 'Reactivate Corp',
        subdomain: 'reactivate',
      };

      const tenant = await service.provisionTenant(params);

      // Deprovision
      await service.deprovisionTenant(tenant.id);
      expect(db.getTenantById(tenant.id)?.isActive).toBe(false);

      // Reactivate manually
      db.updateTenant(tenant.id, { isActive: true });
      expect(db.getTenantById(tenant.id)?.isActive).toBe(true);

      // Verify can be found by subdomain again
      const reactivated = db.getTenantBySubdomain('reactivate');
      expect(reactivated).toBeDefined();
      expect(reactivated?.id).toBe(tenant.id);
    });
  });
});
