# Monitoring and Observability

**Status:** ✅ Implemented  
**Issue:** #041  
**Phase:** Phase 4.5 - Scale & Governance

## Overview

OpenPortal includes a comprehensive monitoring and observability stack that provides insights into application performance, errors, user behavior, and system health. The implementation is privacy-first, minimal-dependency, and production-ready.

## Architecture

### Backend Monitoring

```
┌─────────────────────────────────────────────────────────────┐
│                     Express Middleware                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Correlation  │  │   Metrics    │  │    Audit     │      │
│  │      ID      │  │   Tracking   │  │   Logging    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼─────┐  ┌─────▼──────┐  ┌────▼──────┐
    │ Monitoring │  │   Audit    │  │   Alert   │
    │  Service   │  │  Service   │  │  Manager  │
    └────────────┘  └────────────┘  └───────────┘
```

**Components:**
- **Correlation ID Middleware**: Adds unique IDs to requests for distributed tracing
- **Metrics Tracking**: Records request/response times, error rates, resource usage
- **Audit Logging**: Logs all authenticated actions with full context
- **Monitoring Service**: Collects and aggregates metrics
- **Alert Manager**: Evaluates alert conditions and triggers notifications

### Frontend Monitoring

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
├─────────────────────────────────────────────────────────────┤
│                   ┌──────────────────┐                       │
│                   │ Error Boundary   │                       │
│                   └──────────────────┘                       │
│                           │                                  │
│       ┌───────────────────┼───────────────────┐             │
│       │                   │                   │             │
│  ┌────▼─────┐      ┌──────▼──────┐     ┌─────▼─────┐       │
│  │  Error   │      │ Performance │     │ Analytics │       │
│  │ Tracker  │      │   Monitor   │     │  Tracker  │       │
│  └──────────┘      └─────────────┘     └───────────┘       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                  Backend API Endpoints
```

**Components:**
- **Error Boundary**: Catches React errors and reports to Error Tracker
- **Error Tracker**: Captures unhandled errors, promise rejections, console errors
- **Performance Monitor**: Tracks Core Web Vitals and custom performance metrics
- **Analytics Tracker**: Records user interactions and feature usage

## Features

### 1. Error Tracking

**Backend (`auditService.ts`):**
- Structured error logging via Pino
- Error context with correlation IDs
- Error aggregation and analysis

**Frontend (`errorTracker.ts`):**
- Unhandled error capture
- Promise rejection tracking
- React error boundaries
- Component stack traces
- User context tracking
- Batch error submission

**Usage Example:**
```typescript
import { errorTracker } from '@/services/errorTracker';

// Capture an error
try {
  riskyOperation();
} catch (error) {
  errorTracker.captureError(error, {
    tags: { component: 'UserForm' },
    level: 'error',
  });
}

// Capture a message
errorTracker.captureMessage('Something went wrong', 'warning');

// Set user context
errorTracker.setUser(userId, tenantId);
```

### 2. Performance Monitoring

**Core Web Vitals Tracked:**
- **CLS** (Cumulative Layout Shift)
- **FID** (First Input Delay)
- **FCP** (First Contentful Paint)
- **LCP** (Largest Contentful Paint)
- **TTFB** (Time to First Byte)

**Custom Metrics:**
- Component render times
- API call durations
- User-defined metrics

**Usage Example:**
```typescript
import { performanceMonitor } from '@/services/performanceMonitor';

// Record component render time
const startTime = performance.now();
// ... component render ...
const renderTime = performance.now() - startTime;
performanceMonitor.recordRenderTime('UserForm', renderTime);

// Record API call
const apiStart = performance.now();
const response = await fetch('/api/users');
const apiDuration = performance.now() - apiStart;
performanceMonitor.recordApiCall('/api/users', apiDuration, response.status);

