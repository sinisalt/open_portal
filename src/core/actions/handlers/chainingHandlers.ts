/**
 * Action Chaining Handlers
 *
 * Handlers for action chaining (sequence, parallel, conditional)
 */

import type {
  ActionContext,
  ActionResult,
  ConditionalActionParams,
  ParallelActionParams,
  SequenceActionParams,
} from '@/types/action.types';
import { evaluateCondition } from '../templateUtils';

/**
 * Execute actions sequentially
 * Note: This is handled directly by ActionExecutor.executeSequence
 * This handler is provided for completeness
 */
export async function sequenceHandler(
  params: SequenceActionParams,
  context: ActionContext,
  signal?: AbortSignal
): Promise<ActionResult> {
  try {
    const { actions } = params;

    if (!actions || !Array.isArray(actions)) {
      throw new Error('Sequence action requires "actions" array parameter');
    }

    // Import executor dynamically to avoid circular dependency
    const { actionExecutor } = await import('../ActionExecutor');
    const results = await actionExecutor.executeSequence(actions, context, signal);

    // Check if all actions succeeded
    const allSucceeded = results.every(r => r.success);

    return {
      success: allSucceeded,
      data: { results },
      metadata: { duration: 0 },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: 'SEQUENCE_ERROR',
        cause: error,
      },
      metadata: { duration: 0 },
    };
  }
}

/**
 * Execute actions in parallel
 * Note: This is handled directly by ActionExecutor.executeParallel
 * This handler is provided for completeness
 */
export async function parallelHandler(
  params: ParallelActionParams,
  context: ActionContext,
  signal?: AbortSignal
): Promise<ActionResult> {
  try {
    const { actions } = params;

    if (!actions || !Array.isArray(actions)) {
      throw new Error('Parallel action requires "actions" array parameter');
    }

    // Import executor dynamically to avoid circular dependency
    const { actionExecutor } = await import('../ActionExecutor');
    const results = await actionExecutor.executeParallel(actions, context, signal);

    // Check if all actions succeeded
    const allSucceeded = results.every(r => r.success);

    return {
      success: allSucceeded,
      data: { results },
      metadata: { duration: 0 },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: 'PARALLEL_ERROR',
        cause: error,
      },
      metadata: { duration: 0 },
    };
  }
}

/**
 * Execute actions conditionally based on a condition
 */
export async function conditionalHandler(
  params: ConditionalActionParams,
  context: ActionContext,
  signal?: AbortSignal
): Promise<ActionResult> {
  try {
    const { condition, then: thenActions, else: elseActions } = params;

    if (!condition) {
      throw new Error('Conditional action requires "condition" parameter');
    }

    // Evaluate condition
    const conditionResult = evaluateCondition(condition, context);

    // Select actions to execute
    const actionsToExecute = conditionResult ? thenActions : elseActions;

    if (!actionsToExecute) {
      return {
        success: true,
        data: { condition: conditionResult, executed: false },
        metadata: { duration: 0 },
      };
    }

    // Import executor dynamically to avoid circular dependency
    const { actionExecutor } = await import('../ActionExecutor');

    // Execute selected actions
    const actions = Array.isArray(actionsToExecute) ? actionsToExecute : [actionsToExecute];
    const results = await actionExecutor.executeSequence(actions, context, signal);

    // Check if all actions succeeded
    const allSucceeded = results.every(r => r.success);

    return {
      success: allSucceeded,
      data: { condition: conditionResult, results },
      metadata: { duration: 0 },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: 'CONDITIONAL_ERROR',
        cause: error,
      },
      metadata: { duration: 0 },
    };
  }
}
