# Branding & Multi-Tenant Theme System - Implementation Plan

## Overview

This document provides a detailed, step-by-step implementation plan for the OpenPortal branding and multi-tenant theme system. Each section represents a GitHub issue that can be assigned to developers and tracked independently.

**Related Documentation:**
- [branding.md](./branding.md) - Complete branding system documentation
- [architecture.md](./architecture.md) - System architecture including branding service
- [api-specification.md](./api-specification.md) - API endpoints including `/ui/branding`

---

## Issue Breakdown

### Phase 1: Foundation & Backend Setup (Weeks 1-2)

#### Issue #1: Define Branding Configuration JSON Schema
**Priority:** High  
**Effort:** 2-3 days  
**Dependencies:** None

**Description:**
Create a comprehensive JSON Schema that defines the structure of the branding configuration, including logos, colors, typography, spacing, and component overrides.

**Tasks:**
- [ ] Create `branding-config.schema.json` file
- [ ] Define schema for logos (primary, login, favicon, mobile icons)
- [ ] Define schema for color palette (primary, secondary, semantic colors)
- [ ] Define schema for typography (fonts, sizes, weights, line heights)
- [ ] Define schema for spacing and layout (units, scale, border radius, shadows)
- [ ] Define schema for component-specific overrides
- [ ] Add validation rules (required fields, format validation)
- [ ] Include examples in schema comments
- [ ] Write schema documentation
- [ ] Create test fixtures with valid/invalid examples

**Acceptance Criteria:**
- JSON Schema validates all required branding properties
- Schema includes reasonable defaults
- Schema documentation is clear and comprehensive
- Test fixtures pass/fail validation as expected

**Files to Create/Modify:**
- `schemas/branding-config.schema.json` (new)
- `schemas/README.md` (update)
- `test/fixtures/branding/` (new directory with examples)

---

#### Issue #2: Create Database Schema for Tenant Branding
**Priority:** High  
**Effort:** 1-2 days  
**Dependencies:** None

**Description:**
Design and implement database schema to store tenant-specific branding configurations with version control and audit tracking.

**Tasks:**
- [ ] Create `tenant_branding` table schema
- [ ] Add columns: tenant_id (PK), config (JSONB), version, created_at, updated_at, is_active
- [ ] Add indexes: tenant_id, version, is_active
- [ ] Create `branding_version_history` table for audit trail
- [ ] Add columns: id, tenant_id, version, config, created_by, created_at, change_log
- [ ] Write database migration scripts
- [ ] Add foreign key constraints
- [ ] Create seed data with default branding
- [ ] Write database schema documentation
- [ ] Test migrations (up and down)

**Acceptance Criteria:**
- Database tables created successfully
- Indexes improve query performance
- Migrations are reversible
- Seed data includes working default branding
- Schema supports multiple tenants

**Files to Create/Modify:**
- `migrations/001_create_tenant_branding_tables.sql` (new)
- `migrations/002_seed_default_branding.sql` (new)
- `database/schema.md` (update)

**SQL Example:**
```sql
CREATE TABLE tenant_branding (
  tenant_id VARCHAR(255) PRIMARY KEY,
  config JSONB NOT NULL,
  version VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_tenant_branding_version ON tenant_branding(version);
```

---

#### Issue #3: Implement GET /ui/branding API Endpoint
**Priority:** High  
**Effort:** 3-4 days  
**Dependencies:** Issue #1, Issue #2

**Description:**
Create the backend API endpoint that serves tenant-specific branding configurations with proper caching headers and fallback to default branding.

**Tasks:**
- [ ] Create API route handler for `GET /ui/branding`
- [ ] Implement tenant ID extraction from query parameter
- [ ] Query database for tenant-specific branding
- [ ] Implement fallback to default branding if not found
- [ ] Add ETag generation based on version and tenant ID
- [ ] Set proper cache headers (Cache-Control, ETag)
- [ ] Validate branding config against JSON Schema before returning
- [ ] Add error handling for missing/invalid configs
- [ ] Implement conditional GET support (If-None-Match header)
- [ ] Add logging for branding requests
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Document API endpoint

**Acceptance Criteria:**
- Endpoint returns tenant branding when available
- Endpoint returns default branding as fallback
- ETag is properly generated and validated
- Cache headers are correctly set
- Returns 304 Not Modified for cached requests
- Unit tests cover all scenarios
- Integration tests verify end-to-end flow

**Files to Create/Modify:**
- `backend/routes/ui/branding.js` (new)
- `backend/services/branding-service.js` (new)
- `backend/tests/unit/branding-service.test.js` (new)
- `backend/tests/integration/branding-api.test.js` (new)
- `backend/routes/index.js` (update)

---

#### Issue #4: Update Bootstrap API to Include Branding Reference
**Priority:** High  
**Effort:** 1 day  
**Dependencies:** Issue #3