// Record custom metric
performanceMonitor.recordMetric('custom_metric', 42, {
  category: 'business',
  unit: 'count',
});
```

### 3. User Analytics

**Events Tracked:**
- Page views
- Button clicks
- Form submissions
- Widget interactions
- Feature usage
- Navigation events

**Privacy Features:**
- No personally identifiable information (PII) collected
- Session-based tracking
- User consent support
- Batch submission to reduce requests

**Usage Example:**
```typescript
import { analyticsTracker } from '@/services/analyticsTracker';

// Track page view (automatic on navigation)
analyticsTracker.trackPageView();

// Track button click
analyticsTracker.trackClick('submit-button', 'Submit Form');

// Track widget interaction
analyticsTracker.trackWidgetInteraction('TableWidget', 'sort', {
  column: 'name',
  direction: 'asc',
});

// Track feature usage
analyticsTracker.trackFeature('export-data', {
  format: 'csv',
  rows: 100,
});

// Set user context
analyticsTracker.setUser(userId, tenantId);
```

### 4. Audit Logging

**Actions Logged:**
- Authentication (login, logout, refresh)
- Configuration changes (create, update, delete, deploy)
- User management
- Tenant operations
- UI actions

**Audit Log Structure:**
```typescript
{
  id: string;
  timestamp: Date;
  userId: string;
  tenantId?: string;
  action: string;  // e.g., 'config.update'
  resource: string;  // e.g., 'config'
  resourceId?: string;
  method: string;  // HTTP method
  ip: string;
  userAgent: string;
  success: boolean;
  changes?: {
    before?: unknown;
    after?: unknown;
  };
  metadata?: Record<string, unknown>;
  correlationId?: string;
}
```

**Querying Audit Logs:**
```bash
# Get audit logs for a user
GET /monitoring/audit?userId=user123&limit=50

# Get failed actions
GET /monitoring/audit?success=false&startDate=2026-01-01

# Get config changes
GET /monitoring/audit?resource=config&action=config.update

# Get audit statistics
GET /monitoring/audit/stats?tenantId=tenant1
```

### 5. Metrics Collection

**Metrics Tracked:**
- Request count and error rate
- Response times (average, percentiles)
- Memory usage (heap used, heap total)
- CPU usage
- Active connections
- WebSocket connections
- Custom business metrics

**Health Metrics Structure:**
```typescript
{
  uptime: number;  // seconds
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpu: number;  // seconds
  requests: {
    total: number;
    errors: number;
    avgResponseTime: number;  // ms
  };
  connections: {
    active: number;
    websockets: number;
  };
}
```

**API Endpoints:**
```bash
# Enhanced health check
GET /monitoring/health

# Get metrics summary
GET /monitoring/metrics

# Get dashboard data
GET /monitoring/dashboard
```

### 6. Alert System

**Built-in Alerts:**
1. **High Error Rate**: Triggers when error rate > 10%
2. **High Memory Usage**: Triggers when heap used > 500 MB
3. **Slow Response Time**: Triggers when avg response time > 1 second

**Alert Configuration:**
```typescript
import { alertManager } from '@/services/monitoringService';

// Register custom alert
alertManager.registerAlert({
  id: 'custom-alert',
  name: 'Custom Alert',
  condition: (metrics) => {
    // Custom condition logic
    return metrics.requests.total > 10000;
  },
  message: 'High request volume detected',
  severity: 'warning',
  cooldown: 5 * 60 * 1000,  // 5 minutes
});

// Add alert handler
alertManager.addHandler((alert, metrics) => {
  // Send notification (email, Slack, PagerDuty, etc.)
  console.error(`Alert: ${alert.name} - ${alert.message}`);
});
```

## Configuration

### Environment Variables

**Frontend (`.env`):**
```bash
# Monitoring & Observability
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_ANALYTICS=true

# API endpoint for monitoring data
VITE_API_URL=http://localhost:4000
```

**Backend (`backend/.env`):**
```bash
# Logging level
LOG_LEVEL=info

