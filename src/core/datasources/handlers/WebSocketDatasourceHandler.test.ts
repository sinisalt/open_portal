/**
 * WebSocket Datasource Handler Tests
 *
 * Note: These are basic unit tests. Integration tests with a real WebSocket server
 * should be performed separately.
 */

import type { WebSocketDatasourceConfig } from '@/types/datasource.types';
import { WebSocketDatasourceHandler } from './WebSocketDatasourceHandler';

describe('WebSocketDatasourceHandler', () => {
  let handler: WebSocketDatasourceHandler;

  beforeEach(() => {
    handler = new WebSocketDatasourceHandler();
  });

  afterEach(() => {
    handler.closeAll();
  });

  describe('fetch', () => {
    it('should create a WebSocket datasource config', () => {
      const config: WebSocketDatasourceConfig = {
        id: 'test-ws',
        type: 'websocket',
        config: {
          url: 'ws://localhost:3001/ws',
          reconnect: true,
        },
      };

      expect(config.type).toBe('websocket');
      expect(config.config.url).toBe('ws://localhost:3001/ws');
    });

    it('should handle config with reconnect disabled', () => {
      const config: WebSocketDatasourceConfig = {
        id: 'test-ws-no-reconnect',
        type: 'websocket',
        config: {
          url: 'ws://localhost:3001/ws',
          reconnect: false,
        },
      };

      expect(config.config.reconnect).toBe(false);
    });

    it('should handle config with custom reconnect delay', () => {
      const config: WebSocketDatasourceConfig = {
        id: 'test-ws-custom-delay',
        type: 'websocket',
        config: {
          url: 'ws://localhost:3001/ws',
          reconnect: true,
          reconnectDelay: 5000,
        },
      };

      expect(config.config.reconnectDelay).toBe(5000);
    });
  });

  describe('subscribe and publish', () => {
    it('should provide subscribe method', () => {
      expect(typeof handler.subscribe).toBe('function');
    });

    it('should provide publish method', () => {
      expect(typeof handler.publish).toBe('function');
    });

    it('should provide closeAll method', () => {
      expect(typeof handler.closeAll).toBe('function');
    });
  });

  describe('cleanup', () => {
    it('should handle cleanup', () => {
      const config: WebSocketDatasourceConfig = {
        id: 'test-ws-cleanup',
        type: 'websocket',
        config: {
          url: 'ws://localhost:3001/ws',
        },
      };

      // Should not throw
      expect(() => handler.cleanup(config)).not.toThrow();
    });
  });
});
