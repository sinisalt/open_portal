/**
 * Datasource Manager Tests
 */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { DatasourceHandler, HttpDatasourceConfig } from '@/types/datasource.types';
import { DatasourceManager } from './DatasourceManager';
import { datasourceRegistry } from './DatasourceRegistry';

describe('DatasourceManager', () => {
  let manager: DatasourceManager;
  let mockHandler: DatasourceHandler;
  let fetchSpy: jest.Mock;

  beforeEach(() => {
    manager = new DatasourceManager({ debug: false });
    fetchSpy = jest.fn();

    mockHandler = {
      fetch: fetchSpy,
    };

    datasourceRegistry.register('http', mockHandler);
    jest.useFakeTimers();
  });

  afterEach(() => {
    manager.cleanup();
    datasourceRegistry.clear();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  const createHttpConfig = (id: string, url: string): HttpDatasourceConfig => ({
    id,
    type: 'http',
    config: {
      url,
      method: 'GET',
    },
  });

  describe('fetch', () => {
    it('should fetch data from datasource', async () => {
      const config = createHttpConfig('test-ds', '/api/test');
      const mockData = { value: 'test' };
      fetchSpy.mockResolvedValue(mockData);

      const result = await manager.fetch(config);

      expect(result.data).toEqual(mockData);
      expect(result.fromCache).toBe(false);
      expect(fetchSpy).toHaveBeenCalledWith(config, undefined);
    });

    it('should throw error if datasource is disabled', async () => {
      const config = createHttpConfig('test-ds', '/api/test');
      config.enabled = false;

      await expect(manager.fetch(config)).rejects.toThrow("Datasource 'test-ds' is disabled");
    });

    it('should throw error if handler not found', async () => {
      const config: any = {
        id: 'test-ds',
        type: 'unknown',
        config: {},
      };

      await expect(manager.fetch(config)).rejects.toThrow(
        "No handler registered for type 'unknown'"
      );
    });
  });

  describe('fetch policies', () => {
    describe('cache-first', () => {
      it('should return cached data if available', async () => {
        const config = createHttpConfig('test-ds', '/api/test');
        config.fetchPolicy = 'cache-first';
        const mockData = { value: 'test' };
        fetchSpy.mockResolvedValue(mockData);

        // First fetch
        await manager.fetch(config);

        // Second fetch should use cache
        const result = await manager.fetch(config);

        expect(result.data).toEqual(mockData);
        expect(result.fromCache).toBe(true);
        expect(fetchSpy).toHaveBeenCalledTimes(1); // Only first fetch
      });

      it('should fetch from network if cache is stale', async () => {
        const config = createHttpConfig('test-ds', '/api/test');
        config.fetchPolicy = 'cache-first';
        const mockData1 = { value: 'test1' };
        const mockData2 = { value: 'test2' };
        fetchSpy.mockResolvedValueOnce(mockData1).mockResolvedValueOnce(mockData2);

        // First fetch
        await manager.fetch(config);

        // Mark as stale
        manager.invalidate('test-ds');

        // Second fetch should hit network
        const result = await manager.fetch(config);

        expect(result.data).toEqual(mockData2);
        expect(result.fromCache).toBe(false);
        expect(fetchSpy).toHaveBeenCalledTimes(2);
      });

      it('should fetch from network if no cache', async () => {
        const config = createHttpConfig('test-ds', '/api/test');
        config.fetchPolicy = 'cache-first';
        const mockData = { value: 'test' };
        fetchSpy.mockResolvedValue(mockData);

        const result = await manager.fetch(config);

        expect(result.data).toEqual(mockData);
        expect(result.fromCache).toBe(false);
        expect(fetchSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('network-only', () => {
      it('should always fetch from network', async () => {
        const config = createHttpConfig('test-ds', '/api/test');
        config.fetchPolicy = 'network-only';
        const mockData1 = { value: 'test1' };
        const mockData2 = { value: 'test2' };
        fetchSpy.mockResolvedValueOnce(mockData1).mockResolvedValueOnce(mockData2);

        // First fetch
        const result1 = await manager.fetch(config);
        expect(result1.data).toEqual(mockData1);
        expect(result1.fromCache).toBe(false);

        // Second fetch should hit network again
        const result2 = await manager.fetch(config);
        expect(result2.data).toEqual(mockData2);
        expect(result2.fromCache).toBe(false);
        expect(fetchSpy).toHaveBeenCalledTimes(2);
      });

      it('should update cache after fetch', async () => {
        const config = createHttpConfig('test-ds', '/api/test');
        config.fetchPolicy = 'network-only';
        const mockData = { value: 'test' };
        fetchSpy.mockResolvedValue(mockData);

        await manager.fetch(config);

        // Change to cache-first to check if cached
        config.fetchPolicy = 'cache-first';
        const result = await manager.fetch(config);

        expect(result.fromCache).toBe(true);
        expect(fetchSpy).toHaveBeenCalledTimes(1); // Only from network-only fetch
      });
    });

    describe('cache-and-network', () => {
      it('should return cached data immediately', async () => {
        const config = createHttpConfig('test-ds', '/api/test');
        const mockData = { value: 'test' };
        fetchSpy.mockResolvedValue(mockData);

        // First fetch to populate cache
        await manager.fetch(config);

        // Second fetch with cache-and-network
        config.fetchPolicy = 'cache-and-network';
        const result = await manager.fetch(config);

        expect(result.data).toEqual(mockData);
        expect(result.fromCache).toBe(true);
      });

      it('should fetch from network if no cache', async () => {
        const config = createHttpConfig('test-ds', '/api/test');
        config.fetchPolicy = 'cache-and-network';
        const mockData = { value: 'test' };
        fetchSpy.mockResolvedValue(mockData);

        const result = await manager.fetch(config);

        expect(result.data).toEqual(mockData);
        expect(result.fromCache).toBe(false);
      });
    });

    describe('no-cache', () => {
      it('should always fetch from network', async () => {
        const config = createHttpConfig('test-ds', '/api/test');
        config.fetchPolicy = 'no-cache';
        const mockData1 = { value: 'test1' };
        const mockData2 = { value: 'test2' };
        fetchSpy.mockResolvedValueOnce(mockData1).mockResolvedValueOnce(mockData2);

        // First fetch
        const result1 = await manager.fetch(config);
        expect(result1.data).toEqual(mockData1);

        // Second fetch should hit network again
        const result2 = await manager.fetch(config);
        expect(result2.data).toEqual(mockData2);
        expect(fetchSpy).toHaveBeenCalledTimes(2);
      });

      it('should not cache data', async () => {
        const config = createHttpConfig('test-ds', '/api/test');
        config.fetchPolicy = 'no-cache';
        const mockData = { value: 'test' };
        fetchSpy.mockResolvedValue(mockData);

        await manager.fetch(config);

        // Change to cache-first to check if cached
        config.fetchPolicy = 'cache-first';
        const result = await manager.fetch(config);

        expect(result.fromCache).toBe(false); // Should not be cached
        expect(fetchSpy).toHaveBeenCalledTimes(2); // Both fetches hit network
      });
    });
  });

  describe('getState', () => {
    it('should return undefined for non-existent datasource', () => {
      const state = manager.getState('non-existent');
      expect(state).toBeUndefined();
    });

    it('should return state after fetch', async () => {
      const config = createHttpConfig('test-ds', '/api/test');
      const mockData = { value: 'test' };
      fetchSpy.mockResolvedValue(mockData);

      await manager.fetch(config);

      const state = manager.getState('test-ds');
      expect(state).toBeDefined();
      expect(state?.data).toEqual(mockData);
      expect(state?.loading).toBe(false);
      expect(state?.error).toBeNull();
    });

    it('should include refetch and invalidate methods', async () => {
      const config = createHttpConfig('test-ds', '/api/test');
      const mockData = { value: 'test' };
      fetchSpy.mockResolvedValue(mockData);

      await manager.fetch(config);

      const state = manager.getState('test-ds');
      expect(state?.refetch).toBeInstanceOf(Function);
      expect(state?.invalidate).toBeInstanceOf(Function);
    });
  });

  describe('invalidate', () => {
    it('should mark state as stale', async () => {
      const config = createHttpConfig('test-ds', '/api/test');
      const mockData = { value: 'test' };
      fetchSpy.mockResolvedValue(mockData);

      await manager.fetch(config);

      manager.invalidate('test-ds');

      const state = manager.getState('test-ds');
      expect(state?.isStale).toBe(true);
    });

    it('should clear cache entry', async () => {
      const config = createHttpConfig('test-ds', '/api/test');
      config.fetchPolicy = 'cache-first';
      const mockData = { value: 'test' };
      fetchSpy.mockResolvedValue(mockData);

      await manager.fetch(config);

      manager.invalidate('test-ds');

      // Next fetch should hit network
      await manager.fetch(config);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('invalidateAll', () => {
    it('should invalidate all datasources', async () => {
      const config1 = createHttpConfig('ds1', '/api/test1');
      const config2 = createHttpConfig('ds2', '/api/test2');
      fetchSpy.mockResolvedValue({ value: 'test' });

      await manager.fetch(config1);
      await manager.fetch(config2);

      manager.invalidateAll();

      const state1 = manager.getState('ds1');
      const state2 = manager.getState('ds2');

      expect(state1?.isStale).toBe(true);
      expect(state2?.isStale).toBe(true);
    });

    it('should clear all cache', async () => {
      const config1 = createHttpConfig('ds1', '/api/test1');
      const config2 = createHttpConfig('ds2', '/api/test2');
      config1.fetchPolicy = 'cache-first';
      config2.fetchPolicy = 'cache-first';
      fetchSpy.mockResolvedValue({ value: 'test' });

      await manager.fetch(config1);
      await manager.fetch(config2);

      manager.invalidateAll();

      // Next fetches should hit network
      await manager.fetch(config1);
      await manager.fetch(config2);

      expect(fetchSpy).toHaveBeenCalledTimes(4); // 2 initial + 2 after invalidate
    });
  });

  describe('refetch', () => {
    it('should refetch data', async () => {
      const config = createHttpConfig('test-ds', '/api/test');
      const mockData1 = { value: 'test1' };
      const mockData2 = { value: 'test2' };
      fetchSpy.mockResolvedValueOnce(mockData1).mockResolvedValueOnce(mockData2);

      await manager.fetch(config);

      await manager.refetch('test-ds');

      const state = manager.getState('test-ds');
      expect(state?.data).toEqual(mockData2);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('should throw error for non-existent datasource', async () => {
      await expect(manager.refetch('non-existent')).rejects.toThrow(
        "Datasource 'non-existent' not found"
      );
    });
  });

  describe('auto-refetch', () => {
    it('should set up refetch interval', async () => {
      const config = createHttpConfig('test-ds', '/api/test');
      config.refetchInterval = 1000; // 1 second
      const mockData = { value: 'test' };
      fetchSpy.mockResolvedValue(mockData);

      await manager.fetch(config);

      // Advance time and check refetch
      jest.advanceTimersByTime(1000);
      await Promise.resolve(); // Let promises resolve

      expect(fetchSpy).toHaveBeenCalledTimes(2); // Initial + auto-refetch
    });

    it('should not set up interval if refetchInterval is 0', async () => {
      const config = createHttpConfig('test-ds', '/api/test');
      config.refetchInterval = 0;
      const mockData = { value: 'test' };
      fetchSpy.mockResolvedValue(mockData);

      await manager.fetch(config);

      jest.advanceTimersByTime(10000);

      expect(fetchSpy).toHaveBeenCalledTimes(1); // Only initial fetch
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      const stats = manager.getCacheStats();

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('hitRate');
    });
  });

  describe('clearCache', () => {
    it('should clear all cache entries', async () => {
      const config = createHttpConfig('test-ds', '/api/test');
      fetchSpy.mockResolvedValue({ value: 'test' });

      await manager.fetch(config);

      manager.clearCache();

      const stats = manager.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should clear all intervals', async () => {
      const config = createHttpConfig('test-ds', '/api/test');
      config.refetchInterval = 1000;
      fetchSpy.mockResolvedValue({ value: 'test' });

      await manager.fetch(config);

      manager.cleanup();

      // Advance time - should not trigger refetch
      jest.advanceTimersByTime(2000);

      expect(fetchSpy).toHaveBeenCalledTimes(1); // Only initial fetch
    });

    it('should clear all states', async () => {
      const config = createHttpConfig('test-ds', '/api/test');
      fetchSpy.mockResolvedValue({ value: 'test' });

      await manager.fetch(config);

      manager.cleanup();

      const state = manager.getState('test-ds');
      expect(state).toBeUndefined();
    });
  });
});