**Description:**
Enhance the `/ui/bootstrap` endpoint to include tenant information with branding version so the frontend knows when to fetch/refresh branding.

**Tasks:**
- [ ] Add `brandingVersion` to tenant object in bootstrap response
- [ ] Add `branding` object with version and URL to bootstrap response
- [ ] Query tenant branding version from database
- [ ] Update bootstrap response schema
- [ ] Update unit tests
- [ ] Update integration tests
- [ ] Update API documentation

**Acceptance Criteria:**
- Bootstrap response includes branding information
- Branding version matches database version
- Tests verify branding info is included
- Documentation reflects new response structure

**Files to Create/Modify:**
- `backend/routes/ui/bootstrap.js` (update)
- `backend/tests/unit/bootstrap.test.js` (update)
- `documentation/api-specification.md` (update - already done)

---

#### Issue #5: Create Default Branding Configuration
**Priority:** Medium  
**Effort:** 2 days  
**Dependencies:** Issue #1, Issue #2

**Description:**
Create a comprehensive default branding configuration that serves as the fallback for all tenants and as a template for custom branding.

**Tasks:**
- [ ] Design default logo (SVG format)
- [ ] Create login logo variant
- [ ] Design favicon and mobile icons
- [ ] Define default color palette (primary, secondary, semantic)
- [ ] Choose default fonts (Google Fonts)
- [ ] Define default spacing and layout values
- [ ] Create default component style overrides
- [ ] Export all assets to CDN-ready format
- [ ] Create JSON configuration file
- [ ] Validate configuration against schema
- [ ] Insert into database as default tenant
- [ ] Document default branding rationale

**Acceptance Criteria:**
- Default branding is visually appealing
- All assets are optimized and CDN-ready
- Configuration validates against schema
- Default branding works across all pages
- Documentation explains design decisions

**Files to Create/Modify:**
- `assets/branding/default/logo-primary.svg` (new)
- `assets/branding/default/logo-login.svg` (new)
- `assets/branding/default/favicon.ico` (new)
- `assets/branding/default/icons/` (new directory)
- `config/default-branding.json` (new)
- `documentation/branding.md` (update with default values)

---

### Phase 2: Frontend Integration (Weeks 2-4)

#### Issue #6: Create ThemeProvider Component
**Priority:** High  
**Effort:** 3-4 days  
**Dependencies:** None (frontend can use mock data initially)

**Description:**
Build a React ThemeProvider component that wraps the application and provides theme context to all child components.

**Tasks:**
- [ ] Create `ThemeProvider` React component
- [ ] Create `ThemeContext` using React Context API
- [ ] Implement theme object structure (colors, typography, spacing)
- [ ] Create `useTheme` hook for accessing theme
- [ ] Support CSS custom properties injection
- [ ] Implement theme switching capability
- [ ] Add TypeScript types/interfaces
- [ ] Write component documentation
- [ ] Write unit tests
- [ ] Write Storybook stories (if applicable)

**Acceptance Criteria:**
- ThemeProvider wraps App component
- Theme values are accessible via useTheme hook
- CSS custom properties are injected into DOM
- Theme can be updated dynamically
- Tests verify context and hook behavior
- TypeScript types are correct

**Files to Create/Modify:**
- `src/components/ThemeProvider/ThemeProvider.js` (new)
- `src/components/ThemeProvider/ThemeContext.js` (new)
- `src/components/ThemeProvider/useTheme.js` (new)
- `src/components/ThemeProvider/index.js` (new)
- `src/components/ThemeProvider/ThemeProvider.test.js` (new)
- `src/types/theme.d.ts` (new)

---

#### Issue #7: Create BrandingProvider Component
**Priority:** High  
**Effort:** 3-4 days  
**Dependencies:** Issue #3, Issue #6

**Description:**
Build a React component that fetches, caches, and provides branding configuration to the application.

**Tasks:**
- [ ] Create `BrandingProvider` React component
- [ ] Create `BrandingContext` for branding state
- [ ] Implement branding fetch logic (call `/ui/branding`)
- [ ] Implement localStorage caching with version check
- [ ] Add ETag support for conditional requests
- [ ] Implement fallback to default branding on error
- [ ] Create `useBranding` hook
- [ ] Handle loading and error states
- [ ] Add retry logic for failed requests
- [ ] Write unit tests
- [ ] Write integration tests

**Acceptance Criteria:**
- Branding is fetched on app bootstrap
- Branding is cached in localStorage with version
- ETag prevents unnecessary re-fetches
- Fallback works when API fails
- Loading states are handled gracefully
- Tests cover all scenarios

