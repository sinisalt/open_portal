/**
 * Monitoring Middleware
 * 
 * Tracks HTTP requests, response times, and collects metrics
 */

import type { NextFunction, Request, Response } from 'express';
import { metricsCollector } from '../services/monitoringService.js';

/**
 * Add correlation ID to requests for distributed tracing
 */
export function correlationId(req: Request, _res: Response, next: NextFunction): void {
  // Use existing correlation ID from headers or generate new one
  const correlationId = req.headers['x-correlation-id'] as string ||
    `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  req.correlationId = correlationId;
  next();
}

/**
 * Track request metrics
 */
export function trackMetrics(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Record metrics on response finish
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    metricsCollector.recordRequest(responseTime, res.statusCode);

    // Record additional metrics based on route
    if (req.route) {
      metricsCollector.recordMetric({
        name: 'http_request_by_route',
        value: responseTime,
        labels: {
          method: req.method,
          route: req.route.path,
          status: res.statusCode.toString(),
        },
      });
    }

    // Record slow requests
    if (responseTime > 1000) {
      metricsCollector.recordMetric({
        name: 'slow_request',
        value: responseTime,
        labels: {
          method: req.method,
          path: req.path,
          status: res.statusCode.toString(),
        },
      });
    }

    // Record errors
    if (res.statusCode >= 400) {
      metricsCollector.recordMetric({
        name: 'http_error',
        value: 1,
        labels: {
          method: req.method,
          path: req.path,
          status: res.statusCode.toString(),
        },
      });
    }
  });

  next();
}

// Extend Express Request type to include correlationId
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}
