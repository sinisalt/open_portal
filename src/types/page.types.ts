/**
 * Page Configuration Types
 *
 * Type definitions for page configurations, widgets, datasources, and actions
 */

/**
 * Page configuration metadata
 */
export interface PageMetadata {
  /** Required permissions for page access */
  permissions?: string[];

  /** Required roles for page access */
  roles?: string[];

  /** Cache policy (TTL in seconds, or 'no-cache') */
  cachePolicy?: number | 'no-cache';

  /** Additional metadata */
  [key: string]: unknown;
}

/**
 * Layout configuration
 */
export interface LayoutConfig {
  /** Layout type */
  type: 'grid' | 'flex' | 'tabs' | 'stack';

  /** Grid-specific configuration */
  grid?: {
    /** Number of columns */
    columns?: number;

    /** Gap between items */
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

    /** Responsive breakpoints */
    breakpoints?: {
      xs?: number;
      sm?: number;
      md?: number;
      lg?: number;
      xl?: number;
    };
  };

  /** Additional layout properties */
  [key: string]: unknown;
}

/**
 * Data binding configuration
 */
export interface BindingConfig {
  /** Path into page state */
  statePath?: string;

  /** Path into datasource response */
  dataPath?: string;

  /** Binding mode */
  mode?: 'read' | 'write' | 'twoWay';
}

/**
 * Policy configuration for visibility and access control
 */
export interface PolicyConfig {
  /** Show widget condition */
  show?: string | boolean;

  /** Hide widget condition */
  hide?: string | boolean;

  /** Disable widget condition */
  disable?: string | boolean;

  /** Required permissions */
  permissions?: string[];

  /** Required roles */
  roles?: string[];
}

/**
 * Event handler configuration
 */
export interface EventHandlerConfig {
  /** Event name (e.g., 'onClick', 'onChange', 'onLoad') */
  on: string;

  /** Action IDs to execute */
  do: string[];

  /** Condition to check before executing */
  when?: string;

  /** Debounce delay in ms */
  debounce?: number;
}

/**
 * Widget configuration
 */
export interface WidgetConfig {
  /** Unique widget identifier */
  id: string;

  /** Widget type from registry */
  type: string;

  /** Widget-specific properties */
  props?: Record<string, unknown>;

  /** Data bindings */
  bindings?: Record<string, BindingConfig>;

  /** Datasource ID to fetch data from */
  datasourceId?: string;

  /** Child widgets */
  children?: WidgetConfig[];

  /** Event handlers */
  events?: EventHandlerConfig[];

  /** Visibility and access policy */
  policy?: PolicyConfig;
}

/**
 * Fetch policy for datasources
 */
export interface FetchPolicyConfig {
  /** When to fetch data */
  mode: 'onMount' | 'onDemand' | 'polling';

  /** Polling interval in ms (for polling mode) */
  interval?: number;

  /** Cache duration in seconds */
  cacheDuration?: number;

  /** Refetch on window focus */
  refetchOnFocus?: boolean;

  /** Refetch on reconnect */
  refetchOnReconnect?: boolean;
}

/**
 * HTTP datasource configuration
 */
export interface HttpDatasourceConfig {
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  /** Request URL (relative or absolute) */
  url: string;

  /** Request headers */
  headers?: Record<string, string>;

  /** Request body (for POST/PUT/PATCH) */
  body?: unknown;

  /** Query parameters */
  params?: Record<string, string | number | boolean>;

  /** Transform function for response data */
  transformResponse?: string;
}

/**
 * WebSocket datasource configuration
 */
export interface WebSocketDatasourceConfig {
  /** WebSocket URL */
  url: string;

  /** Reconnect on disconnect */
  reconnect?: boolean;

  /** Reconnect delay in ms */
  reconnectDelay?: number;
}

/**
 * Static datasource configuration
 */
export interface StaticDatasourceConfig {
  /** Static data */
  data: unknown;
}

/**
 * Datasource configuration
 */
export interface DatasourceConfig {
  /** Unique datasource identifier */
  id: string;

