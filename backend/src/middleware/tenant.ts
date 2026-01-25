import type { NextFunction, Request, Response } from 'express';
import { db } from '../models/database.js';

/**
 * Extended Request interface with tenant information
 */
export interface TenantRequest extends Request {
  tenantId?: string;
  tenant?: {
    id: string;
    name: string;
    featureFlags: Record<string, boolean>;
  };
}

/**
 * Tenant Identification Middleware
 * Identifies tenant from subdomain, domain, or X-Tenant-ID header
 * Priority: Header > Subdomain > Domain > Default
 */
export function identifyTenant(req: TenantRequest, _res: Response, next: NextFunction): void {
  let tenantId: string | undefined;

  // Priority 1: Check X-Tenant-ID header
  const tenantIdHeader = req.headers['x-tenant-id'] as string | undefined;
  if (tenantIdHeader) {
    const tenant = db.getTenantById(tenantIdHeader);
    if (tenant?.isActive) {
      tenantId = tenant.id;
      req.tenant = {
        id: tenant.id,
        name: tenant.name,
        featureFlags: tenant.featureFlags,
      };
    }
  }

  // Priority 2: Check subdomain
  if (!tenantId) {
    const host = req.hostname || req.headers.host || '';
    const parts = host.split('.');

    // Extract subdomain (e.g., "acme" from "acme.example.com")
    if (parts.length >= 3) {
      const subdomain = parts[0];
      const tenant = db.getTenantBySubdomain(subdomain);
      if (tenant?.isActive) {
        tenantId = tenant.id;
        req.tenant = {
          id: tenant.id,
          name: tenant.name,
          featureFlags: tenant.featureFlags,
        };
      }
    }
  }

  // Priority 3: Check full domain
  if (!tenantId) {
    const domain = req.hostname || req.headers.host || '';
    const tenant = db.getTenantByDomain(domain);
    if (tenant?.isActive) {
      tenantId = tenant.id;
      req.tenant = {
        id: tenant.id,
        name: tenant.name,
        featureFlags: tenant.featureFlags,
      };
    }
  }

  // Priority 4: Default to tenant-001 for local development
  if (!tenantId) {
    const defaultTenant = db.getTenantById('tenant-001');
    if (defaultTenant?.isActive) {
      tenantId = defaultTenant.id;
      req.tenant = {
        id: defaultTenant.id,
        name: defaultTenant.name,
        featureFlags: defaultTenant.featureFlags,
      };
    }
  }

  req.tenantId = tenantId;
  next();
}
