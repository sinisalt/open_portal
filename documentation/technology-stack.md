# OpenPortal Technology Stack

**Version:** 1.0  
**Last Updated:** January 20, 2026  
**Status:** Finalized

## Overview

This document outlines all technology choices for the OpenPortal platform, including rationale, alternatives considered, and risk mitigation strategies. All major decisions are documented as Architecture Decision Records (ADRs) in the `/documentation/adr/` directory.

### Project Scope

**OpenPortal is a frontend-only project** focused on building a configuration-driven UI rendering engine. The frontend is **backend-agnostic** and can work with any backend technology stack that implements the required API contracts.

The backend stack documented in this file is **for demonstration and testing purposes only**. It provides a minimalist reference implementation in Node.js to showcase all frontend features during development.

**Backend SDKs/Libraries** will be created as **separate sub-projects** for different backend technologies:
- **.NET SDK** - For ASP.NET Core / .NET applications
- **PHP SDK** - For Laravel and PHP applications
- **Additional SDKs** - Can be added for other backend technologies as needed

Each SDK will implement the OpenPortal API specification, allowing backend developers to integrate with the frontend in their preferred technology stack.

## Technology Stack Summary

### Frontend Stack

| Category | Technology | Version | Rationale |
|----------|-----------|---------|-----------|
| **Framework** | React | 19.2.3 | Industry standard, excellent performance, large ecosystem |
| **Build Tool** | Create React App | 5.0.1 | Simplicity, zero configuration, focus on development |
| **State Management** | React Context API + Hooks | Built-in | Lightweight, sufficient for configuration-driven architecture |
| **UI Components** | Custom Widget Library | - | Full control, configuration-driven design, no external constraints |
| **Routing** | React Router | 6.x | De facto standard, excellent documentation, v6 improvements |
| **Forms** | React Hook Form | 7.x | Minimal re-renders, excellent performance, small bundle size |
| **HTTP Client** | Fetch API + Custom Wrapper | Native | Native browser API, no extra dependencies, sufficient for needs |
| **WebSocket** | Native WebSocket API | Native | Lightweight, direct control, no abstraction overhead |
| **Testing** | Jest + React Testing Library | Built-in | Industry standard, Create React App default, excellent support |
| **E2E Testing** | Playwright | Latest | Modern, multi-browser, excellent developer experience |
| **Type System** | TypeScript | 4.x+ | Type safety for configuration contracts, improved DX |
| **Linting** | ESLint | Built-in | Code quality, catch errors early, team consistency |
| **Formatting** | Prettier | 2.x | Code consistency, automated formatting |
| **CSS Approach** | CSS Modules | Built-in | Component-scoped styles, no global conflicts, built-in support |

### Test Backend Stack (For Development/Demo Only)

**Note:** This is a **minimalist test backend** for demonstrating frontend features during development. OpenPortal is backend-agnostic and can work with any backend that implements the API contracts. Production backends should be implemented using the appropriate SDK for your technology stack (see Backend SDKs section below).

| Category | Technology | Rationale |
|----------|-----------|-----------|
| **Runtime** | Node.js 18+ LTS | Simplicity for test backend, JavaScript/TypeScript consistency |
| **Framework** | Express.js | Lightweight, flexible, minimal setup |
| **Database** | PostgreSQL 14+ | Robust, JSONB support for configurations, excellent performance |
| **ORM** | Prisma | Type-safe, excellent DX, migration support |
| **Caching** | Redis 7+ | Fast, versatile, session storage, config caching |
| **WebSocket** | ws (WebSocket library) | Lightweight, standards-compliant, good performance |
| **Authentication** | JWT + Refresh Tokens | Stateless, scalable, industry standard |
| **API Docs** | OpenAPI 3.0 (Swagger) | Standard specification, auto-generated documentation |
| **Validation** | Zod | TypeScript-first, excellent DX, shared with frontend |
| **Testing** | Jest | Consistency with frontend, excellent ecosystem |
| **Logging** | Pino | High performance, structured logging, JSON output |

### Backend SDKs (Separate Sub-Projects)

OpenPortal backend SDKs will be developed as **separate repositories/packages** to enable integration with various backend technologies:

| SDK | Technology | Repository | Status |
|-----|-----------|------------|--------|
| **.NET SDK** | ASP.NET Core / .NET | `openportal-dotnet-sdk` | 📋 Planned |
| **PHP SDK** | Laravel / PHP | `openportal-php-sdk` | 📋 Planned |
| **Node.js SDK** | Express / NestJS | `openportal-node-sdk` | 📋 Planned |
| **Java SDK** | Spring Boot | `openportal-java-sdk` | 🔄 Future |
| **Python SDK** | FastAPI / Django | `openportal-python-sdk` | 🔄 Future |

Each SDK will provide:
- Implementation of OpenPortal API specification
- Configuration management and storage
- Authentication and authorization helpers
- WebSocket event handling
- Validation utilities
- Documentation and examples

**Development Priority:**
1. **.NET SDK** - High priority for enterprise applications
2. **PHP/Laravel SDK** - High priority for web applications
3. **Node.js SDK** - Extract from test backend as reference implementation
4. Additional SDKs based on demand

### Infrastructure

