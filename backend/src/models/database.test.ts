import type { Tenant } from '../models/database';
import { db } from '../models/database';

describe('Tenant Model', () => {
  beforeEach(() => {
    // Clear tenants before each test
    const tenants = db.getTenants();
    for (const tenant of tenants) {
      db.deleteTenant(tenant.id);
    }
  });

  describe('createTenant', () => {
    it('should create a new tenant', () => {
      const tenant: Tenant = {
        id: 'test-tenant-001',
        name: 'Test Tenant',
        subdomain: 'test',
        domain: 'test.example.com',
        isActive: true,
        featureFlags: {
          darkMode: true,
          notifications: true,
        },
        metadata: {
          industry: 'Technology',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const created = db.createTenant(tenant);

      expect(created).toEqual(tenant);
      expect(db.getTenantById(tenant.id)).toEqual(tenant);
    });
  });

  describe('getTenantById', () => {
    it('should return tenant by id', () => {
      const tenant: Tenant = {
        id: 'test-tenant-001',
        name: 'Test Tenant',
        isActive: true,
        featureFlags: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.createTenant(tenant);

      const result = db.getTenantById('test-tenant-001');
      expect(result).toEqual(tenant);
    });

    it('should return undefined for non-existent tenant', () => {
      const result = db.getTenantById('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('getTenantBySubdomain', () => {
    it('should return active tenant by subdomain', () => {
      const tenant: Tenant = {
        id: 'test-tenant-001',
        name: 'Test Tenant',
        subdomain: 'test',
        isActive: true,
        featureFlags: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.createTenant(tenant);

      const result = db.getTenantBySubdomain('test');
      expect(result).toEqual(tenant);
    });

    it('should not return inactive tenant', () => {
      const tenant: Tenant = {
        id: 'test-tenant-001',
        name: 'Test Tenant',
        subdomain: 'test',
        isActive: false,
        featureFlags: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.createTenant(tenant);

      const result = db.getTenantBySubdomain('test');
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-existent subdomain', () => {
      const result = db.getTenantBySubdomain('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('getTenantByDomain', () => {
    it('should return active tenant by domain', () => {
      const tenant: Tenant = {
        id: 'test-tenant-001',
        name: 'Test Tenant',
        domain: 'test.example.com',
        isActive: true,
        featureFlags: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.createTenant(tenant);

      const result = db.getTenantByDomain('test.example.com');
      expect(result).toEqual(tenant);
    });

    it('should not return inactive tenant', () => {
      const tenant: Tenant = {
        id: 'test-tenant-001',
        name: 'Test Tenant',
        domain: 'test.example.com',
        isActive: false,
        featureFlags: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.createTenant(tenant);

      const result = db.getTenantByDomain('test.example.com');
      expect(result).toBeUndefined();
    });
  });

  describe('updateTenant', () => {
    it('should update tenant properties', () => {
      const tenant: Tenant = {
        id: 'test-tenant-001',
        name: 'Test Tenant',
        isActive: true,
        featureFlags: {
          darkMode: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.createTenant(tenant);

      const updated = db.updateTenant('test-tenant-001', {
        name: 'Updated Tenant',
        featureFlags: {
          darkMode: false,
          notifications: true,
        },
      });

      expect(updated?.name).toBe('Updated Tenant');
      expect(updated?.featureFlags).toEqual({
        darkMode: false,
        notifications: true,
      });
    });

    it('should return undefined for non-existent tenant', () => {
      const result = db.updateTenant('non-existent', { name: 'Updated' });
      expect(result).toBeUndefined();
    });
  });

  describe('deleteTenant', () => {
    it('should delete tenant', () => {
      const tenant: Tenant = {
        id: 'test-tenant-001',
        name: 'Test Tenant',
        isActive: true,
        featureFlags: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.createTenant(tenant);
      const result = db.deleteTenant('test-tenant-001');

      expect(result).toBe(true);
      expect(db.getTenantById('test-tenant-001')).toBeUndefined();
    });

    it('should return false for non-existent tenant', () => {
      const result = db.deleteTenant('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('getTenants', () => {
    it('should return all tenants', () => {
      const tenant1: Tenant = {
        id: 'test-tenant-001',
        name: 'Test Tenant 1',
        isActive: true,
        featureFlags: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const tenant2: Tenant = {
        id: 'test-tenant-002',
        name: 'Test Tenant 2',
        isActive: true,
        featureFlags: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.createTenant(tenant1);
      db.createTenant(tenant2);

      const tenants = db.getTenants();
      expect(tenants).toHaveLength(2);
      expect(tenants).toContainEqual(tenant1);
      expect(tenants).toContainEqual(tenant2);
    });

    it('should return empty array when no tenants exist', () => {
      const tenants = db.getTenants();
      expect(tenants).toEqual([]);
    });
  });
});
