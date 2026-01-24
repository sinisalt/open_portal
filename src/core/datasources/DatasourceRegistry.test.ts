/**
 * Datasource Registry Tests
 */

import { beforeEach, describe, expect, it } from '@jest/globals';
import type { DatasourceHandler } from '@/types/datasource.types';
import { DatasourceRegistry } from './DatasourceRegistry';

describe('DatasourceRegistry', () => {
  let registry: DatasourceRegistry;

  // Mock handlers
  const mockHttpHandler: DatasourceHandler = {
    fetch: async () => ({ data: 'http' }),
  };

  const mockWebSocketHandler: DatasourceHandler = {
    fetch: async () => ({ data: 'websocket' }),
    cleanup: () => {},
  };

  const mockStaticHandler: DatasourceHandler = {
    fetch: async () => ({ data: 'static' }),
  };

  beforeEach(() => {
    registry = new DatasourceRegistry();
  });

  describe('register', () => {
    it('should register a datasource handler', () => {
      registry.register('http', mockHttpHandler);
      expect(registry.has('http')).toBe(true);
    });

    it('should register multiple handlers for different types', () => {
      registry.register('http', mockHttpHandler);
      registry.register('websocket', mockWebSocketHandler);
      registry.register('static', mockStaticHandler);

      expect(registry.has('http')).toBe(true);
      expect(registry.has('websocket')).toBe(true);
      expect(registry.has('static')).toBe(true);
    });

    it('should warn when overwriting existing handler', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      registry.register('http', mockHttpHandler);
      registry.register('http', mockWebSocketHandler); // Overwrite

      expect(consoleSpy).toHaveBeenCalledWith(
        "Datasource handler for type 'http' already registered. Overwriting."
      );
      expect(registry.get('http')).toBe(mockWebSocketHandler);

      consoleSpy.mockRestore();
    });
  });

  describe('get', () => {
    it('should return registered handler', () => {
      registry.register('http', mockHttpHandler);
      expect(registry.get('http')).toBe(mockHttpHandler);
    });

    it('should return undefined for unregistered type', () => {
      expect(registry.get('http')).toBeUndefined();
    });

    it('should return correct handler for each type', () => {
      registry.register('http', mockHttpHandler);
      registry.register('websocket', mockWebSocketHandler);
      registry.register('static', mockStaticHandler);

      expect(registry.get('http')).toBe(mockHttpHandler);
      expect(registry.get('websocket')).toBe(mockWebSocketHandler);
      expect(registry.get('static')).toBe(mockStaticHandler);
    });
  });

  describe('has', () => {
    it('should return true for registered type', () => {
      registry.register('http', mockHttpHandler);
      expect(registry.has('http')).toBe(true);
    });

    it('should return false for unregistered type', () => {
      expect(registry.has('http')).toBe(false);
    });

    it('should return correct status for multiple types', () => {
      registry.register('http', mockHttpHandler);
      registry.register('static', mockStaticHandler);

      expect(registry.has('http')).toBe(true);
      expect(registry.has('websocket')).toBe(false);
      expect(registry.has('static')).toBe(true);
    });
  });

  describe('getTypes', () => {
    it('should return empty array when no handlers registered', () => {
      expect(registry.getTypes()).toEqual([]);
    });

    it('should return array of registered types', () => {
      registry.register('http', mockHttpHandler);
      registry.register('websocket', mockWebSocketHandler);

      const types = registry.getTypes();
      expect(types).toHaveLength(2);
      expect(types).toContain('http');
      expect(types).toContain('websocket');
    });

    it('should return all three types when all registered', () => {
      registry.register('http', mockHttpHandler);
      registry.register('websocket', mockWebSocketHandler);
      registry.register('static', mockStaticHandler);

      const types = registry.getTypes();
      expect(types).toHaveLength(3);
      expect(types).toContain('http');
      expect(types).toContain('websocket');
      expect(types).toContain('static');
    });
  });

  describe('unregister', () => {
    it('should unregister a handler', () => {
      registry.register('http', mockHttpHandler);
      expect(registry.has('http')).toBe(true);

      const result = registry.unregister('http');
      expect(result).toBe(true);
      expect(registry.has('http')).toBe(false);
    });

    it('should return false when unregistering non-existent handler', () => {
      const result = registry.unregister('http');
      expect(result).toBe(false);
    });

    it('should only unregister specified type', () => {
      registry.register('http', mockHttpHandler);
      registry.register('websocket', mockWebSocketHandler);

      registry.unregister('http');

      expect(registry.has('http')).toBe(false);
      expect(registry.has('websocket')).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all handlers', () => {
      registry.register('http', mockHttpHandler);
      registry.register('websocket', mockWebSocketHandler);
      registry.register('static', mockStaticHandler);

      expect(registry.getTypes()).toHaveLength(3);

      registry.clear();

      expect(registry.getTypes()).toHaveLength(0);
      expect(registry.has('http')).toBe(false);
      expect(registry.has('websocket')).toBe(false);
      expect(registry.has('static')).toBe(false);
    });

    it('should work when no handlers registered', () => {
      expect(() => registry.clear()).not.toThrow();
      expect(registry.getTypes()).toHaveLength(0);
    });
  });

  describe('singleton instance', () => {
    it('should export singleton instance', () => {
      const { datasourceRegistry } = require('./DatasourceRegistry');
      expect(datasourceRegistry).toBeInstanceOf(DatasourceRegistry);
    });

    it('singleton should maintain state across imports', () => {
      const { datasourceRegistry: instance1 } = require('./DatasourceRegistry');
      instance1.register('http', mockHttpHandler);

      // Clear require cache and re-import
      delete require.cache[require.resolve('./DatasourceRegistry')];
      const { datasourceRegistry: instance2 } = require('./DatasourceRegistry');

      // Both instances should be the same
      expect(instance1).toBe(instance2);
    });
  });
});
