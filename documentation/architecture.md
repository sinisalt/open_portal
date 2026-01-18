# Architecture Documentation

## High-Level Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / Client                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           React Rendering Engine                      │  │
│  │  - Route Handler                                      │  │
│  │  - Widget Registry                                    │  │
│  │  - State Management                                   │  │
│  │  - Action Engine                                      │  │
│  │  - Cache Layer                                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                         HTTP / WebSocket
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Backend Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Service │  │ UI Config    │  │ Business     │     │
│  │              │  │ Service      │  │ Logic APIs   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Validation   │  │ Realtime     │  │ Config       │     │
│  │ Service      │  │ Events       │  │ Store        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Core Modules

#### 1. Runtime Router
- Matches routes (e.g., `/dashboard`, `/profile/:id`)
- Calls backend to fetch route configuration
- Uses cached configuration when valid
- Handles deep linking and redirect flows

#### 2. Config Cache
- Stores UI definitions (static) with ETag/hash/version
- Separates static layout/config from dynamic datasets
- IndexedDB or localStorage implementation
- Cache invalidation based on version changes

#### 3. State Store
- Manages page state, form state, widget state
- Supports optimistic updates
- Server reconciliation
- Background refresh capabilities

#### 4. Action Engine
Executes actions described in configuration:
- API calls
- Navigation
- Modal management (open/close)
- Validation triggers
- State mutations
- Toast notifications
- File downloads
- Action chaining and error handling

#### 5. Widget Registry
- Maps widget `type` to React component
- Enforces stable contract for each widget type
- Extensible for custom widgets
- Lazy loading support

#### 6. Data Layer
- Fetch policies and invalidation rules
- WebSocket/SSE subscriptions
- Query caching
- Data normalization

#### 7. Security & Policy Enforcement
- UI-level gating for menus and controls
- Permission-based visibility
- Backend-provided permissions
- Defense in depth (backend always authoritative)

## Backend Architecture

### Core Services

#### 1. Auth / Session / Token Service
- User authentication (credentials, OAuth)
- Session management
- Token generation and refresh
- Permission assignment

#### 2. UI Composition Service
Builds route/page configuration based on:
- User identity and permissions
- Tenant context
- Feature flags
- Role-based UI availability

#### 3. Business APIs
- Actual operations (CRUD, workflows, reports)
- Domain-specific logic
- Data transformation
- Integration with data sources

#### 4. Validation & Rules Service
- Field-level validation rules
- Cross-field validation
- Conditional visibility logic
- Business rule enforcement

#### 5. Events/Realtime Service
- WebSocket channel management
- Event topic subscriptions
- Data update notifications
- Live data streaming

#### 6. Config Store
- UI config templates
- Widget configurations
- Layout presets
- Tenant-specific overrides
- Version management

#### 7. Observability
- Audit trail of actions
- Config version tracking
- Error logging
- Performance metrics

## Data Flow

### Page Load Flow

1. **User navigates to route** (e.g., `/dashboard`)
2. **Router resolves route** → Backend `/ui/routes/resolve?path=/dashboard`
3. **Backend returns**: pageId, route params, permission check
4. **Frontend loads PageConfig**:
   - Check cache with ETag
   - Fetch if not cached or stale
5. **Execute datasources** based on fetch policies
6. **Render page** with widgets and data
7. **Subscribe to real-time updates** (if configured)

### Action Execution Flow

1. **User triggers event** (button click, form submit, etc.)
2. **Action Engine** identifies action from config
3. **Execute action**:
   - Validate inputs (client-side)
   - Call backend endpoint (if needed)
   - Backend validates (authoritative)
   - Backend returns result/patches
4. **Apply state updates**
5. **Trigger follow-up actions** (success/error handlers)
6. **Update UI** reactively

### Form Validation Flow

1. **User enters data** in form fields
2. **Client-side validation** runs (regex, required, etc.)
3. **On blur/debounce** (if configured), call server validation
4. **Server returns**:
   - Field-specific errors
   - Cross-field validation errors
   - Computed values
   - Visibility/enabled state changes
5. **UI updates** to show errors/warnings
6. **On submit**:
   - Final server validation
   - Business logic execution
   - Success/error response

## Configuration Model

### Static vs Dynamic Separation

