/**
 * Error Tracking Service
 * 
 * Captures and reports frontend errors, similar to Sentry
 */

export interface ErrorEvent {
  id: string;
  timestamp: Date;
  message: string;
  stack?: string;
  componentStack?: string;
  error?: Error;
  errorInfo?: {
    componentStack?: string;
  };
  context?: {
    url: string;
    userAgent: string;
    userId?: string;
    tenantId?: string;
    route?: string;
  };
  tags?: Record<string, string>;
  level: 'error' | 'warning' | 'info';
}

/**
 * Error tracker
 */
class ErrorTracker {
  private errors: ErrorEvent[] = [];
  private listeners: ((event: ErrorEvent) => void)[] = [];
  private enabled = true;
  private maxErrors = 100;

  constructor() {
    this.enabled = import.meta.env.VITE_ENABLE_ERROR_TRACKING !== 'false';

    if (this.enabled && typeof window !== 'undefined') {
      this.initializeGlobalHandlers();
    }
  }

  /**
   * Initialize global error handlers
   */
  private initializeGlobalHandlers(): void {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        tags: { type: 'unhandled' },
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        {
          tags: { type: 'unhandled-promise' },
        }
      );
    });

    // Console error interception (optional)
    if (import.meta.env.DEV) {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        this.captureMessage(String(args[0]), 'error', {
          tags: { type: 'console-error' },
        });
        originalConsoleError.apply(console, args);
      };
    }
  }

  /**
   * Capture an error
   */
  captureError(
    error: Error,
    options?: {
      tags?: Record<string, string>;
      context?: Record<string, unknown>;
      level?: 'error' | 'warning';
    }
  ): string {
    if (!this.enabled) return '';

    const errorEvent: ErrorEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      message: error.message,
      stack: error.stack,
      error,
      context: this.getContext(),
      tags: options?.tags,
      level: options?.level || 'error',
    };

    this.addError(errorEvent);
    this.sendToBackend(errorEvent);

    return errorEvent.id;
  }

  /**
   * Capture a message
   */
  captureMessage(
    message: string,
    level: 'error' | 'warning' | 'info' = 'info',
    options?: {
      tags?: Record<string, string>;
      context?: Record<string, unknown>;
    }
  ): string {
    if (!this.enabled) return '';

    const errorEvent: ErrorEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      message,
      context: this.getContext(),
      tags: options?.tags,
      level,
    };

    this.addError(errorEvent);
    this.sendToBackend(errorEvent);

    return errorEvent.id;
  }

  /**
   * Capture React error boundary error
   */
  captureReactError(
    error: Error,
    errorInfo: { componentStack?: string }
  ): string {
    if (!this.enabled) return '';

    const errorEvent: ErrorEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      error,
      errorInfo,
      context: this.getContext(),
      tags: { type: 'react-error-boundary' },
      level: 'error',
    };

    this.addError(errorEvent);
    this.sendToBackend(errorEvent);

    return errorEvent.id;
  }

  /**
   * Add error to internal store
   */
  private addError(errorEvent: ErrorEvent): void {
    this.errors.push(errorEvent);

    // Keep only last N errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Notify listeners
    this.notifyListeners(errorEvent);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[Error Tracker]', errorEvent.message, errorEvent);
    }
  }

  /**
   * Send error to backend
   */
  private sendToBackend(errorEvent: ErrorEvent): void {
    // Skip in test environment
    if (import.meta.env.MODE === 'test') return;

    const endpoint = `${import.meta.env.VITE_API_URL}/monitoring/errors`;

    // Use sendBeacon for better reliability
    if (navigator.sendBeacon) {
      const data = JSON.stringify({
        ...errorEvent,
        error: undefined, // Don't send Error object (not serializable)
      });
      
      navigator.sendBeacon(endpoint, data);
    } else {
      // Fallback to fetch
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...errorEvent,
          error: undefined,
        }),
        keepalive: true,
      }).catch(err => {
        console.error('Failed to send error to backend:', err);
      });
    }
  }

  /**
   * Get error context
   */
  private getContext(): ErrorEvent['context'] {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      route: window.location.pathname,
      // Note: userId and tenantId should be set from auth context
    };
  }

  /**
   * Set user context
   */
  setUser(userId: string, tenantId?: string): void {
    // Store in sessionStorage for context retrieval
    if (userId) {
      sessionStorage.setItem('error-tracker-user-id', userId);
    }
    if (tenantId) {
      sessionStorage.setItem('error-tracker-tenant-id', tenantId);
    }
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    sessionStorage.removeItem('error-tracker-user-id');
    sessionStorage.removeItem('error-tracker-tenant-id');
  }

  /**
   * Add error listener
   */
  addListener(listener: (event: ErrorEvent) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove error listener
   */
  removeListener(listener: (event: ErrorEvent) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(errorEvent: ErrorEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(errorEvent);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    }
  }

  /**
   * Get all errors
   */
  getErrors(): ErrorEvent[] {
    return [...this.errors];
  }

  /**
   * Get error summary
   */
  getSummary(): {
    total: number;
    byLevel: Record<string, number>;
    recent: ErrorEvent[];
  } {
    const byLevel: Record<string, number> = {};
    
    for (const error of this.errors) {
      byLevel[error.level] = (byLevel[error.level] || 0) + 1;
    }

    return {
      total: this.errors.length,
      byLevel,
      recent: this.errors.slice(-10).reverse(),
    };
  }

  /**
   * Clear all errors
   */
  clear(): void {
    this.errors = [];
  }

  /**
   * Enable/disable tracking
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// Export for use in components
export default errorTracker;
