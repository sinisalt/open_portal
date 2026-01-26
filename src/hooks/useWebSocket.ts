/**
 * useWebSocket Hook
 *
 * React hook for WebSocket datasources with topic subscription support
 * Features:
 * - Topic subscription management
 * - Automatic cleanup on unmount
 * - Connection state tracking
 * - Message handling
 */

import { useEffect, useRef, useState } from 'react';
import { websocketDatasourceHandler } from '@/core/datasources';

/**
 * WebSocket hook options
 */
export interface UseWebSocketOptions {
  /** WebSocket server URL */
  url: string;

  /** Topic to subscribe to */
  topic?: string;

  /** Message handler */
  onMessage?: (data: unknown) => void;

  /** Connection handler */
  onConnect?: () => void;

  /** Disconnection handler */
  onDisconnect?: () => void;

  /** Error handler */
  onError?: (error: Event) => void;

  /** Enable/disable subscription */
  enabled?: boolean;
}

/**
 * WebSocket connection state
 */
export interface WebSocketState {
  /** Whether the connection is active */
  isConnected: boolean;

  /** Latest message received */
  lastMessage: unknown;

  /** Error if any */
  error: Error | null;

  /** Send message to topic */
  publish: (topic: string, data: unknown) => void;

  /** Subscribe to additional topic */
  subscribe: (topic: string, handler: (data: unknown) => void) => () => void;
}

/**
 * Hook for WebSocket datasources
 */
export function useWebSocket(options: UseWebSocketOptions): WebSocketState {
  const { url, topic, onMessage, enabled = true } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled || !topic) {
      return;
    }

    // Message handler wrapper
    const messageHandler = (data: unknown) => {
      setLastMessage(data);
      if (onMessage) {
        onMessage(data);
      }
    };

    try {
      // Subscribe to topic
      const unsubscribe = websocketDatasourceHandler.subscribe(url, topic, messageHandler);
      unsubscribeRef.current = unsubscribe;

      // Note: Connection state management is handled internally by the handler
      // We could enhance this to expose connection state via the handler
      setIsConnected(true);
    } catch (err) {
      setError(err as Error);
    }

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [url, topic, enabled, onMessage]);

  // Publish function
  const publish = (publishTopic: string, data: unknown) => {
    try {
      websocketDatasourceHandler.publish(url, publishTopic, data);
    } catch (err) {
      setError(err as Error);
    }
  };

  // Subscribe function for additional topics
  const subscribe = (subscribeTopic: string, handler: (data: unknown) => void) => {
    return websocketDatasourceHandler.subscribe(url, subscribeTopic, handler);
  };

  return {
    isConnected,
    lastMessage,
    error,
    publish,
    subscribe,
  };
}