#### Static (Cacheable)
- Page layout and widget tree
- Field definitions
- Validation rules
- Menu structure
- Action definitions
- Endpoint references
- Text labels (i18n keys)
- Theme tokens
- Datasource definitions

#### Dynamic (Refreshed)
- Table rows and data
- Chart series
- KPI values
- Form initial values
- Lookup results
- Real-time updates
- User-specific data

## Communication Protocols

### HTTP/REST
- Page configuration fetch
- Data queries
- Action execution
- Validation requests

### WebSocket
- Real-time data updates
- Live notifications
- Collaborative features
- Event streaming

### Caching Headers
- ETag for configuration versions
- Last-Modified timestamps
- Cache-Control directives
- Version identifiers

## Security Architecture

### Authentication
- Session-based or JWT tokens
- OAuth 2.0 integration
- Refresh token rotation
- Secure cookie handling

### Authorization
- Role-based access control (RBAC)
- Permission-based UI gating
- Field-level security
- Action-level authorization

### Defense in Depth
- Backend validates all operations
- Frontend enforces UI visibility
- Audit logging of all actions
- Input sanitization
- CSRF protection
- XSS prevention

## Caching Architecture

### Frontend Caching Strategy

#### Static Configuration (Long-lived Cache)
Cached in browser using IndexedDB or localStorage with ETag validation:

- **Page structures** - Widget tree, layout definitions
- **Form definitions** - Fields, validation rules, UI logic
- **Menu structures** - Navigation items, permissions
- **Action definitions** - Action handlers and flows
- **Datasource definitions** - Endpoint URLs, fetch policies (not the data)
- **Widget catalogs** - Available widget types and props
- **Theme configurations** - Colors, fonts, styling

**Cache Flow:**
```
1. Initial Request: GET /ui/pages/profile
   Response: 200 OK, ETag: "v1.2.3-abc123"
   → Store in IndexedDB with ETag

2. Subsequent Requests: GET /ui/pages/profile
   Request Header: If-None-Match: "v1.2.3-abc123"
   Response: 304 Not Modified
   → Use cached config

3. Config Updated: GET /ui/pages/profile
   Request Header: If-None-Match: "v1.2.3-abc123"
   Response: 200 OK, ETag: "v1.2.4-def456"
   → Update cache with new config
```

**Implementation:**
```typescript
// Frontend cache service
class ConfigCache {
  private db: IDBDatabase;
  
  async get(key: string, etag?: string): Promise<CachedConfig | null> {
    const cached = await this.db.get('configs', key);
    
    if (cached && etag && cached.etag === etag) {
      return cached.data;
    }
    
    return null;
  }
  
  async set(key: string, data: any, etag: string): Promise<void> {
    await this.db.put('configs', {
      key,
      data,
      etag,
      timestamp: Date.now()
    });
  }
}
```

#### Dynamic Data (Short-lived or No Cache)
Always fetched fresh or with short TTL:

- **User profile data** - Current values, real-time status
- **Table data** - Dynamic lists, search results
- **Form initial values** - Pre-populated form data
- **KPI values** - Real-time metrics
- **Notifications** - New/unread counts
- **Real-time updates** - WebSocket data

**Fetch Policy Options:**
- `onMount` - Fetch when component mounts
- `onDemand` - Fetch when explicitly triggered
- `polling` - Fetch at regular intervals
- `realtime` - Subscribe via WebSocket

### Backend Caching with Redis

#### Redis Cache Layers

**Layer 1: Page Configuration Cache**
```typescript
// Cache page configurations with long TTL
async function getPageConfig(pageId: string, userId: string): Promise<PageConfig> {
  const cacheKey = `page-config:${pageId}:${configVersion}`;
  
  // Try Redis first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Generate from templates/database
  const config = await generatePageConfig(pageId, userId);
  
  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(config));
  
  return config;
}
```

