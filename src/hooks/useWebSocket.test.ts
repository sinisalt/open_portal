/**
 * useWebSocket Hook Tests
 */

import { renderHook } from '@testing-library/react';
import { useWebSocket } from './useWebSocket';

// Mock the WebSocket datasource handler
jest.mock('@/core/datasources', () => ({
  websocketDatasourceHandler: {
    subscribe: jest.fn(() => jest.fn()), // Returns unsubscribe function
    publish: jest.fn(),
  },
}));

describe('useWebSocket', () => {
  const mockUrl = 'ws://localhost:3001/ws';
  const mockTopic = 'test-topic';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useWebSocket({
        url: mockUrl,
        topic: mockTopic,
      })
    );

    expect(result.current.isConnected).toBe(true);
    expect(result.current.lastMessage).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should not subscribe when disabled', () => {
    const { websocketDatasourceHandler } = require('@/core/datasources');

    renderHook(() =>
      useWebSocket({
        url: mockUrl,
        topic: mockTopic,
        enabled: false,
      })
    );

    expect(websocketDatasourceHandler.subscribe).not.toHaveBeenCalled();
  });

  it('should not subscribe when topic is missing', () => {
    const { websocketDatasourceHandler } = require('@/core/datasources');

    renderHook(() =>
      useWebSocket({
        url: mockUrl,
      })
    );

    expect(websocketDatasourceHandler.subscribe).not.toHaveBeenCalled();
  });

  it('should provide publish function', () => {
    const { result } = renderHook(() =>
      useWebSocket({
        url: mockUrl,
        topic: mockTopic,
      })
    );

    expect(typeof result.current.publish).toBe('function');
  });

  it('should provide subscribe function', () => {
    const { result } = renderHook(() =>
      useWebSocket({
        url: mockUrl,
        topic: mockTopic,
      })
    );

    expect(typeof result.current.subscribe).toBe('function');
  });

  it('should call publish with correct arguments', () => {
    const { websocketDatasourceHandler } = require('@/core/datasources');
    const { result } = renderHook(() =>
      useWebSocket({
        url: mockUrl,
        topic: mockTopic,
      })
    );

    const testTopic = 'test-publish-topic';
    const testData = { message: 'test' };

    result.current.publish(testTopic, testData);

    expect(websocketDatasourceHandler.publish).toHaveBeenCalledWith(mockUrl, testTopic, testData);
  });

  it('should cleanup on unmount', () => {
    const mockUnsubscribe = jest.fn();
    const { websocketDatasourceHandler } = require('@/core/datasources');
    websocketDatasourceHandler.subscribe.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() =>
      useWebSocket({
        url: mockUrl,
        topic: mockTopic,
      })
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
