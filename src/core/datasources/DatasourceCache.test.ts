/**
 * Datasource Cache Tests
 */

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DatasourceCache } from './DatasourceCache';

describe('DatasourceCache', () => {
  let cache: DatasourceCache;

  beforeEach(() => {
    cache = new DatasourceCache();
    jest.clearAllTimers();
  });

  describe('get and set', () => {
    it('should store and retrieve data', () => {
      const data = { id: 1, name: 'Test' };
      cache.set('test-ds', data);

      const entry = cache.get('test-ds');
      expect(entry).not.toBeNull();
      expect(entry?.data).toEqual(data);
    });

    it('should return null for non-existent key', () => {
      const entry = cache.get('non-existent');
      expect(entry).toBeNull();
    });

    it('should store data with custom TTL', () => {
      const data = { value: 'test' };
      const ttl = 1000; // 1 second

      cache.set('test-ds', data, ttl);

      const entry = cache.get('test-ds');
      expect(entry).not.toBeNull();
      expect(entry?.data).toEqual(data);
    });

    it('should return null for expired entries', () => {
      jest.useFakeTimers();

      const data = { value: 'test' };
      const ttl = 1000; // 1 second

      cache.set('test-ds', data, ttl);

      // Fast-forward time past TTL
      jest.advanceTimersByTime(1001);

      const entry = cache.get('test-ds');
      expect(entry).toBeNull();

      jest.useRealTimers();
    });

    it('should store data with ETag', () => {
      const data = { value: 'test' };
      const etag = 'etag-123';

      cache.set('test-ds', data, undefined, undefined, etag);

      const entry = cache.get('test-ds');
      expect(entry?.etag).toBe(etag);
    });

    it('should handle params in cache key', () => {
      const data1 = { value: 'test1' };
      const data2 = { value: 'test2' };

      cache.set('test-ds', data1, undefined, { page: 1 });
      cache.set('test-ds', data2, undefined, { page: 2 });

      const entry1 = cache.get('test-ds', { page: 1 });
      const entry2 = cache.get('test-ds', { page: 2 });

      expect(entry1?.data).toEqual(data1);
      expect(entry2?.data).toEqual(data2);
    });

    it('should generate consistent keys for same params', () => {
      const data = { value: 'test' };

      cache.set('test-ds', data, undefined, { b: 2, a: 1 });

      // Params in different order should get same cache entry
      const entry = cache.get('test-ds', { a: 1, b: 2 });
      expect(entry?.data).toEqual(data);
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used when at max size', () => {
      const smallCache = new DatasourceCache({ maxSize: 3, enableLRU: true });

      smallCache.set('ds1', { value: 1 });
      smallCache.set('ds2', { value: 2 });
      smallCache.set('ds3', { value: 3 });

      // Access ds1 to make it more recently used
      smallCache.get('ds1');

      // Adding ds4 should evict ds2 (least recently used)
      smallCache.set('ds4', { value: 4 });

      expect(smallCache.get('ds1')).not.toBeNull();
      expect(smallCache.get('ds2')).toBeNull(); // Evicted
      expect(smallCache.get('ds3')).not.toBeNull();
      expect(smallCache.get('ds4')).not.toBeNull();
    });

    it('should still evict when maxSize is reached even with LRU disabled', () => {
      const noLRUCache = new DatasourceCache({ maxSize: 2, enableLRU: false });

      noLRUCache.set('ds1', { value: 1 });
      noLRUCache.set('ds2', { value: 2 });

      // At maxSize, cache size should be 2
      expect(noLRUCache.getSize()).toBe(2);

      noLRUCache.set('ds3', { value: 3 });

      // Should still evict when at maxSize (even without LRU)
      expect(noLRUCache.getSize()).toBeLessThanOrEqual(2);
    });

    it('should update access order on get', () => {
      const smallCache = new DatasourceCache({ maxSize: 2, enableLRU: true });

      smallCache.set('ds1', { value: 1 });
      smallCache.set('ds2', { value: 2 });

      // Access ds1 to make it more recently used
      smallCache.get('ds1');

      // Adding ds3 should evict ds2
      smallCache.set('ds3', { value: 3 });

      expect(smallCache.get('ds1')).not.toBeNull();
      expect(smallCache.get('ds2')).toBeNull();
      expect(smallCache.get('ds3')).not.toBeNull();
    });
  });

  describe('markStale', () => {
    it('should mark entry as stale', () => {
      cache.set('test-ds', { value: 'test' });

      cache.markStale('test-ds');

      const entry = cache.get('test-ds');
      expect(entry?.isStale).toBe(true);
    });

    it('should handle marking non-existent entry', () => {
      expect(() => cache.markStale('non-existent')).not.toThrow();
    });

    it('should mark entry with params as stale', () => {
      cache.set('test-ds', { value: 'test' }, undefined, { page: 1 });

      cache.markStale('test-ds', { page: 1 });

      const entry = cache.get('test-ds', { page: 1 });
      expect(entry?.isStale).toBe(true);
    });
  });

  describe('invalidate', () => {
    it('should delete cache entry', () => {
      cache.set('test-ds', { value: 'test' });

      const deleted = cache.invalidate('test-ds');

      expect(deleted).toBe(true);
      expect(cache.get('test-ds')).toBeNull();
    });

    it('should return false for non-existent entry', () => {
      const deleted = cache.invalidate('non-existent');
      expect(deleted).toBe(false);
    });

    it('should invalidate entry with params', () => {
      cache.set('test-ds', { value: 'test' }, undefined, { page: 1 });

      cache.invalidate('test-ds', { page: 1 });

      expect(cache.get('test-ds', { page: 1 })).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      cache.set('ds1', { value: 1 });
      cache.set('ds2', { value: 2 });
      cache.set('ds3', { value: 3 });

      cache.clear();

      expect(cache.getSize()).toBe(0);
      expect(cache.get('ds1')).toBeNull();
      expect(cache.get('ds2')).toBeNull();
      expect(cache.get('ds3')).toBeNull();
    });

    it('should reset statistics', () => {
      cache.set('ds1', { value: 1 });
      cache.get('ds1'); // Hit
      cache.get('ds2'); // Miss

      cache.clear();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return accurate statistics', () => {
      cache.set('ds1', { value: 1 });
      cache.set('ds2', { value: 2 });

      cache.get('ds1'); // Hit
      cache.get('ds1'); // Hit
      cache.get('ds3'); // Miss
      cache.get('ds4'); // Miss

      const stats = cache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(0.5);
      expect(stats.memoryUsage).toBeGreaterThan(0);
    });

    it('should handle zero requests', () => {
      const stats = cache.getStats();

      expect(stats.size).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
    });

    it('should approximate memory usage', () => {
      const smallData = { value: 'test' };
      const largeData = { value: 'x'.repeat(1000) };

      cache.set('small', smallData);
      cache.set('large', largeData);

      const stats = cache.getStats();
      expect(stats.memoryUsage).toBeGreaterThan(0);
      expect(stats.memoryUsage).toBeGreaterThan(100); // Large data should increase size
    });
  });

  describe('has', () => {
    it('should return true for existing entry', () => {
      cache.set('test-ds', { value: 'test' });
      expect(cache.has('test-ds')).toBe(true);
    });

    it('should return false for non-existent entry', () => {
      expect(cache.has('non-existent')).toBe(false);
    });

    it('should work with params', () => {
      cache.set('test-ds', { value: 'test' }, undefined, { page: 1 });

      expect(cache.has('test-ds', { page: 1 })).toBe(true);
      expect(cache.has('test-ds', { page: 2 })).toBe(false);
    });
  });

  describe('getKeys', () => {
    it('should return all cache keys', () => {
      cache.set('ds1', { value: 1 });
      cache.set('ds2', { value: 2 });
      cache.set('ds3', { value: 3 }, undefined, { page: 1 });

      const keys = cache.getKeys();

      expect(keys).toHaveLength(3);
      expect(keys).toContain('ds1');
      expect(keys).toContain('ds2');
      expect(keys.some(k => k.startsWith('ds3'))).toBe(true);
    });

    it('should return empty array when cache is empty', () => {
      expect(cache.getKeys()).toEqual([]);
    });
  });

  describe('getSize', () => {
    it('should return number of cache entries', () => {
      expect(cache.getSize()).toBe(0);

      cache.set('ds1', { value: 1 });
      expect(cache.getSize()).toBe(1);

      cache.set('ds2', { value: 2 });
      expect(cache.getSize()).toBe(2);

      cache.invalidate('ds1');
      expect(cache.getSize()).toBe(1);
    });
  });

  describe('custom configuration', () => {
    it('should use custom max size', () => {
      const smallCache = new DatasourceCache({ maxSize: 2 });

      smallCache.set('ds1', { value: 1 });
      smallCache.set('ds2', { value: 2 });
      smallCache.set('ds3', { value: 3 });

      expect(smallCache.getSize()).toBeLessThanOrEqual(2);
    });

    it('should use custom default TTL', () => {
      jest.useFakeTimers();

      const shortTTLCache = new DatasourceCache({ defaultTTL: 100 });

      shortTTLCache.set('test-ds', { value: 'test' });

      jest.advanceTimersByTime(101);

      expect(shortTTLCache.get('test-ds')).toBeNull();

      jest.useRealTimers();
    });
  });
});
