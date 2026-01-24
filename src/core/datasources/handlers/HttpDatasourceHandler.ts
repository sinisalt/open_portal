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

import type {
  DatasourceHandler,
  HttpDatasourceConfig,
  DatasourceError as IDatasourceError,
  DatasourceErrorType,
} from '@/types/datasource.types';
import { httpClient } from '@/services/httpClient';

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
        const error = new Error(errorMessage || `HTTP ${response.status}`) as IDatasourceError;
        error.type = 'NETWORK_ERROR' as DatasourceErrorType;
        error.datasourceId = config.id;
        throw error;
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
          const error = new Error(
            `Failed to transform data with path '${transform}': ${err}`
          ) as IDatasourceError;
          error.type = 'TRANSFORM_ERROR' as DatasourceErrorType;
          error.datasourceId = config.id;
          error.cause = err;
          throw error;
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
        const error = new Error('Request aborted') as IDatasourceError;
        error.type = 'NETWORK_ERROR' as DatasourceErrorType;
        error.datasourceId = config.id;
        error.cause = err;
        throw error;
      }

      // Handle network errors
      if (err instanceof TypeError && err.message.includes('fetch')) {
        const error = new Error('Network request failed') as IDatasourceError;
        error.type = 'NETWORK_ERROR' as DatasourceErrorType;
        error.datasourceId = config.id;
        error.cause = err;
        throw error;
      }

      // Wrap unknown errors
      const error = new Error(
        `HTTP datasource fetch failed: ${err.message || 'Unknown error'}`
      ) as IDatasourceError;
      error.type = 'UNKNOWN_ERROR' as DatasourceErrorType;
      error.datasourceId = config.id;
      error.cause = err;
      throw error;
    }
  }
}

// Singleton instance
export const httpDatasourceHandler = new HttpDatasourceHandler();
