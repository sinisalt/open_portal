import type { Request } from 'express';

/**
 * Action execution context
 * Provides all necessary information for action handlers to execute
 */
export interface ActionContext {
  user: {
    id: string;
    email: string;
    roles: string[];
    tenantId: string;
  };
  tenant: {
    id: string;
  };
  permissions: string[];
  request: {
    ipAddress?: string;
    userAgent?: string;
  };
  // In production, would include database connection, service registry, etc.
}

/**
 * Validation result for action parameters
 */
export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
}

/**
 * Result returned from action execution
 */
export interface ActionResult {
  success: boolean;
  data?: unknown;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
  metadata?: {
    affectedRecords?: number;
    executionTime?: number;
  };
}

/**
 * Action handler interface
 * Each action must implement this interface
 */
export interface ActionHandler {
  id: string;
  permissions?: string[];
  validate?: (params: unknown) => ValidationResult;
  execute: (params: unknown, context: ActionContext) => Promise<ActionResult>;
}

/**
 * Action execution request from frontend
 */
export interface ActionExecuteRequest {
  actionId: string;
  params: Record<string, unknown>;
  context?: {
    pageId?: string;
    widgetId?: string;
  };
}

/**
 * Helper to create action context from Express request
 */
export function createActionContext(
  req: Request & { user?: ActionContext['user'] },
): ActionContext {
  const user = req.user;
  if (!user) {
    throw new Error('User not authenticated');
  }

  return {
    user,
    tenant: {
      id: user.tenantId,
    },
    permissions: [], // Will be populated by action service
    request: {
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    },
  };
}
