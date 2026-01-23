# Page Configuration Loader

## Overview

The Page Configuration Loader is a frontend service that loads, validates, and caches page configurations from the backend. It provides efficient page loading with ETag-based caching, stale-while-revalidate strategy, and comprehensive error handling.

## Table of Contents

- [Architecture](#architecture)
- [Core Service](#core-service)
- [React Hooks](#react-hooks)
- [Caching Strategy](#caching-strategy)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Architecture

The page configuration loader consists of three main layers:

1. **Type Definitions** (`src/types/page.types.ts`)
   - PageConfig, WidgetConfig, DatasourceConfig, ActionConfig
   - Cache metadata types
   - Error types

2. **Core Service** (`src/services/pageConfigLoader.ts`)
   - HTTP client integration
   - ETag-based caching
   - Request deduplication
   - Validation

3. **React Hooks** (`src/hooks/usePageConfig.ts`)
   - `usePageConfig` - Load and manage page configuration
   - `usePreloadPageConfig` - Preload pages in background
   - `useIsPageCached` - Check cache status

## Core Service

### Loading Page Configuration

```typescript
import { loadPageConfig } from '@/services/pageConfigLoader';

// Load page configuration
const result = await loadPageConfig('dashboard-page');
console.log(result.config); // PageConfig object
console.log(result.fromCache); // true if loaded from cache
console.log(result.etag); // ETag from server
```

### Options

```typescript
interface PageLoaderOptions {
  /** Skip cache and force fetch from server */
  skipCache?: boolean;

  /** Cache TTL override (in seconds) */
  cacheTTL?: number;

  /** Use stale cache while revalidating */
  staleWhileRevalidate?: boolean;

  /** Abort signal for request cancellation */
  signal?: AbortSignal;
}
```

### Preloading

```typescript
import { preloadPageConfig } from '@/services/pageConfigLoader';

// Preload page in background (for faster navigation)
await preloadPageConfig('user-profile');
```

### Cache Management

```typescript
import {
  clearPageCache,
  isPageCached,
  getCacheStats,
} from '@/services/pageConfigLoader';

// Clear specific page cache
await clearPageCache('dashboard-page');

// Clear all cached pages
await clearPageCache();

// Check if page is cached
const cached = await isPageCached('dashboard-page');

// Get cache statistics
const stats = await getCacheStats();
console.log(stats.count); // Number of cached pages
console.log(stats.size); // Total cache size (bytes)
```

## React Hooks

### usePageConfig

Primary hook for loading page configurations in React components.

```typescript
import { usePageConfig } from '@/hooks/usePageConfig';

function DashboardPage() {
  const { config, loading, error, reload, clearCache } = usePageConfig('dashboard-page');

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!config) return null;

  return (
    <div>
      <h1>{config.title}</h1>
      <button onClick={reload}>Reload</button>
      <PageRenderer config={config} />
    </div>
  );
}
```

#### Hook State

```typescript
interface UsePageConfigState {
  /** Page configuration (null if not loaded) */
  config: PageConfig | null;

  /** Loading state */
  loading: boolean;

  /** Error state */
  error: PageLoadError | null;

  /** Whether data was loaded from cache */
  fromCache: boolean;

  /** Timestamp when loaded */
  loadedAt: number | null;

  /** Reload function */
  reload: () => Promise<void>;

  /** Clear cache function */
  clearCache: () => Promise<void>;
}
```

#### Hook Options

```typescript
interface UsePageConfigOptions {
  /** Skip automatic loading on mount */
  skip?: boolean;

  /** Auto reload interval in ms (0 = disabled) */
  autoReload?: number;

  /** Callback when page is loaded */
  onLoad?: (config: PageConfig) => void;

  /** Callback when error occurs */
  onError?: (error: PageLoadError) => void;

  // ... all PageLoaderOptions
}
```

### usePreloadPageConfig

Hook for preloading pages without loading them immediately.

```typescript
import { usePreloadPageConfig } from '@/hooks/usePageConfig';

function Navigation() {
  // Preload dashboard when navigation component mounts
  usePreloadPageConfig('dashboard-page');

  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
    </nav>
  );
}
```

### useIsPageCached

Hook for checking if a page is cached.

```typescript
import { useIsPageCached } from '@/hooks/usePageConfig';

function PageLink({ pageId, label }) {
  const isCached = useIsPageCached(pageId);

  return (
    <Link to={`/page/${pageId}`}>
      {isCached && <CacheIcon />}
      {label}
    </Link>
  );
}
```

## Caching Strategy

### ETag-Based Validation

The loader uses HTTP ETags for efficient cache validation:

1. **First Load**: Fetch page config from server, store in cache with ETag
2. **Cached Load**: Return from cache if not expired
3. **Revalidation**: Send `If-None-Match` header with ETag
4. **304 Response**: Server returns 304 if config unchanged, cache remains valid
5. **200 Response**: Server returns new config, cache is updated

### Cache TTL

Default cache TTL is 1 hour (3600 seconds). Can be customized per request:

```typescript
const result = await loadPageConfig('dashboard-page', {
  cacheTTL: 600, // 10 minutes
});
```

### Stale-While-Revalidate

Return cached data immediately while revalidating in the background:

```typescript
const result = await loadPageConfig('dashboard-page', {
  staleWhileRevalidate: true,
});
```

This provides instant loading (from stale cache) while ensuring fresh data is fetched.

### Development Mode

In development mode (`NODE_ENV=development`), caching is disabled by default to ensure you always see the latest config.

### Cache Size and Eviction

Currently uses in-memory cache (Map). Future implementation will use IndexedDB with:
- LRU (Least Recently Used) eviction
- Configurable size limits
- Persistent storage across sessions

## Error Handling

### Error Types

```typescript
enum PageLoadErrorType {
  NOT_FOUND = 'NOT_FOUND',       // Page not found (404)
  FORBIDDEN = 'FORBIDDEN',        // Insufficient permissions (403)
  NETWORK_ERROR = 'NETWORK_ERROR', // Network/connectivity issues
  INVALID_CONFIG = 'INVALID_CONFIG', // Invalid configuration format
  CACHE_ERROR = 'CACHE_ERROR',    // Cache storage/retrieval error
  UNKNOWN = 'UNKNOWN',            // Unknown error
}
```

### Error Class

```typescript
class PageLoadError extends Error {
  constructor(
    message: string,
    public type: PageLoadErrorType,
    public pageId?: string,
    public cause?: unknown
  );
}
```

### Handling Errors

```typescript
try {
  const result = await loadPageConfig('dashboard-page');
} catch (error) {
  if (error instanceof PageLoadError) {
    switch (error.type) {
      case PageLoadErrorType.NOT_FOUND:
        console.error('Page not found:', error.pageId);
        break;
      case PageLoadErrorType.FORBIDDEN:
        console.error('Access denied:', error.pageId);
        break;
      case PageLoadErrorType.NETWORK_ERROR:
        console.error('Network error:', error.message);
        break;
      default:
        console.error('Unknown error:', error.message);
    }
  }
}
```

## Usage Examples

### Basic Page Loading

```typescript
import { usePageConfig } from '@/hooks/usePageConfig';

function MyPage() {
  const { config, loading, error } = usePageConfig('my-page');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <PageRenderer config={config} />;
}
```

### With Callbacks

```typescript
function MyPage() {
  const { config } = usePageConfig('my-page', {
    onLoad: (config) => {
      console.log('Page loaded:', config.title);
      trackPageView(config.id);
    },
    onError: (error) => {
      console.error('Load failed:', error);
      trackError(error);
    },
  });

  return <PageRenderer config={config} />;
}
```

### Auto Reload

```typescript
function LiveDashboard() {
  const { config } = usePageConfig('live-dashboard', {
    autoReload: 30000, // Reload every 30 seconds
  });

  return <PageRenderer config={config} />;
}
```

### Manual Reload

```typescript
function MyPage() {
  const { config, reload } = usePageConfig('my-page');

  return (
    <div>
      <button onClick={reload}>Refresh</button>
      <PageRenderer config={config} />
    </div>
  );
}
```

### Skip Initial Load

```typescript
function ConditionalPage({ shouldLoad }) {
  const { config, reload } = usePageConfig('my-page', {
    skip: !shouldLoad,
  });

  useEffect(() => {
    if (shouldLoad) {
      reload();
    }
  }, [shouldLoad, reload]);

  return <PageRenderer config={config} />;
}
```

### Preloading Pages

```typescript
function App() {
  // Preload common pages on app mount
  usePreloadPageConfig('dashboard-page');
  usePreloadPageConfig('user-profile');
  usePreloadPageConfig('settings');

  return <Router />;
}
```

## API Reference

### Service Functions

#### `loadPageConfig(pageId, options?): Promise<PageLoaderResult>`

Load page configuration from server or cache.

**Parameters:**
- `pageId` (string) - Page identifier
- `options` (PageLoaderOptions) - Optional loader options

**Returns:** `Promise<PageLoaderResult>`
- `config` (PageConfig) - Page configuration
- `fromCache` (boolean) - Whether loaded from cache
- `etag` (string) - ETag from server
- `loadedAt` (number) - Timestamp when loaded

**Throws:** `PageLoadError` on failure

#### `preloadPageConfig(pageId, options?): Promise<void>`

Preload page configuration in background.

#### `clearPageCache(pageId?): Promise<void>`

Clear cached page configuration. If pageId is omitted, clears all cached pages.

#### `isPageCached(pageId): Promise<boolean>`

Check if page is cached and not expired.

#### `getCacheStats(): Promise<CacheStats>`

Get cache statistics (count, size, hit rate).

## Testing

### Unit Tests

The loader has comprehensive unit tests:

```bash
npm test -- src/services/pageConfigLoader.test.ts
npm test -- src/hooks/usePageConfig.test.ts
```

### Test Coverage

- **Service**: 22 tests covering all functionality
- **Hooks**: 14 tests covering all React hooks
- **Total**: 36 tests, all passing ✅

### Mock Server

For integration testing, mock the `/ui/pages/:pageId` endpoint:

```typescript
import { rest } from 'msw';

const handlers = [
  rest.get('/v1/ui/pages/:pageId', (req, res, ctx) => {
    const { pageId } = req.params;
    return res(
      ctx.status(200),
      ctx.set('ETag', '"v1.0.0"'),
      ctx.json({
        id: pageId,
        version: '1.0.0',
        title: 'Test Page',
        layout: { type: 'grid' },
        widgets: [],
      })
    );
  }),
];
```

## Troubleshooting

### Page Not Loading

**Problem:** Page configuration not loading or showing errors.

**Solutions:**
1. Check network tab for failed requests
2. Verify page ID matches backend configuration
3. Check user permissions
4. Clear cache: `await clearPageCache()`
5. Enable debug logging: `localStorage.setItem('debug', 'pageLoader')`

### Stale Data

**Problem:** Page shows old data despite backend changes.

**Solutions:**
1. Force reload: `reload()` or `loadPageConfig(pageId, { skipCache: true })`
2. Reduce cache TTL
3. Check ETag implementation on backend
4. Verify 304 response handling

### Performance Issues

**Problem:** Slow page loading or high memory usage.

**Solutions:**
1. Use `preloadPageConfig()` for common pages
2. Implement pagination for large configs
3. Enable stale-while-revalidate for instant loading
4. Monitor cache size with `getCacheStats()`

### TypeScript Errors

**Problem:** Type errors when using page configuration.

**Solutions:**
1. Import types: `import type { PageConfig } from '@/types/page.types'`
2. Validate config structure matches schema
3. Use type guards for optional fields

## Future Enhancements

Planned improvements for future releases:

1. **IndexedDB Cache**
   - Persistent cache across sessions
   - LRU eviction strategy
   - Configurable size limits

2. **Advanced Caching**
   - Cache versioning and migrations
   - Selective cache invalidation
   - Cache preloading strategies

3. **Performance**
   - Compression support
   - Partial page updates
   - Delta synchronization

4. **Monitoring**
   - Cache hit rate tracking
   - Load time metrics
   - Error rate monitoring

5. **Offline Support**
   - Service worker integration
   - Offline fallback pages
   - Background sync

---

**Related Documentation:**
- [API Specification](./api-specification.md) - Backend API contracts
- [Widget Catalog](./widget-catalog.md) - Available widget types
- [Architecture](./architecture.md) - System architecture

**Version:** 1.0.0  
**Last Updated:** January 23, 2026
