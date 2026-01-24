import { randomUUID } from 'node:crypto';
import type { ActionAuditLog } from '../models/database.js';
import { db } from '../models/database.js';
import { getUserPermissionsFromRoles } from '../utils/permissions.js';
import { actionRegistry } from './actionRegistry.js';
import type { ActionContext, ActionExecuteRequest, ActionResult } from './actionTypes.js';

/**
 * Action Service
 * Handles action execution with validation, permission checking, and audit logging
 */
export class ActionService {
  /**
   * Execute an action with full validation and audit logging
   */
  async execute(request: ActionExecuteRequest, context: ActionContext): Promise<ActionResult> {
    const startTime = Date.now();
    let result: ActionResult;
    let error: Error | undefined;

    try {
      // Get action handler
      const handler = actionRegistry.get(request.actionId);
      if (!handler) {
        result = {
          success: false,
          errors: [
            {
              message: `Action "${request.actionId}" not found`,
              code: 'ACTION_NOT_FOUND',
            },
          ],
        };
        return result;
      }

      // Get user permissions
      const permissions = getUserPermissionsFromRoles(context.user.roles);
      context.permissions = permissions;

      // Check action permissions
      if (handler.permissions && handler.permissions.length > 0) {
        const hasPermission = handler.permissions.some((perm) => permissions.includes(perm));
        if (!hasPermission) {
          result = {
            success: false,
            errors: [
              {
                message: `Insufficient permissions to execute action "${request.actionId}"`,
                code: 'PERMISSION_DENIED',
              },
            ],
          };
          return result;
        }
      }

      // Validate parameters
      if (handler.validate) {
        const validation = handler.validate(request.params);
        if (!validation.valid) {
          result = {
            success: false,
            errors: validation.errors || [
              {
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
              },
            ],
          };
          return result;
        }
      }

      // Execute action
      result = await handler.execute(request.params, context);

      // Add execution time to metadata
      if (!result.metadata) {
        result.metadata = {};
      }
      result.metadata.executionTime = Date.now() - startTime;

      return result;
    } catch (err) {
      error = err as Error;
      result = {
        success: false,
        errors: [
          {
            message: 'Internal server error during action execution',
            code: 'INTERNAL_ERROR',
          },
        ],
      };
      return result;
    } finally {
      // Audit log (always execute, even on error)
      const executionTime = Date.now() - startTime;
      await this.auditLog(request, context, result, executionTime, error);
    }
  }

  /**
   * Log action execution to audit log
   */
  private async auditLog(
    request: ActionExecuteRequest,
    context: ActionContext,
    result: ActionResult,
    executionTime: number,
    error?: Error,
  ): Promise<void> {
    const auditEntry: ActionAuditLog = {
      id: randomUUID(),
      actionId: request.actionId,
      userId: context.user.id,
      tenantId: context.tenant.id,
      params: request.params,
      context: request.context,
      success: result.success,
      errorMessage: error?.message || result.errors?.[0]?.message,
      executionTimeMs: executionTime,
      ipAddress: context.request.ipAddress,
      userAgent: context.request.userAgent,
      affectedRecords: result.metadata?.affectedRecords,
      createdAt: new Date(),
    };

    db.addActionAuditLog(auditEntry);
  }

  /**
   * Get action audit logs for a user
   */
  async getAuditLogs(userId: string, limit = 100): Promise<ActionAuditLog[]> {
    return db.getActionAuditLogsByUser(userId, limit);
  }

  /**
   * Get action audit logs for a tenant
   */
  async getTenantAuditLogs(tenantId: string, limit = 100): Promise<ActionAuditLog[]> {
    return db.getActionAuditLogsByTenant(tenantId, limit);
  }
}

// Export singleton instance
export const actionService = new ActionService();
