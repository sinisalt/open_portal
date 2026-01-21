/**
 * Bootstrap Hook Tests
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import * as bootstrapService from '@/services/bootstrapService';
import * as tokenManager from '@/services/tokenManager';
import type { BootstrapResponse } from '@/types/bootstrap.types';
import { useBootstrap } from './useBootstrap';

// Mock dependencies
jest.mock('@/services/bootstrapService');
jest.mock('@/services/tokenManager');

describe('useBootstrap', () => {
  const mockBootstrapData: BootstrapResponse = {
    user: {
      id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      roles: ['admin'],
    },
    permissions: ['dashboard.view', 'users.edit'],
    tenant: {
      id: 'tenant456',
      name: 'Acme Corp',
      brandingVersion: '1.2.0',
    },
    menu: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        route: '/dashboard',
        order: 1,
      },
    ],
    defaults: {
      homePage: '/dashboard',
      theme: 'light',
    },
    featureFlags: {
      newDashboard: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
  });

  it('should initialize with default state', () => {
    (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(false);
    (bootstrapService.fetchBootstrap as jest.Mock).mockResolvedValue(mockBootstrapData);

    const { result } = renderHook(() => useBootstrap());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.loaded).toBe(false);
  });

  it('should auto-fetch bootstrap data when authenticated', async () => {
    (bootstrapService.fetchBootstrap as jest.Mock).mockResolvedValue(mockBootstrapData);

    const { result } = renderHook(() => useBootstrap());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    expect(result.current.data).toEqual(mockBootstrapData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should not auto-fetch when not authenticated', () => {
    (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(false);
    (bootstrapService.fetchBootstrap as jest.Mock).mockResolvedValue(mockBootstrapData);

    renderHook(() => useBootstrap());

    expect(bootstrapService.fetchBootstrap).not.toHaveBeenCalled();
  });

  it('should set loading state during fetch', async () => {
    let resolveBootstrap: (value: BootstrapResponse) => void;
    const bootstrapPromise = new Promise<BootstrapResponse>(resolve => {
      resolveBootstrap = resolve;
    });
    (bootstrapService.fetchBootstrap as jest.Mock).mockReturnValue(bootstrapPromise);

    const { result } = renderHook(() => useBootstrap());

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    act(() => {
      resolveBootstrap(mockBootstrapData);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle fetch errors', async () => {
    const errorMessage = 'Network error';
    (bootstrapService.fetchBootstrap as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useBootstrap());

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.loaded).toBe(false);
  });

  it('should clear tokens on authentication error', async () => {
    (bootstrapService.fetchBootstrap as jest.Mock).mockRejectedValue(new Error('401 Unauthorized'));

    const { result } = renderHook(() => useBootstrap());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(tokenManager.clearTokens).toHaveBeenCalled();
  });

  it('should provide convenient accessors for bootstrap data', async () => {
    (bootstrapService.fetchBootstrap as jest.Mock).mockResolvedValue(mockBootstrapData);

    const { result } = renderHook(() => useBootstrap());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    expect(result.current.user).toEqual(mockBootstrapData.user);
    expect(result.current.permissions).toEqual(mockBootstrapData.permissions);
    expect(result.current.tenant).toEqual(mockBootstrapData.tenant);
    expect(result.current.menu).toEqual(mockBootstrapData.menu);
    expect(result.current.defaults).toEqual(mockBootstrapData.defaults);
    expect(result.current.featureFlags).toEqual(mockBootstrapData.featureFlags);
  });

  it('should reload bootstrap data with cache', async () => {
    (bootstrapService.fetchBootstrap as jest.Mock).mockResolvedValue(mockBootstrapData);

    const { result } = renderHook(() => useBootstrap());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    // Clear the mock calls
    (bootstrapService.fetchBootstrap as jest.Mock).mockClear();

    // Reload
    await act(async () => {
      await result.current.reload();
    });

    expect(bootstrapService.fetchBootstrap).toHaveBeenCalledWith(true);
  });

  it('should refresh bootstrap data without cache', async () => {
    (bootstrapService.fetchBootstrap as jest.Mock).mockResolvedValue(mockBootstrapData);

    const { result } = renderHook(() => useBootstrap());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    // Clear the mock calls
    (bootstrapService.fetchBootstrap as jest.Mock).mockClear();

    // Refresh
    await act(async () => {
      await result.current.refresh();
    });

    expect(bootstrapService.clearBootstrapCache).toHaveBeenCalled();
    expect(bootstrapService.fetchBootstrap).toHaveBeenCalledWith(false);
  });

  it('should clear bootstrap data and cache', async () => {
    (bootstrapService.fetchBootstrap as jest.Mock).mockResolvedValue(mockBootstrapData);

    const { result } = renderHook(() => useBootstrap());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    // Clear
    act(() => {
      result.current.clear();
    });

    expect(bootstrapService.clearBootstrapCache).toHaveBeenCalled();
    expect(result.current.data).toBeNull();
    expect(result.current.loaded).toBe(false);
  });

  it('should return empty arrays/objects when no data', () => {
    (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useBootstrap());

    expect(result.current.user).toBeNull();
    expect(result.current.permissions).toEqual([]);
    expect(result.current.tenant).toBeNull();
    expect(result.current.menu).toEqual([]);
    expect(result.current.defaults).toBeNull();
    expect(result.current.featureFlags).toEqual({});
  });

  it('should not fetch if not authenticated when reload is called', async () => {
    (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(false);
    (bootstrapService.fetchBootstrap as jest.Mock).mockResolvedValue(mockBootstrapData);

    const { result } = renderHook(() => useBootstrap());

    await act(async () => {
      await result.current.reload();
    });

    expect(bootstrapService.fetchBootstrap).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Not authenticated');
  });

  it('should only fetch once on mount', async () => {
    (bootstrapService.fetchBootstrap as jest.Mock).mockResolvedValue(mockBootstrapData);

    const { result } = renderHook(() => useBootstrap());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    // Wait a bit more to ensure no additional calls
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(bootstrapService.fetchBootstrap).toHaveBeenCalledTimes(1);
  });
});