**Files to Create/Modify:**
- `src/components/BrandingProvider/BrandingProvider.js` (new)
- `src/components/BrandingProvider/BrandingContext.js` (new)
- `src/components/BrandingProvider/useBranding.js` (new)
- `src/components/BrandingProvider/brandingCache.js` (new)
- `src/components/BrandingProvider/index.js` (new)
- `src/components/BrandingProvider/BrandingProvider.test.js` (new)
- `src/services/brandingService.js` (new)

---

#### Issue #8: Build Logo Component with Fallback Support
**Priority:** High  
**Effort:** 2 days  
**Dependencies:** Issue #7

**Description:**
Create a reusable Logo component that displays tenant-specific logos with automatic fallback to default logo on error.

**Tasks:**
- [ ] Create `Logo` React component
- [ ] Support multiple logo types (primary, login)
- [ ] Implement image loading with error handling
- [ ] Add fallback logo on load error
- [ ] Support alt text from branding config
- [ ] Add responsive sizing
- [ ] Include link wrapper (optional)
- [ ] Add loading state/skeleton
- [ ] Write unit tests
- [ ] Write visual tests
- [ ] Document component API

**Acceptance Criteria:**
- Logo displays tenant-specific image
- Fallback works on load error or missing URL
- Alt text is meaningful and configurable
- Component is responsive
- Tests verify fallback behavior
- Documentation includes usage examples

**Files to Create/Modify:**
- `src/components/Logo/Logo.js` (new)
- `src/components/Logo/Logo.css` (new)
- `src/components/Logo/Logo.test.js` (new)
- `src/components/Logo/index.js` (new)
- `src/assets/default-logo.svg` (new)

**Component API:**
```jsx
<Logo 
  type="primary" // or "login"
  fallbackSrc="/assets/default-logo.svg"
  linkTo="/dashboard"
  className="custom-class"
/>
```

---

#### Issue #9: Implement Google Fonts Loader
**Priority:** Medium  
**Effort:** 2-3 days  
**Dependencies:** Issue #7

**Description:**
Create a utility to dynamically load Google Fonts based on branding configuration with proper font-display strategy.

**Tasks:**
- [ ] Create `GoogleFontsLoader` utility
- [ ] Generate Google Fonts URL from config
- [ ] Inject link tag into document head
- [ ] Support multiple fonts with different weights/styles
- [ ] Implement font-display: swap strategy
- [ ] Add preconnect hints for performance
- [ ] Handle font loading state
- [ ] Implement FOUT mitigation
- [ ] Add error handling for failed loads
- [ ] Write unit tests
- [ ] Test with various font configurations

**Acceptance Criteria:**
- Google Fonts load dynamically from config
- Multiple fonts can be loaded simultaneously
- Font-display strategy prevents invisible text
- Performance is optimized with preconnect
- Error handling prevents broken UI
- Tests verify correct URL generation

**Files to Create/Modify:**
- `src/utils/googleFontsLoader.js` (new)
- `src/utils/googleFontsLoader.test.js` (new)
- `src/components/BrandingProvider/BrandingProvider.js` (update to use loader)

---

#### Issue #10: Implement Custom Font Loader
**Priority:** Low  
**Effort:** 2 days  
**Dependencies:** Issue #9

**Description:**
Create a utility to load custom fonts (WOFF2, WOFF) from CDN or custom URLs with proper @font-face injection.

**Tasks:**
- [ ] Create `CustomFontLoader` utility
- [ ] Generate @font-face CSS from config
- [ ] Support multiple font formats (WOFF2, WOFF, TTF)
- [ ] Inject font-face rules into document
- [ ] Implement preload hints for critical fonts
- [ ] Add font loading status tracking
- [ ] Handle CORS for external fonts
- [ ] Implement fallback for load failures
- [ ] Write unit tests
- [ ] Test with self-hosted fonts

**Acceptance Criteria:**
- Custom fonts load from configured URLs
- Multiple formats are supported
- Font-face rules are correctly injected
- CORS issues are handled
- Fallback fonts work
- Tests verify font-face generation

**Files to Create/Modify:**
- `src/utils/customFontLoader.js` (new)
- `src/utils/customFontLoader.test.js` (new)
- `src/components/BrandingProvider/BrandingProvider.js` (update)

---

#### Issue #11: Create Dynamic CSS Custom Properties System
**Priority:** High  
**Effort:** 2-3 days  
**Dependencies:** Issue #6, Issue #7

**Description:**
Build a system to convert branding configuration into CSS custom properties (variables) and inject them into the document.

**Tasks:**
- [ ] Create utility to convert branding config to CSS variables
- [ ] Map colors to CSS custom properties (e.g., `--color-primary-500`)
- [ ] Map typography to CSS variables (e.g., `--font-family-primary`)
- [ ] Map spacing to CSS variables (e.g., `--spacing-4`)
- [ ] Inject CSS variables into `:root` selector
- [ ] Support theme updates (re-inject variables)
- [ ] Handle dark mode variant injection
- [ ] Write unit tests
- [ ] Test variable application in components
- [ ] Document CSS variable naming convention

