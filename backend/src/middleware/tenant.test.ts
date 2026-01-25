import type { Response, NextFunction } from 'express';
import { identifyTenant, type TenantRequest } from '../middleware/tenant';
import type { Tenant } from '../models/database';
import { db } from '../models/database';

describe('Tenant Identification Middleware', () => {
  beforeEach(() => {
    // Clear tenants before each test
    const tenants = db.getTenants();
    for (const tenant of tenants) {
      db.deleteTenant(tenant.id);
    }

    // Create test tenants
    const tenant1: Tenant = {
      id: 'tenant-001',
      name: 'Default Tenant',
      subdomain: 'app',
      domain: 'localhost',
      isActive: true,
      featureFlags: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tenant2: Tenant = {
      id: 'tenant-002',
      name: 'Acme Corp',
      subdomain: 'acme',
      domain: 'acme.example.com',
      isActive: true,
      featureFlags: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.createTenant(tenant1);
    db.createTenant(tenant2);
  });

  describe('Header-based identification', () => {
    it('should identify tenant from X-Tenant-ID header', () => {
      const req = {
        headers: {
          'x-tenant-id': 'tenant-002',
        },
      } as unknown as TenantRequest;

      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      identifyTenant(req, res, next);

      expect(req.tenantId).toBe('tenant-002');
      expect(req.tenant?.id).toBe('tenant-002');
      expect(req.tenant?.name).toBe('Acme Corp');
      expect(next).toHaveBeenCalled();
    });

    it('should ignore invalid tenant ID in header', () => {
      const req = {
        headers: {
          'x-tenant-id': 'invalid-tenant',
        },
        hostname: 'localhost',
      } as unknown as TenantRequest;

      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      identifyTenant(req, res, next);

      // Should fall back to default tenant
      expect(req.tenantId).toBe('tenant-001');
      expect(req.tenant?.name).toBe('Default Tenant');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Subdomain-based identification', () => {
    it('should identify tenant from subdomain', () => {
      const req = {
        headers: {},
        hostname: 'acme.example.com',
      } as unknown as TenantRequest;

      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      identifyTenant(req, res, next);

      expect(req.tenantId).toBe('tenant-002');
      expect(req.tenant?.id).toBe('tenant-002');
      expect(req.tenant?.name).toBe('Acme Corp');
      expect(next).toHaveBeenCalled();
    });

    it('should handle missing subdomain', () => {
      const req = {
        headers: {},
        hostname: 'example.com',
      } as unknown as TenantRequest;

      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      identifyTenant(req, res, next);

      // Should fall back to default
      expect(req.tenantId).toBe('tenant-001');
      expect(next).toHaveBeenCalled();
    });

    it('should handle invalid subdomain', () => {
      const req = {
        headers: {},
        hostname: 'invalid.example.com',
      } as unknown as TenantRequest;

      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      identifyTenant(req, res, next);

      // Should fall back to default
      expect(req.tenantId).toBe('tenant-001');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Domain-based identification', () => {
    it('should identify tenant from full domain', () => {
      const req = {
        headers: {},
        hostname: 'acme.example.com',
      } as unknown as TenantRequest;

      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      identifyTenant(req, res, next);

      expect(req.tenantId).toBe('tenant-002');
      // Note: tenant object doesn't include domain, just id, name, and featureFlags
      expect(next).toHaveBeenCalled();
    });

    it('should handle localhost domain', () => {
      const req = {
        headers: {},
        hostname: 'localhost',
      } as unknown as TenantRequest;

      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      identifyTenant(req, res, next);

      expect(req.tenantId).toBe('tenant-001');
      // Note: tenant object doesn't include domain, just id, name, and featureFlags
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Priority order', () => {
    it('should prioritize header over subdomain', () => {
      const req = {
        headers: {
          'x-tenant-id': 'tenant-001',
        },
        hostname: 'acme.example.com',
      } as unknown as TenantRequest;

      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      identifyTenant(req, res, next);

      // Header takes priority
      expect(req.tenantId).toBe('tenant-001');
      expect(req.tenant?.name).toBe('Default Tenant');
      expect(next).toHaveBeenCalled();
    });

    it('should fall back to subdomain when header is invalid', () => {
      const req = {
        headers: {
          'x-tenant-id': 'invalid-tenant',
        },
        hostname: 'acme.example.com',
      } as unknown as TenantRequest;

      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      identifyTenant(req, res, next);

      // Falls back to subdomain
      expect(req.tenantId).toBe('tenant-002');
      expect(req.tenant?.name).toBe('Acme Corp');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Inactive tenants', () => {
    it('should not identify inactive tenant', () => {
      // Deactivate tenant
      db.updateTenant('tenant-002', { isActive: false });

      const req = {
        headers: {
          'x-tenant-id': 'tenant-002',
        },
        hostname: 'localhost',
      } as unknown as TenantRequest;

      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      identifyTenant(req, res, next);

      // Should fall back to default
      expect(req.tenantId).toBe('tenant-001');
      expect(req.tenant?.name).toBe('Default Tenant');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Default fallback', () => {
    it('should fall back to default tenant when no match found', () => {
      const req = {
        headers: {},
        hostname: 'unknown.example.com',
      } as unknown as TenantRequest;

      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      identifyTenant(req, res, next);

      expect(req.tenantId).toBe('tenant-001');
      expect(req.tenant?.name).toBe('Default Tenant');
      expect(next).toHaveBeenCalled();
    });
  });
});
