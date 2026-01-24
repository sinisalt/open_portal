/**
 * HTTP Datasource Handler
 *
 * Handles HTTP datasource fetching with support for:
 * - All HTTP methods (GET, POST, PUT, PATCH, DELETE)
 * - Query parameters and headers
 * - Request body
 * - Authentication token injection via httpClient
 * - Request cancellation
 * - Error handling
 */

import { httpClient } from '@/services/httpClient';
import type {
  DatasourceErrorType,
  DatasourceHandler,
  HttpDatasourceConfig,
  DatasourceError as IDatasourceError,
} from '@/types/datasource.types';

/**
 * Transform response data using dot notation path
 * @param data - Response data
 * @param transform - Transform path (e.g., "data.results")
 * @returns Transformed data
 */
function transformData(data: any, transform?: string): any {
  if (!transform) {
    return data;
  }

  const parts = transform.split('.');
  let result = data;

  for (const part of parts) {
    if (result == null) {
      return null;
    }
    result = result[part];
  }

  return result;
}

/**
 * Build query string from parameters
 * @param params - Query parameters object
 * @returns Query string (without leading ?)
 */
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  return searchParams.toString();
}

/**
 * Create a typed datasource error
 * @param type - Error type
 * @param message - Error message
 * @param datasourceId - Datasource ID
 * @param cause - Original error cause
 * @returns Typed datasource error
 */
function createDatasourceError(
  type: DatasourceErrorType,
  message: string,
  datasourceId: string,
  cause?: unknown
): IDatasourceError {
  const error = new Error(message) as IDatasourceError;
  error.type = type;
  error.datasourceId = datasourceId;
  if (cause !== undefined) {
    error.cause = cause;
  }
  return error;
}

/**
 * HTTP Datasource Handler Implementation
 */
export class HttpDatasourceHandler implements DatasourceHandler<HttpDatasourceConfig> {
  /**
   * Fetch data from HTTP endpoint
   */
  async fetch(config: HttpDatasourceConfig, signal?: AbortSignal): Promise<any> {
    const { config: httpConfig, transform } = config;
    const { url, method = 'GET', headers = {}, body, queryParams } = httpConfig;

    try {
      // Build URL with query params
      let fullUrl = url;
      if (queryParams && Object.keys(queryParams).length > 0) {
        const queryString = buildQueryString(queryParams);
        if (queryString) {
          fullUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
        }
      }

      // Prepare request options
      const options: RequestInit = {
        method,
        headers: {
          ...headers,
        },
        signal,
      };

      // Add body for non-GET requests
      if (body && method !== 'GET' && method !== 'DELETE') {
        options.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      // Make HTTP request using httpClient (handles auth)
      const response = await httpClient(fullUrl, options);

      // Handle HTTP errors
      if (!response.ok) {
        const errorMessage = await response.text().catch(() => response.statusText);
        throw createDatasourceError(
          'NETWORK_ERROR',
          errorMessage || `HTTP ${response.status}`,
          config.id
        );
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Apply transformation if specified
      if (transform) {
        try {
          data = transformData(data, transform);
        } catch (err) {
          throw createDatasourceError(
            'TRANSFORM_ERROR',
            `Failed to transform data with path '${transform}': ${err}`,
            config.id,
            err
          );
        }
      }

      return data;
    } catch (err: any) {
      // Re-throw if already a DatasourceError
      if (err.type && err.datasourceId) {
        throw err;
      }

      // Handle AbortError
      if (err.name === 'AbortError') {
        throw createDatasourceError('NETWORK_ERROR', 'Request aborted', config.id, err);
      }

      // Handle network errors
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw createDatasourceError('NETWORK_ERROR', 'Network request failed', config.id, err);
      }

      // Wrap unknown errors
      throw createDatasourceError(
        'UNKNOWN_ERROR',
        `HTTP datasource fetch failed: ${err.message || 'Unknown error'}`,
        config.id,
        err
      );
    }
  }
}

// Singleton instance
export const httpDatasourceHandler = new HttpDatasourceHandler();
