/**
 * Datasource System Type Definitions
 *
 * Comprehensive type definitions for the datasource system including:
 * - Datasource configuration
 * - Fetch policies
 * - Cache management
 * - State management
 * - HTTP/WebSocket/Static datasources
 */

/**
 * Fetch policy modes for datasource caching
 */
export type FetchPolicy = 'cache-first' | 'network-only' | 'cache-and-network' | 'no-cache';

/**
 * Datasource types
 */
export type DatasourceType = 'http' | 'websocket' | 'static';

/**
 * HTTP methods supported by HTTP datasource
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Datasource state represents the current state of a datasource
 */
export interface DatasourceState<T = any> {
  /** Data returned from the datasource */
  data: T | null;

  /** Loading state */
  loading: boolean;

  /** Error object if fetch failed */
  error: Error | null;

  /** Whether the cached data is stale */
  isStale: boolean;

  /** Timestamp of last successful fetch */
  lastFetched: number | null;

  /** Refetch function to manually trigger data fetch */
  refetch: () => Promise<void>;

  /** Invalidate cache and mark data as stale */
  invalidate: () => void;
}

/**
 * Base datasource configuration
 */
export interface BaseDatasourceConfig {
  /** Unique datasource identifier */
  id: string;

  /** Datasource type */
  type: DatasourceType;

  /** Fetch policy for caching behavior */
  fetchPolicy?: FetchPolicy;

  /** Cache time in milliseconds (default: 5 minutes) */
  cacheTime?: number;

  /** Auto-refetch interval in milliseconds (0 = disabled) */
  refetchInterval?: number;

  /** Whether datasource is enabled (conditional fetching) */
  enabled?: boolean;

  /** IDs of datasources this depends on */
  depends?: string[];

  /** Data transformation expression (e.g., "data.results") */
  transform?: string;
}

/**
 * HTTP datasource configuration
 */
export interface HttpDatasourceConfig extends BaseDatasourceConfig {
  type: 'http';

  /** HTTP request configuration */
  config: {
    /** Request URL (can include template variables) */
    url: string;

    /** HTTP method */
    method?: HttpMethod;

    /** Request headers */
    headers?: Record<string, string>;

    /** Request body (for POST/PUT/PATCH) */
    body?: any;

    /** Query parameters */
    queryParams?: Record<string, any>;
  };
}

/**
 * WebSocket datasource configuration
 */
export interface WebSocketDatasourceConfig extends BaseDatasourceConfig {
  type: 'websocket';

  /** WebSocket configuration */
  config: {
    /** WebSocket URL */
    url: string;

    /** Reconnect on disconnect */
    reconnect?: boolean;

    /** Reconnect delay in milliseconds */
    reconnectDelay?: number;

    /** Message handlers */
    onMessage?: (data: any) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
  };
}

/**
 * Static datasource configuration
 */
export interface StaticDatasourceConfig extends BaseDatasourceConfig {
  type: 'static';

  /** Static data configuration */
  config: {
    /** Static data value */
    data: any;
  };
}

/**
 * Union type for all datasource configurations
 */
export type DatasourceConfig =
  | HttpDatasourceConfig
  | WebSocketDatasourceConfig
  | StaticDatasourceConfig;

/**
 * Cache entry for storing datasource results
 */
export interface CacheEntry<T = any> {
  /** Cached data */
  data: T;

  /** Timestamp when data was cached */
  timestamp: number;

  /** Cache expiration timestamp */
  expiresAt: number;

  /** ETag for cache validation */
  etag?: string;

  /** Whether the cache entry is stale */
  isStale: boolean;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Maximum cache size (number of entries) */
  maxSize?: number;

  /** Default TTL in milliseconds */
  defaultTTL?: number;

  /** Enable LRU eviction */
  enableLRU?: boolean;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Total number of cache entries */
  size: number;

  /** Number of cache hits */
  hits: number;

  /** Number of cache misses */
  misses: number;

  /** Cache hit rate (0-1) */
  hitRate: number;

  /** Total cache memory usage (approximate, in bytes) */
  memoryUsage: number;
}

/**
 * Datasource handler interface
 */
export interface DatasourceHandler<TConfig extends BaseDatasourceConfig = BaseDatasourceConfig> {
  /**
   * Fetch data from the datasource
   * @param config - Datasource configuration
   * @param signal - Optional AbortSignal for cancellation
   * @returns Promise resolving to fetched data
   */
  fetch(config: TConfig, signal?: AbortSignal): Promise<any>;

