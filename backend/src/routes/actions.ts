import express from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth.js';
import { authenticateToken } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { actionService } from '../services/actionService.js';
import type { ActionExecuteRequest } from '../services/actionTypes.js';
import { createActionContext } from '../services/actionTypes.js';

const router = express.Router();

/**
 * Request validation schema
 */
const executeActionSchema = z.object({
  actionId: z.string().min(1, 'Action ID is required'),
  params: z.record(z.unknown()),
  context: z
    .object({
      pageId: z.string().optional(),
      widgetId: z.string().optional(),
    })
    .optional(),
});

/**
 * POST /ui/actions/execute
 * Execute an action with permission checking and audit logging
 */
router.post(
  '/execute',
  authenticateToken,
  authRateLimiter, // Apply rate limiting to prevent abuse
  async (req: AuthRequest, res: express.Response) => {
    try {
      // Validate request body
      const validation = executeActionSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          errors: validation.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
            code: 'VALIDATION_ERROR',
          })),
        });
        return;
      }

      const request: ActionExecuteRequest = validation.data;

      // Create action context
      const context = createActionContext(req);

      // Execute action
      const result = await actionService.execute(request, context);

      // Determine HTTP status code
      let statusCode = 200;
      if (!result.success) {
        const errorCode = result.errors?.[0]?.code;
        if (errorCode === 'ACTION_NOT_FOUND') {
          statusCode = 404;
        } else if (errorCode === 'PERMISSION_DENIED') {
          statusCode = 403;
        } else if (errorCode === 'VALIDATION_ERROR' || errorCode === 'NOT_FOUND') {
          statusCode = 400;
        } else {
          statusCode = 500;
        }
      }

      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Error executing action:', error);
      res.status(500).json({
        success: false,
        errors: [
          {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR',
          },
        ],
      });
    }
  },
);

/**
 * GET /ui/actions/audit
 * Get action audit logs for the authenticated user
 */
router.get('/audit', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const limit = Number.parseInt(req.query.limit as string, 10) || 100;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        errors: [{ message: 'User not authenticated', code: 'UNAUTHORIZED' }],
      });
      return;
    }

    const logs = await actionService.getAuditLogs(userId, limit);

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      errors: [
        {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      ],
    });
  }
});

export default router;