**Layer 2: User Session Cache**
```typescript
// Cache user session data
async function getUserSession(userId: string): Promise<UserSession> {
  const cacheKey = `user-session:${userId}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const session = await loadUserSession(userId);
  
  // Cache for 15 minutes
  await redis.setex(cacheKey, 900, JSON.stringify(session));
  
  return session;
}
```

**Layer 3: Permissions & Access Control Cache**
```typescript
// Cache user permissions
async function getUserPermissions(userId: string): Promise<string[]> {
  const cacheKey = `user-permissions:${userId}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const permissions = await fetchUserPermissions(userId);
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(permissions));
  
  return permissions;
}
```

**Layer 4: Query Result Cache**
```typescript
// Cache expensive query results
async function getCachedQuery(queryKey: string, query: () => Promise<any>, ttl: number = 60): Promise<any> {
  const cacheKey = `query:${queryKey}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const result = await query();
  
  await redis.setex(cacheKey, ttl, JSON.stringify(result));
  
  return result;
}

// Usage
const listings = await getCachedQuery(
  `listings:user:${userId}:active`,
  () => database.listings.findActive(userId),
  120 // 2 minutes TTL
);
```

#### Cache Invalidation Strategies

**Pattern 1: Version-based Invalidation**
```typescript
// Increment config version to invalidate all page configs
await redis.set('config-version', 'v1.2.4');

// All cached pages with old version become stale
// Clients will receive new ETag and fetch updated configs
```

**Pattern 2: Key-based Invalidation**
```typescript
// When user profile is updated
async function updateUserProfile(userId: string, updates: any): Promise<void> {
  await database.users.update(userId, updates);
  
  // Invalidate specific user caches
  await redis.del(`user-profile:${userId}`);
  await redis.del(`user-session:${userId}`);
  
  // Invalidate any user-specific page configs
  const keys = await redis.keys(`page-config:*:user:${userId}`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

**Pattern 3: Tag-based Invalidation**
```typescript
// Tag cache entries for bulk invalidation
await redis.sadd('cache-tags:user:user123', 'user-profile:user123');
await redis.sadd('cache-tags:user:user123', 'user-listings:user123');

// Invalidate all entries with tag
async function invalidateUserCache(userId: string): Promise<void> {
  const tagKey = `cache-tags:user:${userId}`;
  const keys = await redis.smembers(tagKey);
  
  if (keys.length > 0) {
    await redis.del(...keys);
    await redis.del(tagKey);
  }
}
```

**Pattern 4: Time-based Expiration**
```typescript
// Set different TTLs based on data volatility
const cacheTTL = {
  pageConfig: 3600,        // 1 hour (changes rarely)
  userSession: 900,        // 15 minutes (moderate change)
  permissions: 300,        // 5 minutes (changes occasionally)
  queryResults: 60,        // 1 minute (changes frequently)
  realtimeData: 10         // 10 seconds (very dynamic)
};
```

### Redis Configuration

**Production Setup:**
```yaml
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru  # Evict least recently used keys
appendonly yes                 # Enable persistence
appendfsync everysec          # Fsync every second
```

**Connection Pool:**
```typescript
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 5000,
    keepAlive: 5000
  },
  database: 0,
  password: process.env.REDIS_PASSWORD,
  retry_strategy: (options) => {
    if (options.attempt > 10) {
      return undefined; // Stop retrying
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

await redisClient.connect();
```

## Scalability Considerations

### Frontend
- Code splitting by route
- Lazy loading of widgets
- Service Worker for offline support
- IndexedDB for config caching (ETag-based)
- React Query for data caching and synchronization
- Virtualized lists/tables for large datasets
- Optimistic updates with background sync

### Backend
- Stateless API design
- Horizontal scaling (load balancer + multiple instances)
- Redis cluster for distributed caching
- CDN for static configs and assets
- Database query optimization with indexes
- Connection pooling (database and Redis)
- Event bus for real-time (Kafka, RabbitMQ)
- Rate limiting per user/IP
- Microservices for different domains (optional)

---

**Version:** 1.1
**Last Updated:** January 18, 2026

**Related Documents:**
- [API Specification](./api-specification.md) - Complete API endpoint definitions
- [Authentication Scenarios](./authentication-scenarios.md) - Detailed auth flows with examples
- [User Profile Scenarios](./user-profile-scenarios.md) - Profile workflows and caching
- [User Journey Scenarios](./user-journey-scenarios.md) - End-to-end user experiences
- [AI-First Implementation Plan](./ai-first-implementation-plan.md) - Development approach
- [Widget Catalog](./widget-catalog.md) - Available UI components
- [JSON Schemas](./json-schemas.md) - Configuration schemas

