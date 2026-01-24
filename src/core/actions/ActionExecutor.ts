/**
 * Action Executor
 *
 * Core execution engine that interprets and executes actions defined in configurations
 */

import type {
  ActionConfig,
  ActionContext,
  ActionError,
  ActionResult,
  IActionExecutor,
} from '@/types/action.types';
import { ActionKind } from '@/types/action.types';
import { actionRegistry } from './ActionRegistry';
import { evaluateCondition, resolveTemplatesInObject } from './templateUtils';

/**
 * Action executor implementation
 */
export class ActionExecutor implements IActionExecutor {
  private pendingActions: Map<string, AbortController>;
  private enableLogging: boolean;

  constructor(options?: { enableLogging?: boolean }) {
    this.pendingActions = new Map();
    // Default to true in dev mode, false in production/test
    const isDev = typeof process !== 'undefined' ? process.env.NODE_ENV === 'development' : false;
    this.enableLogging = options?.enableLogging ?? isDev;
  }

  /**
   * Execute an action
   */
  async execute(
    action: ActionConfig,
    context: ActionContext,
    signal?: AbortSignal
  ): Promise<ActionResult> {
    const startTime = Date.now();
    const actionId = action.id || `action-${Date.now()}`;

    // Check if already cancelled
    if (signal?.aborted) {
      return this.createCancelledResult(startTime);
    }

    try {
      // Log action start
      if (this.enableLogging) {
        this.logStart(action, context);
      }

      // Evaluate condition
      if (action.when && !evaluateCondition(action.when, context)) {
        if (this.enableLogging) {
          console.log(`[Action] Skipped "${action.id}" - condition not met:`, action.when);
        }
        return this.createSuccessResult(
          { skipped: true, reason: 'condition_not_met' },
          startTime,
          { skipped: true }
        );
      }

      // Resolve parameters with templates
      const resolvedParams = action.params ? resolveTemplatesInObject(action.params, context) : {};

      // Create abort controller for this action
      const actionAbortController = new AbortController();
      this.pendingActions.set(actionId, actionAbortController);

      // Link parent signal if provided
      if (signal) {
        signal.addEventListener('abort', () => {
          actionAbortController.abort();
        });
      }

      // Apply timeout if specified
      let timeoutId: NodeJS.Timeout | undefined;
      if (action.timeout) {
        timeoutId = setTimeout(() => {
          actionAbortController.abort();
        }, action.timeout);
      }

      try {
        // Execute the action with retry logic
        const result = await this.executeWithRetry(
          action,
          resolvedParams,
          context,
          actionAbortController.signal
        );

        // Clear timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Log success or error based on result
        if (result.success) {
          if (this.enableLogging) {
            this.logSuccess(action, result, Date.now() - startTime);
          }

          // Execute success handlers
          if (action.onSuccess) {
            const successActions = Array.isArray(action.onSuccess)
              ? action.onSuccess
              : [action.onSuccess];
            await this.executeSequence(successActions, context, signal);
          }
        } else {
          // Result indicates failure
          if (this.enableLogging) {
            this.logError(action, result.error!, Date.now() - startTime);
          }

          // Execute error handlers
          if (action.onError) {
            const errorActions = Array.isArray(action.onError) ? action.onError : [action.onError];
            try {
              await this.executeSequence(errorActions, context, signal);
            } catch (handlerError) {
              console.error('[Action] Error handler failed:', handlerError);
            }
          }
        }

        return result;
      } catch (error) {
        // Clear timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Handle error
        const actionError = this.normalizeError(error);
        const errorResult = this.createErrorResult(actionError, startTime);

        // Log error
        if (this.enableLogging) {
          this.logError(action, actionError, Date.now() - startTime);
        }

        // Execute error handlers
        if (action.onError) {
          const errorActions = Array.isArray(action.onError) ? action.onError : [action.onError];
          try {
            await this.executeSequence(errorActions, context, signal);
          } catch (handlerError) {
            console.error('[Action] Error handler failed:', handlerError);
          }
        }

        return errorResult;
      }
    } finally {
      // Cleanup
      this.pendingActions.delete(actionId);
    }
  }

