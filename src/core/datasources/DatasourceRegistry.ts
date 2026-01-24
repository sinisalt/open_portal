/**
 * Datasource Registry
 *
 * Central registry for datasource handlers. Maps datasource types to their
 * handler implementations.
 */

import type {
  DatasourceHandler,
  DatasourceType,
  IDatasourceRegistry,
} from '@/types/datasource.types';

/**
 * DatasourceRegistry implementation
 *
 * Manages registration and lookup of datasource handlers.
 */
export class DatasourceRegistry implements IDatasourceRegistry {
  private handlers: Map<DatasourceType, DatasourceHandler>;

  constructor() {
    this.handlers = new Map();
  }

  /**
   * Register a datasource handler
   */
  register(type: DatasourceType, handler: DatasourceHandler): void {
    if (this.handlers.has(type)) {
      console.warn(`Datasource handler for type '${type}' already registered. Overwriting.`);
    }
    this.handlers.set(type, handler);
  }

  /**
   * Get datasource handler by type
   */
  get(type: DatasourceType): DatasourceHandler | undefined {
    return this.handlers.get(type);
  }

  /**
   * Check if datasource type has a registered handler
   */
  has(type: DatasourceType): boolean {
    return this.handlers.has(type);
  }

  /**
   * Get all registered datasource types
   */
  getTypes(): DatasourceType[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Unregister a datasource handler
   */
  unregister(type: DatasourceType): boolean {
    return this.handlers.delete(type);
  }

  /**
   * Clear all registered handlers
   */
  clear(): void {
    this.handlers.clear();
  }
}

// Singleton instance
export const datasourceRegistry = new DatasourceRegistry();
