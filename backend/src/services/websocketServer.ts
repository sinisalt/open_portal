/**
 * WebSocket Server
 *
 * Manages WebSocket connections, topics/channels, and message broadcasting.
 * Features:
 * - Topic-based subscription system
 * - Authentication via token
 * - User presence tracking
 * - Message broadcasting to subscribers
 * - Connection lifecycle management
 */

import type { Server as HttpServer, IncomingMessage } from 'node:http';
import jwt from 'jsonwebtoken';
import pino from 'pino';
import { WebSocket, WebSocketServer } from 'ws';
import { config } from '../config/index.js';

const logger = pino({ level: config.logLevel });

/**
 * WebSocket message types
 */
export enum WSMessageType {
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
export interface WSMessage {
  type: WSMessageType;
  topic?: string;
  data?: unknown;
  timestamp?: number;
  messageId?: string;
}

/**
 * Authenticated WebSocket connection
 */
interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  username?: string;
  isAlive?: boolean;
  subscribedTopics?: Set<string>;
}

/**
 * Topic subscription tracking
 */
interface TopicSubscribers {
  subscribers: Set<AuthenticatedWebSocket>;
  presenceCount: number;
}

/**
 * WebSocket Server Manager
 */
export class WebSocketServerManager {
  private wss: WebSocketServer | null = null;
  private topics: Map<string, TopicSubscribers> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds

  /**
   * Initialize WebSocket server
   */
  initialize(server: HttpServer): void {
    this.wss = new WebSocketServer({
      server,
      path: '/ws',
      verifyClient: (info, callback) => {
        this.authenticateConnection(info, callback);
      },
    });

    this.wss.on('connection', (ws: AuthenticatedWebSocket, request: IncomingMessage) => {
      this.handleConnection(ws, request);
    });

    // Start heartbeat to detect dead connections
    this.startHeartbeat();

    logger.info('WebSocket server initialized on /ws');
  }

