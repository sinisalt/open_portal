# Issue #012: Branding Service Implementation

**Phase:** Phase 1 - Core Platform (MVP Renderer)  
**Weeks:** 3-4  
**Component:** Frontend + Backend  
**Estimated Effort:** 4 days  
**Priority:** High  
**Labels:** phase-1, frontend, backend, branding, theming

## Description
Implement the branding service to load, cache, and apply tenant-specific branding including logos, colors, fonts, and theming. Support fallback to default branding.

## Acceptance Criteria

### Backend
- [ ] `/ui/branding` endpoint implemented
- [ ] Query by tenantId parameter
- [ ] Branding storage schema in database
- [ ] Default branding configuration
- [ ] Logo file serving (or CDN URLs)
- [ ] ETag/version-based caching
- [ ] Branding version management

### Frontend
- [ ] Branding service/hook implementation
- [ ] Load branding after bootstrap
- [ ] Cache branding with version checking
- [ ] Apply theme tokens to application
- [ ] Logo rendering (header, login)
- [ ] Font loading (Google Fonts or custom)
- [ ] Favicon updates
- [ ] CSS variable injection
- [ ] Fallback to default branding
- [ ] Branding hot reload (development)

## Branding Configuration Schema
```typescript
{
  version: string;
  tenantId: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
  };
  typography: {
    fontFamily: string;
    fontSize: {
      base: string;
      sm: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    unit: number; // base unit in px
  };
  logos: {
    header: string; // URL
    login: string;
    favicon: string;
    email: string;
  };
  customCSS?: string; // Additional custom CSS
}
```

## Dependencies
- Depends on: #010 (Bootstrap provides brandingVersion)
- Depends on: #011 (Tenant context)

## Technical Notes
- Store branding in localStorage with version
- Check version from bootstrap against cached
- CSS variables for dynamic theming
- Support both light and dark mode
- Logo optimization (format, size)
- Font loading strategy (swap, block, fallback)
- Performance: minimize layout shift

## Testing Requirements
- [ ] Unit tests for branding service
- [ ] Test branding application
- [ ] Test cache invalidation
- [ ] Test fallback behavior
- [ ] Test logo loading
- [ ] Visual regression tests
- [ ] Multi-tenant testing

## Documentation
- [ ] Branding configuration guide
- [ ] Theme customization guide
- [ ] Logo requirements and specs
- [ ] Color palette guidelines
- [ ] Typography guidelines

## Deliverables
- Branding backend endpoint
- Branding frontend service
- Theme application system
- Default branding config
- Tests
- Documentation