| Category | Technology | Rationale |
|----------|-----------|-----------|
| **Version Control** | Git (trunk-based) | Simple workflow, continuous integration friendly |
| **CI/CD** | GitHub Actions | Native integration, free for public repos, flexible |
| **Containers** | Docker | Standardized environments, deployment flexibility |
| **Orchestration** | Docker Compose (dev) | Simple for development, easy to run locally |
| **Monitoring** | TBD | Decision deferred to deployment phase |
| **Error Tracking** | TBD | Decision deferred to deployment phase |

## Frontend Technology Decisions

### 1. Build Tool: Create React App

**Decision:** Continue using Create React App (CRA) 5.0.1

**Rationale:**
- Already in place and working
- Zero configuration needed
- Focus on development, not build tooling
- Sufficient for MVP and Phase 1
- Can migrate to Vite later if needed

**Alternatives Considered:**
- **Vite**: Faster dev server, better performance, but requires migration effort
- **Next.js**: Adds SSR complexity we don't need (configuration-driven SPA)

**Risk Mitigation:**
- CRA is stable but slower than Vite
- Migration path to Vite documented for future consideration
- Performance acceptable for current project phase

**ADR:** See [ADR-001: Build Tool Selection](./adr/ADR-001-build-tool.md)

### 2. State Management: React Context API + Hooks

**Decision:** Use React Context API with useContext and useState/useReducer hooks

**Rationale:**
- Configuration-driven architecture means minimal state management needs
- Most state is ephemeral (page state, form state, widget state)
- Context API sufficient for sharing user context, theme, tenant info
- No need for heavy state management library
- Reduces bundle size and complexity

**State Structure:**
```javascript
// Global contexts:
- AuthContext (user, tenant, permissions)
- ThemeContext (branding, colors, fonts)
- ConfigContext (cached configurations)

// Page-level state:
- useState for component state
- useReducer for complex page state
- Custom hooks for shared logic
```

**Alternatives Considered:**
- **Redux Toolkit**: Robust but overkill for configuration-driven UI
- **Zustand**: Lightweight but unnecessary for our use case
- **Jotai**: Atomic state, but adds complexity we don't need

**Risk Mitigation:**
- If state management becomes complex, migrate to Zustand (lightweight, easy migration)
- Document state management patterns in coding standards
- Use custom hooks to encapsulate complex state logic

**ADR:** See [ADR-002: State Management](./adr/ADR-002-state-management.md)

### 3. UI Component Library: Custom Widget Library

**Decision:** Build custom widget library from scratch

**Rationale:**
- **Configuration-driven requirements**: Need complete control over widget contracts
- **Stable contracts**: External libraries have breaking changes
- **No unnecessary features**: UI libraries include features we won't use
- **Bundle size**: Custom library only includes what we need
- **Design flexibility**: Not constrained by library design patterns
- **Learning**: Team learns component architecture deeply

**Widget Categories (12 Core MVP Widgets):**
1. Layout: Page, Section, Grid, Card
2. Form Inputs: TextInput, Select, DatePicker, Checkbox
3. Data Display: Table, KPI
4. Dialogs: Modal, Toast

**Alternatives Considered:**
- **Material-UI (MUI)**: Popular but heavy, opinionated design, bundle size concerns
- **Ant Design**: Enterprise focus, but Chinese design language may not fit
- **Chakra UI**: Good DX, but adds abstraction layer over our configuration model

**Risk Mitigation:**
- Higher initial development effort
- Document all widget contracts in widget-catalog.md
- Create comprehensive component tests
- Build incrementally, starting with MVP widgets
- Consider using headless UI libraries for complex widgets (e.g., Radix UI, Headless UI)

**ADR:** See [ADR-003: UI Component Library](./adr/ADR-003-ui-component-library.md)

### 4. Routing: React Router v6

**Decision:** Use React Router v6

**Rationale:**
- De facto standard for React routing
- Excellent documentation and community support
- v6 improvements: better hooks API, simplified nested routes
- Matches our architecture (dynamic route resolution)
- Supports route params, query params, deep linking

**Integration with OpenPortal:**
```javascript
// Dynamic route configuration from backend
<Route path="/dashboard" element={<PageRenderer pageId="dashboard" />} />
<Route path="/profile/:userId" element={<PageRenderer pageId="profile" />} />

// Route resolver fetches page config from backend
useEffect(() => {
  fetch(`/ui/routes/resolve?path=${location.pathname}`)
    .then(res => res.json())
    .then(config => renderPage(config));
}, [location]);
```

**Alternatives Considered:**
- **TanStack Router**: Type-safe routing, but newer and less mature
- **Wouter**: Lightweight, but lacks features we need

**Risk Mitigation:**
- React Router is stable and well-maintained
- Large ecosystem and community support
- Easy to migrate to v7 when released

**ADR:** See [ADR-004: Routing Library](./adr/ADR-004-routing.md)

### 5. Form Management: React Hook Form

**Decision:** Use React Hook Form 7.x

**Rationale:**
- **Minimal re-renders**: Uses uncontrolled components, excellent performance
- **Small bundle size**: ~8KB minified
- **Excellent validation**: Integrates with Zod for schema validation
- **Configuration-friendly**: Easy to build forms from JSON configuration
- **Field-level validation**: Supports our validation rule system

