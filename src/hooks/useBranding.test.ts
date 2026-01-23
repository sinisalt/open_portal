/**
 * useBranding Hook Tests
 */

import { renderHook, waitFor } from '@testing-library/react';
import * as brandingService from '@/services/brandingService';
import type { BrandingResponse } from '@/types/branding.types';
import * as applyThemeUtils from '@/utils/applyTheme';
import { useBranding } from './useBranding';

// Mock dependencies
jest.mock('@/services/brandingService');
jest.mock('@/utils/applyTheme');

describe('useBranding', () => {
  const mockBrandingResponse: BrandingResponse = {
    tenantId: 'tenant456',
    version: '1.2.0',
    branding: {
      logos: {
        primary: {
          url: 'https://example.com/logo.svg',
          altText: 'Logo',
        },
        login: {
          url: 'https://example.com/logo-login.svg',
          altText: 'Login Logo',
        },
      },
      colors: {
        primary: {
          500: '#2196f3',
        },
      },
      typography: {
        fontFamily: {
          primary: "'Roboto', sans-serif",
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial loading', () => {
    it('should start with loading false when disabled', () => {
      const { result } = renderHook(() => useBranding({ tenantId: 'tenant456', enabled: false }));

      expect(result.current.loading).toBe(false);
      expect(result.current.branding).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should start with loading false when tenantId is missing', () => {
      const { result } = renderHook(() => useBranding({}));

      expect(result.current.loading).toBe(false);
      expect(result.current.branding).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should fetch branding when tenantId is provided', async () => {
      (brandingService.fetchBranding as jest.Mock).mockResolvedValue(mockBrandingResponse);
      (brandingService.needsBrandingRefresh as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useBranding({ tenantId: 'tenant456' }));

      // Should start loading
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.branding).toEqual(mockBrandingResponse);
      expect(result.current.error).toBeNull();
      expect(brandingService.fetchBranding).toHaveBeenCalledWith('tenant456', undefined, true);
    });

    it('should apply theme automatically by default', async () => {
      (brandingService.fetchBranding as jest.Mock).mockResolvedValue(mockBrandingResponse);
      (brandingService.needsBrandingRefresh as jest.Mock).mockReturnValue(false);

      renderHook(() => useBranding({ tenantId: 'tenant456' }));

      await waitFor(() => {
        expect(applyThemeUtils.applyBrandingTheme).toHaveBeenCalledWith(
          mockBrandingResponse.branding
        );
      });
    });

    it('should not apply theme when autoApply is false', async () => {
      (brandingService.fetchBranding as jest.Mock).mockResolvedValue(mockBrandingResponse);
      (brandingService.needsBrandingRefresh as jest.Mock).mockReturnValue(false);

      renderHook(() => useBranding({ tenantId: 'tenant456', autoApply: false }));

      await waitFor(() => {
        expect(brandingService.fetchBranding).toHaveBeenCalled();
      });

      expect(applyThemeUtils.applyBrandingTheme).not.toHaveBeenCalled();
    });
  });

  describe('version checking', () => {
    it('should check version and bypass cache when refresh needed', async () => {
      (brandingService.fetchBranding as jest.Mock).mockResolvedValue(mockBrandingResponse);
      (brandingService.needsBrandingRefresh as jest.Mock).mockReturnValue(true);

      renderHook(() =>
        useBranding({
          tenantId: 'tenant456',
          expectedVersion: '2.0.0',
        })
      );

      await waitFor(() => {
        expect(brandingService.needsBrandingRefresh).toHaveBeenCalledWith('2.0.0');
        expect(brandingService.fetchBranding).toHaveBeenCalledWith('tenant456', '2.0.0', false);
      });
    });

    it('should use cache when version matches', async () => {
      (brandingService.fetchBranding as jest.Mock).mockResolvedValue(mockBrandingResponse);
      (brandingService.needsBrandingRefresh as jest.Mock).mockReturnValue(false);

      renderHook(() =>
        useBranding({
          tenantId: 'tenant456',
          expectedVersion: '1.2.0',
        })
      );

      await waitFor(() => {
        expect(brandingService.needsBrandingRefresh).toHaveBeenCalledWith('1.2.0');
        expect(brandingService.fetchBranding).toHaveBeenCalledWith('tenant456', '1.2.0', true);
      });
    });
  });

  describe('error handling', () => {
    it('should handle fetch errors', async () => {
      const error = new Error('Network error');
      (brandingService.fetchBranding as jest.Mock).mockRejectedValue(error);
      (brandingService.needsBrandingRefresh as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useBranding({ tenantId: 'tenant456' }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.branding).toBeNull();
      expect(result.current.error).toEqual(error);
      expect(applyThemeUtils.applyBrandingTheme).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should remove branding theme on unmount when autoApply is true', async () => {
      (brandingService.fetchBranding as jest.Mock).mockResolvedValue(mockBrandingResponse);
      (brandingService.needsBrandingRefresh as jest.Mock).mockReturnValue(false);

      const { unmount } = renderHook(() => useBranding({ tenantId: 'tenant456' }));

      await waitFor(() => {
        expect(applyThemeUtils.applyBrandingTheme).toHaveBeenCalled();
      });

      unmount();

      expect(applyThemeUtils.removeBrandingTheme).toHaveBeenCalled();
    });

    it('should not remove branding theme on unmount when autoApply is false', () => {
      const { unmount } = renderHook(() =>
        useBranding({ tenantId: 'tenant456', autoApply: false })
      );

      unmount();

      expect(applyThemeUtils.removeBrandingTheme).not.toHaveBeenCalled();
    });
  });

  describe('manual methods', () => {
    it('should manually apply branding', async () => {
      (brandingService.fetchBranding as jest.Mock).mockResolvedValue(mockBrandingResponse);
      (brandingService.needsBrandingRefresh as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useBranding({ tenantId: 'tenant456', autoApply: false }));

      await waitFor(() => {
        expect(result.current.branding).toEqual(mockBrandingResponse);
      });

      // Manual apply
      result.current.applyBranding();

      expect(applyThemeUtils.applyBrandingTheme).toHaveBeenCalledWith(
        mockBrandingResponse.branding
      );
    });

    it('should manually remove branding', () => {
      const { result } = renderHook(() => useBranding({ tenantId: 'tenant456' }));

      result.current.removeBranding();

      expect(applyThemeUtils.removeBrandingTheme).toHaveBeenCalled();
    });

    it('should manually refresh branding', async () => {
      (brandingService.fetchBranding as jest.Mock).mockResolvedValue(mockBrandingResponse);
      (brandingService.needsBrandingRefresh as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useBranding({ tenantId: 'tenant456' }));

      await waitFor(() => {
        expect(result.current.branding).toEqual(mockBrandingResponse);
      });

      // Clear mock calls from initial load
      jest.clearAllMocks();

      // Refresh
      await result.current.refreshBranding();

      expect(brandingService.fetchBranding).toHaveBeenCalledWith('tenant456', undefined, false);
      expect(result.current.branding).toEqual(mockBrandingResponse);
    });

    it('should not refresh when tenantId is missing', async () => {
      const { result } = renderHook(() => useBranding({}));

      await result.current.refreshBranding();

      expect(brandingService.fetchBranding).not.toHaveBeenCalled();
    });

    it('should handle refresh errors', async () => {
      (brandingService.fetchBranding as jest.Mock)
        .mockResolvedValueOnce(mockBrandingResponse)
        .mockRejectedValueOnce(new Error('Refresh failed'));
      (brandingService.needsBrandingRefresh as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useBranding({ tenantId: 'tenant456' }));

      await waitFor(() => {
        expect(result.current.branding).toEqual(mockBrandingResponse);
      });

      // Try to refresh (will fail)
      await expect(result.current.refreshBranding()).rejects.toThrow('Refresh failed');

      // Wait for state to update after refresh failure
      await waitFor(() => {
        expect(result.current.branding).toBeNull();
      });

      expect(result.current.error).toEqual(new Error('Refresh failed'));
    });
  });

  describe('re-rendering on option changes', () => {
    it('should refetch when tenantId changes', async () => {
      (brandingService.fetchBranding as jest.Mock).mockResolvedValue(mockBrandingResponse);
      (brandingService.needsBrandingRefresh as jest.Mock).mockReturnValue(false);

      const { rerender } = renderHook(({ tenantId }) => useBranding({ tenantId }), {
        initialProps: { tenantId: 'tenant456' },
      });

      await waitFor(() => {
        expect(brandingService.fetchBranding).toHaveBeenCalledWith('tenant456', undefined, true);
      });

      // Change tenantId
      rerender({ tenantId: 'tenant789' });

      await waitFor(() => {
        expect(brandingService.fetchBranding).toHaveBeenCalledWith('tenant789', undefined, true);
      });

      expect(brandingService.fetchBranding).toHaveBeenCalledTimes(2);
    });

    it('should refetch when expectedVersion changes', async () => {
      (brandingService.fetchBranding as jest.Mock).mockResolvedValue(mockBrandingResponse);
      (brandingService.needsBrandingRefresh as jest.Mock).mockReturnValue(false);

      const { rerender } = renderHook(
        ({ version }) => useBranding({ tenantId: 'tenant456', expectedVersion: version }),
        {
          initialProps: { version: '1.0.0' },
        }
      );

      await waitFor(() => {
        expect(brandingService.fetchBranding).toHaveBeenCalledWith('tenant456', '1.0.0', true);
      });

      // Change version
      rerender({ version: '2.0.0' });

      await waitFor(() => {
        expect(brandingService.fetchBranding).toHaveBeenCalledWith('tenant456', '2.0.0', true);
      });

      expect(brandingService.fetchBranding).toHaveBeenCalledTimes(2);
    });
  });
});
