/**
 * Bootstrap Hook
 *
 * React hook for managing bootstrap data lifecycle
 */

import { useCallback, useEffect, useState } from 'react';
import { clearBootstrapCache, fetchBootstrap } from '@/services/bootstrapService';
import * as tokenManager from '@/services/tokenManager';
import type { BootstrapState } from '@/types/bootstrap.types';

/**
 * Hook for managing application bootstrap data
 *
 * Automatically fetches bootstrap data when user is authenticated
 * and provides methods to refresh or clear the data
 *
 * @returns Bootstrap state and control methods
 */
export function useBootstrap() {
  const [state, setState] = useState<BootstrapState>({
    data: null,
    loading: false,
    error: null,
    loaded: false,
  });

  /**
   * Fetch bootstrap data from API
   */
  const loadBootstrap = useCallback(async (useCache = true) => {
    // Don't fetch if not authenticated
    if (!tokenManager.isAuthenticated()) {
      setState({
        data: null,
        loading: false,
        error: 'Not authenticated',
        loaded: false,
      });
      return;
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const data = await fetchBootstrap(useCache);
      setState({
        data,
        loading: false,
        error: null,
        loaded: true,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load bootstrap data';

      setState({
        data: null,
        loading: false,
        error: errorMessage,
        loaded: true, // Mark as attempted to prevent infinite retry loop
      });

      // If it's an authentication error, clear tokens
      if (
        error instanceof Error &&
        (error.message.includes('401') || error.message.includes('Authentication failed'))
      ) {
        tokenManager.clearTokens();
      }
    }
  }, []);

  /**
   * Refresh bootstrap data (bypass cache)
   */
  const refresh = useCallback(async () => {
    clearBootstrapCache();
    await loadBootstrap(false);
  }, [loadBootstrap]);

  /**
   * Clear bootstrap data and cache
   */
  const clear = useCallback(() => {
    clearBootstrapCache();
    setState({
      data: null,
      loading: false,
      error: null,
      loaded: false,
    });
  }, []);

  /**
   * Auto-fetch on mount if authenticated
   */
  useEffect(() => {
    if (tokenManager.isAuthenticated() && !state.loaded && !state.loading) {
      loadBootstrap();
    }
  }, [loadBootstrap, state.loaded, state.loading]);

  return {
    /**
     * Bootstrap data
     */
    data: state.data,

    /**
     * Loading state
     */
    loading: state.loading,

    /**
     * Error message if any
     */
    error: state.error,

    /**
     * Whether bootstrap has been successfully loaded
     */
    loaded: state.loaded,

    /**
     * Reload bootstrap data (uses cache by default)
     */
    reload: loadBootstrap,

    /**
     * Refresh bootstrap data (bypasses cache)
     */
    refresh,

    /**
     * Clear bootstrap data and cache
     */
    clear,

    // Convenient accessors
    /**
     * Current user information
     */
    user: state.data?.user ?? null,

    /**
     * User permissions
     */
    permissions: state.data?.permissions ?? [],

    /**
     * Tenant information
     */
    tenant: state.data?.tenant ?? null,

    /**
     * Menu configuration
     */
    menu: state.data?.menu ?? [],

    /**
     * Application defaults
     */
    defaults: state.data?.defaults ?? null,

    /**
     * Feature flags
     */
    featureFlags: state.data?.featureFlags ?? {},
  };
}
