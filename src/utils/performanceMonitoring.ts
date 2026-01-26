/**
 * Performance Monitoring Utilities
 *
 * Provides tools for monitoring application performance including:
 * - Widget render time tracking
 * - Web Vitals monitoring (FCP, LCP, CLS, FID, TTFB)
 * - Bundle size analysis
 * - Re-render tracking
 *
 * Usage:
 * ```typescript
 * // Track widget render time
 * const perfMarker = startPerformanceMark('TextInput-render');
 * // ... render widget ...
 * endPerformanceMark(perfMarker);
 *
 * // Get performance metrics
 * const metrics = getPerformanceMetrics();
 * console.log('Average widget render time:', metrics.avgRenderTime);
 * ```
 */

/**
 * Performance threshold constants
 */
const SLOW_RENDER_THRESHOLD_MS = 30;

/**
 * Performance marker interface
 */
export interface PerformanceMarker {
  id: string;
  name: string;
  startTime: number;
}

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  avgRenderTime: number;
  maxRenderTime: number;
  minRenderTime: number;
  totalRenders: number;
  slowWidgets: Array<{ name: string; time: number }>;
}

/**
 * Widget performance data
 */
interface WidgetPerformanceData {
  name: string;
  renderTimes: number[];
  lastRenderTime: number;
}

/**
 * Performance data store
 */
class PerformanceMonitor {
  private widgetPerformance: Map<string, WidgetPerformanceData> = new Map();
  private enabled: boolean = process.env.NODE_ENV !== 'production';

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if performance monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Start a performance measurement
   */
  startMark(name: string): PerformanceMarker | null {
    if (!this.enabled) return null;

    const id = `${name}-${Date.now()}-${Math.random()}`;
    const startTime = performance.now();

    // Use Performance API if available
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(id);
    }

    return { id, name, startTime };
  }

  /**
   * End a performance measurement
   */
  endMark(marker: PerformanceMarker | null): number | null {
    if (!this.enabled || !marker) return null;

    const endTime = performance.now();
    const duration = endTime - marker.startTime;

    // Use Performance API if available
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(`${marker.name}-duration`, marker.id);
      } catch (error) {
        // Ignore measurement errors
      }
    }

    // Store widget performance data
    this.recordWidgetRender(marker.name, duration);

    // Warn about slow renders (> threshold target)
    if (duration > SLOW_RENDER_THRESHOLD_MS) {
      console.warn(
        `[Performance] Slow widget render detected: ${marker.name} took ${duration.toFixed(2)}ms (target: <${SLOW_RENDER_THRESHOLD_MS}ms)`
      );
    }

    return duration;
  }

  /**
   * Record widget render time
   */
  private recordWidgetRender(name: string, duration: number): void {
    const existing = this.widgetPerformance.get(name);

    if (existing) {
      existing.renderTimes.push(duration);
      existing.lastRenderTime = duration;

      // Keep only last 100 renders to prevent memory issues
      if (existing.renderTimes.length > 100) {
        existing.renderTimes.shift();
      }
    } else {
      this.widgetPerformance.set(name, {
        name,
        renderTimes: [duration],
        lastRenderTime: duration,
      });
    }
  }

  /**
   * Get performance metrics for all widgets
   */
  getMetrics(): PerformanceMetrics {
    const allRenderTimes: number[] = [];
    const slowWidgets: Array<{ name: string; time: number }> = [];

    // Collect all render times
    for (const [name, data] of this.widgetPerformance.entries()) {
      allRenderTimes.push(...data.renderTimes);

      // Find slow widgets (avg > threshold)
      const avgTime =
        data.renderTimes.reduce((sum, time) => sum + time, 0) / data.renderTimes.length;
      if (avgTime > SLOW_RENDER_THRESHOLD_MS) {
        slowWidgets.push({ name, time: avgTime });
      }
    }

    // Calculate metrics
    const avgRenderTime =
      allRenderTimes.length > 0
        ? allRenderTimes.reduce((sum, time) => sum + time, 0) / allRenderTimes.length
        : 0;

    const maxRenderTime = allRenderTimes.length > 0 ? Math.max(...allRenderTimes) : 0;
    const minRenderTime = allRenderTimes.length > 0 ? Math.min(...allRenderTimes) : 0;

    // Sort slow widgets by time (slowest first)
    slowWidgets.sort((a, b) => b.time - a.time);

    return {
      avgRenderTime,
      maxRenderTime,
      minRenderTime,
      totalRenders: allRenderTimes.length,
      slowWidgets: slowWidgets.slice(0, 10), // Top 10 slowest
    };
  }

  /**
   * Get metrics for a specific widget
   */
  getWidgetMetrics(widgetName: string): {
    avgRenderTime: number;
    maxRenderTime: number;
    minRenderTime: number;
    totalRenders: number;
  } | null {
    const data = this.widgetPerformance.get(widgetName);
    if (!data || data.renderTimes.length === 0) return null;

    const avgRenderTime =
      data.renderTimes.reduce((sum, time) => sum + time, 0) / data.renderTimes.length;
    const maxRenderTime = Math.max(...data.renderTimes);
    const minRenderTime = Math.min(...data.renderTimes);

    return {
      avgRenderTime,
      maxRenderTime,
      minRenderTime,
      totalRenders: data.renderTimes.length,
    };
  }

  /**
   * Clear all performance data
   */
  clear(): void {
    this.widgetPerformance.clear();

    // Clear Performance API marks and measures
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }

  /**
   * Log performance summary to console
   */
  logSummary(): void {
    if (!this.enabled) return;

    const metrics = this.getMetrics();

    console.group('[Performance Summary]');
    console.log(`Total renders: ${metrics.totalRenders}`);
    console.log(`Average render time: ${metrics.avgRenderTime.toFixed(2)}ms`);
    console.log(`Max render time: ${metrics.maxRenderTime.toFixed(2)}ms`);
    console.log(`Min render time: ${metrics.minRenderTime.toFixed(2)}ms`);

    if (metrics.slowWidgets.length > 0) {
      console.group(`Slow widgets (avg > ${SLOW_RENDER_THRESHOLD_MS}ms):`);
      for (const widget of metrics.slowWidgets) {
        console.log(`  ${widget.name}: ${widget.time.toFixed(2)}ms`);
      }
      console.groupEnd();
    }

    console.groupEnd();
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Start a performance measurement
 */
export function startPerformanceMark(name: string): PerformanceMarker | null {
  return performanceMonitor.startMark(name);
}

/**
 * End a performance measurement
 */
export function endPerformanceMark(marker: PerformanceMarker | null): number | null {
  return performanceMonitor.endMark(marker);
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  return performanceMonitor.getMetrics();
}

/**
 * Get metrics for a specific widget
 */
export function getWidgetMetrics(widgetName: string) {
  return performanceMonitor.getWidgetMetrics(widgetName);
}

/**
 * Clear all performance data
 */
export function clearPerformanceData(): void {
  performanceMonitor.clear();
}

/**
 * Log performance summary
 */
export function logPerformanceSummary(): void {
  performanceMonitor.logSummary();
}

/**
 * Enable/disable performance monitoring
 */
export function setPerformanceMonitoring(enabled: boolean): void {
  performanceMonitor.setEnabled(enabled);
}

/**
 * Check if performance monitoring is enabled
 */
export function isPerformanceMonitoringEnabled(): boolean {
  return performanceMonitor.isEnabled();
}
