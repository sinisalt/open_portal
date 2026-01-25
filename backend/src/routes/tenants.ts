import { randomUUID } from 'node:crypto';
import express from 'express';
import { type AuthRequest, authenticateToken } from '../middleware/auth.js';
import type { Tenant } from '../models/database.js';
import { db } from '../models/database.js';

const router = express.Router();

/**
 * GET /tenants
 * List all tenants (admin only)
 */
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    // Check if user has admin role
    if (!req.user?.roles.includes('admin')) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const tenants = db.getTenants();
    res.json({
      tenants: tenants.map((t) => ({
        id: t.id,
        name: t.name,
        subdomain: t.subdomain,
        domain: t.domain,
        isActive: t.isActive,
        featureFlags: t.featureFlags,
        metadata: t.metadata,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error listing tenants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /tenants/:id
 * Get tenant details
 */
router.get('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const tenant = db.getTenantById(id);

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    // Users can only view their own tenant unless they're admin
    if (req.user?.tenantId !== id && !req.user?.roles.includes('admin')) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      domain: tenant.domain,
      isActive: tenant.isActive,
      featureFlags: tenant.featureFlags,
      metadata: tenant.metadata,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /tenants
 * Create a new tenant (admin only)
 */
router.post('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    // Check if user has admin role
    if (!req.user?.roles.includes('admin')) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { name, subdomain, domain, featureFlags = {}, metadata = {} } = req.body;

    // Validate required fields
    if (!name) {
      res.status(400).json({ error: 'Tenant name is required' });
      return;
    }

    // Check if subdomain is already taken
    if (subdomain && db.getTenantBySubdomain(subdomain)) {
      res.status(409).json({ error: 'Subdomain already taken' });
      return;
    }

    // Check if domain is already taken
    if (domain && db.getTenantByDomain(domain)) {
      res.status(409).json({ error: 'Domain already taken' });
      return;
    }

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

    res.status(201).json({
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      domain: tenant.domain,
      isActive: tenant.isActive,
      featureFlags: tenant.featureFlags,
      metadata: tenant.metadata,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /tenants/:id
 * Update tenant (admin only)
 */
router.patch('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    // Check if user has admin role
    if (!req.user?.roles.includes('admin')) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;
    const { name, subdomain, domain, isActive, featureFlags, metadata } = req.body;

    const tenant = db.getTenantById(id);
    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    // Check if new subdomain is already taken
    if (subdomain && subdomain !== tenant.subdomain && db.getTenantBySubdomain(subdomain)) {
      res.status(409).json({ error: 'Subdomain already taken' });
      return;
    }

    // Check if new domain is already taken
    if (domain && domain !== tenant.domain && db.getTenantByDomain(domain)) {
      res.status(409).json({ error: 'Domain already taken' });
      return;
    }

    const updates: Partial<Tenant> = {};
    if (name !== undefined) updates.name = name;
    if (subdomain !== undefined) updates.subdomain = subdomain;
    if (domain !== undefined) updates.domain = domain;
    if (isActive !== undefined) updates.isActive = isActive;
    if (featureFlags !== undefined) {
      updates.featureFlags = { ...tenant.featureFlags, ...featureFlags };
    }
    if (metadata !== undefined) {
      updates.metadata = { ...tenant.metadata, ...metadata };
    }

    const updated = db.updateTenant(id, updates);

    if (!updated) {
      res.status(500).json({ error: 'Failed to update tenant' });
      return;
    }

    res.json({
      id: updated.id,
      name: updated.name,
      subdomain: updated.subdomain,
      domain: updated.domain,
      isActive: updated.isActive,
      featureFlags: updated.featureFlags,
      metadata: updated.metadata,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /tenants/:id
 * Deactivate tenant (admin only)
 * Note: We deactivate instead of deleting to preserve data integrity
 */
router.delete('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    // Check if user has admin role
    if (!req.user?.roles.includes('admin')) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;
    const tenant = db.getTenantById(id);

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    // Deactivate instead of deleting
    db.updateTenant(id, { isActive: false });

    res.json({ success: true, message: 'Tenant deactivated successfully' });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
