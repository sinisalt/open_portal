/**
 * useDatasource Hook
 *
 * React hook for using datasources in components.
 * Provides reactive state updates and automatic refetching.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { datasourceManager } from '@/core/datasources/DatasourceManager';
import type { DatasourceConfig, DatasourceState } from '@/types/datasource.types';

/**
 * Hook options
 */
export interface UseDatasourceOptions {
  /** Skip initial fetch on mount */
  skip?: boolean;

  /** Fetch on component mount (default: true) */
  fetchOnMount?: boolean;

  /** Refetch on window focus */
  refetchOnFocus?: boolean;

  /** Callback on successful fetch */
  onSuccess?: (data: any) => void;

  /** Callback on fetch error */
  onError?: (error: Error) => void;
}

/**
 * Hook return type
 */
export interface UseDatasourceResult<T = any>
  extends Omit<DatasourceState<T>, 'refetch' | 'invalidate'> {
  /** Refetch data */
  refetch: () => Promise<void>;

  /** Invalidate cache */
  invalidate: () => void;

  /** Whether data is being fetched for the first time */
  isInitialLoading: boolean;
}

/**
 * React hook for using datasources
 *
 * @param config - Datasource configuration
 * @param options - Hook options
 * @returns Datasource state and methods
 */
export function useDatasource<T = any>(
  config: DatasourceConfig | null,
  options: UseDatasourceOptions = {}
): UseDatasourceResult<T> {
  const { skip = false, fetchOnMount = true, refetchOnFocus = false, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  const configRef = useRef(config);
  const isMountedRef = useRef(true);

  // Update config ref
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Set up mounted ref
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Fetch data from datasource
   */
  const fetch = useCallback(async () => {
    if (!configRef.current || skip) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await datasourceManager.fetch<T>(configRef.current);

      if (isMountedRef.current) {
        setData(result.data);
        setIsStale(false);
        setLastFetched(result.fetchedAt);
        setIsInitialLoading(false);

        if (onSuccess) {
          onSuccess(result.data);
        }
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err);
        setIsInitialLoading(false);

        if (onError) {
          onError(err);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [skip, onSuccess, onError]);

  /**
   * Refetch data (invalidates cache first)
   */
  const refetch = useCallback(async () => {
    if (!configRef.current) {
      return;
    }

    // Invalidate cache first to force fresh fetch
    datasourceManager.invalidate(configRef.current.id);

    // Then fetch
    await fetch();
  }, [fetch]);

  /**
   * Invalidate cache
   */
  const invalidate = useCallback(() => {
    if (!configRef.current) {
      return;
    }

    datasourceManager.invalidate(configRef.current.id);
    setIsStale(true);
  }, []);

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    if (fetchOnMount && !skip && configRef.current) {
      fetch();
    }
  }, [config?.id, fetchOnMount, skip, fetch]); // Only refetch if datasource ID changes

  /**
   * Set up refetch on focus
   */
  useEffect(() => {
    if (!refetchOnFocus || skip || !configRef.current) {
      return;
    }

    const handleFocus = () => {
      fetch();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetchOnFocus, skip, config?.id, fetch]);

  return {
    data,
    loading,
    error,
    isStale,
    lastFetched,
    isInitialLoading,
    refetch,
    invalidate,
  };
}
