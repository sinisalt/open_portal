/**
 * Datasource Manager
 *
 * Central manager for datasources. Handles:
 * - Fetch policy enforcement
 * - State management
 * - Cache integration
 * - Refetch and invalidation
 * - Dependent datasources
 * - Auto-refetch intervals
 */

import type {
  CacheStats,
  DatasourceConfig,
  DatasourceErrorType,
  DatasourceFetchOptions,
  DatasourceFetchResult,
  DatasourceManagerOptions,
  DatasourceState,
  DatasourceError as IDatasourceError,
  IDatasourceManager,
} from '@/types/datasource.types';
import { DatasourceCache } from './DatasourceCache';
import { datasourceRegistry } from './DatasourceRegistry';

/**
 * Internal state tracking
 */
interface InternalState<T = any> extends Omit<DatasourceState<T>, 'refetch' | 'invalidate'> {
  config: DatasourceConfig;
  intervalId?: NodeJS.Timeout;
  abortController?: AbortController;
}

/**
 * DatasourceManager implementation
 */
export class DatasourceManager implements IDatasourceManager {
  private cache: DatasourceCache;
  private states: Map<string, InternalState>;
  private options: DatasourceManagerOptions;

  constructor(options?: DatasourceManagerOptions) {
    this.cache = new DatasourceCache(options?.cacheConfig);
    this.states = new Map();
    this.options = options || {};
  }

  /**
   * Fetch data from a datasource with fetch policy
   */
  async fetch<T = any>(
    config: DatasourceConfig,
    options?: DatasourceFetchOptions
  ): Promise<DatasourceFetchResult<T>> {
    const { id, fetchPolicy: configFetchPolicy, enabled = true } = config;
    const { signal, fetchPolicy: optionsFetchPolicy } = options || {};

    // Check if datasource is enabled
    if (!enabled) {
      throw this.createError('CONFIG_ERROR', `Datasource '${id}' is disabled`, id);
    }

    // Determine effective fetch policy
    const effectiveFetchPolicy =
      optionsFetchPolicy || configFetchPolicy || this.options.defaultFetchPolicy || 'cache-first';

    // Get or create state
    let state = this.states.get(id);
    if (!state) {
      state = this.createState(config);
      this.states.set(id, state);
    }

    // Handle different fetch policies
    switch (effectiveFetchPolicy) {
      case 'cache-first':
        return await this.fetchCacheFirst<T>(config, state, signal);

      case 'network-only':
        return await this.fetchNetworkOnly<T>(config, state, signal);

      case 'cache-and-network':
        return await this.fetchCacheAndNetwork<T>(config, state, signal);

      case 'no-cache':
        return await this.fetchNoCache<T>(config, state, signal);

      default:
        throw this.createError('CONFIG_ERROR', `Unknown fetch policy: ${effectiveFetchPolicy}`, id);
    }
  }

  /**
   * Cache-first policy: Use cache if available, fetch if not
   */
  private async fetchCacheFirst<T>(
    config: DatasourceConfig,
    state: InternalState,
    signal?: AbortSignal
  ): Promise<DatasourceFetchResult<T>> {
    const cached = this.cache.get<T>(config.id);

    if (cached && !cached.isStale) {
      return {
        data: cached.data,
        fromCache: true,
        fetchedAt: cached.timestamp,
        cacheEntry: cached,
      };
    }

    // Fetch from network
    return await this.fetchFromNetwork<T>(config, state, signal, true);
  }

  /**
   * Network-only policy: Always fetch, update cache
   */
  private async fetchNetworkOnly<T>(
    config: DatasourceConfig,
    state: InternalState,
    signal?: AbortSignal
  ): Promise<DatasourceFetchResult<T>> {
    return await this.fetchFromNetwork<T>(config, state, signal, true);
  }

  /**
   * Cache-and-network policy: Return cache immediately, fetch in background
   */
  private async fetchCacheAndNetwork<T>(
    config: DatasourceConfig,
    state: InternalState,
    signal?: AbortSignal
  ): Promise<DatasourceFetchResult<T>> {
    const cached = this.cache.get<T>(config.id);

    // Start background fetch
    this.fetchFromNetwork<T>(config, state, signal, true).catch(err => {
      if (this.options.debug) {
        console.error(`Background fetch failed for datasource '${config.id}':`, err);
      }
    });

    // Return cached data immediately if available
    if (cached) {
      return {
        data: cached.data,
        fromCache: true,
        fetchedAt: cached.timestamp,
        cacheEntry: cached,
      };
    }

    // Wait for network fetch if no cache
    return await this.fetchFromNetwork<T>(config, state, signal, true);
  }

