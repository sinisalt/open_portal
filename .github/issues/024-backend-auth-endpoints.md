# Issue #024: Backend - Authentication Endpoints

**Phase:** Phase 1 - Core Platform (MVP Renderer)  
**Weeks:** 3-5  
**Component:** Backend  
**Estimated Effort:** 5 days  
**Priority:** High  
**Labels:** phase-1, backend, authentication, api

## Description
Implement backend authentication endpoints including login, logout, token refresh, and OAuth callback handlers.

## Acceptance Criteria
- [ ] POST `/auth/login` - Username/password authentication
- [ ] POST `/auth/logout` - Session termination
- [ ] POST `/auth/refresh` - Token refresh
- [ ] GET `/auth/oauth/authorize/:provider` - OAuth initiation
- [ ] GET `/auth/oauth/callback/:provider` - OAuth callback
- [ ] Password hashing (bcrypt)
- [ ] JWT token generation
- [ ] Refresh token management
- [ ] Session storage
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout after failed attempts
- [ ] Audit logging

## API Endpoints

### POST /auth/login
```typescript
Request: {
  username: string;
  password: string;
  rememberMe?: boolean;
}

Response: {
  token: string;
  refreshToken?: string;
  expiresIn: number;
  user: UserInfo;
}
```

### POST /auth/logout
```typescript
Request: {
  refreshToken?: string;
}

Response: {
  success: boolean;
}
```

### POST /auth/refresh
```typescript
Request: {
  refreshToken: string;
}

Response: {
  token: string;
  refreshToken: string;
  expiresIn: number;
}
```

## Dependencies
- Depends on: #004 (Technical stack for backend framework)
- Depends on: #006 (Repository structure)

## Security Requirements
- [ ] Password hashing with bcrypt (10+ rounds)
- [ ] Secure token generation (crypto.randomBytes)
- [ ] JWT signing with strong secret
- [ ] Refresh token rotation
- [ ] Token expiry enforcement
- [ ] Rate limiting (max 5 attempts per minute)
- [ ] Account lockout (10 failed attempts)
- [ ] HTTPS only in production
- [ ] CSRF protection
- [ ] SQL injection prevention
- [ ] No sensitive data in logs

## Token Structure (JWT)
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "roles": ["user", "admin"],
  "tenantId": "tenant-123",
  "iat": 1234567890,
  "exp": 1234571490
}
```

## Database Schema
```sql
-- users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar_url VARCHAR(500),
  tenant_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- refresh_tokens table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Testing Requirements
- [ ] Unit tests for auth logic
- [ ] Test login success/failure
- [ ] Test token generation/validation
- [ ] Test refresh token flow
- [ ] Test account lockout
- [ ] Test rate limiting
- [ ] Security testing
- [ ] Integration tests

## Documentation
- [ ] API endpoint documentation
- [ ] Authentication flow diagrams
- [ ] Security considerations
- [ ] Token management guide
- [ ] Error codes reference

## Deliverables
- Authentication endpoints
- Password hashing
- JWT generation/validation
- Refresh token management
- Rate limiting
- Tests
- API documentation
