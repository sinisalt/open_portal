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

## Scalability Considerations

### Frontend
- Code splitting by route
- Lazy loading of widgets
- Service Worker for offline support
- IndexedDB for large datasets
- Virtualized lists/tables

### Backend
- Stateless API design
- Horizontal scaling
- Config caching (Redis)
- CDN for static configs
- Database query optimization
- Event bus for real-time (Kafka, RabbitMQ)

---

**Version:** 1.0
**Last Updated:** January 2026