# Server port
PORT=4000
```

### Feature Flags

All monitoring features can be individually enabled/disabled via environment variables:

```typescript
// Check if feature is enabled
const errorTrackingEnabled = import.meta.env.VITE_ENABLE_ERROR_TRACKING !== 'false';
const performanceEnabled = import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING !== 'false';
const analyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS !== 'false';
```

## Integration

### Backend Setup

Monitoring is automatically initialized on server startup:

```typescript
// server.ts
import { initializeDefaultAlerts, startMonitoring } from './services/monitoringService';

// ... after server starts ...
initializeDefaultAlerts();
startMonitoring(60000);  // Check alerts every minute
```

### Frontend Setup

Monitoring is integrated at the application root:

```typescript
// index.tsx
import { ErrorBoundary } from './components/ErrorBoundary';
import { performanceMonitor } from './services/performanceMonitor';
import { analyticsTracker } from './services/analyticsTracker';
import { errorTracker } from './services/errorTracker';

// Wrap app in error boundary
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Performance monitoring is automatic via web-vitals
```

## Data Flow

### Error Tracking Flow

```
1. Error occurs in React component
   ↓
2. Error Boundary catches error
   ↓
3. errorTracker.captureReactError(error, errorInfo)
   ↓
4. Error stored locally + sent to backend
   ↓
5. Backend /monitoring/errors endpoint receives error
   ↓
6. Error logged via Pino + stored for analysis
```

### Performance Monitoring Flow

```
1. Web Vitals callback triggered (e.g., LCP measured)
   ↓
2. performanceMonitor.handleWebVital(metric)
   ↓
3. Metric stored locally + sent to backend via sendBeacon
   ↓
4. Backend /monitoring/metrics endpoint receives metric
   ↓
5. Metric aggregated with other metrics
```

### Analytics Flow

```
1. User interacts with UI (click, submit, etc.)
   ↓
2. analyticsTracker.track(event, properties)
   ↓
3. Event queued for batch submission
   ↓
4. After 10 events or 5 seconds, batch is sent
   ↓
5. Backend /monitoring/analytics endpoint receives batch
   ↓
6. Events stored for analysis
```

## Best Practices

### 1. Error Handling

**DO:**
```typescript
// ✅ Capture errors with context
try {
  await updateUser(userId, data);
} catch (error) {
  errorTracker.captureError(error, {
    tags: { operation: 'update-user', userId },
    level: 'error',
  });
  // Show user-friendly message
}
```

**DON'T:**
```typescript
// ❌ Silent failures
try {
  await updateUser(userId, data);
} catch (error) {
  // Error is swallowed
}
```

### 2. Performance Monitoring

**DO:**
```typescript
// ✅ Monitor critical paths
const startTime = performance.now();
const data = await fetchCriticalData();
const duration = performance.now() - startTime;
performanceMonitor.recordMetric('fetch_critical_data', duration);

// ✅ Set performance budgets
if (duration > 500) {
  console.warn('Slow critical data fetch:', duration);
}
```

**DON'T:**
```typescript
// ❌ Monitor everything
for (let i = 0; i < 10000; i++) {
  performanceMonitor.recordMetric('iteration', i);  // Too noisy
}
```

### 3. Analytics

**DO:**
```typescript
// ✅ Track meaningful events
analyticsTracker.track('feature_used', {
  feature: 'data-export',
  format: 'csv',
  recordCount: 100,
});

// ✅ Use semantic event names
analyticsTracker.track('button_click', {
  elementId: 'export-button',
  label: 'Export Data',
});
```

**DON'T:**
```typescript
// ❌ Track PII
analyticsTracker.track('user_info', {
  email: 'user@example.com',  // Don't track PII
  ssn: '123-45-6789',  // Never track sensitive data
});
```

### 4. Audit Logging

Audit logging is automatic via middleware, but you can manually log events:

```typescript
import { auditLogger } from './services/auditService';

auditLogger.log({
  userId: 'user123',
  tenantId: 'tenant1',
  action: 'custom.action',
  resource: 'custom-resource',
  resourceId: 'res456',
  method: 'POST',
  ip: req.ip || 'unknown',
  userAgent: req.headers['user-agent'] || 'unknown',
  success: true,
  correlationId: req.correlationId,
  metadata: {
    // Additional context
  },
});
```

## Troubleshooting

### High Memory Usage

```bash
# Check current metrics
curl http://localhost:4000/monitoring/metrics