  /**
   * No-cache policy: Always fetch, don't cache
   */
  private async fetchNoCache<T>(
    config: DatasourceConfig,
    state: InternalState,
    signal?: AbortSignal
  ): Promise<DatasourceFetchResult<T>> {
    return await this.fetchFromNetwork<T>(config, state, signal, false);
  }

  /**
   * Fetch data from network
   */
  private async fetchFromNetwork<T>(
    config: DatasourceConfig,
    state: InternalState,
    signal?: AbortSignal,
    shouldCache: boolean
  ): Promise<DatasourceFetchResult<T>> {
    const { id, type } = config;

    // Update state to loading
    state.loading = true;
    state.error = null;

    try {
      // Get handler
      const handler = datasourceRegistry.get(type);
      if (!handler) {
        throw this.createError('HANDLER_NOT_FOUND', `No handler registered for type '${type}'`, id);
      }

      // Fetch data
      const data = await handler.fetch(config, signal);

      // Update state
      const now = Date.now();
      state.data = data;
      state.loading = false;
      state.error = null;
      state.lastFetched = now;
      state.isStale = false;

      // Cache if enabled
      if (shouldCache) {
        this.cache.set(id, data, config.cacheTime);
      }

      return {
        data,
        fromCache: false,
        fetchedAt: now,
      };
    } catch (err: any) {
      // Update state with error
      state.loading = false;
      state.error = err;

      throw err;
    }
  }

  /**
   * Create initial state for a datasource
   */
  private createState(config: DatasourceConfig): InternalState {
    const state: InternalState = {
      config,
      data: null,
      loading: false,
      error: null,
      isStale: false,
      lastFetched: null,
    };

    // Set up auto-refetch interval if configured
    if (config.refetchInterval && config.refetchInterval > 0) {
      state.intervalId = setInterval(() => {
        this.refetch(config.id).catch(err => {
          if (this.options.debug) {
            console.error(`Auto-refetch failed for datasource '${config.id}':`, err);
          }
        });
      }, config.refetchInterval);
    }

    return state;
  }

  /**
   * Get current state of a datasource
   */
  getState<T = any>(datasourceId: string): DatasourceState<T> | undefined {
    const internal = this.states.get(datasourceId);
    if (!internal) {
      return undefined;
    }

    // Return public state with bound methods
    return {
      data: internal.data as T,
      loading: internal.loading,
      error: internal.error,
      isStale: internal.isStale,
      lastFetched: internal.lastFetched,
      refetch: () => this.refetch(datasourceId),
      invalidate: () => this.invalidate(datasourceId),
    };
  }

  /**
   * Invalidate cache for a datasource
   */
  invalidate(datasourceId: string): void {
    // Invalidate cache
    this.cache.invalidate(datasourceId);

    // Mark state as stale
    const state = this.states.get(datasourceId);
    if (state) {
      state.isStale = true;
    }
  }

  /**
   * Invalidate all cached datasources
   */
  invalidateAll(): void {
    this.cache.clear();

    // Mark all states as stale
    for (const state of this.states.values()) {
      state.isStale = true;
    }
  }

  /**
   * Refetch data for a datasource
   */
  async refetch(datasourceId: string): Promise<void> {
    const state = this.states.get(datasourceId);
    if (!state) {
      throw this.createError(
        'CONFIG_ERROR',
        `Datasource '${datasourceId}' not found`,
        datasourceId
      );
    }

    // Invalidate cache first
    this.invalidate(datasourceId);

    // Fetch fresh data
    await this.fetch(state.config, { skipCache: true });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    return this.cache.getStats();
  }

  /**
   * Clear all cache entries
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Cleanup manager resources
   */
  cleanup(): void {
    // Clear all intervals
    for (const state of this.states.values()) {
      if (state.intervalId) {
        clearInterval(state.intervalId);
      }

      // Abort any pending requests
      if (state.abortController) {
        state.abortController.abort();
      }
    }

    // Clear states and cache
    this.states.clear();
    this.cache.clear();
  }

  /**
   * Create a typed datasource error
   */
  private createError(
    type: DatasourceErrorType,
    message: string,
    datasourceId?: string
  ): IDatasourceError {
    const error = new Error(message) as IDatasourceError;
    error.type = type;
    error.datasourceId = datasourceId;
    return error;
  }
}

// Singleton instance
export const datasourceManager = new DatasourceManager();