**Integration with OpenPortal:**
```javascript
// Form config from backend
{
  "type": "Form",
  "fields": [
    { "name": "email", "type": "TextInput", "validation": {...} }
  ]
}

// React Hook Form usage
const { register, handleSubmit, formState } = useForm();
<input {...register("email", { required: true, pattern: /email-regex/ })} />
```

**Alternatives Considered:**
- **Formik**: Popular but more re-renders, larger bundle
- **Custom solution**: Too much effort, reinventing the wheel

**Risk Mitigation:**
- React Hook Form is stable and well-maintained
- Excellent TypeScript support
- Can integrate with our action engine for form submission

**ADR:** See [ADR-005: Form Management](./adr/ADR-005-forms.md)

### 6. HTTP Client: Native Fetch API + Custom Wrapper

**Decision:** Use native Fetch API with custom wrapper functions

**Rationale:**
- **Native browser API**: No extra dependencies
- **Sufficient for needs**: Our API interaction is straightforward
- **Custom wrapper**: Add error handling, authentication, caching logic
- **Bundle size**: Zero additional KB

**Custom Wrapper Features:**
```javascript
// Custom fetch wrapper
- Automatic token injection (Authorization header)
- Error handling and retry logic
- ETag caching support
- Request/response interceptors
- JSON serialization/deserialization
- Timeout handling
```

**Alternatives Considered:**
- **Axios**: Popular but adds ~13KB, provides features we can build ourselves
- **TanStack Query**: Excellent for data fetching, but overkill for configuration-driven UI
- **SWR**: Good for data synchronization, but we have specific caching needs

**Risk Mitigation:**
- Document custom wrapper thoroughly
- Add comprehensive error handling
- Consider TanStack Query for Phase 2 if data fetching becomes complex

**ADR:** See [ADR-006: HTTP Client](./adr/ADR-006-http-client.md)

### 7. WebSocket Client: Native WebSocket API

**Decision:** Use native WebSocket API with custom reconnection logic

**Rationale:**
- **Native browser API**: No dependencies
- **Full control**: Custom reconnection, heartbeat, error handling
- **Lightweight**: Zero bundle size impact
- **Standards-compliant**: Works with any WebSocket server

**Custom WebSocket Manager:**
```javascript
class WebSocketManager {
  - Connection management (connect, disconnect, reconnect)
  - Exponential backoff reconnection
  - Heartbeat/ping-pong for connection health
  - Message queue for offline messages
  - Subscription management (topic-based)
  - Error handling and recovery
}
```

**Alternatives Considered:**
- **Socket.IO Client**: Popular but adds ~30KB, includes features we don't need
- **Reconnecting WebSocket**: Lightweight wrapper, but we can build ourselves

**Risk Mitigation:**
- Implement comprehensive reconnection logic
- Add heartbeat mechanism
- Test edge cases (disconnect, reconnect, network issues)
- Consider Socket.IO if requirements become more complex

**ADR:** See [ADR-007: WebSocket Client](./adr/ADR-007-websocket.md)

### 8. Testing: Jest + React Testing Library

**Decision:** Use Jest and React Testing Library (included with Create React App)

**Rationale:**
- **Industry standard**: Most popular testing combination for React
- **Built-in**: Comes with Create React App, zero configuration
- **Excellent documentation**: Large community, many examples
- **Testing best practices**: Encourages testing from user perspective
- **Accessibility testing**: Supports a11y queries

**Testing Strategy:**
- **Unit tests**: Individual widget components
- **Integration tests**: Widget interaction with action engine, state
- **End-to-end tests**: Full page rendering from configuration
- **Coverage target**: 80%+ for core widgets and engine

**Alternatives Considered:**
- **Vitest**: Faster, but requires migration from Jest
- **Testing Library alone**: Need test runner, Jest provides it

**Risk Mitigation:**
- Jest is stable and well-maintained
- Can migrate to Vitest later if needed
- Large ecosystem for mocking and testing utilities

**ADR:** See [ADR-008: Testing Framework](./adr/ADR-008-testing.md)

### 9. E2E Testing: Playwright

**Decision:** Use Playwright for end-to-end testing

**Rationale:**
- **Modern and fast**: Better developer experience than Cypress
- **Multi-browser**: Tests Chrome, Firefox, Safari automatically
- **Auto-wait**: Reduces flaky tests
- **Excellent debugging**: Inspector, trace viewer, video recording
- **TypeScript support**: First-class TypeScript support

**E2E Testing Strategy:**
```javascript
// Test scenarios:
1. User login → Dashboard load → Navigate to profile
2. Form submission → Validation → Success toast
3. Table interaction → Sort → Filter → Pagination
4. Modal open → Form fill → Submit → Modal close
5. Real-time updates → WebSocket message → UI update
```

**Alternatives Considered:**
- **Cypress**: Popular but slower, only tests Chrome by default
- **Selenium**: Older, more complex setup

**Risk Mitigation:**
- Playwright is actively maintained by Microsoft
- Run E2E tests in CI/CD pipeline
- Keep E2E tests focused on critical user flows

**ADR:** See [ADR-009: E2E Testing](./adr/ADR-009-e2e-testing.md)

