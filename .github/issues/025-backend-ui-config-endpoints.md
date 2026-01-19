# Issue #025: Backend - UI Configuration Endpoints (Bootstrap, Branding, Routes, Pages)

**Phase:** Phase 1 - Core Platform (MVP Renderer)  
**Weeks:** 3-5  
**Component:** Backend  
**Estimated Effort:** 6 days  
**Priority:** Critical  
**Labels:** phase-1, backend, api, configuration

## Description
Implement core backend endpoints for UI configuration delivery including bootstrap, branding, route resolution, and page configurations.

## Acceptance Criteria
- [ ] GET `/ui/bootstrap` - Initial app configuration
- [ ] GET `/ui/branding` - Tenant branding configuration
- [ ] GET `/ui/routes/resolve` - Route to page mapping
- [ ] GET `/ui/pages/:pageId` - Page configuration
- [ ] Configuration storage schema
- [ ] Branding storage schema
- [ ] ETag support for caching
- [ ] Permission-based filtering
- [ ] Tenant-specific configurations
- [ ] Version management

## API Endpoints

### GET /ui/bootstrap
```typescript
Response: {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    roles: string[];
  };
  permissions: string[];
  tenant: {
    id: string;
    name: string;
    brandingVersion: string;
  };
  menu: MenuConfig;
  defaults: {
    homePage: string;
    theme: string;
  };
  featureFlags: Record<string, boolean>;
}
```

### GET /ui/branding?tenantId={id}
```typescript
Response: {
  version: string;
  tenantId: string;
  colors: ColorConfig;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  logos: LogoConfig;
  customCSS?: string;
}
```

### GET /ui/routes/resolve?path={path}
```typescript
Response: {
  pageId: string;
  params: Record<string, string>;
  metadata: {
    title?: string;
    permissions?: string[];
  };
}
```

### GET /ui/pages/:pageId
```typescript
Response: PageConfig // Full page configuration
```

## Database Schema
```sql
-- page_configs table
CREATE TABLE page_configs (
  id UUID PRIMARY KEY,
  page_id VARCHAR(100) UNIQUE NOT NULL,
  version VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  tenant_id UUID,
  permissions TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- route_configs table
CREATE TABLE route_configs (
  id UUID PRIMARY KEY,
  pattern VARCHAR(255) NOT NULL,
  page_id VARCHAR(100) NOT NULL,
  permissions TEXT[],
  exact BOOLEAN DEFAULT false,
  redirect_to VARCHAR(255),
  metadata JSONB,
  tenant_id UUID,
  priority INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- tenant_branding table
CREATE TABLE tenant_branding (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL UNIQUE,
  version VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- menu_configs table
CREATE TABLE menu_configs (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  role VARCHAR(100),
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Dependencies
- Depends on: #024 (Auth endpoints for user context)
- Depends on: #002 (Configuration schemas)

## Technical Notes
- Use JSONB for flexible configuration storage
- Implement ETag generation (hash of config + version)
- Cache configurations in Redis
- Support tenant override patterns
- Implement role-based menu filtering
- Version all configurations
- Support default fallback branding

## Caching Strategy
- [ ] Generate ETag from config version + content hash
- [ ] Return 304 Not Modified when ETag matches
- [ ] Cache in Redis with TTL
- [ ] Invalidate cache on config updates
- [ ] Per-tenant cache keys

## Permission Filtering
- [ ] Filter menu items by user permissions
- [ ] Return 403 for pages without permission
- [ ] Hide routes user can't access
- [ ] Apply tenant-specific overrides

## Testing Requirements
- [ ] Unit tests for endpoints
- [ ] Test permission filtering
- [ ] Test ETag caching
- [ ] Test tenant isolation
- [ ] Test configuration retrieval
- [ ] Integration tests
- [ ] Load testing

## Documentation
- [ ] API documentation for all endpoints
- [ ] Configuration schema documentation
- [ ] Caching strategy documentation
- [ ] Multi-tenancy guide
- [ ] Permission system documentation

## Deliverables
- Bootstrap endpoint
- Branding endpoint
- Route resolver endpoint
- Page config endpoint
- Database schema
- Configuration storage
- Tests
- API documentation
