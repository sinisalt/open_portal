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
import { getNestedValue, setNestedValue } from '../templateUtils';

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
 * Reset page state to initial values
 *
 * Restores state to initial values when initialPageState is available in context.
 * If initialPageState is not available, clears the state values.
 */
export async function resetStateHandler(
  params: ResetStateActionParams,
  context: ActionContext
): Promise<ActionResult> {
  try {
    const { paths } = params;

    if (paths && paths.length > 0) {
      // Reset specific state paths
      for (const path of paths) {
        if (context.initialPageState) {
          // Restore from initial state
          const initialValue = getNestedValue(context.initialPageState, path);
          context.setState(path, initialValue, false);
        } else {
          // Clear if no initial state available
          context.setState(path, undefined, false);
        }
      }
    } else {
      // Reset all state
      if (context.initialPageState) {
        // Restore entire state from initial snapshot
        Object.keys(context.pageState).forEach(key => {
          delete context.pageState[key];
        });
        // Deep clone to avoid reference issues
        Object.assign(context.pageState, JSON.parse(JSON.stringify(context.initialPageState)));
      } else {
        // Clear all state if no initial state available
        Object.keys(context.pageState).forEach(key => {
          delete context.pageState[key];
        });
      }
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
