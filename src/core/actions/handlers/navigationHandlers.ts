/**
 * Navigation Action Handlers
 *
 * Handlers for navigation-related actions (navigate, goBack, reload)
 */

import type {
  ActionContext,
  ActionResult,
  GoBackActionParams,
  NavigateActionParams,
  ReloadActionParams,
} from '@/types/action.types';

/**
 * Navigate to a different page or route
 */
export async function navigateHandler(
  params: NavigateActionParams,
  context: ActionContext
): Promise<ActionResult> {
  try {
    const { to, query, replace, external, openInNewTab } = params;

    if (!to) {
      throw new Error('Navigate action requires "to" parameter');
    }

    // Handle external URLs
    if (external) {
      if (openInNewTab) {
        window.open(to, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = to;
      }
      return {
        success: true,
        metadata: { duration: 0 },
      };
    }

    // Use context navigation service
    context.navigate(to, { replace, query });

    return {
      success: true,
      data: { path: to },
      metadata: { duration: 0 },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: 'NAVIGATION_ERROR',
        cause: error,
      },
      metadata: { duration: 0 },
    };
  }
}

/**
 * Navigate to the previous page in history
 */
export async function goBackHandler(
  params: GoBackActionParams,
  context: ActionContext
): Promise<ActionResult> {
  try {
    const { fallback } = params;

    // Check if there's history to go back to
    if (window.history.length > 1) {
      window.history.back();
    } else if (fallback) {
      context.navigate(fallback);
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
        code: 'GO_BACK_ERROR',
        cause: error,
      },
      metadata: { duration: 0 },
    };
  }
}

/**
 * Reload the current page configuration
 */
export async function reloadHandler(
  params: ReloadActionParams,
  _context: ActionContext
): Promise<ActionResult> {
  try {
    const { hard } = params;

    if (hard) {
      // Force full page reload
      window.location.reload();
    } else {
      // Soft reload - just refresh the current route
      // This will be handled by the router/page loader
      window.location.reload();
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
        code: 'RELOAD_ERROR',
        cause: error,
      },
      metadata: { duration: 0 },
    };
  }
}
