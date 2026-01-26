/**
 * Monitoring Routes
 * 
 * API endpoints for accessing monitoring data, metrics, and audit logs
 */

import express, { type Request, type Response } from 'express';
import { alertManager, metricsCollector } from '../services/monitoringService.js';
import { auditLogger } from '../services/auditService.js';

const router = express.Router();

/**
 * GET /monitoring/health
 * Enhanced health check with detailed metrics
 */
router.get('/health', (_req: Request, res: Response) => {
  const metrics = metricsCollector.getHealthMetrics();
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ...metrics,
  });
});

/**
 * GET /monitoring/metrics
 * Get current metrics summary
 */
router.get('/metrics', (_req: Request, res: Response) => {
  const metrics = metricsCollector.getHealthMetrics();
  const allMetrics = metricsCollector.getAllMetrics();
  
  const summary: Record<string, unknown> = {
    health: metrics,
    customMetrics: {},
  };

  // Summarize custom metrics
  for (const [key, values] of allMetrics.entries()) {
    if (values.length > 0) {
      const latest = values[values.length - 1];
      const avg = values.reduce((sum, m) => sum + m.value, 0) / values.length;
      
      summary.customMetrics[key] = {
        latest: latest.value,
        average: Math.round(avg * 100) / 100,
        count: values.length,
        labels: latest.labels,
      };
    }
  }

  res.json(summary);
});

/**
 * GET /monitoring/alerts
 * Get all registered alerts and their status
 */
router.get('/alerts', (_req: Request, res: Response) => {
  const alerts = alertManager.getAlerts();
  res.json({ alerts });
});

/**
 * GET /monitoring/audit
 * Query audit logs
 */
router.get('/audit', (req: Request, res: Response) => {
  const {
    userId,
    tenantId,
    action,
    resource,
    startDate,
    endDate,
    success,
    limit,
  } = req.query;

  const filters = {
    userId: userId as string | undefined,
    tenantId: tenantId as string | undefined,
    action: action as string | undefined,
    resource: resource as string | undefined,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    success: success ? success === 'true' : undefined,
    limit: limit ? Number.parseInt(limit as string, 10) : undefined,
  };

  const logs = auditLogger.query(filters);
  
  res.json({
    logs,
    count: logs.length,
    filters,
  });
});

/**
 * GET /monitoring/audit/stats
 * Get audit log statistics
 */
router.get('/audit/stats', (req: Request, res: Response) => {
  const { startDate, endDate, tenantId } = req.query;

  const filters = {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    tenantId: tenantId as string | undefined,
  };

  const stats = auditLogger.getStats(filters);
  
  res.json({
    stats,
    filters,
  });
});

/**
 * GET /monitoring/dashboard
 * Get comprehensive dashboard data
 */
router.get('/dashboard', (_req: Request, res: Response) => {
  const health = metricsCollector.getHealthMetrics();
  const auditStats = auditLogger.getStats();
  const alerts = alertManager.getAlerts();

  res.json({
    timestamp: new Date().toISOString(),
    health,
    audit: auditStats,
    alerts: {
      total: alerts.length,
      active: alerts.filter(a => a.lastTriggered).length,
    },
  });
});

export default router;
