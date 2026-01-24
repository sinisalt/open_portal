import express from 'express';
import { z } from 'zod';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { validateRequest } from '../middleware/validation.js';
import { authService } from '../services/authService.js';

const router = express.Router();

/**
 * Validation Schemas
 */
const loginSchema = z.object({
  username: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * POST /auth/login
 * Authenticate user with username/password
 */
router.post('/login', authRateLimiter, validateRequest(loginSchema), async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const result = await authService.login(username, password, rememberMe, ipAddress, userAgent);

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    res.status(401).json({ error: message });
  }
});

/**
 * POST /auth/logout
 * Terminate user session
 */
router.post('/logout', validateRequest(logoutSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post('/refresh', authRateLimiter, validateRequest(refreshSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refresh(refreshToken);

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token refresh failed';
    res.status(401).json({ error: message });
  }
});

export default router;
