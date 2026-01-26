/**
 * User Analytics Service
 *
 * Privacy-first analytics tracking for user behavior and feature usage
 */

export interface AnalyticsEvent {
  id: string;
  timestamp: Date;
  event: string;
  properties?: Record<string, unknown>;
  userId?: string;
  tenantId?: string;
  sessionId: string;
  url: string;
  referrer?: string;
}

export type EventType =
  // Page events
  | 'page_view'
  | 'page_exit'
  // User interaction
  | 'button_click'
  | 'link_click'
  | 'form_submit'
  | 'form_error'
  // Widget interaction
  | 'widget_load'
  | 'widget_interact'
  | 'widget_error'
  // Feature usage
  | 'feature_used'
  | 'search_performed'
  | 'filter_applied'
  | 'export_data'
  // Navigation
  | 'navigation_click'
  | 'menu_open'
  | 'menu_close';

/**
 * Analytics tracker
 */
class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];
  private listeners: ((event: AnalyticsEvent) => void)[] = [];
  private enabled = true;
  private sessionId: string;
  private maxEvents = 1000;
  private batchSize = 10;
  private batchTimeout: number | null = null;
  private eventQueue: AnalyticsEvent[] = [];

  constructor() {
    this.enabled = import.meta.env.VITE_ENABLE_ANALYTICS !== 'false';
    this.sessionId = this.getOrCreateSessionId();

    if (this.enabled && typeof window !== 'undefined') {
      this.initializeTracking();
    }
  }

  /**
   * Initialize tracking
   */
  private initializeTracking(): void {
    // Track page views
    if (typeof window !== 'undefined') {
      // Initial page view
      this.trackPageView();

      // Track page visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.track('page_exit', {
            duration: performance.now(),
          });
          this.flush(); // Flush events before page becomes hidden
        }
      });

      // Track navigation (for SPAs)
      window.addEventListener('popstate', () => {
        this.trackPageView();
      });
    }
  }

  /**
   * Track a custom event
   */
  track(event: EventType, properties?: Record<string, unknown>): string {
    if (!this.enabled) return '';

    const analyticsEvent: AnalyticsEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      event,
      properties,
      sessionId: this.sessionId,
      url: window.location.href,
      referrer: document.referrer || undefined,
      userId: this.getUserId(),
      tenantId: this.getTenantId(),
    };

    this.addEvent(analyticsEvent);
    this.queueForBatch(analyticsEvent);

    return analyticsEvent.id;
  }

  /**
   * Track page view
   */
  trackPageView(): void {
    this.track('page_view', {
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      title: document.title,
    });
  }

  /**
   * Track button click
   */
  trackClick(elementId: string, label?: string): void {
    this.track('button_click', {
      elementId,
      label,
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmit(formId: string, success: boolean): void {
    this.track('form_submit', {
      formId,
      success,
    });
  }

  /**
   * Track widget interaction
   */
  trackWidgetInteraction(
    widgetType: string,
    action: string,
    metadata?: Record<string, unknown>
  ): void {
    this.track('widget_interact', {
      widgetType,
      action,
      ...metadata,
    });
  }

  /**
   * Track feature usage
   */
  trackFeature(featureName: string, metadata?: Record<string, unknown>): void {
    this.track('feature_used', {
      feature: featureName,
      ...metadata,
    });
  }

  /**
   * Add event to internal store
   */
  private addEvent(event: AnalyticsEvent): void {
    this.events.push(event);

    // Keep only last N events
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Notify listeners
    this.notifyListeners(event);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event.event, event.properties);
    }
  }

  /**
   * Queue event for batch sending
   */
  private queueForBatch(event: AnalyticsEvent): void {
    this.eventQueue.push(event);

    // Send batch if we've reached batch size
    if (this.eventQueue.length >= this.batchSize) {
      this.flush();
    } else {
      // Schedule batch send
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }
      this.batchTimeout = setTimeout(() => {
        this.flush();
      }, 5000); // Send batch after 5 seconds
    }
  }

  /**
   * Flush event queue
   */
  flush(): void {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    this.sendToBackend(events);
  }

  /**
   * Send events to backend
   */
  private sendToBackend(events: AnalyticsEvent[]): void {
    // Skip in test environment
    if (import.meta.env.MODE === 'test') return;

    const endpoint = `${import.meta.env.VITE_API_URL}/monitoring/analytics`;

    // Use sendBeacon for better reliability
    if (navigator.sendBeacon) {
      const data = JSON.stringify({ events });
      navigator.sendBeacon(endpoint, data);
    } else {
      // Fallback to fetch
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
        keepalive: true,
      }).catch(err => {
        console.error('Failed to send analytics events:', err);
      });
    }
  }

  /**
   * Get or create session ID
   */
  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics-session-id');

    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('analytics-session-id', sessionId);
    }

    return sessionId;
  }

  /**
   * Get user ID from session storage
   */
  private getUserId(): string | undefined {
    return sessionStorage.getItem('analytics-user-id') || undefined;
  }

  /**
   * Get tenant ID from session storage
   */
  private getTenantId(): string | undefined {
    return sessionStorage.getItem('analytics-tenant-id') || undefined;
  }

  /**
   * Set user context
   */
  setUser(userId: string, tenantId?: string): void {
    if (userId) {
      sessionStorage.setItem('analytics-user-id', userId);
    }
    if (tenantId) {
      sessionStorage.setItem('analytics-tenant-id', tenantId);
    }

    // Track user identification
    this.track('feature_used', {
      feature: 'user_identified',
      userId,
      tenantId,
    });
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    sessionStorage.removeItem('analytics-user-id');
    sessionStorage.removeItem('analytics-tenant-id');
  }

  /**
   * Add event listener
   */
  addListener(listener: (event: AnalyticsEvent) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeListener(listener: (event: AnalyticsEvent) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(event: AnalyticsEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in analytics listener:', err);
      }
    }
  }

  /**
   * Get all events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Get event summary
   */
  getSummary(): {
    total: number;
    byEvent: Record<string, number>;
    byPage: Record<string, number>;
    sessionDuration: number;
  } {
    const byEvent: Record<string, number> = {};
    const byPage: Record<string, number> = {};
    let sessionStart = Date.now();
    let sessionEnd = Date.now();

    for (const event of this.events) {
      byEvent[event.event] = (byEvent[event.event] || 0) + 1;

      if (event.event === 'page_view' && event.properties?.path) {
        const page = event.properties.path as string;
        byPage[page] = (byPage[page] || 0) + 1;
      }

      const eventTime = event.timestamp.getTime();
      if (eventTime < sessionStart) sessionStart = eventTime;
      if (eventTime > sessionEnd) sessionEnd = eventTime;
    }

    return {
      total: this.events.length,
      byEvent,
      byPage,
      sessionDuration: Math.round((sessionEnd - sessionStart) / 1000), // in seconds
    };
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
    this.eventQueue = [];
  }

  /**
   * Enable/disable tracking
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;

    if (!enabled) {
      this.flush(); // Flush remaining events before disabling
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Singleton instance
export const analyticsTracker = new AnalyticsTracker();

// Export for use in components
export default analyticsTracker;