  /**
   * Authenticate WebSocket connection
   */
  private authenticateConnection(
    info: { origin: string; secure: boolean; req: IncomingMessage },
    callback: (result: boolean, code?: number, message?: string) => void,
  ): void {
    try {
      const url = new URL(info.req.url || '', `http://${info.req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        logger.warn('WebSocket connection rejected: No token provided');
        callback(false, 401, 'Unauthorized: No token provided');
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; username: string };

      // Store auth info on request for later use
      (info.req as IncomingMessage & { user?: { userId: string; username: string } }).user = {
        userId: decoded.userId,
        username: decoded.username,
      };

      callback(true);
    } catch (err) {
      logger.error('WebSocket authentication failed:', err);
      callback(false, 401, 'Unauthorized: Invalid token');
    }
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: AuthenticatedWebSocket, request: IncomingMessage): void {
    const user = (request as IncomingMessage & { user?: { userId: string; username: string } })
      .user;

    if (!user) {
      ws.close(1008, 'Authentication required');
      return;
    }

    // Set user info on WebSocket
    ws.userId = user.userId;
    ws.username = user.username;
    ws.isAlive = true;
    ws.subscribedTopics = new Set();

    logger.info(`WebSocket connected: ${user.username} (${user.userId})`);

    // Handle messages
    ws.on('message', (data: Buffer) => {
      this.handleMessage(ws, data);
    });

    // Handle pong responses (for heartbeat)
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Handle disconnection
    ws.on('close', () => {
      this.handleDisconnection(ws);
    });

    // Handle errors
    ws.on('error', (error: Error) => {
      logger.error(`WebSocket error for user ${ws.username}:`, error);
    });

    // Send welcome message
    this.sendMessage(ws, {
      type: WSMessageType.MESSAGE,
      data: { message: 'Connected to WebSocket server' },
      timestamp: Date.now(),
    });
  }

  /**
   * Handle incoming message from client
   */
  private handleMessage(ws: AuthenticatedWebSocket, data: Buffer): void {
    try {
      const message: WSMessage = JSON.parse(data.toString());

      switch (message.type) {
        case WSMessageType.SUBSCRIBE:
          if (message.topic) {
            this.subscribe(ws, message.topic);
          }
          break;

        case WSMessageType.UNSUBSCRIBE:
          if (message.topic) {
            this.unsubscribe(ws, message.topic);
          }
          break;

        case WSMessageType.PUBLISH:
          if (message.topic && message.data) {
            this.publish(message.topic, message.data, ws.userId);
          }
          break;

        case WSMessageType.PING:
          this.sendMessage(ws, {
            type: WSMessageType.PONG,
            timestamp: Date.now(),
          });
          break;

        default:
          this.sendError(ws, `Unknown message type: ${message.type}`);
      }
    } catch (err) {
      logger.error('Failed to parse WebSocket message:', err);
      this.sendError(ws, 'Invalid message format');
    }
  }

  /**
   * Subscribe client to a topic
   */
  private subscribe(ws: AuthenticatedWebSocket, topic: string): void {
    if (!this.topics.has(topic)) {
      this.topics.set(topic, {
        subscribers: new Set(),
        presenceCount: 0,
      });
    }

    const topicData = this.topics.get(topic)!;
    topicData.subscribers.add(ws);
    topicData.presenceCount = topicData.subscribers.size;
    ws.subscribedTopics?.add(topic);

    logger.info(`User ${ws.username} subscribed to topic: ${topic}`);

    // Notify client of successful subscription
    this.sendMessage(ws, {
      type: WSMessageType.SUBSCRIBED,
      topic,
      data: { presenceCount: topicData.presenceCount },
      timestamp: Date.now(),
    });

    // Broadcast presence update to all subscribers
    this.broadcastPresence(topic);
  }

  /**
   * Unsubscribe client from a topic
   */
  private unsubscribe(ws: AuthenticatedWebSocket, topic: string): void {
    const topicData = this.topics.get(topic);

    if (topicData) {
      topicData.subscribers.delete(ws);
      topicData.presenceCount = topicData.subscribers.size;
      ws.subscribedTopics?.delete(topic);

      // Clean up empty topics
      if (topicData.subscribers.size === 0) {
        this.topics.delete(topic);
      }

      logger.info(`User ${ws.username} unsubscribed from topic: ${topic}`);

      // Notify client
      this.sendMessage(ws, {
        type: WSMessageType.UNSUBSCRIBED,
        topic,
        timestamp: Date.now(),
      });

      // Broadcast presence update if topic still exists
      if (this.topics.has(topic)) {
        this.broadcastPresence(topic);
      }
    }
  }

  /**
   * Publish message to a topic
   */
  public publish(topic: string, data: unknown, senderId?: string): void {
    const topicData = this.topics.get(topic);

    if (!topicData || topicData.subscribers.size === 0) {
      logger.debug(`No subscribers for topic: ${topic}`);
      return;
    }

    const message: WSMessage = {
      type: WSMessageType.MESSAGE,
      topic,
      data,
      timestamp: Date.now(),
      messageId: this.generateMessageId(),
    };

    logger.debug(`Publishing to topic ${topic}: ${topicData.subscribers.size} subscribers`);

    // Broadcast to all subscribers
    for (const subscriber of topicData.subscribers) {
      // Optionally skip sender
      if (senderId && subscriber.userId === senderId) {
        continue;
      }
      this.sendMessage(subscriber, message);
    }
  }

  /**
   * Broadcast presence update for a topic
   */
  private broadcastPresence(topic: string): void {
    const topicData = this.topics.get(topic);

    if (!topicData) {
      return;
    }

    const presenceMessage: WSMessage = {
      type: WSMessageType.PRESENCE,
      topic,
      data: { presenceCount: topicData.presenceCount },
      timestamp: Date.now(),
    };

    for (const subscriber of topicData.subscribers) {
      this.sendMessage(subscriber, presenceMessage);
    }
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(ws: AuthenticatedWebSocket): void {
    logger.info(`WebSocket disconnected: ${ws.username} (${ws.userId})`);

    // Unsubscribe from all topics
    if (ws.subscribedTopics) {
      for (const topic of ws.subscribedTopics) {
        this.unsubscribe(ws, topic);
      }
    }
  }

  /**
   * Send message to a specific client
   */
  private sendMessage(ws: AuthenticatedWebSocket, message: WSMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send error message to client
   */
  private sendError(ws: AuthenticatedWebSocket, error: string): void {
    this.sendMessage(ws, {
      type: WSMessageType.ERROR,
      data: { error },
      timestamp: Date.now(),
    });
  }

  /**
   * Start heartbeat to detect dead connections
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (!this.wss) return;

      this.wss.clients.forEach((ws: WebSocket) => {
        const client = ws as AuthenticatedWebSocket;

        if (client.isAlive === false) {
          logger.info(`Terminating dead connection: ${client.username}`);
          client.terminate();
          return;
        }

        client.isAlive = false;
        client.ping();
      });
    }, this.HEARTBEAT_INTERVAL);
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get topic statistics
   */
  public getTopicStats(): { topic: string; subscribers: number }[] {
    return Array.from(this.topics.entries()).map(([topic, data]) => ({
      topic,
      subscribers: data.subscribers.size,
    }));
  }

  /**
   * Close WebSocket server
   */
  public close(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.wss) {
      this.wss.clients.forEach((client) => {
        client.close(1001, 'Server shutting down');
      });
      this.wss.close();
      this.wss = null;
    }

    this.topics.clear();
    logger.info('WebSocket server closed');
  }
}

// Singleton instance
export const websocketServer = new WebSocketServerManager();