**Acceptance Criteria:**
- CSS variables are injected from branding config
- Variables are accessible in all components
- Variable names follow consistent convention
- Theme updates reflect immediately
- Tests verify correct variable generation
- Documentation explains usage

**Files to Create/Modify:**
- `src/utils/cssVariablesGenerator.js` (new)
- `src/utils/cssVariablesGenerator.test.js` (new)
- `src/components/ThemeProvider/ThemeProvider.js` (update)
- `documentation/css-variables.md` (new)

**Example Output:**
```css
:root {
  --color-primary-500: #2196f3;
  --color-secondary-500: #e91e63;
  --font-family-primary: 'Roboto', sans-serif;
  --spacing-unit: 8px;
  --spacing-4: 32px;
  --border-radius-medium: 8px;
}
```

---

### Phase 3: UI Integration (Weeks 4-5)

#### Issue #12: Update App.js to Use Branding System
**Priority:** High  
**Effort:** 1 day  
**Dependencies:** Issue #6, Issue #7

**Description:**
Integrate ThemeProvider and BrandingProvider into the main App.js to enable branding throughout the application.

**Tasks:**
- [ ] Wrap App with ThemeProvider
- [ ] Wrap App with BrandingProvider
- [ ] Ensure proper provider nesting order
- [ ] Pass initial tenant ID from auth context
- [ ] Handle loading state during branding fetch
- [ ] Show error state if branding fails to load
- [ ] Test integration with existing app structure
- [ ] Update tests

**Acceptance Criteria:**
- App is wrapped with both providers
- Branding loads on app initialization
- Loading state is shown during fetch
- Error state is handled gracefully
- Tests verify provider integration

**Files to Create/Modify:**
- `src/App.js` (update)
- `src/App.test.js` (update)
- `src/index.js` (update if needed)

---

#### Issue #13: Create Header Component with Tenant Logo
**Priority:** High  
**Effort:** 2-3 days  
**Dependencies:** Issue #8, Issue #12

**Description:**
Build or update the application header to display the tenant-specific primary logo with branding-aware styling.

**Tasks:**
- [ ] Create/update Header component
- [ ] Integrate Logo component (type="primary")
- [ ] Apply theme colors from useTheme hook
- [ ] Add responsive layout
- [ ] Include navigation menu placeholder
- [ ] Add user menu placeholder
- [ ] Style with CSS variables from theme
- [ ] Write component tests
- [ ] Write visual regression tests
- [ ] Document component

**Acceptance Criteria:**
- Header displays tenant logo
- Header styling uses theme colors
- Header is responsive
- Logo links to home/dashboard
- Tests verify logo rendering
- Visual tests capture different tenants

**Files to Create/Modify:**
- `src/components/Header/Header.js` (new or update)
- `src/components/Header/Header.css` (new or update)
- `src/components/Header/Header.test.js` (new or update)
- `src/components/Header/index.js` (new)

---

#### Issue #14: Create Login Page with Tenant Logo
**Priority:** High  
**Effort:** 2-3 days  
**Dependencies:** Issue #8, Issue #12

**Description:**
Build or update the login page to display the tenant-specific login logo and apply tenant colors.

**Tasks:**
- [ ] Create/update Login page component
- [ ] Integrate Logo component (type="login")
- [ ] Apply theme colors to form elements
- [ ] Style buttons with primary color
- [ ] Add branding-aware backgrounds
- [ ] Implement responsive layout
- [ ] Add loading states
- [ ] Write component tests
- [ ] Write visual regression tests
- [ ] Document component

**Acceptance Criteria:**
- Login page displays tenant login logo
- Form elements use theme colors
- Page is fully responsive
- Works with and without custom branding
- Tests verify rendering
- Visual tests cover multiple tenants

**Files to Create/Modify:**
- `src/pages/Login/Login.js` (new or update)
- `src/pages/Login/Login.css` (new or update)
- `src/pages/Login/Login.test.js` (new or update)
- `src/pages/Login/index.js` (new)

---

#### Issue #15: Apply Theme to All UI Components
**Priority:** Medium  
**Effort:** 3-5 days  
**Dependencies:** Issue #11, Issue #12

**Description:**
Update all existing UI components to use CSS variables and theme values from the branding system.

**Tasks:**
- [ ] Audit all components for hardcoded colors
- [ ] Replace hardcoded colors with CSS variables
- [ ] Update button styles to use theme colors
- [ ] Update form input styles to use theme
- [ ] Update card components with theme values
- [ ] Update table styles with theme
- [ ] Update modal/dialog styles
- [ ] Ensure consistency across all components
- [ ] Test with different tenant themes
- [ ] Update component tests

**Acceptance Criteria:**
- No hardcoded colors in components
- All components respect theme configuration
- Visual consistency across the app
- Theme changes apply to all components
- Tests verify theme application
- Regression tests pass

