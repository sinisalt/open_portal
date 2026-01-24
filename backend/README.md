# OpenPortal Backend (Test/Development)

This is a **minimalist test backend** for demonstrating OpenPortal frontend features during development. It provides reference implementations of the OpenPortal API specification.

⚠️ **Important**: This is for **development and testing only**. OpenPortal is a frontend-only project that is backend-agnostic. Production implementations should use the appropriate backend SDK for your technology stack (.NET, PHP/Laravel, etc.).

## Technology Stack

- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js
- **Language**: TypeScript 5
- **Authentication**: JWT + Refresh Tokens
- **Password Hashing**: bcrypt
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Pino
- **Database**: In-memory (for development)
- **Testing**: Jest + Supertest

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.x or higher

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Security
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Development

```bash
# Start development server with hot reload
npm run dev

# The server will start on http://localhost:4000
```

### Production Build

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

## API Endpoints

### Authentication

#### POST /auth/login
Authenticate user with username/password.

**Request:**
```json
{
  "username": "user@example.com",
  "password": "password123",
  "rememberMe": false
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "refreshToken": "refresh-token-string",
  "expiresIn": 3600,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["user"]
  }
}
```

#### POST /auth/logout
Terminate user session.

**Request:**
```json
{
  "refreshToken": "refresh-token-string"
}
```

**Response:**
```json
{
  "success": true
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "refresh-token-string"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "refreshToken": "new-refresh-token-string",
  "expiresIn": 3600
}
```

### Health Check

#### GET /health
Check server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-24T12:00:00.000Z",
  "uptime": 12345
}
```

### UI Configuration

#### GET /ui/bootstrap
Get initial application configuration (requires authentication).

**Response:**
```json
{
  "user": { "id": "...", "name": "...", "email": "...", "roles": [...] },
  "permissions": [...],
  "tenant": { "id": "...", "name": "...", "brandingVersion": "..." },
  "menu": { "items": [...] },
  "defaults": { "homePage": "/", "theme": "light" },
  "featureFlags": { "darkMode": true, ... }
}
```

#### GET /ui/branding
Get tenant branding configuration (requires authentication).

**Query:** `?tenantId=tenant-001` (optional)

**Response:**
```json
{
  "version": "1.0.0",
  "tenantId": "tenant-001",
  "colors": { "primary": "#1e40af", ... },
  "typography": { "fontFamily": "Inter", ... },
  "spacing": { "md": "1rem", ... },
  "logos": { "primary": "/logo.svg", ... }
}
```

#### GET /ui/routes/resolve
Resolve route path to page ID (requires authentication).

**Query:** `?path=/dashboard` (required)

**Response:**
```json
{
  "pageId": "dashboard",
  "params": {},
  "metadata": { "title": "Dashboard", "permissions": [...] }
}
```

#### GET /ui/pages/:pageId
Get full page configuration (requires authentication).

**Response:**
```json
{
  "id": "...",
  "pageId": "home",
  "version": "1.0.0",
  "config": { "widgets": [...], ... },
  "tenantId": "tenant-001",
  "permissions": [],
  "isActive": true
}
```

For detailed UI configuration API documentation, see [UI Configuration API](../documentation/ui-config-api.md).

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Code Quality

```bash
# Check code quality
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Security Features

- **Password Hashing**: bcrypt with 10+ rounds
- **JWT Authentication**: Signed with strong secret
- **Refresh Token Rotation**: Tokens rotated on use
- **Rate Limiting**: 5 attempts per minute on auth endpoints
- **Account Lockout**: 10 failed attempts locks account for 15 minutes
- **CORS Protection**: Configured allowed origins
- **Security Headers**: Helmet middleware
- **Request Validation**: Zod schema validation
- **Audit Logging**: All authentication events logged

## Test Users

The in-memory database is seeded with test users:

| Email | Password | Roles |
|-------|----------|-------|
| admin@example.com | admin123 | admin, user |
| user@example.com | user123 | user |

## Architecture

```
backend/
├── src/
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic
│   ├── models/           # Data models (in-memory)
│   ├── middleware/       # Express middleware
│   ├── config/           # Configuration
│   ├── utils/            # Utility functions
│   ├── __tests__/        # Test files
│   └── server.ts         # Application entry point
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Production Deployment

⚠️ **This backend is for development only**. For production:

1. Use OpenPortal backend SDKs (.NET, PHP/Laravel, etc.)
2. Implement proper database (PostgreSQL, MySQL, etc.)
3. Use environment-specific secrets
4. Implement proper session management
5. Add comprehensive audit logging
6. Set up monitoring and alerting
7. Use HTTPS only
8. Implement backup and recovery

## Related Documentation

- [API Specification](../documentation/api-specification.md)
- [Architecture](../documentation/architecture.md)
- [Technology Stack](../documentation/technology-stack.md)
- [ADR-013: Backend Runtime](../documentation/adr/ADR-013-backend-runtime.md)

## License

MIT License - see LICENSE file for details.
