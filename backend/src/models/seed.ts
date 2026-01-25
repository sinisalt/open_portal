import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import pino from 'pino';
import type { Tenant, User } from './database.js';
import { db } from './database.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

/**
 * Seed test tenants into the database
 */
export async function seedTenants(): Promise<void> {
  const tenants: Tenant[] = [
    {
      id: 'tenant-001',
      name: 'Default Tenant',
      subdomain: 'app',
      domain: 'localhost',
      isActive: true,
      featureFlags: {
        darkMode: true,
        notifications: true,
        analytics: true,
        websockets: true,
      },
      metadata: {
        industry: 'Technology',
        size: 'small',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'tenant-002',
      name: 'Acme Corporation',
      subdomain: 'acme',
      domain: 'acme.example.com',
      isActive: true,
      featureFlags: {
        darkMode: true,
        notifications: true,
        analytics: false,
        websockets: true,
      },
      metadata: {
        industry: 'Manufacturing',
        size: 'large',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const tenant of tenants) {
    db.createTenant(tenant);
  }

  logger.info(`Seeded ${tenants.length} test tenants`);
}

/**
 * Seed test users into the database
 */
export async function seedUsers(): Promise<void> {
  const users: Omit<User, 'passwordHash'>[] = [
    {
      id: randomUUID(),
      email: 'admin@example.com',
      name: 'Admin User',
      tenantId: 'tenant-001',
      isActive: true,
      failedLoginAttempts: 0,
      roles: ['admin', 'user'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: randomUUID(),
      email: 'user@example.com',
      name: 'Regular User',
      tenantId: 'tenant-001',
      isActive: true,
      failedLoginAttempts: 0,
      roles: ['user'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const passwords = {
    'admin@example.com': 'admin123',
    'user@example.com': 'user123',
  };

  for (const userData of users) {
    const password = passwords[userData.email as keyof typeof passwords];
    const passwordHash = await bcrypt.hash(password, 10);

    const user: User = {
      ...userData,
      passwordHash,
    };

    db.createUser(user);
  }

  logger.info('Seeded test users');
  logger.info('Test user accounts available (credentials in backend/README.md)');
}