**Files to Create/Modify:**
- `src/components/**/*.css` (update multiple files)
- `src/components/**/*.js` (update to use useTheme hook)
- `src/components/**/*.test.js` (update tests)

---

#### Issue #16: Implement Dynamic Favicon Injection
**Priority:** Low  
**Effort:** 1 day  
**Dependencies:** Issue #7

**Description:**
Create a utility to dynamically update the browser favicon based on tenant branding configuration.

**Tasks:**
- [ ] Create `faviconInjector` utility
- [ ] Remove existing favicon links from DOM
- [ ] Inject tenant-specific favicon link
- [ ] Support multiple favicon sizes
- [ ] Handle fallback to default favicon
- [ ] Test in multiple browsers
- [ ] Write unit tests

**Acceptance Criteria:**
- Favicon updates dynamically
- Works in all major browsers
- Fallback works on error
- Tests verify DOM manipulation

**Files to Create/Modify:**
- `src/utils/faviconInjector.js` (new)
- `src/utils/faviconInjector.test.js` (new)
- `src/components/BrandingProvider/BrandingProvider.js` (update)

---

#### Issue #17: Implement PWA Manifest Generation per Tenant
**Priority:** Low  
**Effort:** 2 days  
**Dependencies:** Issue #7

**Description:**
Dynamically generate PWA manifest with tenant-specific icons and branding information.

**Tasks:**
- [ ] Create dynamic manifest generator
- [ ] Include tenant name in manifest
- [ ] Include tenant-specific icons (192x192, 512x512)
- [ ] Include theme colors in manifest
- [ ] Serve manifest via API endpoint or inline
- [ ] Update service worker to handle dynamic manifest
- [ ] Test PWA installation with different tenants
- [ ] Write tests

**Acceptance Criteria:**
- PWA manifest is tenant-specific
- Icons are correct for each tenant
- PWA installation works
- Installed app shows tenant branding
- Tests verify manifest generation

**Files to Create/Modify:**
- `src/utils/manifestGenerator.js` (new)
- `backend/routes/manifest.js` (new)
- `public/manifest.json` (convert to template)
- `src/utils/manifestGenerator.test.js` (new)

---

### Phase 4: Caching & Performance (Week 5-6)

#### Issue #18: Implement Branding Configuration Caching
**Priority:** High  
**Effort:** 2 days  
**Dependencies:** Issue #7

**Description:**
Enhance the branding cache implementation to use localStorage with version checking and ETag support.

**Tasks:**
- [ ] Implement localStorage cache for branding config
- [ ] Store config with version key
- [ ] Implement cache read/write utilities
- [ ] Add cache expiration logic (optional TTL)
- [ ] Compare cached version with server version
- [ ] Implement ETag-based conditional requests
- [ ] Handle 304 Not Modified responses
- [ ] Add cache clearing functionality
- [ ] Write unit tests
- [ ] Test cache behavior across sessions

**Acceptance Criteria:**
- Branding config is cached in localStorage
- Cache is invalidated when version changes
- ETag prevents unnecessary fetches
- Cache improves page load performance
- Tests verify cache behavior

**Files to Create/Modify:**
- `src/utils/brandingCache.js` (new or enhance existing)
- `src/utils/brandingCache.test.js` (new)
- `src/services/brandingService.js` (update for ETag support)

---

#### Issue #19: Implement CDN Integration for Assets
**Priority:** Medium  
**Effort:** 2-3 days  
**Dependencies:** Issue #5

**Description:**
Set up CDN hosting for branding assets (logos, fonts, icons) with proper cache headers and optimization.

**Tasks:**
- [ ] Set up CDN bucket/storage (e.g., S3, CloudFlare)
- [ ] Upload default branding assets to CDN
- [ ] Configure proper cache headers (1 year for versioned assets)
- [ ] Set up CORS headers for font loading
- [ ] Implement asset upload script/tool
- [ ] Add image optimization (WebP, compression)
- [ ] Configure CDN URL in backend configuration
- [ ] Update branding configs to use CDN URLs
- [ ] Test asset loading from CDN
- [ ] Document CDN setup process

**Acceptance Criteria:**
- Assets are served from CDN
- Cache headers are correctly set
- CORS is configured for fonts
- Images are optimized
- CDN setup is documented

**Files to Create/Modify:**
- `scripts/upload-assets-to-cdn.js` (new)
- `config/cdn.config.js` (new)
- `documentation/cdn-setup.md` (new)
- `backend/config/default.json` (update with CDN URL)

---

#### Issue #20: Optimize Font Loading Strategy
**Priority:** Medium  
**Effort:** 2 days  
**Dependencies:** Issue #9, Issue #10

**Description:**
Implement performance optimizations for font loading including preloading, subsetting, and font-display strategies.