# If memory is high:
# 1. Check for memory leaks in custom code
# 2. Reduce metric retention (adjust maxLogs in services)
# 3. Consider external metrics storage (Prometheus, CloudWatch)
```

### Missing Metrics

```bash
# Verify monitoring is enabled
# Backend: Check server startup logs
# Frontend: Check browser console

# Common issues:
# 1. Environment variables not set
# 2. CORS blocking backend requests
# 3. AdBlockers blocking analytics
```

### Alert Not Triggering

```typescript
// Check alert registration
const alerts = alertManager.getAlerts();
console.log('Registered alerts:', alerts);

// Manually check alert condition
const metrics = metricsCollector.getHealthMetrics();
const condition = alert.condition(metrics);
console.log('Alert condition met:', condition);

// Check cooldown period
const timeSinceLastTrigger = Date.now() - (alert.lastTriggered || 0);
const cooldownActive = timeSinceLastTrigger < alert.cooldown;
console.log('Cooldown active:', cooldownActive);
```

## Future Enhancements

### Planned Features
- [ ] Integration with external services (Sentry, DataDog, New Relic)
- [ ] Persistent storage for metrics (PostgreSQL, TimescaleDB)
- [ ] Real-time dashboards (Grafana, custom React dashboard)
- [ ] Advanced alerting (Webhook integrations, Slack, PagerDuty)
- [ ] Distributed tracing (OpenTelemetry)
- [ ] Log aggregation (ELK stack, CloudWatch Logs)

### Integration Examples

**Sentry Integration:**
```typescript
import * as Sentry from '@sentry/react';

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: 1.0,
  });

  // Forward errors to Sentry
  errorTracker.addListener((error) => {
    Sentry.captureException(error.error);
  });
}
```

**Prometheus Integration:**
```typescript
import { register, Counter, Histogram } from 'prom-client';

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'status'],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  buckets: [10, 50, 100, 300, 500, 1000, 3000, 5000],
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

## Security Considerations

### Data Privacy
- No PII (Personally Identifiable Information) is collected in analytics
- Sensitive fields in audit logs are automatically sanitized
- User context is optional and stored in sessionStorage only

### Data Retention
- Frontend: Last 100 errors, 100 metrics, 1000 analytics events
- Backend: Last 10,000 audit logs, 1000 metrics per type
- For production, implement rolling deletion or external storage

### Access Control
- Monitoring endpoints should be protected with authentication
- Consider role-based access (only admins can view audit logs)
- Implement rate limiting on monitoring endpoints

## Performance Impact

### Frontend
- **Error Tracking**: <1ms overhead per error
- **Performance Monitor**: <0.1ms per metric
- **Analytics**: Batched, <0.1ms per event
- **Bundle Size**: ~25KB total (gzipped)

### Backend
- **Correlation ID**: <0.1ms per request
- **Metrics Tracking**: <1ms per request
- **Audit Logging**: <5ms per authenticated request
- **Memory Overhead**: ~50MB for in-memory storage

## Resources

### Documentation
- [Web Vitals](https://web.dev/vitals/)
- [Pino Logger](https://getpino.io/)
- [Error Handling Best Practices](https://kentcdodds.com/blog/use-react-error-boundary-to-handle-errors-in-react)

### Related Files
- Backend: `/backend/src/services/monitoringService.ts`
- Backend: `/backend/src/services/auditService.ts`
- Backend: `/backend/src/middleware/monitoring.ts`
- Backend: `/backend/src/middleware/audit.ts`
- Backend: `/backend/src/routes/monitoring.ts`
- Frontend: `/src/services/performanceMonitor.ts`
- Frontend: `/src/services/errorTracker.ts`
- Frontend: `/src/services/analyticsTracker.ts`
- Frontend: `/src/components/ErrorBoundary.tsx`

---

**Last Updated:** January 26, 2026  
**Maintained By:** OpenPortal Team
