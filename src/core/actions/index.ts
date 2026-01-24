/**
 * Action Engine - Core Exports
 *
 * Central export point for the action execution framework
 */

// Re-export types
export type {
  ActionConfig,
  ActionContext,
  ActionError,
  ActionHandler,
  ActionKind,
  ActionResult,
  ApiCallActionParams,
  ConditionalActionParams,
  ExecuteActionParams,
  GoBackActionParams,
  IActionExecutor,
  IActionRegistry,
  MergeStateActionParams,
  NavigateActionParams,
  ParallelActionParams,
  ReloadActionParams,
  ResetStateActionParams,
  SequenceActionParams,
  SetStateActionParams,
  ShowDialogActionParams,
  ShowToastActionParams,
} from '@/types/action.types';
export { ActionExecutor, actionExecutor } from './ActionExecutor';
// Core classes
export { ActionRegistry, actionRegistry } from './ActionRegistry';
export { apiCallHandler, executeActionHandler } from './handlers/apiHandlers';
export {
  conditionalHandler,
  parallelHandler,
  sequenceHandler,
} from './handlers/chainingHandlers';
// Action handlers
export { goBackHandler, navigateHandler, reloadHandler } from './handlers/navigationHandlers';
export { mergeStateHandler, resetStateHandler, setStateHandler } from './handlers/stateHandlers';
export { showDialogHandler, showToastHandler } from './handlers/uiFeedbackHandlers';
// Utilities
export {
  evaluateCondition,
  getNestedValue,
  resolveTemplate,
  resolveTemplatesInObject,
  setNestedValue,
} from './templateUtils';

// Register all built-in action handlers
import { ActionKind } from '@/types/action.types';
import { actionRegistry } from './ActionRegistry';
import { apiCallHandler, executeActionHandler } from './handlers/apiHandlers';
import { conditionalHandler, parallelHandler, sequenceHandler } from './handlers/chainingHandlers';
import { goBackHandler, navigateHandler, reloadHandler } from './handlers/navigationHandlers';
import { mergeStateHandler, resetStateHandler, setStateHandler } from './handlers/stateHandlers';
import { showDialogHandler, showToastHandler } from './handlers/uiFeedbackHandlers';

/**
 * Register all built-in action handlers
 */
export function registerBuiltInActions(): void {
  // Navigation actions
  actionRegistry.register(ActionKind.NAVIGATE, navigateHandler, {
    displayName: 'Navigate',
    description: 'Navigate to a different page or route',
    cancellable: false,
    retriable: false,
  });

  actionRegistry.register(ActionKind.GO_BACK, goBackHandler, {
    displayName: 'Go Back',
    description: 'Navigate to the previous page in history',
    cancellable: false,
    retriable: false,
  });

  actionRegistry.register(ActionKind.RELOAD, reloadHandler, {
    displayName: 'Reload',
    description: 'Reload the current page configuration',
    cancellable: false,
    retriable: false,
  });

  // State management actions
  actionRegistry.register(ActionKind.SET_STATE, setStateHandler, {
    displayName: 'Set State',
    description: 'Update page state',
    cancellable: false,
    retriable: false,
  });

  actionRegistry.register(ActionKind.RESET_STATE, resetStateHandler, {
    displayName: 'Reset State',
    description: 'Reset page state to initial values',
    cancellable: false,
    retriable: false,
  });

  actionRegistry.register(ActionKind.MERGE_STATE, mergeStateHandler, {
    displayName: 'Merge State',
    description: 'Merge new values into existing state',
    cancellable: false,
    retriable: false,
  });

  // API actions
  actionRegistry.register(ActionKind.API_CALL, apiCallHandler, {
    displayName: 'API Call',
    description: 'Execute an HTTP API call',
    cancellable: true,
    retriable: true,
  });

  actionRegistry.register(ActionKind.EXECUTE_ACTION, executeActionHandler, {
    displayName: 'Execute Action',
    description: 'Execute a backend-defined action via the action gateway',
    cancellable: true,
    retriable: true,
  });

  // UI feedback actions
  actionRegistry.register(ActionKind.SHOW_TOAST, showToastHandler, {
    displayName: 'Show Toast',
    description: 'Display a toast notification',
    cancellable: false,
    retriable: false,
  });

  actionRegistry.register(ActionKind.SHOW_DIALOG, showDialogHandler, {
    displayName: 'Show Dialog',
    description: 'Display a confirmation or alert dialog',
    cancellable: false,
    retriable: false,
  });

  // Chaining actions
  actionRegistry.register(ActionKind.SEQUENCE, sequenceHandler, {
    displayName: 'Sequence',
    description: 'Execute actions sequentially',
    cancellable: true,
    retriable: false,
  });

  actionRegistry.register(ActionKind.PARALLEL, parallelHandler, {
    displayName: 'Parallel',
    description: 'Execute actions in parallel',
    cancellable: true,
    retriable: false,
  });

  actionRegistry.register(ActionKind.CONDITIONAL, conditionalHandler, {
    displayName: 'Conditional',
    description: 'Execute actions conditionally based on a condition',
    cancellable: true,
    retriable: false,
  });
}

// Auto-register built-in actions on module import
registerBuiltInActions();