  /**
   * Clean up resources (e.g., close WebSocket connections)
   * @param config - Datasource configuration
   */
  cleanup?(config: TConfig): void;
}

/**
 * Datasource manager options
 */
export interface DatasourceManagerOptions {
  /** Cache configuration */
  cacheConfig?: CacheConfig;

  /** Enable debug logging */
  debug?: boolean;

  /** Global fetch policy override */
  defaultFetchPolicy?: FetchPolicy;

  /** Context data for template interpolation */
  context?: Record<string, any>;
}

/**
 * Datasource fetch options
 */
export interface DatasourceFetchOptions {
  /** Skip cache and force fetch from source */
  skipCache?: boolean;

  /** Abort signal for request cancellation */
  signal?: AbortSignal;

  /** Override fetch policy for this request */
  fetchPolicy?: FetchPolicy;
}

/**
 * Datasource fetch result
 */
export interface DatasourceFetchResult<T = any> {
  /** Fetched data */
  data: T;

  /** Whether data was loaded from cache */
  fromCache: boolean;

  /** Timestamp when data was fetched */
  fetchedAt: number;

  /** Cache entry if loaded from cache */
  cacheEntry?: CacheEntry<T>;
}

/**
 * Datasource error types
 */
export enum DatasourceErrorType {
  /** Network error */
  NETWORK_ERROR = 'NETWORK_ERROR',

  /** Timeout error */
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  /** Configuration error */
  CONFIG_ERROR = 'CONFIG_ERROR',

  /** Transformation error */
  TRANSFORM_ERROR = 'TRANSFORM_ERROR',

  /** Handler not found */
  HANDLER_NOT_FOUND = 'HANDLER_NOT_FOUND',

  /** Dependency error */
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',

  /** Unknown error */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Datasource error class
 */
export class DatasourceError extends Error {
  constructor(
    message: string,
    public type: DatasourceErrorType,
    public datasourceId?: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'DatasourceError';
  }
}

/**
 * Datasource registry interface
 */
export interface IDatasourceRegistry {
  /**
   * Register a datasource handler
   * @param type - Datasource type
   * @param handler - Datasource handler implementation
   */
  register(type: DatasourceType, handler: DatasourceHandler): void;

  /**
   * Get datasource handler by type
   * @param type - Datasource type
   * @returns Datasource handler or undefined
   */
  get(type: DatasourceType): DatasourceHandler | undefined;

  /**
   * Check if datasource type has a registered handler
   * @param type - Datasource type
   * @returns True if handler is registered
   */
  has(type: DatasourceType): boolean;

  /**
   * Get all registered datasource types
   * @returns Array of datasource types
   */
  getTypes(): DatasourceType[];

  /**
   * Unregister a datasource handler
   * @param type - Datasource type
   * @returns True if handler was unregistered
   */
  unregister(type: DatasourceType): boolean;

  /**
   * Clear all registered handlers
   */
  clear(): void;
}

/**
 * Datasource manager interface
 */
export interface IDatasourceManager {
  /**
   * Fetch data from a datasource
   * @param config - Datasource configuration
   * @param options - Fetch options
   * @returns Promise resolving to fetch result
   */
  fetch<T = any>(
    config: DatasourceConfig,
    options?: DatasourceFetchOptions
  ): Promise<DatasourceFetchResult<T>>;

  /**
   * Get current state of a datasource
   * @param datasourceId - Datasource identifier
   * @returns Datasource state or undefined
   */
  getState<T = any>(datasourceId: string): DatasourceState<T> | undefined;

  /**
   * Invalidate cache for a datasource
   * @param datasourceId - Datasource identifier
   */
  invalidate(datasourceId: string): void;

  /**
   * Invalidate all cached datasources
   */
  invalidateAll(): void;

  /**
   * Refetch data for a datasource
   * @param datasourceId - Datasource identifier
   * @returns Promise resolving when refetch completes
   */
  refetch(datasourceId: string): Promise<void>;

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getCacheStats(): CacheStats;

  /**
   * Clear all cache entries
   */
  clearCache(): void;

  /**
   * Cleanup manager resources
   */
  cleanup(): void;
}
