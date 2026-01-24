/**
 * State Management Action Handlers
 *
 * Handlers for state management actions (setState, resetState, mergeState)
 */

import type {
  ActionContext,
  ActionResult,
  MergeStateActionParams,
  ResetStateActionParams,
  SetStateActionParams,
} from '@/types/action.types';
import { setNestedValue } from '../templateUtils';

/**
 * Update page state
 */
export async function setStateHandler(
  params: SetStateActionParams,
  context: ActionContext
): Promise<ActionResult> {
  try {
    const { path, value, merge = true } = params;

    if (path) {
      context.setState(path, value, merge);
    } else {
      // Set entire state
      Object.keys(context.pageState).forEach(key => {
        delete context.pageState[key];
      });
      Object.assign(context.pageState, value);
    }

    return {
      success: true,
      data: { path, value },
      metadata: { duration: 0 },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: 'SET_STATE_ERROR',
        cause: error,
      },
      metadata: { duration: 0 },
    };
  }
}

/**
 * Reset page state
 *
 * Note: This action clears state values rather than resetting to initial values.
 * True reset-to-initial-values functionality requires storing initial state snapshots,
 * which will be implemented when page state management is enhanced.
 */
export async function resetStateHandler(
  params: ResetStateActionParams,
  context: ActionContext
): Promise<ActionResult> {
  try {
    const { paths } = params;

    if (paths && paths.length > 0) {
      // Clear specific state paths
      for (const path of paths) {
        context.setState(path, undefined, false);
      }
    } else {
      // Clear all state
      Object.keys(context.pageState).forEach(key => {
        delete context.pageState[key];
      });
    }

    return {
      success: true,
      metadata: { duration: 0 },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: 'RESET_STATE_ERROR',
        cause: error,
      },
      metadata: { duration: 0 },
    };
  }
}

/**
 * Merge new values into existing state
 */
export async function mergeStateHandler(
  params: MergeStateActionParams,
  context: ActionContext
): Promise<ActionResult> {
  try {
    const { updates } = params;

    if (!updates || typeof updates !== 'object') {
      throw new Error('Merge state action requires "updates" object parameter');
    }

    // Update each path
    for (const [path, value] of Object.entries(updates)) {
      context.setState(path, value, true);
    }

    return {
      success: true,
      data: { updates },
      metadata: { duration: 0 },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: 'MERGE_STATE_ERROR',
        cause: error,
      },
      metadata: { duration: 0 },
    };
  }
}
