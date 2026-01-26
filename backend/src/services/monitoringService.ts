/**
 * Monitoring Service
 * 
 * Provides centralized monitoring, metrics collection, and observability
 * for the OpenPortal backend.
 */

import pino from 'pino';
import { config } from '../config/index.js';

const logger = pino({ level: config.logLevel });

export interface Metric {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp?: Date;
}

export interface HealthMetrics {
  uptime: number;
  memory: NodeJS.MemoryUsage;
  cpu: number;
  requests: {
    total: number;
    errors: number;
    avgResponseTime: number;
  };
  connections: {
    active: number;
    websockets: number;
  };
}

/**
 * Metrics Storage
 * In-memory storage for basic metrics. In production, this would be
 * sent to a metrics service like Prometheus, CloudWatch, or Datadog.
 */
class MetricsCollector {
  private metrics: Map<string, Metric[]> = new Map();
  private requestCount = 0;
  private errorCount = 0;
  private responseTimes: number[] = [];
  private activeConnections = 0;
  private startTime = Date.now();

  /**
   * Record a custom metric
   */
  recordMetric(metric: Metric): void {
    const { name, value, labels = {}, timestamp = new Date() } = metric;
    
    const key = this.getMetricKey(name, labels);
    const existing = this.metrics.get(key) || [];
    
    existing.push({ name, value, labels, timestamp });
    
    // Keep only last 1000 metrics per key
    if (existing.length > 1000) {
      existing.shift();
    }
    
    this.metrics.set(key, existing);
    
    logger.debug({ metric: { name, value, labels } }, 'Metric recorded');
  }

  /**
   * Record an HTTP request
   */
  recordRequest(responseTime: number, statusCode: number): void {
    this.requestCount++;
    this.responseTimes.push(responseTime);
    
    if (statusCode >= 400) {
      this.errorCount++;
    }
    
    // Keep only last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }
    
    this.recordMetric({
      name: 'http_request',
      value: responseTime,
      labels: { status: statusCode.toString() },
    });
  }

  /**
   * Set active connections count
   */
  setActiveConnections(count: number): void {
    this.activeConnections = count;
  }

  /**
   * Get current health metrics
   */
  getHealthMetrics(): HealthMetrics {
    const avgResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
      : 0;

    return {
      uptime: (Date.now() - this.startTime) / 1000,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage().user / 1000000, // Convert to seconds
      requests: {
        total: this.requestCount,
        errors: this.errorCount,
        avgResponseTime: Math.round(avgResponseTime),
      },
      connections: {
        active: this.activeConnections,
        websockets: 0, // Will be updated by websocket service
      },
    };
  }

  /**
   * Get metrics by name
   */
  getMetrics(name: string, labels?: Record<string, string>): Metric[] {
    const key = this.getMetricKey(name, labels || {});
    return this.metrics.get(key) || [];
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, Metric[]> {
    return this.metrics;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimes = [];
  }

  /**
   * Generate a unique key for a metric
   */
  private getMetricKey(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    return labelStr ? `${name}{${labelStr}}` : name;
  }
}

/**
 * Alert Configuration
 */
export interface Alert {
  id: string;
  name: string;
  condition: (metrics: HealthMetrics) => boolean;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  cooldown?: number; // Minimum time between alerts (ms)
  lastTriggered?: number;
}

/**
 * Alert Manager
 */
class AlertManager {
  private alerts: Map<string, Alert> = new Map();
  private alertHandlers: ((alert: Alert, metrics: HealthMetrics) => void)[] = [];

  /**
   * Register an alert
   */
  registerAlert(alert: Alert): void {
    this.alerts.set(alert.id, alert);
    logger.info({ alertId: alert.id, name: alert.name }, 'Alert registered');
  }

  /**
   * Remove an alert
   */
  removeAlert(id: string): void {
    this.alerts.delete(id);
    logger.info({ alertId: id }, 'Alert removed');
  }

  /**
   * Add an alert handler
   */
  addHandler(handler: (alert: Alert, metrics: HealthMetrics) => void): void {
    this.alertHandlers.push(handler);
  }

  /**
   * Check all alerts against current metrics
   */
  checkAlerts(metrics: HealthMetrics): void {
    for (const alert of this.alerts.values()) {
      try {
        if (alert.condition(metrics)) {
          // Check cooldown
          if (alert.lastTriggered && alert.cooldown) {
            const timeSinceLastTrigger = Date.now() - alert.lastTriggered;
            if (timeSinceLastTrigger < alert.cooldown) {
              continue;
            }
          }

          // Trigger alert
          alert.lastTriggered = Date.now();
          
          logger[alert.severity === 'critical' || alert.severity === 'error' ? 'error' : 'warn'](
            { alertId: alert.id, name: alert.name, severity: alert.severity },
            alert.message
          );

          // Call handlers
          for (const handler of this.alertHandlers) {
            try {
              handler(alert, metrics);
            } catch (err) {
              logger.error({ error: err, alertId: alert.id }, 'Alert handler error');
            }
          }
        }
      } catch (err) {
        logger.error({ error: err, alertId: alert.id }, 'Error checking alert');
      }
    }
  }

  /**
   * Get all alerts
   */
  getAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }
}

// Singleton instances
export const metricsCollector = new MetricsCollector();
export const alertManager = new AlertManager();

/**
 * Initialize default alerts
 */
export function initializeDefaultAlerts(): void {
  // High error rate alert
  alertManager.registerAlert({
    id: 'high-error-rate',
    name: 'High Error Rate',
    condition: (metrics) => {
      const errorRate = metrics.requests.total > 0
        ? metrics.requests.errors / metrics.requests.total
        : 0;
      return errorRate > 0.1; // 10% error rate
    },
    message: 'Error rate exceeds 10%',
    severity: 'error',
    cooldown: 5 * 60 * 1000, // 5 minutes
  });

  // High memory usage alert
  alertManager.registerAlert({
    id: 'high-memory-usage',
    name: 'High Memory Usage',
    condition: (metrics) => {
      const usedMemoryMB = metrics.memory.heapUsed / 1024 / 1024;
      return usedMemoryMB > 500; // 500 MB
    },
    message: 'Memory usage exceeds 500 MB',
    severity: 'warning',
    cooldown: 10 * 60 * 1000, // 10 minutes
  });

  // Slow response time alert
  alertManager.registerAlert({
    id: 'slow-response-time',
    name: 'Slow Response Time',
    condition: (metrics) => {
      return metrics.requests.avgResponseTime > 1000; // 1 second
    },
    message: 'Average response time exceeds 1 second',
    severity: 'warning',
    cooldown: 5 * 60 * 1000, // 5 minutes
  });

  logger.info('Default alerts initialized');
}

/**
 * Start monitoring periodic checks
 */
export function startMonitoring(intervalMs = 60000): NodeJS.Timeout {
  const interval = setInterval(() => {
    const metrics = metricsCollector.getHealthMetrics();
    alertManager.checkAlerts(metrics);
  }, intervalMs);

  logger.info({ intervalMs }, 'Monitoring started');
  return interval;
}

/**
 * Export monitoring service
 */
export const monitoringService = {
  metricsCollector,
  alertManager,
  initializeDefaultAlerts,
  startMonitoring,
};
