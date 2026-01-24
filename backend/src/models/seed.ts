import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import pino from 'pino';
import type { User } from './database.js';
import { db } from './database.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

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