### 10. CSS Approach: CSS Modules

**Decision:** Use CSS Modules (built-in with Create React App)

**Rationale:**
- **Built-in support**: Zero configuration with CRA
- **Component-scoped styles**: No global namespace conflicts
- **Performance**: No runtime overhead (unlike CSS-in-JS)
- **Familiar syntax**: Regular CSS/SCSS, easy to learn
- **Theming support**: CSS variables for dynamic theming

**Theming Strategy:**
```css
/* Global theme variables */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --font-family: 'Inter', sans-serif;
}

/* Component uses theme variables */
.button {
  background-color: var(--primary-color);
  font-family: var(--font-family);
}

/* Dynamic theme injection from branding config */
const theme = brandingConfig.theme;
document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
```

**Alternatives Considered:**
- **Styled Components**: Popular but runtime overhead, bundle size increase
- **Tailwind CSS**: Utility-first, but verbose in configuration-driven UI
- **Emotion**: Similar to Styled Components, CSS-in-JS approach

**Risk Mitigation:**
- CSS Modules is mature and stable
- Can use SCSS for advanced features if needed
- CSS custom properties provide theming flexibility

**ADR:** See [ADR-010: CSS Approach](./adr/ADR-010-css-approach.md)

### 11. TypeScript: Strict Mode Configuration

**Decision:** Use TypeScript with strict mode enabled

**Rationale:**
- **Type safety**: Catch errors at compile time
- **Configuration contracts**: Strongly-typed widget props, action configs
- **Better DX**: Autocomplete, refactoring support
- **Documentation**: Types serve as inline documentation
- **Team consistency**: Enforced coding standards

**TypeScript Configuration:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Key Type Definitions:**
- `WidgetConfig` - Base configuration for all widgets
- `ActionConfig` - Action definition types
- `DatasourceConfig` - Data source configurations
- `PageConfig` - Page structure definition

**ADR:** See [ADR-011: TypeScript Configuration](./adr/ADR-011-typescript.md)

### 12. Code Quality: ESLint + Prettier

**Decision:** Use ESLint for linting and Prettier for formatting

**Rationale:**
- **Built-in**: ESLint comes with Create React App
- **Code consistency**: Automated formatting and linting
- **Catch errors**: ESLint catches potential bugs
- **Team consistency**: Same code style across team
- **Git integration**: Pre-commit hooks for formatting

**ESLint Configuration:**
```json
{
  "extends": [
    "react-app",
    "react-app/jest",
    "plugin:jsx-a11y/recommended"
  ],
  "plugins": ["jsx-a11y"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error"
  }
}
```

**Prettier Configuration:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**ADR:** See [ADR-012: Code Quality Tools](./adr/ADR-012-code-quality.md)

## Test Backend Technology Decisions

**Important:** These decisions are for the **minimalist test backend** used during development and demonstration. OpenPortal is a **frontend-only project** that is **backend-agnostic**. Production implementations should use the appropriate backend SDK for your technology stack (.NET, PHP/Laravel, etc.).

The test backend serves these purposes:
- Demonstrate all frontend features during development
- Provide reference implementation of the API specification
- Enable local development and testing without external dependencies
- Serve as basis for the Node.js SDK

### 1. Runtime: Node.js 18+ LTS (Test Backend Only)

**Decision:** Use Node.js 18 or later (LTS versions) for the test backend

**Rationale:**
- **Simplicity**: Quick to set up for demonstration purposes
- **JavaScript consistency**: Same language as frontend for this project
- **TypeScript support**: Share types between frontend and test backend
- **JSON native**: Perfect for JSON configuration handling
- **Development speed**: Fast to implement test API endpoints

**Note:** For production backends, use the appropriate SDK for your technology stack (.NET, PHP/Laravel, Java, Python, etc.).

**Alternatives Considered:**
- **Python + FastAPI**: Good choice, but Node.js simpler for test backend
- **Go**: Excellent performance, but more complex for simple test backend
- **.NET or PHP**: Could use, but Node.js faster to set up for this project

**ADR:** See [ADR-013: Backend Runtime](./adr/ADR-013-backend-runtime.md)

### 2. Framework: Express.js (Test Backend Only)

**Decision:** Use Express.js as the backend framework

**Rationale:**
- **Lightweight**: Minimal overhead, flexible
- **Well-understood**: Large community, extensive documentation
- **Middleware ecosystem**: Authentication, validation, logging, etc.
- **API-focused**: Perfect for REST API and WebSocket integration
- **Unopinionated**: Flexibility to structure as needed

**API Structure:**
```javascript
app.get('/ui/bootstrap', authMiddleware, bootstrapController);
app.get('/ui/routes/resolve', authMiddleware, routeResolverController);
app.get('/ui/pages/:pageId', authMiddleware, cacheMiddleware, pageController);
app.post('/ui/actions/execute', authMiddleware, actionController);
app.get('/ui/branding', authMiddleware, brandingController);
```

**Alternatives Considered:**
- **NestJS**: TypeScript-first, but more opinionated and heavier
- **Fastify**: Faster than Express, but smaller ecosystem

**ADR:** See [ADR-014: Backend Framework](./adr/ADR-014-backend-framework.md)

