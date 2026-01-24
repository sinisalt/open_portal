import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * Extended Request interface with user information
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
    tenantId: string;
  };
}

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user information to request
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      sub: string;
      email: string;
      roles: string[];
      tenantId: string;
    };

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      roles: decoded.roles,
      tenantId: decoded.tenantId,
    };

    next();
  } catch (_error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}