**Tasks:**
- [ ] Add preload hints for critical fonts
- [ ] Implement font-display: swap strategy
- [ ] Consider font subsetting for custom fonts
- [ ] Add preconnect hints for Google Fonts
- [ ] Implement FOUT (Flash of Unstyled Text) mitigation
- [ ] Test font loading with network throttling
- [ ] Measure impact on FCP and LCP metrics
- [ ] Write performance tests
- [ ] Document font loading strategy

**Acceptance Criteria:**
- Critical fonts are preloaded
- Font-display prevents invisible text
- Font loading doesn't block page render
- Performance metrics improve (FCP, LCP)
- Tests verify optimization effectiveness

**Files to Create/Modify:**
- `src/utils/googleFontsLoader.js` (update)
- `src/utils/customFontLoader.js` (update)
- `src/components/BrandingProvider/BrandingProvider.js` (update)
- `documentation/performance.md` (new or update)

---

#### Issue #21: Implement Stale-While-Revalidate Strategy
**Priority:** Medium  
**Effort:** 1-2 days  
**Dependencies:** Issue #18

**Description:**
Implement a stale-while-revalidate caching strategy for branding configuration to improve perceived performance.

**Tasks:**
- [ ] Update cache to support stale data
- [ ] Serve cached branding immediately
- [ ] Fetch fresh branding in background
- [ ] Update UI if new version is available
- [ ] Show update notification to user (optional)
- [ ] Implement graceful cache refresh
- [ ] Write unit tests
- [ ] Test with slow network conditions

**Acceptance Criteria:**
- Cached branding loads instantly
- Fresh branding fetches in background
- UI updates smoothly when new version available
- Tests verify stale-while-revalidate behavior

**Files to Create/Modify:**
- `src/utils/brandingCache.js` (update)
- `src/components/BrandingProvider/BrandingProvider.js` (update)
- `src/components/BrandingUpdateNotification.js` (new, optional)

---

### Phase 5: Advanced Features (Week 6-7)

#### Issue #22: Support Dark Mode per Tenant
**Priority:** Low  
**Effort:** 3 days  
**Dependencies:** Issue #11

**Description:**
Add support for tenant-specific dark mode themes with automatic or manual switching.

**Tasks:**
- [ ] Extend branding schema to include dark mode colors
- [ ] Update CSS variable injection to support dark mode
- [ ] Implement theme mode context (light/dark/auto)
- [ ] Create theme mode toggle component
- [ ] Detect system preference (prefers-color-scheme)
- [ ] Store user preference in localStorage
- [ ] Update all components to work in dark mode
- [ ] Test dark mode across different tenants
- [ ] Write tests
- [ ] Document dark mode support

**Acceptance Criteria:**
- Dark mode colors can be configured per tenant
- Theme switches between light and dark
- System preference is respected
- User preference is persisted
- All components work in dark mode
- Tests verify theme switching

**Files to Create/Modify:**
- `schemas/branding-config.schema.json` (update)
- `src/components/ThemeProvider/ThemeProvider.js` (update)
- `src/components/ThemeToggle/ThemeToggle.js` (new)
- `src/utils/cssVariablesGenerator.js` (update)
- `documentation/branding.md` (update)

---

#### Issue #23: Implement Component-Level Style Overrides
**Priority:** Low  
**Effort:** 2-3 days  
**Dependencies:** Issue #11

**Description:**
Allow tenants to override specific component styles (e.g., button border radius, card padding) through branding configuration.

**Tasks:**
- [ ] Extend branding schema with component overrides
- [ ] Define component-specific CSS variables
- [ ] Update components to use override variables
- [ ] Implement override application logic
- [ ] Test with various component overrides
- [ ] Write unit tests
- [ ] Document override system

**Acceptance Criteria:**
- Components respect branding overrides
- Overrides don't break component functionality
- Override system is documented
- Tests verify override application

**Files to Create/Modify:**
- `schemas/branding-config.schema.json` (update)
- `src/utils/cssVariablesGenerator.js` (update)
- `src/components/**/*.css` (update components)
- `documentation/branding.md` (update)

---

#### Issue #24: Create Branding Preview Tool
**Priority:** Low  
**Effort:** 3-4 days  
**Dependencies:** Multiple previous issues

**Description:**
Build a developer tool for previewing branding changes in real-time before deploying to production.

**Tasks:**
- [ ] Create preview page/route
- [ ] Add branding JSON editor
- [ ] Implement live preview panel
- [ ] Show side-by-side comparison (current vs preview)
- [ ] Include sample pages (login, dashboard, etc.)
- [ ] Add validation and error highlighting
- [ ] Implement import/export functionality
- [ ] Add accessibility checks (contrast, etc.)
- [ ] Write component tests
- [ ] Document preview tool usage

