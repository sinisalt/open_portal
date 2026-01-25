import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { config } from '../config/index';
import { authenticateToken } from '../middleware/auth';
import type { Tenant } from '../models/database';
import { db } from '../models/database';
import tenantsRouter from '../routes/tenants';

// Create test app
const app = express();
app.use(express.json());
app.use('/tenants', authenticateToken, tenantsRouter);

// Mock user for tests
const mockAdminUser = {
  id: 'user-001',
  email: 'admin@example.com',
  roles: ['admin', 'user'],
  tenantId: 'tenant-001',
};

const mockRegularUser = {
  id: 'user-002',
  email: 'user@example.com',
  roles: ['user'],
  tenantId: 'tenant-001',
};

// Generate test tokens
const generateToken = (user: typeof mockAdminUser | typeof mockRegularUser) => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      tenantId: user.tenantId,
    },
    config.jwtSecret,
    { expiresIn: '1h' },
  );
};

describe('Tenant Routes', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(() => {
    adminToken = generateToken(mockAdminUser);
    userToken = generateToken(mockRegularUser);
  });

  beforeEach(() => {
    // Clear tenants before each test
    const tenants = db.getTenants();
    for (const tenant of tenants) {
      db.deleteTenant(tenant.id);
    }

    // Create test tenant
    const testTenant: Tenant = {
      id: 'tenant-001',
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
    db.createTenant(testTenant);
  });

  describe('GET /tenants', () => {
    it('should return all tenants for admin', async () => {
      const response = await request(app)
        .get('/tenants')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tenants).toHaveLength(1);
      expect(response.body.tenants[0].name).toBe('Test Tenant');
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .get('/tenants')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Admin access required');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app).get('/tenants');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /tenants/:id', () => {
    it('should return tenant details for admin', async () => {
      const response = await request(app)
        .get('/tenants/tenant-001')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('tenant-001');
      expect(response.body.name).toBe('Test Tenant');
    });

    it('should allow user to view their own tenant', async () => {
      const response = await request(app)
        .get('/tenants/tenant-001')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('tenant-001');
    });

    it('should reject user viewing different tenant', async () => {
      const otherTenant: Tenant = {
        id: 'tenant-002',
        name: 'Other Tenant',
        isActive: true,
        featureFlags: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.createTenant(otherTenant);

      const response = await request(app)
        .get('/tenants/tenant-002')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });

    it('should return 404 for non-existent tenant', async () => {
      const response = await request(app)
        .get('/tenants/non-existent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Tenant not found');
    });
  });

  describe('POST /tenants', () => {
    it('should create new tenant for admin', async () => {
      const newTenant = {
        name: 'New Tenant',
        subdomain: 'new',
        domain: 'new.example.com',
        featureFlags: {
          darkMode: false,
        },
        metadata: {
          industry: 'Healthcare',
        },
      };

      const response = await request(app)
        .post('/tenants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newTenant);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('New Tenant');
      expect(response.body.subdomain).toBe('new');
      expect(response.body.isActive).toBe(true);
      expect(response.body.id).toBeDefined();
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .post('/tenants')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'New Tenant' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Admin access required');
    });

    it('should reject tenant without name', async () => {
      const response = await request(app)
        .post('/tenants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Tenant name is required');
    });

    it('should reject duplicate subdomain', async () => {
      const response = await request(app)
        .post('/tenants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate Tenant',
          subdomain: 'test', // Already exists
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Subdomain already taken');
    });

    it('should reject duplicate domain', async () => {
      const response = await request(app)
        .post('/tenants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate Tenant',
          domain: 'test.example.com', // Already exists
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Domain already taken');
    });
  });

  describe('PATCH /tenants/:id', () => {
    it('should update tenant for admin', async () => {
      const response = await request(app)
        .patch('/tenants/tenant-001')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Tenant',
          featureFlags: {
            analytics: true,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Tenant');
      expect(response.body.featureFlags.analytics).toBe(true);
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .patch('/tenants/tenant-001')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Admin access required');
    });

    it('should return 404 for non-existent tenant', async () => {
      const response = await request(app)
        .patch('/tenants/non-existent')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Tenant not found');
    });

    it('should reject duplicate subdomain', async () => {
      const otherTenant: Tenant = {
        id: 'tenant-002',
        name: 'Other Tenant',
        subdomain: 'other',
        isActive: true,
        featureFlags: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.createTenant(otherTenant);

      const response = await request(app)
        .patch('/tenants/tenant-001')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ subdomain: 'other' });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Subdomain already taken');
    });
  });

  describe('DELETE /tenants/:id', () => {
    it('should deactivate tenant for admin', async () => {
      const response = await request(app)
        .delete('/tenants/tenant-001')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify tenant is deactivated
      const tenant = db.getTenantById('tenant-001');
      expect(tenant?.isActive).toBe(false);
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .delete('/tenants/tenant-001')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Admin access required');
    });

    it('should return 404 for non-existent tenant', async () => {
      const response = await request(app)
        .delete('/tenants/non-existent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Tenant not found');
    });
  });
});
