/**
 * Audit Logging Service
 *
 * Tracks all user actions, configuration changes, and security events
 * for compliance and security auditing.
 */

import pino from 'pino';
import { config } from '../config/index.js';

const logger = pino({ level: config.logLevel });

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  tenantId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  ip: string;
  userAgent: string;
  success: boolean;
  changes?: {
    before?: unknown;
    after?: unknown;
  };
  metadata?: Record<string, unknown>;
  correlationId?: string;
}

export type AuditAction =
  // Authentication
  | 'auth.login'
  | 'auth.logout'
  | 'auth.refresh'
  | 'auth.failed'
  // Configuration
  | 'config.create'
  | 'config.update'
  | 'config.delete'
  | 'config.deploy'
  | 'config.rollback'
  | 'config.approve'
  // User management
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  | 'user.password_change'
  // Tenant management
  | 'tenant.create'
  | 'tenant.update'
  | 'tenant.delete'
  // UI actions
  | 'ui.page_view'
  | 'ui.action_execute'
  | 'ui.widget_interact'
  // System
  | 'system.error'
  | 'system.alert';

/**
 * Audit Log Storage
 * In-memory storage for development. In production, this would be
 * sent to a database, log aggregation service (ELK, Splunk), or
 * compliance system.
 */
class AuditLogger {
  private logs: AuditLog[] = [];
  private maxLogs = 10000; // Keep last 10k logs in memory

  /**
   * Log an audit event
   */
  log(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const auditLog: AuditLog = {
      id: this.generateId(),
      timestamp: new Date(),
      ...entry,
    };

    this.logs.push(auditLog);

    // Keep only last N logs in memory
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to Pino for structured logging
    logger.info(
      {
        audit: {
          id: auditLog.id,
          action: auditLog.action,
          resource: auditLog.resource,
          userId: auditLog.userId,
          tenantId: auditLog.tenantId,
          success: auditLog.success,
          correlationId: auditLog.correlationId,
        },
      },
      `Audit: ${auditLog.action} on ${auditLog.resource}`,
    );

    // In production, send to audit storage
    // await this.sendToAuditStore(auditLog);
  }

  /**
   * Query audit logs
   */
  query(filters: {
    userId?: string;
    tenantId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    success?: boolean;
    limit?: number;
  }): AuditLog[] {
    let results = [...this.logs];

    if (filters.userId) {
      results = results.filter((log) => log.userId === filters.userId);
    }
    if (filters.tenantId) {
      results = results.filter((log) => log.tenantId === filters.tenantId);
    }
    if (filters.action) {
      results = results.filter((log) => log.action === filters.action);
    }
    if (filters.resource) {
      results = results.filter((log) => log.resource === filters.resource);
    }
    if (filters.startDate) {
      const startDate = filters.startDate;
      results = results.filter((log) => log.timestamp >= startDate);
    }
    if (filters.endDate) {
      const endDate = filters.endDate;
      results = results.filter((log) => log.timestamp <= endDate);
    }
    if (filters.success !== undefined) {
      results = results.filter((log) => log.success === filters.success);
    }

    // Sort by timestamp descending (newest first)
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Limit results
    const limit = filters.limit || 100;
    return results.slice(0, limit);
  }

  /**
   * Get audit statistics
   */
  getStats(filters?: { startDate?: Date; endDate?: Date; tenantId?: string }): {
    totalLogs: number;
    byAction: Record<string, number>;
    byResource: Record<string, number>;
    successRate: number;
  } {
    let logs = [...this.logs];

    if (filters?.startDate) {
      const startDate = filters.startDate;
      logs = logs.filter((log) => log.timestamp >= startDate);
    }
    if (filters?.endDate) {
      const endDate = filters.endDate;
      logs = logs.filter((log) => log.timestamp <= endDate);
    }
    if (filters?.tenantId) {
      logs = logs.filter((log) => log.tenantId === filters.tenantId);
    }

    const byAction: Record<string, number> = {};
    const byResource: Record<string, number> = {};
    let successCount = 0;

    for (const log of logs) {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byResource[log.resource] = (byResource[log.resource] || 0) + 1;
      if (log.success) successCount++;
    }

    return {
      totalLogs: logs.length,
      byAction,
      byResource,
      successRate: logs.length > 0 ? successCount / logs.length : 1,
    };
  }

  /**
   * Clear old logs (for maintenance)
   */
  clearOldLogs(beforeDate: Date): number {
    const originalLength = this.logs.length;
    this.logs = this.logs.filter((log) => log.timestamp >= beforeDate);
    const removed = originalLength - this.logs.length;

    if (removed > 0) {
      logger.info({ removed, beforeDate }, 'Cleared old audit logs');
    }

    return removed;
  }

  /**
   * Get all logs (for export)
   */
  getAll(): AuditLog[] {
    return [...this.logs];
  }

  /**
   * Generate unique ID for audit log
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Singleton instance
export const auditLogger = new AuditLogger();

/**
 * Helper function to extract request info
 */
export function extractRequestInfo(req: {
  user?: { id: string };
  tenantId?: string;
  ip?: string;
  headers?: { 'user-agent'?: string };
}): {
  userId: string;
  tenantId?: string;
  ip: string;
  userAgent: string;
} {
  return {
    userId: req.user?.id || 'anonymous',
    tenantId: req.tenantId,
    ip: req.ip || 'unknown',
    userAgent: req.headers?.['user-agent'] || 'unknown',
  };
}

/**
 * Export audit service
 */
export const auditService = {
  auditLogger,
  extractRequestInfo,
};
