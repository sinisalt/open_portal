/**
 * WebSocket HTTP API Routes
 *
 * HTTP endpoints for WebSocket management (stats, publishing, etc.)
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { websocketServer } from '../services/websocketServer.js';

const router = express.Router();

/**
 * GET /ws/stats
 * Get WebSocket server statistics
 */
router.get('/stats', authenticateToken, (_req, res) => {
  try {
    const stats = websocketServer.getTopicStats();
    res.json({
      topics: stats,
      totalTopics: stats.length,
      totalSubscribers: stats.reduce((sum, topic) => sum + topic.subscribers, 0),
    });
  } catch (error) {
    // Log error for debugging
    console.error('Failed to get WebSocket stats:', error);
    res.status(500).json({ error: 'Failed to get WebSocket stats' });
  }
});

/**
 * POST /ws/publish
 * Publish a message to a topic (HTTP endpoint)
 */
router.post('/publish', authenticateToken, (req, res) => {
  try {
    const { topic, data } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Missing required field: topic' });
    }

    if (!data) {
      return res.status(400).json({ error: 'Missing required field: data' });
    }

    websocketServer.publish(topic, data);

    return res.json({
      success: true,
      message: `Message published to topic: ${topic}`,
    });
  } catch (_error) {
    return res.status(500).json({ error: 'Failed to publish message' });
  }
});

export default router;