  /**
   * Execute action with retry logic
   */
  private async executeWithRetry(
    action: ActionConfig,
    params: Record<string, unknown>,
    context: ActionContext,
    signal: AbortSignal
  ): Promise<ActionResult> {
    const maxAttempts = action.retry?.attempts ?? 1;
    const retryDelay = action.retry?.delay ?? 1000;
    const backoff = action.retry?.backoff ?? 'linear';

    let lastError: ActionError | undefined;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Get handler
        const handler = actionRegistry.get(action.type);
        if (!handler) {
          throw new Error(`Action handler not found for type: ${action.type}`);
        }

        // Execute handler
        const result = await handler(params, context, signal);
        return result;
      } catch (error) {
        lastError = this.normalizeError(error);

        // Don't retry if cancelled or max attempts reached
        if (signal.aborted || attempt === maxAttempts - 1) {
          break;
        }

        // Calculate delay with backoff
        const delay = backoff === 'exponential' ? retryDelay * 2 ** attempt : retryDelay;

        // Wait before retry
        await this.sleep(delay, signal);
      }
    }

    // All retries failed
    return this.createErrorResult(lastError!, Date.now(), maxAttempts - 1);
  }

  /**
   * Execute multiple actions in sequence
   */
  async executeSequence(
    actions: ActionConfig[],
    context: ActionContext,
    signal?: AbortSignal
  ): Promise<ActionResult[]> {
    const results: ActionResult[] = [];

    for (const action of actions) {
      if (signal?.aborted) {
        break;
      }

      const result = await this.execute(action, context, signal);
      results.push(result);

      // Stop sequence if action failed
      if (!result.success) {
        break;
      }
    }

    return results;
  }

  /**
   * Execute multiple actions in parallel
   */
  async executeParallel(
    actions: ActionConfig[],
    context: ActionContext,
    signal?: AbortSignal
  ): Promise<ActionResult[]> {
    const promises = actions.map(action => this.execute(action, context, signal));
    return Promise.all(promises);
  }

  /**
   * Cancel all pending actions
   */
  cancelAll(): void {
    for (const controller of this.pendingActions.values()) {
      controller.abort();
    }
    this.pendingActions.clear();
  }

  /**
   * Sleep with cancellation support
   */
  private sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);

      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('Cancelled'));
        });
      }
    });
  }

  /**
   * Create success result
   */
  private createSuccessResult<T>(
    data: T,
    startTime: number,
    extra?: { skipped?: boolean }
  ): ActionResult<T> {
    return {
      success: true,
      data,
      metadata: {
        duration: Date.now() - startTime,
        ...extra,
      },
    };
  }

  /**
   * Create error result
   */
  private createErrorResult(error: ActionError, startTime: number, retries?: number): ActionResult {
    return {
      success: false,
      error,
      metadata: {
        duration: Date.now() - startTime,
        retries,
      },
    };
  }

  /**
   * Create cancelled result
   */
  private createCancelledResult(startTime: number): ActionResult {
    return {
      success: false,
      error: {
        message: 'Action was cancelled',
        code: 'CANCELLED',
      },
      metadata: {
        duration: Date.now() - startTime,
        cancelled: true,
      },
    };
  }

  /**
   * Normalize error to ActionError
   */
  private normalizeError(error: unknown): ActionError {
    if (error && typeof error === 'object' && 'message' in error) {
      const err = error as Error & { code?: string; status?: number };
      return {
        message: err.message,
        code: err.code,
        status: err.status,
        cause: error,
      };
    }

    return {
      message: String(error),
      cause: error,
    };
  }

  /**
   * Log action start
   */
  private logStart(action: ActionConfig, context: ActionContext): void {
    console.groupCollapsed(`[Action] Start: ${action.id} (${action.type})`);
    console.log('Action:', action);
    console.log('Context:', context);
    console.groupEnd();
  }

  /**
   * Log action success
   */
  private logSuccess(action: ActionConfig, result: ActionResult, duration: number): void {
    console.log(
      `[Action] Success: ${action.id} (${duration}ms)`,
      result.data !== undefined ? result.data : ''
    );
  }

  /**
   * Log action error
   */
  private logError(action: ActionConfig, error: ActionError, duration: number): void {
    console.groupCollapsed(`[Action] Error: ${action.id} (${duration}ms)`);
    console.error('Error:', error);
    console.groupEnd();
  }
}

/**
 * Global action executor instance
 */
export const actionExecutor = new ActionExecutor();