### 3. Database: PostgreSQL 14+ (Test Backend Only)

**Decision:** Use PostgreSQL 14 or later for the test backend

**Rationale:**
- **Robust and mature**: Industry-standard, battle-tested
- **JSONB support**: Perfect for storing UI configurations
- **Performance**: Excellent query performance, indexing
- **ACID compliance**: Data integrity guarantees
- **Rich features**: Arrays, full-text search, triggers, etc.

**Schema Design:**
```sql
-- Pages table
CREATE TABLE pages (
  page_id VARCHAR PRIMARY KEY,
  config JSONB NOT NULL,
  version VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tenants table
CREATE TABLE tenants (
  tenant_id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  branding_version VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tenant branding table
CREATE TABLE tenant_branding (
  tenant_id VARCHAR PRIMARY KEY REFERENCES tenants(tenant_id),
  branding JSONB NOT NULL,
  version VARCHAR NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Alternatives Considered:**
- **MySQL**: Similar features, but JSONB support less mature
- **MongoDB**: Document database, but we need relational features

**ADR:** See [ADR-015: Database Selection](./adr/ADR-015-database.md)

### 4. ORM: Prisma (Test Backend Only)

**Decision:** Use Prisma as the ORM for the test backend

**Rationale:**
- **TypeScript-first**: Auto-generated types from schema
- **Excellent DX**: Intuitive API, great tooling
- **Migration support**: Database schema migrations
- **Type safety**: Compile-time query validation
- **Performance**: Efficient queries, connection pooling

**Prisma Schema Example:**
```prisma
model Page {
  pageId    String   @id @map("page_id")
  config    Json
  version   String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("pages")
}

model Tenant {
  tenantId        String   @id @map("tenant_id")
  name            String
  brandingVersion String?  @map("branding_version")
  createdAt       DateTime @default(now()) @map("created_at")
  branding        TenantBranding?

  @@map("tenants")
}
```

**Alternatives Considered:**
- **TypeORM**: More mature, but less intuitive API
- **Sequelize**: Popular, but not TypeScript-first

**ADR:** See [ADR-016: ORM Selection](./adr/ADR-016-orm.md)

### 5. Caching: Redis 7+

**Decision:** Use Redis for caching and session storage

**Rationale:**
- **Fast**: In-memory storage, sub-millisecond latency
- **Versatile**: Caching, sessions, pub/sub, rate limiting
- **Reliable**: Mature, battle-tested, widely used
- **Scalable**: Clustering support, replication
- **Data structures**: Strings, hashes, lists, sets, sorted sets

**Use Cases:**
```javascript
// Configuration caching
redis.set(`page:${pageId}:${version}`, JSON.stringify(pageConfig), 'EX', 3600);

// Session storage
redis.set(`session:${sessionId}`, JSON.stringify(session), 'EX', 86400);

// Rate limiting
redis.incr(`rate_limit:${userId}:${endpoint}`, 'EX', 60);

// Real-time pub/sub
redis.publish('ui-updates', JSON.stringify({ pageId, action: 'refresh' }));
```

**Alternatives Considered:**
- **In-memory caching**: Simple, but doesn't scale across instances
- **Memcached**: Fast, but less versatile than Redis

**ADR:** See [ADR-017: Caching Solution](./adr/ADR-017-caching.md)

### 6. WebSocket Server: ws (Test Backend Only)

**Decision:** Use `ws` library for WebSocket server in the test backend

**Rationale:**
- **Lightweight**: Minimal overhead, standards-compliant
- **Performance**: Fast, efficient, low memory usage
- **Flexibility**: Full control over WebSocket behavior
- **Well-maintained**: Active development, stable

**WebSocket Server Setup:**
```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: httpServer });

wss.on('connection', (ws, req) => {
  const userId = authenticateWebSocket(req);
  
  ws.on('message', (message) => {
    handleWebSocketMessage(userId, message);
  });
  
  ws.on('close', () => {
    cleanupUserConnection(userId);
  });
});

// Broadcast to specific user
function sendToUser(userId, message) {
  const client = userConnections.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  }
}
```

**Alternatives Considered:**
- **Socket.IO**: Feature-rich, but adds overhead we don't need
- **uWebSockets.js**: Extremely fast, but C++ dependency concerns

**ADR:** See [ADR-018: WebSocket Server](./adr/ADR-018-websocket-server.md)

### 7. Authentication: JWT + Refresh Tokens (Test Backend Only)

**Decision:** Use JWT (JSON Web Tokens) with refresh token rotation in the test backend

**Rationale:**
- **Stateless**: No server-side session storage (except refresh tokens)
- **Scalable**: Works across multiple servers
- **Standard**: Industry standard, well-understood
- **Secure**: Signed tokens, short-lived access tokens

**Authentication Flow:**
```javascript
// Login
POST /auth/login
Response: { accessToken, refreshToken, expiresIn }

// Access token (short-lived, 15 minutes)
Authorization: Bearer <accessToken>

// Refresh token (long-lived, 7 days, stored in httpOnly cookie)
POST /auth/refresh
Cookie: refreshToken=<refreshToken>
Response: { accessToken, expiresIn }

