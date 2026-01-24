/**
 * UI Feedback Action Handlers
 *
 * Handlers for UI feedback actions (showToast, showDialog)
 */

import type {
  ActionContext,
  ActionResult,
  ShowDialogActionParams,
  ShowToastActionParams,
} from '@/types/action.types';

/**
 * Display a toast notification
 */
export async function showToastHandler(
  params: ShowToastActionParams,
  context: ActionContext
): Promise<ActionResult> {
  try {
    const { message, variant, duration = 5000 } = params;

    if (!message) {
      throw new Error('Show toast action requires "message" parameter');
    }

    // Use context toast service
    context.showToast(message, variant, duration);

    return {
      success: true,
      data: { message, variant },
      metadata: { duration: 0 },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: 'SHOW_TOAST_ERROR',
        cause: error,
      },
      metadata: { duration: 0 },
    };
  }
}

/**
 * Display a confirmation or alert dialog
 */
export async function showDialogHandler(
  params: ShowDialogActionParams,
  _context: ActionContext
): Promise<ActionResult<{ confirmed: boolean }>> {
  try {
    const { title, message, variant, confirmLabel = 'OK', cancelLabel = 'Cancel' } = params;

    if (!title || !message) {
      throw new Error('Show dialog action requires "title" and "message" parameters');
    }

    // For now, use native browser dialogs
    // TODO: Replace with custom modal component
    let confirmed = false;

    if (variant === 'confirm') {
      confirmed = window.confirm(`${title}\n\n${message}`);
    } else {
      window.alert(`${title}\n\n${message}`);
      confirmed = true;
    }

    return {
      success: true,
      data: { confirmed },
      metadata: { duration: 0 },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: 'SHOW_DIALOG_ERROR',
        cause: error,
      },
      metadata: { duration: 0 },
    };
  }
}
