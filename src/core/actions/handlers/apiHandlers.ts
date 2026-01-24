/**
 * API Action Handlers
 *
 * Handlers for API-related actions (apiCall, executeAction)
 */

import type {
  ActionContext,
  ActionResult,
  ApiCallActionParams,
  ExecuteActionParams,
} from '@/types/action.types';

/**
 * Execute an HTTP API call
 */
export async function apiCallHandler(
  params: ApiCallActionParams,
  context: ActionContext,
  signal?: AbortSignal
): Promise<ActionResult> {
  try {
    const { url, method, headers, body, queryParams, timeout } = params;

    if (!url) {
      throw new Error('API call action requires "url" parameter');
    }

    // Build URL with query parameters
    let fullUrl = url;
    if (queryParams) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        searchParams.append(key, String(value));
      }
      fullUrl = `${url}?${searchParams.toString()}`;
    }

    // Build request options
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal,
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    // Apply timeout if specified
    const timeoutSignal = timeout ? AbortSignal.timeout(timeout) : undefined;

    const effectiveSignal =
      timeoutSignal && signal ? AbortSignal.any([timeoutSignal, signal]) : timeoutSignal || signal;

    // Make request using context fetch service
    const response = await context.fetch(fullUrl, {
      ...requestOptions,
      signal: effectiveSignal,
    });

    // Parse response safely, expecting JSON
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      const rawBody = await response.text().catch(() => '');
      throw new Error(
        `Expected JSON response from "${fullUrl}" but received content type "${contentType}" with status ${response.status}.` +
          (rawBody ? ` Body (truncated): ${rawBody.slice(0, 200)}` : '')
      );
    }

    let responseData: unknown;
    try {
      responseData = await response.json();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error while parsing JSON response';
      throw new Error(`Failed to parse JSON response from "${fullUrl}": ${message}`);
    }
    // Check for errors
    if (!response.ok) {
      return {
        success: false,
        error: {
          message: responseData.message || 'API request failed',
          code: responseData.code || 'API_ERROR',
          status: response.status,
          fieldErrors: responseData.fieldErrors,
          cause: responseData,
        },
        metadata: { duration: 0 },
      };
    }

    return {
      success: true,
      data: {
        status: response.status,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries()),
      },
      metadata: { duration: 0 },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: 'API_CALL_ERROR',
        cause: error,
      },
      metadata: { duration: 0 },
    };
  }
}

/**
 * Execute a backend-defined action via the action gateway
 */
export async function executeActionHandler(
  params: ExecuteActionParams,
  context: ActionContext,
  signal?: AbortSignal
): Promise<ActionResult> {
  try {
    const { actionId, context: actionContext } = params;

    if (!actionId) {
      throw new Error('Execute action requires "actionId" parameter');
    }

    // Call the action gateway endpoint
    const response = await context.fetch('/ui/actions/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        actionId,
        context: actionContext,
      }),
      signal,
    });

    const responseData = await response.json();

    // Check for errors
    if (!response.ok) {
      return {
        success: false,
        error: {
          message: responseData.message || 'Action execution failed',
          code: responseData.code || 'EXECUTE_ACTION_ERROR',
          status: response.status,
          fieldErrors: responseData.fieldErrors,
          cause: responseData,
        },
        metadata: { duration: 0 },
      };
    }

    return {
      success: true,
      data: responseData,
      metadata: { duration: 0 },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: 'EXECUTE_ACTION_ERROR',
        cause: error,
      },
      metadata: { duration: 0 },
    };
  }
}