**Acceptance Criteria:**
- Preview tool loads branding config
- Changes reflect in real-time
- Validation highlights errors
- Accessibility checks work
- Tool is easy to use
- Documentation is complete

**Files to Create/Modify:**
- `src/pages/BrandingPreview/BrandingPreview.js` (new)
- `src/components/BrandingEditor/BrandingEditor.js` (new)
- `src/utils/brandingValidator.js` (new)
- `src/utils/accessibilityChecker.js` (new)
- `documentation/branding-preview-tool.md` (new)

---

### Phase 6: Testing & Documentation (Week 7-8)

#### Issue #25: Write Comprehensive Unit Tests
**Priority:** High  
**Effort:** 3-4 days  
**Dependencies:** All implementation issues

**Description:**
Ensure comprehensive unit test coverage for all branding system components and utilities.

**Tasks:**
- [ ] Audit test coverage across branding system
- [ ] Write missing unit tests for all utilities
- [ ] Write missing unit tests for all components
- [ ] Achieve >80% code coverage
- [ ] Test edge cases and error scenarios
- [ ] Test with various branding configurations
- [ ] Mock API calls appropriately
- [ ] Run tests in CI/CD pipeline
- [ ] Generate coverage reports
- [ ] Document testing approach

**Acceptance Criteria:**
- Unit test coverage >80%
- All edge cases are tested
- Tests are maintainable and clear
- Coverage reports are generated
- Tests run in CI/CD

**Files to Create/Modify:**
- `src/**/*.test.js` (update/create multiple test files)
- `jest.config.js` (update coverage thresholds)
- `.github/workflows/test.yml` (update CI config)

---

#### Issue #26: Write Integration Tests
**Priority:** High  
**Effort:** 2-3 days  
**Dependencies:** All implementation issues

**Description:**
Create end-to-end integration tests that verify the entire branding system works together.

**Tasks:**
- [ ] Write test for complete branding load flow
- [ ] Test tenant switching
- [ ] Test cache invalidation scenarios
- [ ] Test fallback to default branding
- [ ] Test error handling and recovery
- [ ] Test with multiple tenant configurations
- [ ] Write API integration tests
- [ ] Use Cypress or Playwright for E2E tests
- [ ] Document test scenarios

**Acceptance Criteria:**
- Integration tests cover critical paths
- Tests verify end-to-end functionality
- Tests detect regressions
- Tests are documented
- Tests run in CI/CD

**Files to Create/Modify:**
- `tests/integration/branding.test.js` (new)
- `cypress/integration/branding.spec.js` (new, if using Cypress)
- `documentation/testing.md` (update)

---

#### Issue #27: Conduct Accessibility Compliance Testing
**Priority:** High  
**Effort:** 2-3 days  
**Dependencies:** All UI implementation issues

**Description:**
Verify that the branding system and all themed components meet WCAG 2.1 AA accessibility standards.

**Tasks:**
- [ ] Test color contrast ratios (WCAG AA: 4.5:1)
- [ ] Test with screen readers (NVDA, JAWS)
- [ ] Test keyboard navigation
- [ ] Test with browser zoom (up to 200%)
- [ ] Test high contrast mode
- [ ] Test with color blindness simulators
- [ ] Validate alt text for logos
- [ ] Run automated accessibility audits (axe, Lighthouse)
- [ ] Document accessibility findings
- [ ] Fix any accessibility issues found

**Acceptance Criteria:**
- WCAG 2.1 AA compliance achieved
- Automated audits pass
- Manual testing confirms accessibility
- Issues are documented and fixed
- Accessibility report is created

**Files to Create/Modify:**
- `tests/accessibility/branding.test.js` (new)
- `documentation/accessibility-report.md` (new)
- Various component files (fix accessibility issues)

---

#### Issue #28: Performance Benchmarking
**Priority:** Medium  
**Effort:** 2 days  
**Dependencies:** Issue #18, Issue #19, Issue #20

**Description:**
Measure and document the performance impact of the branding system on page load and runtime.

**Tasks:**
- [ ] Measure branding load time (initial and cached)
- [ ] Measure impact on FCP (First Contentful Paint)
- [ ] Measure impact on LCP (Largest Contentful Paint)
- [ ] Measure impact on TTI (Time to Interactive)
- [ ] Measure bundle size increase
- [ ] Test with slow network conditions
- [ ] Compare performance across different tenants
- [ ] Document performance metrics
- [ ] Identify and document optimizations
- [ ] Set performance budgets

**Acceptance Criteria:**
- Branding load time <100ms (cached)
- Branding load time <500ms (fresh)
- No significant impact on core web vitals
- Performance metrics are documented
- Performance budgets are defined

**Files to Create/Modify:**
- `tests/performance/branding-performance.test.js` (new)
- `documentation/performance-report.md` (new)
- `.github/workflows/performance.yml` (new, for CI)

---

