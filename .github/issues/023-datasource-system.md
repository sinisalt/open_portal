# Issue #023: Datasource System and HTTP Datasource

**Phase:** Phase 1 - Core Platform (MVP Renderer)  
**Weeks:** 9-10  
**Component:** Frontend  
**Estimated Effort:** 5 days  
**Priority:** High  
**Labels:** phase-1, frontend, data-layer

## Description
Implement the datasource system that manages data fetching, caching, and state for widgets. Includes HTTP datasource implementation with fetch policies and caching.

## Acceptance Criteria
- [ ] Datasource registry system
- [ ] HTTP datasource implementation
- [ ] Fetch policy enforcement
- [ ] Query caching
- [ ] Loading state management
- [ ] Error handling
- [ ] Data transformation support
- [ ] Refetch functionality
- [ ] Cache invalidation
- [ ] Dependent datasources support

## Datasource Configuration
```typescript
{
  id: string;
  type: "http" | "websocket" | "static";
  config: {
    url: string;
    method?: "GET" | "POST";
    headers?: Record<string, string>;
    body?: any;
    queryParams?: Record<string, any>;
  };
  fetchPolicy?: "cache-first" | "network-only" | "cache-and-network" | "no-cache";
  cacheTime?: number; // milliseconds
  refetchInterval?: number; // Auto-refetch interval
  enabled?: boolean; // Conditional fetching
  depends?: string[]; // Other datasource IDs
  transform?: string; // Data transformation expression
}
```

## Fetch Policies
- **cache-first**: Use cache if available, fetch if not
- **network-only**: Always fetch, update cache
- **cache-and-network**: Return cache immediately, fetch in background
- **no-cache**: Always fetch, don't cache

## Datasource State
```typescript
{
  data: any;
  loading: boolean;
  error: Error | null;
  isStale: boolean;
  lastFetched: number;
  refetch: () => Promise<void>;
  invalidate: () => void;
}
```

## Core Features
- [ ] Datasource registration
- [ ] Automatic fetching on mount
- [ ] Manual refetch support
- [ ] Cache management
- [ ] TTL-based cache invalidation
- [ ] Dependent datasource chaining
- [ ] Conditional fetching (enabled flag)
- [ ] Parameter interpolation
- [ ] Background refetching
- [ ] Optimistic updates

## Dependencies
- Depends on: #009 (Token management for auth)
- Depends on: #021 (apiCall action for HTTP)

## HTTP Datasource Features
- [ ] GET/POST support
- [ ] Query parameters
- [ ] Request headers
- [ ] Authentication token injection
- [ ] Response transformation
- [ ] Error handling
- [ ] Retry logic
- [ ] Request cancellation

## Caching Strategy
- [ ] In-memory cache
- [ ] Cache key generation
- [ ] Cache size limits
- [ ] LRU eviction
- [ ] Manual cache clearing
- [ ] Per-datasource TTL

## Data Transformation
Support simple transformations:
```typescript
{
  transform: "data.results" // Extract nested data
}
```

## Dependent Datasources
```typescript
{
  id: "userDetails",
  depends: ["userId"],
  config: {
    url: "/api/users/{{datasources.userId.data.id}}"
  }
}
```

## Testing Requirements
- [ ] Unit tests for datasource system
- [ ] Test each fetch policy
- [ ] Test caching behavior
- [ ] Test dependent datasources
- [ ] Test error scenarios
- [ ] Test data transformation
- [ ] Integration tests with widgets

## Documentation
- [ ] Datasource system architecture
- [ ] Configuration guide
- [ ] Fetch policies explained
- [ ] Caching strategy
- [ ] Transformation guide
- [ ] Common patterns

## Deliverables
- Datasource system framework
- HTTP datasource implementation
- Caching layer
- Tests
- Documentation