// Token structure
{
  userId: "user123",
  tenantId: "tenant456",
  permissions: ["read:pages", "write:forms"],
  iat: 1234567890,
  exp: 1234568790
}
```

**Security Measures:**
- Access tokens: Short-lived (15 minutes)
- Refresh tokens: Stored in httpOnly, secure cookies
- Refresh token rotation: New refresh token on each refresh
- Token revocation: Blacklist in Redis for logout

**Alternatives Considered:**
- **Session-based**: Simpler, but requires server-side storage, less scalable
- **OAuth 2.0 only**: Good for third-party auth, but need own auth too

**ADR:** See [ADR-019: Authentication Strategy](./adr/ADR-019-authentication.md)

### 8. API Documentation: OpenAPI 3.0 (Swagger)

**Decision:** Use OpenAPI 3.0 specification with Swagger UI

**Note:** The OpenAPI specification defines the API contracts that all backend SDKs must implement. This ensures consistency across different backend technologies (.NET, PHP/Laravel, Node.js, etc.).

**Rationale:**
- **Standard specification**: Industry standard for REST APIs
- **Auto-generated docs**: Generate docs from code or vice versa
- **Interactive**: Swagger UI allows API testing
- **Contract-first**: Define API contract before implementation
- **Tooling**: Code generation, validation, mocking

**Example OpenAPI Spec:**
```yaml
openapi: 3.0.0
info:
  title: OpenPortal API
  version: 1.0.0
paths:
  /ui/pages/{pageId}:
    get:
      summary: Get page configuration
      parameters:
        - name: pageId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Page configuration
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PageConfig'
```

**ADR:** See [ADR-020: API Documentation](./adr/ADR-020-api-documentation.md)

### 9. Validation: Zod

**Decision:** Use Zod for runtime validation (shared with frontend)

**Rationale:**
- **TypeScript-first**: Auto-infer TypeScript types from schemas
- **Shared validation**: Use same schemas on frontend and backend
- **Excellent DX**: Intuitive API, great error messages
- **Runtime validation**: Catch invalid data at runtime
- **Composable**: Build complex schemas from simple ones

**Validation Example:**
```typescript
import { z } from 'zod';

// Define schema
const PageConfigSchema = z.object({
  pageId: z.string(),
  title: z.string(),
  widgets: z.array(WidgetConfigSchema),
  datasources: z.array(DatasourceConfigSchema).optional(),
});

// Validate
const result = PageConfigSchema.safeParse(data);
if (!result.success) {
  console.error(result.error.issues);
}

// Type inference
type PageConfig = z.infer<typeof PageConfigSchema>;
```

**Alternatives Considered:**
- **Joi**: Popular, but not TypeScript-first
- **Yup**: Good, but Zod has better TypeScript integration
- **AJV (JSON Schema)**: Fast, but less intuitive API

**ADR:** See [ADR-021: Validation Library](./adr/ADR-021-validation.md)

### 10. Testing: Jest (Test Backend Only)

**Decision:** Use Jest for test backend testing (consistency with frontend)

**Rationale:**
- **Consistency**: Same testing framework as frontend
- **Excellent ecosystem**: Mocking, coverage, matchers
- **Fast**: Parallel test execution
- **Well-documented**: Large community, many examples

**Testing Strategy:**
- **Unit tests**: Individual functions, utilities
- **Integration tests**: API endpoints, database queries
- **E2E tests**: Full request/response flows
- **Coverage target**: 80%+ for core APIs

**ADR:** See [ADR-022: Backend Testing](./adr/ADR-022-backend-testing.md)

### 11. Logging: Pino (Test Backend Only)

**Decision:** Use Pino for structured logging in the test backend

**Rationale:**
- **High performance**: Fastest Node.js logger
- **Structured logging**: JSON output, easy to parse
- **Low overhead**: Minimal performance impact
- **Child loggers**: Contextual logging
- **Transports**: Send logs to various destinations

**Logging Example:**
```javascript
const pino = require('pino');
const logger = pino({ level: 'info' });

// Structured logging
logger.info({ userId, pageId, duration }, 'Page loaded');

// Error logging
logger.error({ err, userId, action }, 'Action execution failed');

// Child logger with context
const requestLogger = logger.child({ requestId, userId });
requestLogger.info('Processing request');
```

**ADR:** See [ADR-023: Logging Library](./adr/ADR-023-logging.md)

## Infrastructure Decisions

### 1. Version Control Workflow: Trunk-Based Development

**Decision:** Use trunk-based development with short-lived feature branches

**Rationale:**
- **Simple workflow**: No complex branching strategies
- **Continuous integration**: Frequent merges to main branch
- **Fast feedback**: Quick detection of integration issues
- **Feature flags**: Enable/disable features without branches

**Workflow:**
```
main (protected)
  ├── feature/widget-table (1-2 days, then merge)
  ├── feature/action-engine (1-2 days, then merge)
  └── hotfix/auth-bug (merge immediately)
