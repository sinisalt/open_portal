/**
 * Audit Middleware
 * 
 * Automatically logs all authenticated actions for audit trail
 */

import type { NextFunction, Request, Response } from 'express';
import { auditLogger, extractRequestInfo } from '../services/auditService.js';

/**
 * Audit middleware - logs all authenticated requests
 */
export function auditMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Only audit authenticated requests (skip health checks and public endpoints)
  if (!req.user || req.path === '/health') {
    return next();
  }

  const startTime = Date.now();

  // Capture original res.json to log response
  const originalJson = res.json.bind(res);
  let responseData: unknown;

  res.json = function (data: unknown) {
    responseData = data;
    return originalJson(data);
  };

  // Log audit entry on response finish
  res.on('finish', () => {
    const requestInfo = extractRequestInfo(req);
    const success = res.statusCode < 400;
    const duration = Date.now() - startTime;

    // Determine action based on method and path
    const action = determineAction(req.method, req.path);
    const resource = extractResource(req.path);
    const resourceId = extractResourceId(req.path);

    auditLogger.log({
      ...requestInfo,
      action,
      resource,
      resourceId,
      method: req.method,
      success,
      correlationId: req.correlationId,
      metadata: {
        duration,
        statusCode: res.statusCode,
        query: req.query,
        // Only log body for certain actions (avoid logging sensitive data)
        body: shouldLogBody(action) ? sanitizeBody(req.body) : undefined,
        error: !success && typeof responseData === 'object' && responseData !== null
          ? (responseData as { error?: string }).error
          : undefined,
      },
    });
  });

  next();
}

/**
 * Determine action from request method and path
 */
function determineAction(method: string, path: string): string {
  // Authentication
  if (path.includes('/auth/login')) return 'auth.login';
  if (path.includes('/auth/logout')) return 'auth.logout';
  if (path.includes('/auth/refresh')) return 'auth.refresh';

  // Configuration
  if (path.includes('/config')) {
    if (path.includes('/deploy')) return 'config.deploy';
    if (path.includes('/rollback')) return 'config.rollback';
    if (path.includes('/approve')) return 'config.approve';
    if (method === 'POST') return 'config.create';
    if (method === 'PUT' || method === 'PATCH') return 'config.update';
    if (method === 'DELETE') return 'config.delete';
  }

  // Tenants
  if (path.includes('/tenants')) {
    if (method === 'POST') return 'tenant.create';
    if (method === 'PUT' || method === 'PATCH') return 'tenant.update';
    if (method === 'DELETE') return 'tenant.delete';
  }

  // Users
  if (path.includes('/users')) {
    if (method === 'POST') return 'user.create';
    if (method === 'PUT' || method === 'PATCH') return 'user.update';
    if (method === 'DELETE') return 'user.delete';
  }

  // UI actions
  if (path.includes('/ui/actions')) return 'ui.action_execute';
  if (path.includes('/ui')) return 'ui.page_view';

  // Default
  return `${method.toLowerCase()}.${extractResource(path)}`;
}

/**
 * Extract resource type from path
 */
function extractResource(path: string): string {
  const match = path.match(/^\/([^/]+)/);
  return match ? match[1] : 'unknown';
}

/**
 * Extract resource ID from path
 */
function extractResourceId(path: string): string | undefined {
  const match = path.match(/\/([^/]+)\/([a-zA-Z0-9-_]+)(?:\/|$)/);
  return match ? match[2] : undefined;
}

/**
 * Determine if request body should be logged for this action
 */
function shouldLogBody(action: string): boolean {
  // Don't log sensitive authentication data
  if (action.startsWith('auth.')) return false;
  
  // Log config changes
  if (action.startsWith('config.')) return true;
  
  // Log user/tenant changes
  if (action.startsWith('user.') || action.startsWith('tenant.')) return true;
  
  return false;
}

/**
 * Sanitize request body to remove sensitive data
 */
function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;

  const sanitized = { ...body } as Record<string, unknown>;
  
  // Remove sensitive fields
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'apiKey',
    'privateKey',
    'creditCard',
    'ssn',
  ];

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}
