# ADR-013: Backend Runtime

**Status:** Accepted  
**Date:** 2026-01-20  
**Deciders:** Development Team  
**Issue:** #004 - Technical Stack Finalization

## Context

OpenPortal requires a backend server to:
- Provide configuration APIs (bootstrap, routes, pages, branding)
- Execute actions via gateway endpoint
- Manage authentication and authorization
- Handle WebSocket connections for real-time updates
- Serve as business logic orchestration layer
- Store and retrieve UI configurations from database

We need to choose a backend runtime environment that will serve all these needs.

## Decision

**We will use Node.js 18+ LTS (Long Term Support) as the backend runtime.**

Specifically:
- **Node.js 18.x** or **Node.js 20.x** (LTS versions)
- **TypeScript** for backend development
- **CommonJS or ES Modules** (prefer ES Modules for consistency with frontend)

## Alternatives Considered

### Option 1: Node.js 18+ LTS - SELECTED ✅

**Pros:**
- ✅ **Language consistency**: JavaScript/TypeScript same as frontend
- ✅ **Shared types**: Use same TypeScript types on frontend and backend
- ✅ **JSON native**: Perfect for JSON configuration handling
- ✅ **Mature ecosystem**: npm has packages for everything
- ✅ **Performance**: V8 engine, excellent for API servers
- ✅ **Async I/O**: Non-blocking, handles concurrent requests well
- ✅ **WebSocket support**: Excellent WebSocket libraries available
- ✅ **Team familiarity**: Team already knows JavaScript/TypeScript
- ✅ **Fast development**: Rapid prototyping and iteration

**Cons:**
- ❌ **Single-threaded**: Need to use clustering for CPU-intensive tasks
- ❌ **Memory usage**: Higher than Go or Rust
- ❌ **Type safety**: Less strict than compiled languages (mitigated by TypeScript)

**Why Selected:**
- Language consistency with frontend (JavaScript/TypeScript)
- Shared types between frontend and backend reduce duplication
- JSON-native makes configuration handling natural
- Excellent ecosystem for web APIs
- Team already has JavaScript/TypeScript expertise
- Fast development velocity

### Option 2: Python + FastAPI

**Pros:**
- ✅ Excellent for data science and ML (if needed later)
- ✅ Fast API development with FastAPI
- ✅ Type hints with Pydantic
- ✅ Good performance with async
- ✅ Large ecosystem

**Cons:**
- ❌ Different language from frontend (no type sharing)
- ❌ JSON handling less natural than JavaScript
- ❌ Team less familiar with Python
- ❌ Separate type definitions for frontend/backend
- ❌ Not ideal for WebSocket compared to Node.js

**Why Not Selected:**
- Language mismatch with frontend
- Can't share TypeScript types
- Team has less Python expertise
- Not needed for our use case (no ML/data science requirements)

### Option 3: Java + Spring Boot

**Pros:**
- ✅ Enterprise-grade, battle-tested
- ✅ Strong type system
- ✅ Excellent tooling and IDE support
- ✅ Great for large teams
- ✅ Robust security features

**Cons:**
- ❌ Heavy framework, slower development
- ❌ Different language from frontend
- ❌ More verbose code
- ❌ Longer build times
- ❌ Steeper learning curve
- ❌ Not ideal for JSON handling

**Why Not Selected:**
- Too heavy for our needs
- Slower development velocity
- Language mismatch with frontend
- Verbosity slows development

### Option 4: Go

**Pros:**
- ✅ Excellent performance
- ✅ Low memory footprint
- ✅ Built-in concurrency (goroutines)
- ✅ Fast compilation
- ✅ Good for microservices

**Cons:**
- ❌ Different language from frontend
- ❌ Less flexible than JavaScript
- ❌ Smaller ecosystem for web APIs
- ❌ JSON handling less ergonomic
- ❌ Team less familiar with Go

**Why Not Selected:**
- Language mismatch with frontend
- Team has no Go expertise
- Ecosystem less mature for web APIs
- Performance benefits not critical for MVP

### Option 5: Rust

**Pros:**
- ✅ Excellent performance
- ✅ Memory safety
- ✅ Great for system programming
- ✅ Modern language

**Cons:**
- ❌ Very steep learning curve
- ❌ Slower development velocity
- ❌ Different language from frontend
- ❌ Smaller web ecosystem
- ❌ Overkill for API server

**Why Not Selected:**
- Too complex for team
- Slower development velocity
- Not needed for our use case

## Consequences

### Positive

