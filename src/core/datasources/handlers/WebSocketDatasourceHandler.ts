/**
 * WebSocket Datasource Handler
 *
 * Handles WebSocket datasource connections with support for:
 * - Topic-based subscriptions
 * - Automatic reconnection with exponential backoff
 * - Message queuing during disconnection
 * - Connection state management
 * - Authentication via JWT token
 */

import { getAccessToken } from '@/services/tokenManager';
import type {
  DatasourceErrorType,
  DatasourceHandler,
  DatasourceError as IDatasourceError,
  WebSocketDatasourceConfig,
} from '@/types/datasource.types';

/**
 * WebSocket message types (must match backend)
 */
enum WSMessageType {
  // Client -> Server
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  PUBLISH = 'publish',
  PING = 'ping',

  // Server -> Client
  MESSAGE = 'message',
  SUBSCRIBED = 'subscribed',
  UNSUBSCRIBED = 'unsubscribed',
  ERROR = 'error',
  PONG = 'pong',
  PRESENCE = 'presence',
}

/**
 * WebSocket message structure
 */
interface WSMessage {
  type: WSMessageType;
  topic?: string;
  data?: unknown;
  timestamp?: number;
  messageId?: string;
}

/**
 * Connection state
 */
enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
}

/**
 * WebSocket connection wrapper with reconnection logic
 */
class WebSocketConnection {
  private ws: WebSocket | null = null;
  private url: string;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageQueue: WSMessage[] = [];
  private maxQueueSize = 100;
  private subscriptions = new Set<string>();
  private messageHandlers: Map<string, ((data: unknown) => void)[]> = new Map();
  private connectionHandlers: (() => void)[] = [];
  private disconnectionHandlers: (() => void)[] = [];
  private errorHandlers: ((error: Event) => void)[] = [];

  constructor(url: string, reconnect = true) {
    this.url = url;
    if (reconnect) {
      this.connect();
    }
  }

