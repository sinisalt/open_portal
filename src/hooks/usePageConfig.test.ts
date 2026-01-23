/**
 * Page Configuration Hook Tests
 */

import { renderHook, waitFor } from '@testing-library/react';
import * as pageConfigLoader from '@/services/pageConfigLoader';
import type { PageConfig, PageLoadError, PageLoadErrorType } from '@/types/page.types';
import { useIsPageCached, usePageConfig, usePreloadPageConfig } from './usePageConfig';

// Mock pageConfigLoader
jest.mock('@/services/pageConfigLoader');

const mockLoadPageConfig = pageConfigLoader.loadPageConfig as jest.MockedFunction<
  typeof pageConfigLoader.loadPageConfig
>;
const mockPreloadPageConfig = pageConfigLoader.preloadPageConfig as jest.MockedFunction<
  typeof pageConfigLoader.preloadPageConfig
>;
const mockIsPageCached = pageConfigLoader.isPageCached as jest.MockedFunction<
  typeof pageConfigLoader.isPageCached
>;
const mockClearPageCache = pageConfigLoader.clearPageCache as jest.MockedFunction<
  typeof pageConfigLoader.clearPageCache
>;

/**
 * Sample page configuration
 */
const samplePageConfig: PageConfig = {
  id: 'test-page',
  version: '1.0.0',
  title: 'Test Page',
  layout: {
    type: 'grid',
    grid: {
      columns: 12,
    },
  },
  widgets: [],
};

describe('usePageConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load page configuration on mount', async () => {
    mockLoadPageConfig.mockResolvedValue({
      config: samplePageConfig,
      fromCache: false,
      loadedAt: Date.now(),
    });

    const { result } = renderHook(() => usePageConfig('test-page'));

    // Initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.config).toBeNull();

    // Wait for load to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config).toEqual(samplePageConfig);
    expect(result.current.error).toBeNull();
    expect(mockLoadPageConfig).toHaveBeenCalledWith('test-page', {});
  });

  it('should skip loading when skip option is true', () => {
    const { result } = renderHook(() => usePageConfig('test-page', { skip: true }));

    expect(result.current.loading).toBe(false);
    expect(result.current.config).toBeNull();
    expect(mockLoadPageConfig).not.toHaveBeenCalled();
  });

  it('should handle loading errors', async () => {
    const error = new Error('Load failed') as PageLoadError;
    error.name = 'PageLoadError';
    error.type = 'NOT_FOUND' as PageLoadErrorType;

    mockLoadPageConfig.mockRejectedValue(error);

    const { result } = renderHook(() => usePageConfig('test-page'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config).toBeNull();
    expect(result.current.error).toEqual(error);
  });

  it('should reload page configuration', async () => {
    mockLoadPageConfig.mockResolvedValue({
      config: samplePageConfig,
      fromCache: false,
      loadedAt: Date.now(),
    });

    const { result } = renderHook(() => usePageConfig('test-page'));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = mockLoadPageConfig.mock.calls.length;

    // Reload
    await result.current.reload();

    // Should have called loadPageConfig one more time with skipCache
    expect(mockLoadPageConfig).toHaveBeenCalledTimes(initialCallCount + 1);
    expect(mockLoadPageConfig).toHaveBeenLastCalledWith('test-page', { skipCache: true });
  });

  it('should clear cache', async () => {
    mockLoadPageConfig.mockResolvedValue({
      config: samplePageConfig,
      fromCache: false,
      loadedAt: Date.now(),
    });

    mockClearPageCache.mockResolvedValue();

    const { result } = renderHook(() => usePageConfig('test-page'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.clearCache();

    expect(mockClearPageCache).toHaveBeenCalledWith('test-page');
  });

  it('should track fromCache and loadedAt', async () => {
    const loadedAt = Date.now();
    mockLoadPageConfig.mockResolvedValue({
      config: samplePageConfig,
      fromCache: true,
      etag: '"v1.0.0"',
      loadedAt,
    });

    const { result } = renderHook(() => usePageConfig('test-page'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.fromCache).toBe(true);
    expect(result.current.loadedAt).toBe(loadedAt);
  });

  it('should call onLoad callback on success', async () => {
    mockLoadPageConfig.mockResolvedValue({
      config: samplePageConfig,
      fromCache: false,
      loadedAt: Date.now(),
    });

    const onLoad = jest.fn();
    renderHook(() => usePageConfig('test-page', { onLoad }));

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalledWith(samplePageConfig);
    });
  });

  it('should call onError callback on failure', async () => {
    const error = new Error('Load failed') as PageLoadError;
    error.name = 'PageLoadError';
    error.type = 'NOT_FOUND' as PageLoadErrorType;

    mockLoadPageConfig.mockRejectedValue(error);

    const onError = jest.fn();
    renderHook(() => usePageConfig('test-page', { onError }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  it('should support custom loader options', async () => {
    mockLoadPageConfig.mockResolvedValue({
      config: samplePageConfig,
      fromCache: false,
      loadedAt: Date.now(),
    });

    renderHook(() =>
      usePageConfig('test-page', {
        skipCache: true,
        cacheTTL: 60,
      })
    );

    await waitFor(() => {
      expect(mockLoadPageConfig).toHaveBeenCalledWith('test-page', {
        skipCache: true,
        cacheTTL: 60,
      });
    });
  });

  it('should reload page configuration at interval', async () => {
    jest.useFakeTimers();

    mockLoadPageConfig.mockResolvedValue({
      config: samplePageConfig,
      fromCache: false,
      loadedAt: Date.now(),
    });

    renderHook(() =>
      usePageConfig('test-page', {
        autoReload: 1000,
      })
    );

    // Initial load
    await waitFor(() => {
      expect(mockLoadPageConfig).toHaveBeenCalledTimes(1);
    });

    // Fast-forward time
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(mockLoadPageConfig).toHaveBeenCalledTimes(2);
    });

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(mockLoadPageConfig).toHaveBeenCalledTimes(3);
    });

    jest.useRealTimers();
  });
});

describe('usePreloadPageConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should preload page configuration', () => {
    mockPreloadPageConfig.mockResolvedValue();

    renderHook(() => usePreloadPageConfig('test-page'));

    expect(mockPreloadPageConfig).toHaveBeenCalledWith('test-page', {});
  });

  it('should support custom options', () => {
    mockPreloadPageConfig.mockResolvedValue();

    renderHook(() => usePreloadPageConfig('test-page', { cacheTTL: 60 }));

    expect(mockPreloadPageConfig).toHaveBeenCalledWith('test-page', { cacheTTL: 60 });
  });
});

describe('useIsPageCached', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when page is cached', async () => {
    mockIsPageCached.mockResolvedValue(true);

    const { result } = renderHook(() => useIsPageCached('test-page'));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should return false when page is not cached', async () => {
    mockIsPageCached.mockResolvedValue(false);

    const { result } = renderHook(() => useIsPageCached('test-page'));

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });
});
