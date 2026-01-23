/**
 * Page Configuration Hook
 *
 * React hook for loading page configurations with:
 * - Automatic loading on mount
 * - Loading states management
 * - Error handling
 * - Cache integration
 * - Reload functionality
 */

import { useCallback, useEffect, useState } from 'react';
import {
  clearPageCache,
  isPageCached,
  loadPageConfig,
  preloadPageConfig,
} from '@/services/pageConfigLoader';
import type { PageConfig, PageLoadError, PageLoaderOptions } from '@/types/page.types';

/**
 * Hook state
 */
interface UsePageConfigState {
  /** Page configuration (null if not loaded) */
  config: PageConfig | null;

  /** Loading state */
  loading: boolean;

  /** Error state */
  error: PageLoadError | null;

  /** Whether data was loaded from cache */
  fromCache: boolean;

  /** Timestamp when loaded */
  loadedAt: number | null;

  /** Reload function */
  reload: () => Promise<void>;

  /** Clear cache function */
  clearCache: () => Promise<void>;
}

/**
 * Hook options
 */
interface UsePageConfigOptions extends PageLoaderOptions {
  /** Skip automatic loading on mount */
  skip?: boolean;

  /** Auto reload interval in ms (0 = disabled) */
  autoReload?: number;

  /** Callback when page is loaded */
  onLoad?: (config: PageConfig) => void;

  /** Callback when error occurs */
  onError?: (error: PageLoadError) => void;
}

/**
 * Hook for loading page configuration
 *
 * @param pageId - Page identifier
 * @param options - Hook options
 * @returns Page configuration state and actions
 *
 * @example
 * ```tsx
 * function DashboardPage() {
 *   const { config, loading, error, reload } = usePageConfig('dashboard-page');
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!config) return null;
 *
 *   return <PageRenderer config={config} />;
 * }
 * ```
 */
export function usePageConfig(
  pageId: string,
  options: UsePageConfigOptions = {}
): UsePageConfigState {
  const { skip = false, autoReload = 0, onLoad, onError, ...loaderOptions } = options;

  const [config, setConfig] = useState<PageConfig | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<PageLoadError | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [loadedAt, setLoadedAt] = useState<number | null>(null);

  /**
   * Load page configuration
   */
  const load = useCallback(
    async (forceReload = false) => {
      if (!pageId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await loadPageConfig(pageId, {
          skipCache: forceReload || loaderOptions.skipCache,
          cacheTTL: loaderOptions.cacheTTL,
          staleWhileRevalidate: loaderOptions.staleWhileRevalidate,
          signal: loaderOptions.signal,
        });

        setConfig(result.config);
        setFromCache(result.fromCache);
        setLoadedAt(result.loadedAt);

        // Call onLoad callback
        if (onLoad) {
          onLoad(result.config);
        }
      } catch (err) {
        const pageError = err as PageLoadError;
        setError(pageError);

        // Call onError callback
        if (onError) {
          onError(pageError);
        }
      } finally {
        setLoading(false);
      }
    },
    [
      pageId,
      loaderOptions.skipCache,
      loaderOptions.cacheTTL,
      loaderOptions.staleWhileRevalidate,
      loaderOptions.signal,
      onLoad,
      onError,
    ]
  );

  /**
   * Reload page configuration (skip cache)
   */
  const reload = useCallback(async () => {
    await load(true);
  }, [load]);

  /**
   * Clear cache for this page
   */
  const clearCache = useCallback(async () => {
    await clearPageCache(pageId);
  }, [pageId]);

  /**
   * Load on mount
   */
  useEffect(() => {
    if (!skip) {
      void load();
    }
  }, [skip, load]);

  /**
   * Auto reload interval
   */
  useEffect(() => {
    if (autoReload > 0) {
      const interval = setInterval(() => {
        void load();
      }, autoReload);

      return () => clearInterval(interval);
    }
  }, [autoReload, load]);

  return {
    config,
    loading,
    error,
    fromCache,
    loadedAt,
    reload,
    clearCache,
  };
}

/**
 * Hook for preloading page configuration (without loading it immediately)
 *
 * @param pageId - Page identifier
 * @param options - Loader options
 *
 * @example
 * ```tsx
 * function Navigation() {
 *   usePreloadPageConfig('dashboard-page');
 *
 *   return (
 *     <nav>
 *       <Link to="/dashboard">Dashboard</Link>
 *     </nav>
 *   );
 * }
 * ```
 */
export function usePreloadPageConfig(pageId: string, options: PageLoaderOptions = {}): void {
  // biome-ignore lint/correctness/useExhaustiveDependencies: options is intentionally excluded to avoid re-renders on inline object changes
  useEffect(() => {
    if (pageId) {
      void preloadPageConfig(pageId, options);
    }
  }, [pageId]);
}

/**
 * Hook for checking if page is cached
 *
 * @param pageId - Page identifier
 * @returns Whether page is cached
 *
 * @example
 * ```tsx
 * function PageLink({ pageId }) {
 *   const isCached = useIsPageCached(pageId);
 *
 *   return (
 *     <Link to={`/page/${pageId}`}>
 *       {isCached && <CacheIcon />}
 *       Page
 *     </Link>
 *   );
 * }
 * ```
 */
export function useIsPageCached(pageId: string): boolean {
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    if (pageId) {
      void isPageCached(pageId).then(setIsCached);
    }
  }, [pageId]);

  return isCached;
}
