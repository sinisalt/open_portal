/**
 * Datasource Cache
 *
 * In-memory cache with LRU eviction for datasource results.
 * Supports TTL-based expiration and manual invalidation.
 */

import type { CacheConfig, CacheEntry, CacheStats } from '@/types/datasource.types';

/**
 * Default cache configuration
 */
const DEFAULT_CACHE_CONFIG: Required<CacheConfig> = {
  maxSize: 100, // Maximum 100 cache entries
  defaultTTL: 5 * 60 * 1000, // 5 minutes default TTL
  enableLRU: true,
};

/**
 * DatasourceCache implementation
 *
 * Provides in-memory caching with LRU eviction and TTL support.
 */
export class DatasourceCache {
  private cache: Map<string, CacheEntry>;
  private accessOrder: string[]; // For LRU tracking
  private config: Required<CacheConfig>;
  private hits: number;
  private misses: number;

  constructor(config?: CacheConfig) {
    this.cache = new Map();
    this.accessOrder = [];
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Generate cache key for datasource
   */
  private generateKey(datasourceId: string, params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return datasourceId;
    }
    // Sort params for consistent key generation
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    return `${datasourceId}?${sortedParams}`;
  }

  /**
   * Update LRU access order
   */
  private updateAccessOrder(key: string): void {
    if (!this.config.enableLRU) {
      return;
    }

    // Remove key from current position
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }

    // Add to end (most recently used)
    this.accessOrder.push(key);
  }

  /**
   * Evict an entry to make room for new ones
   * Uses LRU if enabled, otherwise evicts first entry in map
   */
  private evict(): void {
    if (this.config.enableLRU && this.accessOrder.length > 0) {
      // Evict least recently used (first in array)
      const keyToEvict = this.accessOrder.shift();
      if (keyToEvict) {
        this.cache.delete(keyToEvict);
      }
    } else if (this.cache.size > 0) {
      // Evict first entry when LRU is disabled
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Get cached data
   */
  get<T = unknown>(datasourceId: string, params?: Record<string, unknown>): CacheEntry<T> | null {
    const key = this.generateKey(datasourceId, params);
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
      this.misses++;
      return null;
    }

    // Update access order for LRU
    this.updateAccessOrder(key);
    this.hits++;

    return entry as CacheEntry<T>;
  }

  /**
   * Set cached data
   */
  set<T = unknown>(
    datasourceId: string,
    data: T,
    ttl?: number,
    params?: Record<string, unknown>,
    etag?: string
  ): void {
    const key = this.generateKey(datasourceId, params);

    // Evict if at max size
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evict();
    }

    const now = Date.now();
    const cacheTTL = ttl ?? this.config.defaultTTL;

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + cacheTTL,
      etag,
      isStale: false,
    };

    this.cache.set(key, entry);
    this.updateAccessOrder(key);
  }

  /**
   * Mark cache entry as stale
   */
  markStale(datasourceId: string, params?: Record<string, unknown>): void {
    const key = this.generateKey(datasourceId, params);
    const entry = this.cache.get(key);

    if (entry) {
      entry.isStale = true;
    }
  }

  /**
   * Invalidate (delete) cache entry
   */
  invalidate(datasourceId: string, params?: Record<string, unknown>): boolean {
    const key = this.generateKey(datasourceId, params);
    const deleted = this.cache.delete(key);

    if (deleted) {
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
    }

    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;

    // Approximate memory usage using a lightweight size estimator
    const estimateSize = (value: unknown, depth: number = 0): number => {
      if (value === null || value === undefined) {
        return 0;
      }

      // Limit depth to avoid expensive traversal of deeply nested structures
      if (depth > 1) {
        return 0;
      }

      const valueType = typeof value;

      if (valueType === 'string') {
        return (value as string).length;
      }

      if (valueType === 'number') {
        // Rough size of a JS number in bytes
        return 8;
      }

      if (valueType === 'boolean') {
        return 4;
      }

      if (Array.isArray(value)) {
        let size = 0;
        for (const item of value) {
          size += estimateSize(item, depth + 1);
        }
        return size;
      }

      if (valueType === 'object') {
        let size = 0;
        const entries = Object.entries(value as Record<string, unknown>);
        for (const [key, val] of entries) {
          size += key.length;
          // Only estimate shallow primitive properties to avoid heavy recursion
          const valType = typeof val;
          if (valType === 'string' || valType === 'number' || valType === 'boolean') {
            size += estimateSize(val, depth + 1);
          }
        }
        return size;
      }

      // Fallback for other types (symbol, function, bigint, etc.)
      return 0;
    };

    let memoryUsage = 0;
    for (const entry of this.cache.values()) {
      memoryUsage += estimateSize(entry.data);
    }

    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate,
      memoryUsage,
    };
  }

  /**
   * Check if cache has entry
   */
  has(datasourceId: string, params?: Record<string, unknown>): boolean {
    const key = this.generateKey(datasourceId, params);
    return this.cache.has(key);
  }

  /**
   * Get all cache keys
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  getSize(): number {
    return this.cache.size;
  }
}
