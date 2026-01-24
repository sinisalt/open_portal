/**
 * Static Datasource Handler
 *
 * Handles static datasource - returns configured static data immediately.
 * Useful for mock data, constants, or testing.
 */

import type { DatasourceHandler, StaticDatasourceConfig } from '@/types/datasource.types';

/**
 * Static Datasource Handler Implementation
 */
export class StaticDatasourceHandler implements DatasourceHandler<StaticDatasourceConfig> {
  /**
   * Return static data from configuration
   */
  async fetch(config: StaticDatasourceConfig): Promise<unknown> {
    const { config: staticConfig } = config;
    return staticConfig.data;
  }
}

// Singleton instance
export const staticDatasourceHandler = new StaticDatasourceHandler();