  /**
   * Connect to WebSocket server
   */
  private connect(): void {
    if (this.state === ConnectionState.CONNECTING || this.state === ConnectionState.CONNECTED) {
      return;
    }

    this.state = ConnectionState.CONNECTING;

    try {
      // Add authentication token to URL
      const token = getAccessToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const wsUrl = new URL(this.url);
      wsUrl.searchParams.set('token', token);

      this.ws = new WebSocket(wsUrl.toString());

      this.ws.onopen = () => {
        this.handleOpen();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        this.handleMessage(event);
      };

      this.ws.onclose = (event: CloseEvent) => {
        this.handleClose(event);
      };

      this.ws.onerror = (event: Event) => {
        this.handleError(event);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Handle connection open
   */
  private handleOpen(): void {
    console.log('WebSocket connected');
    this.state = ConnectionState.CONNECTED;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;

    // Flush message queue
    this.flushMessageQueue();

    // Re-subscribe to topics
    this.resubscribe();

    // Notify connection handlers
    for (const handler of this.connectionHandlers) {
      handler();
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WSMessage = JSON.parse(event.data);

      // Handle different message types
      switch (message.type) {
        case WSMessageType.MESSAGE:
          if (message.topic) {
            this.notifySubscribers(message.topic, message.data);
          }
          break;

        case WSMessageType.SUBSCRIBED:
          console.log(`Subscribed to topic: ${message.topic}`);
          break;

        case WSMessageType.UNSUBSCRIBED:
          console.log(`Unsubscribed from topic: ${message.topic}`);
          break;

        case WSMessageType.ERROR:
          console.error('WebSocket error message:', message.data);
          break;

        case WSMessageType.PONG:
          // Heartbeat response
          break;

        case WSMessageType.PRESENCE:
          if (message.topic) {
            this.notifySubscribers(`${message.topic}:presence`, message.data);
          }
          break;

        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Handle connection close
   */
  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket closed: ${event.code} - ${event.reason}`);
    this.state = ConnectionState.DISCONNECTED;
    this.ws = null;

    // Notify disconnection handlers
    for (const handler of this.disconnectionHandlers) {
      handler();
    }

    // Schedule reconnection unless closed intentionally
    if (event.code !== 1000 && event.code !== 1001) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle connection error
   */
  private handleError(event: Event): void {
    console.error('WebSocket error:', event);

    // Notify error handlers
    for (const handler of this.errorHandlers) {
      handler(event);
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.state = ConnectionState.RECONNECTING;
    this.reconnectAttempts++;

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.reconnectDelay * 2 ** (this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Send message to server
   */
  private send(message: WSMessage): void {
    if (this.state === ConnectionState.CONNECTED && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for later delivery
      this.queueMessage(message);
    }
  }

  /**
   * Queue message during disconnection
   */
  private queueMessage(message: WSMessage): void {
    if (this.messageQueue.length >= this.maxQueueSize) {
      // Remove oldest message
      this.messageQueue.shift();
    }
    this.messageQueue.push(message);
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  /**
   * Re-subscribe to all topics after reconnection
   */
  private resubscribe(): void {
    for (const topic of this.subscriptions) {
      this.send({
        type: WSMessageType.SUBSCRIBE,
        topic,
      });
    }
  }

  /**
   * Subscribe to a topic
   */
  public subscribe(topic: string, handler: (data: unknown) => void): void {
    // Add to subscriptions
    this.subscriptions.add(topic);

    // Add message handler
    if (!this.messageHandlers.has(topic)) {
      this.messageHandlers.set(topic, []);
    }
    this.messageHandlers.get(topic)?.push(handler);

    // Send subscription message
    this.send({
      type: WSMessageType.SUBSCRIBE,
      topic,
    });
  }

  /**
   * Unsubscribe from a topic
   */
  public unsubscribe(topic: string, handler?: (data: unknown) => void): void {
    if (handler) {
      // Remove specific handler
      const handlers = this.messageHandlers.get(topic);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
        if (handlers.length === 0) {
          this.messageHandlers.delete(topic);
          this.subscriptions.delete(topic);
          this.send({
            type: WSMessageType.UNSUBSCRIBE,
            topic,
          });
        }
      }
    } else {
      // Remove all handlers for topic
      this.messageHandlers.delete(topic);
      this.subscriptions.delete(topic);
      this.send({
        type: WSMessageType.UNSUBSCRIBE,
        topic,
      });
    }
  }

  /**
   * Publish message to a topic
   */
  public publish(topic: string, data: unknown): void {
    this.send({
      type: WSMessageType.PUBLISH,
      topic,
      data,
    });
  }

  /**
   * Notify subscribers of new message
   */
  private notifySubscribers(topic: string, data: unknown): void {
    const handlers = this.messageHandlers.get(topic);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      }
    }
  }

  /**
   * Add connection event handler
   */
  public onConnect(handler: () => void): void {
    this.connectionHandlers.push(handler);
  }

  /**
   * Add disconnection event handler
   */
  public onDisconnect(handler: () => void): void {
    this.disconnectionHandlers.push(handler);
  }

  /**
   * Add error event handler
   */
  public onError(handler: (error: Event) => void): void {
    this.errorHandlers.push(handler);
  }

  /**
   * Get connection state
   */
  public getState(): ConnectionState {
    return this.state;
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED;
  }

  /**
   * Close connection
   */
  public close(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.state = ConnectionState.DISCONNECTED;
    this.subscriptions.clear();
    this.messageHandlers.clear();
    this.messageQueue = [];
  }
}

/**
 * WebSocket connection pool for managing multiple connections
 */
class WebSocketConnectionPool {
  private connections: Map<string, WebSocketConnection> = new Map();

  /**
   * Get or create connection for URL
   */
  public getConnection(url: string, reconnect = true): WebSocketConnection {
    if (!this.connections.has(url)) {
      const connection = new WebSocketConnection(url, reconnect);
      this.connections.set(url, connection);
    }
    return this.connections.get(url)!;
  }

  /**
   * Close all connections
   */
  public closeAll(): void {
    for (const connection of this.connections.values()) {
      connection.close();
    }
    this.connections.clear();
  }
}

// Global connection pool
const connectionPool = new WebSocketConnectionPool();

/**
 * Create a typed datasource error
 */
function createDatasourceError(
  type: DatasourceErrorType,
  message: string,
  datasourceId: string,
  cause?: unknown
): IDatasourceError {
  const error = new Error(message) as IDatasourceError;
  error.type = type;
  error.datasourceId = datasourceId;
  if (cause !== undefined) {
    error.cause = cause;
  }
  return error;
}

/**
 * WebSocket Datasource Handler Implementation
 */
export class WebSocketDatasourceHandler implements DatasourceHandler<WebSocketDatasourceConfig> {
  /**
   * Fetch data from WebSocket (establish connection and subscribe)
   */
  async fetch(config: WebSocketDatasourceConfig, signal?: AbortSignal): Promise<unknown> {
    const { config: wsConfig } = config;
    const { url, reconnect = true } = wsConfig;

    try {
      // Get or create connection
      const connection = connectionPool.getConnection(url, reconnect);

      // Return a promise that resolves with subscription info
      return new Promise((resolve, reject) => {
        // Handle abort signal
        if (signal) {
          signal.addEventListener('abort', () => {
            reject(createDatasourceError('NETWORK_ERROR', 'Request aborted', config.id));
          });
        }

        // Set up event handlers
        if (wsConfig.onOpen) {
          connection.onConnect(wsConfig.onOpen);
        }

        if (wsConfig.onClose) {
          connection.onDisconnect(wsConfig.onClose);
        }

        if (wsConfig.onError) {
          connection.onError(wsConfig.onError);
        }

        // Wait for connection or return immediately
        if (connection.isConnected()) {
          resolve({
            connected: true,
            state: connection.getState(),
            connection,
          });
        } else {
          // Wait for connection
          const connectHandler = () => {
            resolve({
              connected: true,
              state: connection.getState(),
              connection,
            });
          };

          const errorHandler = (error: Event) => {
            reject(
              createDatasourceError(
                'NETWORK_ERROR',
                'WebSocket connection failed',
                config.id,
                error
              )
            );
          };

          connection.onConnect(connectHandler);
          connection.onError(errorHandler);

          // Timeout after 10 seconds
          setTimeout(() => {
            reject(
              createDatasourceError('TIMEOUT_ERROR', 'WebSocket connection timeout', config.id)
            );
          }, 10000);
        }
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error';

      throw createDatasourceError(
        'UNKNOWN_ERROR',
        `WebSocket datasource fetch failed: ${errorMessage}`,
        config.id,
        err
      );
    }
  }

  /**
   * Clean up WebSocket connection
   */
  cleanup(config: WebSocketDatasourceConfig): void {
    const { config: wsConfig } = config;
    const { url } = wsConfig;

    // Note: We don't close the connection here since it might be shared
    // Connections are managed by the pool and closed when no longer needed
    console.log(`WebSocket datasource cleanup for: ${url}`);
  }

  /**
   * Subscribe to a topic
   */
  public subscribe(url: string, topic: string, handler: (data: unknown) => void): () => void {
    const connection = connectionPool.getConnection(url, true);
    connection.subscribe(topic, handler);

    // Return unsubscribe function
    return () => {
      connection.unsubscribe(topic, handler);
    };
  }

  /**
   * Publish message to a topic
   */
  public publish(url: string, topic: string, data: unknown): void {
    const connection = connectionPool.getConnection(url, true);
    connection.publish(topic, data);
  }

  /**
   * Close all WebSocket connections
   */
  public closeAll(): void {
    connectionPool.closeAll();
  }
}

// Singleton instance
export const websocketDatasourceHandler = new WebSocketDatasourceHandler();