  /** Datasource kind */
  kind: 'http' | 'websocket' | 'static';

  /** Fetch policy */
  fetchPolicy?: FetchPolicyConfig;

  /** HTTP-specific configuration */
  http?: HttpDatasourceConfig;

  /** WebSocket-specific configuration */
  websocket?: WebSocketDatasourceConfig;

  /** Static data configuration */
  static?: StaticDatasourceConfig;
}

/**
 * Action configuration
 */
export interface ActionConfig {
  /** Unique action identifier */
  id: string;

  /** Action type */
  type: string;

  /** Action parameters */
  params?: Record<string, unknown>;

  /** Condition to check before executing */
  when?: string;
}

/**
 * Complete page configuration
 */
export interface PageConfig {
  /** Page identifier (matches route pageId) */
  id: string;

  /** Schema version for compatibility */
  version: string;

  /** Page title */
  title: string;

  /** Page description */
  description?: string;

  /** Layout configuration */
  layout: LayoutConfig;

  /** Widget tree */
  widgets: WidgetConfig[];

  /** Datasources for the page */
  datasources?: DatasourceConfig[];

  /** Actions available on the page */
  actions?: ActionConfig[];

  /** Page-level event handlers */
  events?: EventHandlerConfig[];

  /** Page metadata (permissions, cache policy, etc.) */
  metadata?: PageMetadata;

  /** Timestamp when config was generated */
  generatedAt?: string;
}

/**
 * Page configuration with cache metadata
 */
export interface CachedPageConfig {
  /** Page configuration */
  config: PageConfig;

  /** ETag for cache validation */
  etag: string;

  /** Timestamp when cached */
  cachedAt: number;

  /** Cache expiration timestamp */
  expiresAt?: number;

  /** Config version */
  version: string;
}

/**
 * Page loader error types
 */
export enum PageLoadErrorType {
  /** Page not found */
  NOT_FOUND = 'NOT_FOUND',

  /** Insufficient permissions */
  FORBIDDEN = 'FORBIDDEN',

  /** Network error */
  NETWORK_ERROR = 'NETWORK_ERROR',

  /** Invalid configuration */
  INVALID_CONFIG = 'INVALID_CONFIG',

  /** Cache error */
  CACHE_ERROR = 'CACHE_ERROR',

  /** Unknown error */
  UNKNOWN = 'UNKNOWN',
}

/**
 * Page loader error
 */
export class PageLoadError extends Error {
  constructor(
    message: string,
    public type: PageLoadErrorType,
    public pageId?: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'PageLoadError';
  }
}

/**
 * Page loader options
 */
export interface PageLoaderOptions {
  /** Skip cache and force fetch from server */
  skipCache?: boolean;

  /** Cache TTL override (in seconds) */
  cacheTTL?: number;

  /** Use stale cache while revalidating */
  staleWhileRevalidate?: boolean;

  /** Abort signal for request cancellation */
  signal?: AbortSignal;
}

/**
 * Page loader result
 */
export interface PageLoaderResult {
  /** Page configuration */
  config: PageConfig;

  /** Whether data was loaded from cache */
  fromCache: boolean;

  /** ETag from server */
  etag?: string;

  /** Timestamp when loaded */
  loadedAt: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Number of cached pages */
  count: number;

  /** Total cache size in bytes (approximate) */
  size: number;

  /** Cache hit rate (0-1) */
  hitRate: number;

  /** Last cache clear timestamp */
  lastClear?: number;
}

/**
 * Cache manager interface
 */
export interface CacheManager {
  /** Get cached page configuration */
  get(pageId: string): Promise<CachedPageConfig | null>;

  /** Store page configuration in cache */
  set(pageId: string, config: CachedPageConfig): Promise<void>;

  /** Delete cached page configuration */
  delete(pageId: string): Promise<void>;

  /** Clear all cached pages */
  clear(): Promise<void>;

  /** Get cache statistics */
  getStats(): Promise<CacheStats>;
}