1. **Language consistency**: JavaScript/TypeScript across entire stack
2. **Shared types**: Same TypeScript types on frontend and backend
3. **Fast development**: Rapid prototyping and iteration
4. **JSON native**: Natural JSON configuration handling
5. **Large ecosystem**: npm packages for everything
6. **WebSocket support**: Excellent WebSocket libraries
7. **Team familiarity**: No new language to learn
8. **Performance**: Good enough for API server workload

### Negative

1. **Single-threaded**: Need clustering for CPU-intensive tasks (unlikely to be an issue)
2. **Memory usage**: Higher than Go/Rust (acceptable tradeoff)
3. **Runtime errors**: Less compile-time safety than Go/Java (mitigated by TypeScript)

### Neutral

1. **Mature platform**: Node.js is proven for API servers
2. **LTS support**: Long-term support for Node.js 18 and 20
3. **Can scale**: Node.js scales well for I/O-bound workloads

## Implementation Details

### Node.js Version

Use **Node.js 18.x LTS** or **Node.js 20.x LTS**:

```bash
# Check Node.js version
node --version

# Should be v18.x.x or v20.x.x
```

### TypeScript Configuration (Backend)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    
    // Strict Type Checking
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // Additional Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Package.json (Backend Recommendation)

```json
{
  "name": "openportal-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\""
  },
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
    "cors": "^2.8.5",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.21",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/ws": "^8.5.9",
    "prisma": "^5.7.0",
    "typescript": "^5.3.0",
    "tsx": "^4.7.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "supertest": "^6.3.0",
    "@types/supertest": "^6.0.2",
    "eslint": "^8.54.0",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "prettier": "^2.8.8"
  }
}
```

### Server Entry Point Example

```typescript
// src/server.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { config } from './config';
import { authRouter } from './routes/auth';
import { uiRouter } from './routes/ui';
import { setupWebSocket } from './websocket';

const logger = pino({ level: config.logLevel });
const app = express();

// Middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());
app.use(pinoHttp({ logger }));

// Routes
app.use('/auth', authRouter);
app.use('/ui', uiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

// Setup WebSocket
setupWebSocket(server);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
```

### Shared Types Package

Create a shared types package that both frontend and backend can use:

```bash
# Directory structure
/packages/types/
  package.json
  tsconfig.json
  src/
    index.ts
    widget.types.ts
    action.types.ts
    page.types.ts
```

```typescript
// packages/types/src/index.ts
export * from './widget.types';
export * from './action.types';
export * from './page.types';
```

Both frontend and backend import from this package:

```typescript
// Frontend
import { PageConfig, WidgetConfig } from '@openportal/types';

// Backend
import { PageConfig, WidgetConfig } from '@openportal/types';
```

### Development Tools

- **tsx**: TypeScript execution for development (`npm run dev`)
- **nodemon**: Auto-restart on file changes (alternative to tsx watch)
- **ts-node**: TypeScript execution (alternative to tsx)

### Production Deployment

```dockerfile
# Dockerfile for backend
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --production

# Copy built files
COPY dist ./dist
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 4000

# Start server
CMD ["node", "dist/server.js"]
```

### Performance Considerations

1. **Clustering**: Use Node.js cluster module for multi-core CPUs
   ```typescript
   import cluster from 'cluster';
   import os from 'os';

   if (cluster.isPrimary) {
     const numCPUs = os.cpus().length;
     for (let i = 0; i < numCPUs; i++) {
       cluster.fork();
     }
   } else {
     startServer();
   }
   ```

2. **Caching**: Use Redis for configuration caching
3. **Connection pooling**: PostgreSQL connection pooling with Prisma
4. **Compression**: Use compression middleware for API responses

### Monitoring

```typescript
// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

// Add metrics endpoint (for Prometheus)
app.get('/metrics', (req, res) => {
  // Return Prometheus metrics
});
```

## Success Metrics

- API response time < 200ms for configuration endpoints
- Memory usage < 512MB per instance
- Handles 1000+ concurrent WebSocket connections
- Zero downtime deployments with clustering
- Shared types reduce duplication by 50%+
- Development velocity 2x faster than alternative runtimes

## Review and Reevaluation

**Review Trigger**: End of Phase 1

**Reevaluate if:**
- Performance issues with Node.js
- Memory usage exceeds acceptable limits
- CPU-bound tasks become bottleneck
- Team requests alternative runtime

## References

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Node Starter](https://github.com/microsoft/TypeScript-Node-Starter)

---

**Last Updated:** January 20, 2026  
**Next Review:** End of Phase 1
