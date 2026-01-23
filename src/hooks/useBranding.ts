/**
 * useBranding Hook
 *
 * React hook for loading and applying branding configuration
 */

import { useEffect, useState } from 'react';
import { fetchBranding, needsBrandingRefresh } from '@/services/brandingService';
import type { BrandingResponse } from '@/types/branding.types';
import { applyBrandingTheme, removeBrandingTheme } from '@/utils/applyTheme';

/**
 * Branding hook state
 */
interface BrandingState {
  branding: BrandingResponse | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Branding hook options
 */
interface UseBrandingOptions {
  tenantId?: string;
  expectedVersion?: string;
  autoApply?: boolean; // Whether to automatically apply theme (default: true)
  enabled?: boolean; // Whether to fetch branding (default: true)
}

/**
 * Hook for loading and applying branding
 *
 * @param options - Branding options
 * @returns Branding state and methods
 */
export function useBranding(options: UseBrandingOptions = {}) {
  const { tenantId, expectedVersion, autoApply = true, enabled = true } = options;

  const [state, setState] = useState<BrandingState>({
    branding: null,
    loading: false,
    error: null,
  });

  // Load branding when options change
  useEffect(() => {
    // Don't fetch if disabled or tenantId is missing
    if (!enabled || !tenantId) {
      return;
    }

    let cancelled = false;

    const loadBranding = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Check if we need to refresh based on version
        const shouldRefresh = expectedVersion ? needsBrandingRefresh(expectedVersion) : false;

        // Fetch branding (will use cache if valid)
        const brandingData = await fetchBranding(
          tenantId,
          expectedVersion,
          !shouldRefresh // Use cache unless we need to refresh
        );

        if (!cancelled) {
          setState({
            branding: brandingData,
            loading: false,
            error: null,
          });

          // Apply theme if autoApply is enabled
          if (autoApply) {
            applyBrandingTheme(brandingData.branding);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            branding: null,
            loading: false,
            error: error as Error,
          });
        }
      }
    };

    loadBranding();

    // Cleanup function to cancel pending requests
    return () => {
      cancelled = true;
    };
  }, [tenantId, expectedVersion, autoApply, enabled]);

  // Cleanup theme on unmount
  useEffect(() => {
    return () => {
      if (autoApply) {
        removeBrandingTheme();
      }
    };
  }, [autoApply]);

  // Manual method to apply branding
  const applyBranding = () => {
    if (state.branding) {
      applyBrandingTheme(state.branding.branding);
    }
  };

  // Manual method to remove branding
  const removeBranding = () => {
    removeBrandingTheme();
  };

  // Manual method to refresh branding
  const refreshBranding = async () => {
    if (!tenantId) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Force fetch (bypass cache)
      const brandingData = await fetchBranding(tenantId, expectedVersion, false);

      setState({
        branding: brandingData,
        loading: false,
        error: null,
      });

      // Apply theme if autoApply is enabled
      if (autoApply) {
        applyBrandingTheme(brandingData.branding);
      }

      return brandingData;
    } catch (error) {
      setState({
        branding: null,
        loading: false,
        error: error as Error,
      });
      throw error;
    }
  };

  return {
    branding: state.branding,
    loading: state.loading,
    error: state.error,
    applyBranding,
    removeBranding,
    refreshBranding,
  };
}