```

**Alternatives Considered:**
- **GitFlow**: Too complex, long-lived branches, slow integration
- **GitHub Flow**: Similar to trunk-based, but allows longer branches

**ADR:** See [ADR-024: Git Workflow](./adr/ADR-024-git-workflow.md)

### 2. CI/CD: GitHub Actions

**Decision:** Use GitHub Actions for continuous integration and deployment

**Rationale:**
- **Native integration**: Built into GitHub
- **Free for public repos**: Cost-effective
- **Flexible**: YAML configuration, reusable workflows
- **Ecosystem**: Many pre-built actions
- **Matrix builds**: Test across multiple environments

**CI/CD Pipeline:**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
```

**ADR:** See [ADR-025: CI/CD Platform](./adr/ADR-025-ci-cd.md)

### 3. Containerization: Docker

**Decision:** Use Docker for containerization

**Rationale:**
- **Standardized environments**: Same environment everywhere
- **Deployment flexibility**: Deploy anywhere that runs Docker
- **Development parity**: Dev environment matches production
- **Isolation**: Dependencies contained, no conflicts

**Docker Setup:**
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
CMD ["npm", "start"]

# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["node", "server.js"]
```

**ADR:** See [ADR-026: Containerization](./adr/ADR-026-docker.md)

### 4. Development Orchestration: Docker Compose

**Decision:** Use Docker Compose for local development environment

**Rationale:**
- **Simple setup**: One command to start everything
- **Service orchestration**: Frontend, backend, database, Redis
- **Environment consistency**: Same setup for all developers
- **Easy onboarding**: New developers start quickly

**Docker Compose Example:**
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    depends_on:
      - postgres
      - redis
  postgres:
    image: postgres:14
    environment:
      POSTGRES_PASSWORD: password
    volumes:
      - postgres-data:/var/lib/postgresql/data
  redis:
    image: redis:7
    ports:
      - "6379:6379"
```

**ADR:** See [ADR-027: Development Environment](./adr/ADR-027-development-environment.md)

### 5. Monitoring & Error Tracking: Deferred

**Decision:** Defer monitoring and error tracking decisions until deployment phase

**Rationale:**
- **Not critical for MVP**: Focus on core functionality first
- **Depends on deployment**: Choice depends on where we deploy
- **Evaluate later**: More information available at deployment time

**Options to Evaluate Later:**
- **Monitoring**: Datadog, New Relic, Prometheus + Grafana, Cloud-native solutions
- **Error Tracking**: Sentry, Rollbar, LogRocket, Cloud-native solutions

**ADR:** See [ADR-028: Monitoring and Error Tracking](./adr/ADR-028-monitoring.md)

## Dependencies Summary

### Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-router-dom": "^6.20.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "react-scripts": "5.0.1",
    "@testing-library/react": "^16.3.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/user-event": "^13.5.0",
    "@playwright/test": "^1.40.0",
    "typescript": "^4.9.5",
    "eslint": "^8.54.0",
    "prettier": "^2.8.8"
  }
}
```

### Test Backend Dependencies (For Development/Demo)

**Note:** These dependencies are for the minimalist test backend only. Production backends should use the appropriate SDK for their technology stack.

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "@prisma/client": "^5.7.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "redis": "^4.6.0",
    "ws": "^8.14.0",
    "zod": "^3.22.4",
    "pino": "^8.17.0",
    "pino-http": "^8.6.0",
    "helmet": "^7.1.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "prisma": "^5.7.0",
    "jest": "^29.7.0",
    "supertest": "^6.3.0",
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.21",
    "eslint": "^8.54.0",
    "prettier": "^2.8.8"
  }
}
```

## License Compliance

All selected technologies are under permissive open-source licenses:

| Technology | License | Commercial Use |
|-----------|---------|----------------|
| React | MIT | ✅ Yes |
| Node.js | MIT | ✅ Yes |
| PostgreSQL | PostgreSQL License | ✅ Yes |
| Redis | BSD-3-Clause | ✅ Yes |
| Express | MIT | ✅ Yes |
| Prisma | Apache 2.0 | ✅ Yes |
| TypeScript | Apache 2.0 | ✅ Yes |
| Jest | MIT | ✅ Yes |
| Playwright | Apache 2.0 | ✅ Yes |

**No licensing concerns for commercial use.**

## Risk Assessment and Mitigation

### High-Risk Decisions

1. **Custom Widget Library**
   - **Risk**: Higher initial development effort
   - **Mitigation**: Start with 12 MVP widgets, thorough documentation, comprehensive tests
   - **Fallback**: Adopt headless UI library (Radix UI) if development becomes too slow

2. **No External Data Fetching Library**
   - **Risk**: Custom implementation may miss edge cases
   - **Mitigation**: Comprehensive error handling, caching logic, timeout handling
   - **Fallback**: Adopt TanStack Query in Phase 2 if needed

3. **Create React App (Maintenance Mode)**
   - **Risk**: CRA is in maintenance mode, may not receive updates
   - **Mitigation**: Plan migration to Vite in Phase 2 or 3
   - **Fallback**: Migrate to Vite if CRA becomes problematic

### Medium-Risk Decisions

1. **Native WebSocket API**
   - **Risk**: Need to implement reconnection and error handling ourselves
   - **Mitigation**: Build robust WebSocketManager with comprehensive testing
   - **Fallback**: Adopt Socket.IO if WebSocket management becomes complex

