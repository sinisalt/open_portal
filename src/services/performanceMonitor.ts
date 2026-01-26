/**
 * Performance Monitoring Service
 * 
 * Tracks Core Web Vitals and custom performance metrics
 */

import { onCLS, onFID, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id: string;
  navigationType?: string;
  timestamp: number;
}

export interface CustomMetric {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

/**
 * Performance metrics collector
 */
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private customMetrics: CustomMetric[] = [];
  private listeners: ((metric: PerformanceMetric | CustomMetric) => void)[] = [];
  private enabled = true;

  constructor() {
    // Check if performance monitoring is enabled
    this.enabled = import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING !== 'false';

    if (this.enabled && typeof window !== 'undefined') {
      this.initializeWebVitals();
    }
  }

  /**
   * Initialize Web Vitals tracking
   */
  private initializeWebVitals(): void {
    // Cumulative Layout Shift
    onCLS(this.handleWebVital.bind(this));
    
    // First Input Delay
    onFID(this.handleWebVital.bind(this));
    
    // First Contentful Paint
    onFCP(this.handleWebVital.bind(this));
    
    // Largest Contentful Paint
    onLCP(this.handleWebVital.bind(this));
    
    // Time to First Byte
    onTTFB(this.handleWebVital.bind(this));
  }

  /**
   * Handle Web Vitals metric
   */
  private handleWebVital(metric: Metric): void {
    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      timestamp: Date.now(),
    };

    this.metrics.push(performanceMetric);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    // Notify listeners
    this.notifyListeners(performanceMetric);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[Performance]', metric.name, metric.value, metric.rating);
    }

    // Send to analytics endpoint
    this.sendToAnalytics(performanceMetric);
  }

  /**
   * Record a custom metric
   */
  recordMetric(name: string, value: number, labels?: Record<string, string>): void {
    if (!this.enabled) return;

    const metric: CustomMetric = {
      name,
      value,
      labels,
      timestamp: Date.now(),
    };

    this.customMetrics.push(metric);

    // Keep only last 100 custom metrics
    if (this.customMetrics.length > 100) {
      this.customMetrics.shift();
    }

    // Notify listeners
    this.notifyListeners(metric);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[Custom Metric]', name, value, labels);
    }
  }

  /**
   * Record component render time
   */
  recordRenderTime(componentName: string, renderTime: number): void {
    this.recordMetric('component_render', renderTime, { component: componentName });

    // Warn about slow renders
    if (renderTime > 30) {
      console.warn(`Slow render detected: ${componentName} took ${renderTime}ms`);
    }
  }

  /**
   * Record API call time
   */
  recordApiCall(endpoint: string, duration: number, status: number): void {
    this.recordMetric('api_call', duration, {
      endpoint,
      status: status.toString(),
    });

    // Warn about slow API calls
    if (duration > 1000) {
      console.warn(`Slow API call: ${endpoint} took ${duration}ms`);
    }
  }

  /**
   * Add metric listener
   */
  addListener(listener: (metric: PerformanceMetric | CustomMetric) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove metric listener
   */
  removeListener(listener: (metric: PerformanceMetric | CustomMetric) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(metric: PerformanceMetric | CustomMetric): void {
    for (const listener of this.listeners) {
      try {
        listener(metric);
      } catch (err) {
        console.error('Error in performance listener:', err);
      }
    }
  }

  /**
   * Send metric to analytics endpoint
   */
  private sendToAnalytics(metric: PerformanceMetric): void {
    // Skip in test environment
    if (import.meta.env.MODE === 'test') return;

    // Send to backend analytics endpoint
    const endpoint = `${import.meta.env.VITE_API_URL}/monitoring/metrics`;
    
    // Use sendBeacon for better reliability
    if (navigator.sendBeacon) {
      const data = JSON.stringify({
        type: 'web-vitals',
        metric,
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
      
      navigator.sendBeacon(endpoint, data);
    } else {
      // Fallback to fetch
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'web-vitals',
          metric,
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
        keepalive: true,
      }).catch(err => {
        console.error('Failed to send performance metric:', err);
      });
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get custom metrics
   */
  getCustomMetrics(): CustomMetric[] {
    return [...this.customMetrics];
  }

  /**
   * Get metrics summary
   */
  getSummary(): {
    webVitals: Record<string, { value: number; rating: string }>;
    customMetrics: Record<string, { avg: number; count: number }>;
  } {
    const webVitals: Record<string, { value: number; rating: string }> = {};
    
    // Get latest value for each Web Vital
    for (const metric of this.metrics) {
      if (!webVitals[metric.name] || metric.timestamp > webVitals[metric.name].value) {
        webVitals[metric.name] = {
          value: metric.value,
          rating: metric.rating,
        };
      }
    }

    // Aggregate custom metrics
    const customAgg: Record<string, { sum: number; count: number }> = {};
    for (const metric of this.customMetrics) {
      if (!customAgg[metric.name]) {
        customAgg[metric.name] = { sum: 0, count: 0 };
      }
      customAgg[metric.name].sum += metric.value;
      customAgg[metric.name].count++;
    }

    const customMetrics: Record<string, { avg: number; count: number }> = {};
    for (const [name, agg] of Object.entries(customAgg)) {
      customMetrics[name] = {
        avg: Math.round(agg.sum / agg.count),
        count: agg.count,
      };
    }

    return { webVitals, customMetrics };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.customMetrics = [];
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export for use in components
export default performanceMonitor;