#### Issue #29: Complete Developer Documentation
**Priority:** High  
**Effort:** 2-3 days  
**Dependencies:** All implementation issues

**Description:**
Create comprehensive documentation for developers working with the branding system.

**Tasks:**
- [ ] Document branding configuration structure
- [ ] Document API endpoints with examples
- [ ] Document React components and hooks
- [ ] Document utilities and helpers
- [ ] Create integration guide for new tenants
- [ ] Document CSS variables and usage
- [ ] Create troubleshooting guide
- [ ] Add code examples for common scenarios
- [ ] Document best practices
- [ ] Create migration guide (if applicable)

**Acceptance Criteria:**
- Documentation is complete and accurate
- Examples are tested and working
- Documentation covers all features
- Troubleshooting guide is helpful
- Best practices are clear

**Files to Create/Modify:**
- `documentation/branding.md` (already created, update)
- `documentation/branding-api.md` (new)
- `documentation/branding-components.md` (new)
- `documentation/branding-integration-guide.md` (new)
- `documentation/css-variables.md` (new)
- `documentation/troubleshooting-branding.md` (new)
- `README.md` (update with branding section)

---

#### Issue #30: Create Tenant Onboarding Guide
**Priority:** Medium  
**Effort:** 1-2 days  
**Dependencies:** Issue #29

**Description:**
Create a step-by-step guide for onboarding new tenants with custom branding.

**Tasks:**
- [ ] Document tenant setup process
- [ ] Create branding requirements checklist
- [ ] Document logo specifications and requirements
- [ ] Document color selection guidelines
- [ ] Document font selection process
- [ ] Create branding configuration template
- [ ] Document asset preparation steps
- [ ] Document deployment process
- [ ] Create video tutorial (optional)
- [ ] Add troubleshooting for common issues

**Acceptance Criteria:**
- Onboarding guide is clear and complete
- New tenants can be onboarded following guide
- All requirements are documented
- Templates are provided
- Guide includes troubleshooting

**Files to Create/Modify:**
- `documentation/tenant-onboarding.md` (new)
- `templates/branding-config-template.json` (new)
- `documentation/branding-requirements.md` (new)

---

## Summary of GitHub Issues

**Total Issues:** 30  
**Estimated Timeline:** 7-8 weeks  
**Team Size:** 2-3 developers (frontend + backend)

### Issue Prioritization by Phase:

**Phase 1 (Foundation & Backend):** 5 issues
- High Priority: 4 (Issues #1-4)
- Medium Priority: 1 (Issue #5)

**Phase 2 (Frontend Integration):** 6 issues
- High Priority: 4 (Issues #6-8, #11)
- Medium Priority: 1 (Issue #9)
- Low Priority: 1 (Issue #10)

**Phase 3 (UI Integration):** 6 issues
- High Priority: 3 (Issues #12-14)
- Medium Priority: 1 (Issue #15)
- Low Priority: 2 (Issues #16-17)

**Phase 4 (Caching & Performance):** 4 issues
- High Priority: 1 (Issue #18)
- Medium Priority: 3 (Issues #19-21)

**Phase 5 (Advanced Features):** 3 issues
- Low Priority: 3 (Issues #22-24)

**Phase 6 (Testing & Documentation):** 6 issues
- High Priority: 3 (Issues #25-27, #29)
- Medium Priority: 2 (Issues #28, #30)

### Critical Path:
1. Issue #1 → #2 → #3 → #4 (Backend foundation)
2. Issue #6 → #7 → #8 (Frontend providers)
3. Issue #11 → #12 (Theme integration)
4. Issue #13, #14 (UI integration)
5. Issue #25, #26, #29 (Testing & docs)

---

## Implementation Guidelines

### For Each Issue:

1. **Create GitHub Issue**
   - Use issue title from this plan
   - Copy description and tasks
   - Add appropriate labels (priority, type, phase)
   - Assign to developer
   - Link to dependencies

2. **Branch Naming**
   - Use format: `feature/branding-{issue-number}-{slug}`
   - Example: `feature/branding-01-json-schema`

3. **Pull Request**
   - Reference issue in PR description
   - Include screenshots for UI changes
   - Ensure tests pass
   - Request review from team lead

4. **Definition of Done**
   - All tasks completed
   - Tests written and passing
   - Documentation updated
   - Code reviewed and approved
   - Merged to main branch

### Labels to Use:
- `priority:high`, `priority:medium`, `priority:low`
- `type:backend`, `type:frontend`, `type:documentation`, `type:testing`
- `phase:1`, `phase:2`, `phase:3`, `phase:4`, `phase:5`, `phase:6`
- `feature:branding`
- `status:todo`, `status:in-progress`, `status:review`, `status:done`

---

**Document Version:** 1.0  
**Last Updated:** January 19, 2026  
**Next Review:** After Phase 1 completion