2. **Context API for State Management**
   - **Risk**: May not scale if state management becomes complex
   - **Mitigation**: Design state carefully, use custom hooks, document patterns
   - **Fallback**: Migrate to Zustand if needed (easy migration path)

### Low-Risk Decisions

- React, TypeScript, Jest, PostgreSQL, Express, Prisma, Redis, Docker
- All are mature, well-maintained, widely-used technologies with large communities

## Technology Compatibility Matrix

| Frontend | Backend | Database | Cache | Status |
|----------|---------|----------|-------|--------|
| React 19.2.3 | Node.js 18+ | PostgreSQL 14+ | Redis 7+ | ✅ Compatible |
| TypeScript 4+ | TypeScript 5+ | Prisma | - | ✅ Compatible |
| Jest | Jest | - | - | ✅ Same version |
| Zod | Zod | - | - | ✅ Shared library |

**No compatibility issues identified.**

## Migration Paths

### Future Technology Migrations (If Needed)

1. **Create React App → Vite**
   - Timeline: Phase 2 or 3
   - Effort: Low (1-2 days)
   - Reason: Better performance, faster dev server

2. **Context API → Zustand**
   - Timeline: If state management becomes complex
   - Effort: Low (1-2 days)
   - Reason: Better performance, simpler API

3. **Native Fetch → TanStack Query**
   - Timeline: Phase 2 if data fetching becomes complex
   - Effort: Medium (3-5 days)
   - Reason: Advanced caching, mutations, optimistic updates

4. **Express → NestJS**
   - Timeline: Future (if needed)
   - Effort: High (2-3 weeks)
   - Reason: Better TypeScript support, structure for large teams

## Proof-of-Concept Implementations

### POC 1: Widget Rendering from Configuration

**Status:** To be implemented in Phase 1

**Objective:** Validate that widgets can be rendered from JSON configuration

**Deliverables:**
- Simple page with TextInput, Button, and Toast widgets
- JSON configuration for the page
- Widget registry implementation
- Render engine that reads config and renders widgets

### POC 2: Form Validation with React Hook Form + Zod

**Status:** To be implemented in Phase 1

**Objective:** Validate form handling approach with configuration-driven validation

**Deliverables:**
- Form with multiple fields (TextInput, Select, DatePicker)
- Validation rules from configuration
- Client-side validation with Zod
- Server-side validation integration

### POC 3: Action Execution Flow

**Status:** To be implemented in Phase 1

**Objective:** Validate action execution from configuration

**Deliverables:**
- Button click triggers action
- Action calls backend API
- Success/error handling
- Toast notification display

## Performance Benchmarks

### Target Metrics (To be validated in Phase 1)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Initial Page Load** | < 2 seconds | Time to interactive (TTI) |
| **Configuration Fetch** | < 500ms | Time to fetch and parse page config |
| **Widget Render** | < 100ms | Time to render individual widget |
| **Form Validation** | < 50ms | Client-side validation response time |
| **Action Execution** | < 1 second | End-to-end action execution time |
| **Bundle Size** | < 500KB | Main bundle size (gzipped) |

**Note:** Benchmarks will be validated and refined during Phase 1 implementation.

## Summary and Next Steps

### Summary

All major technical decisions have been finalized and documented:
- ✅ **Frontend Stack** (Core Project): React 19, Context API, Custom Widgets, React Hook Form, CSS Modules
- ✅ **Test Backend Stack** (For Development/Demo): Node.js, Express, PostgreSQL, Prisma, Redis
- ✅ **Backend SDKs** (Separate Sub-Projects): .NET SDK, PHP/Laravel SDK, Node.js SDK planned
- ✅ **Infrastructure**: Docker, Docker Compose, GitHub Actions
- ✅ **Testing**: Jest, React Testing Library, Playwright
- ✅ **Type Safety**: TypeScript strict mode, Zod validation

**Important:** OpenPortal is a **frontend-only project** that is **backend-agnostic**. The Node.js test backend is for demonstration and development only. Production implementations should use the appropriate backend SDK (.NET, PHP/Laravel, etc.).

### Next Steps

1. **Update package.json** with selected frontend dependencies
2. **Create ADR documents** for all major decisions
3. **Set up development environment** for frontend development
4. **Configure TypeScript** with strict mode
5. **Configure ESLint and Prettier**
6. **Begin Phase 1 implementation** starting with authentication and widget registry
7. **Develop backend SDKs** as separate sub-projects (.NET, PHP/Laravel prioritized)

### Dependencies to Install

**Frontend (This Project):**
```bash
npm install react-router-dom react-hook-form zod
npm install -D @playwright/test prettier
```

**Test Backend (For Development/Demo - Optional):**
```bash
npm install express @prisma/client jsonwebtoken bcrypt redis ws zod pino pino-http helmet cors
npm install -D prisma jest supertest @types/node @types/express typescript
```

**Backend SDKs (Separate Repositories):**
- `.NET SDK`: To be created as `openportal-dotnet-sdk` repository
- `PHP/Laravel SDK`: To be created as `openportal-php-sdk` repository
- `Node.js SDK`: To be created as `openportal-node-sdk` repository (extracted from test backend)

---

**Version:** 1.0  
**Status:** ✅ Complete  
**Last Updated:** January 20, 2026  
**Next Review:** End of Phase 1
