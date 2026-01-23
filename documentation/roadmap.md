# Implementation Roadmap

## Development Workflow

**Issue-Driven Development:** This roadmap is implemented through structured issue files (`ISSUE-XXX-*.md`) in the project root. Each issue contains detailed development steps. When completing an issue:
1. Follow the steps defined in the issue file
2. Create an `ISSUE-XXX-COMPLETION.md` file documenting deliverables
3. **Update this roadmap** by marking completed tasks with `[x]`
4. Commit changes with issue reference

**Progress Tracking:** All checkboxes `[ ]` in this roadmap should be updated to `[x]` as tasks are completed. This ensures the roadmap reflects the actual project status.

---

## Project Phases

This document outlines the phased approach to implementing the OpenPortal platform, from planning through production deployment.

---

## Phase 0: Discovery & Foundation (Weeks 1-2)

**Objective:** Establish technical foundations and make key architectural decisions.

### Deliverables
- [x] Widget taxonomy v1 (10-15 core widgets) - **Completed via ISSUE-001**
- [x] Configuration schema draft (JSON Schema) - **Completed via ISSUE-002**
- [x] Action catalog (10-20 standard actions) - **Completed via ISSUE-003**
- [x] Technical stack finalization - **Completed via ISSUE-004**
- [x] Development environment setup - **Completed via ISSUE-005**
- [x] Project repository structure - **Completed via ISSUE-006**

### Key Decisions
- Actions gateway vs direct endpoints → **✅ Gateway**
- Realtime: WebSocket vs SSE → **✅ WebSocket (Native API)**
- Caching policy (ETag, TTL defaults) → **✅ ETag-based with Redis**
- State management library → **✅ TanStack Store + React Context (revised)** ⚠️ Updated in Phase 0.5
- UI component library → **✅ shadcn/ui + Radix UI (revised)** ⚠️ Updated in Phase 0.5
- Build tool → **✅ Vite 6 (revised)** ⚠️ Updated in Phase 0.5
- Language → **✅ TypeScript 5 strict mode (revised)** ⚠️ Updated in Phase 0.5
- Routing → **✅ TanStack Router v1.132 (revised)** ⚠️ Updated in Phase 0.5
- Authentication → **✅ Azure MSAL + Custom OAuth (dual)** ⚠️ Updated in Phase 0.5
- Backend runtime → **✅ Node.js 18+ LTS (recommended)**
- Database → **✅ PostgreSQL 14+ (recommended)**
- Testing → **✅ Vitest + Playwright (revised)** ⚠️ Updated in Phase 0.5
- Code Quality → **✅ BiomeJS Ultracite preset (revised)** ⚠️ Updated in Phase 0.5

**Note:** Technology stack revised in ADR-012. See Phase 0.5 for migration details.

### Success Criteria
- Team alignment on architecture
- Documented decisions with rationale
- Development environment ready
- First sprint backlog defined

---

## Phase 0.5: Technology Stack Migration (Weeks 2.5-6.5) 🚀

**Objective:** Migrate to modern technology stack before continuing Phase 1 to avoid compounding technical debt.

**Rationale:** After completing Phase 0 and 75% of Phase 1.1, we identified significant limitations in the original stack (CRA, JavaScript, custom widgets). Migrating now prevents exponential debt growth.

**See:** ADR-012 for full rationale and decision details.

### 0.5.1 Build System Migration (Week 2.5)
- [ ] Remove Create React App - **ISSUE-010**
- [ ] Install and configure Vite 6 - **ISSUE-010**
- [ ] Configure TypeScript 5 strict mode - **ISSUE-010**
- [ ] Set up BiomeJS with Ultracite preset - **ISSUE-010**
- [ ] Verify existing JavaScript files work - **ISSUE-010**
- [ ] Migrate environment variables to VITE_ prefix - **ISSUE-010**
- [ ] Update scripts in package.json - **ISSUE-010**

### 0.5.2 Styling & UI Foundation (Week 3-3.5)
- [ ] Install Tailwind CSS v4.1 - **ISSUE-011**
- [ ] Initialize shadcn/ui CLI - **ISSUE-011**
- [ ] Create CSS variables and theme - **ISSUE-011**
- [ ] Map branding tokens to Tailwind - **ISSUE-011**
- [ ] Configure dark mode support - **ISSUE-011**

### 0.5.3 Routing Migration (Week 3.5-4.5)
- [ ] Remove React Router v6 - **ISSUE-012**
- [ ] Install TanStack Router v1.132 - **ISSUE-012**
- [ ] Set up file-based routing - **ISSUE-012**
- [ ] Migrate login route - **ISSUE-012**
- [ ] Migrate OAuth callback route - **ISSUE-012**
- [ ] Create index/home route - **ISSUE-012**
- [ ] Implement route guards - **ISSUE-012**
- [ ] Update navigation in existing components - **ISSUE-012**

### 0.5.4 Authentication Enhancement (Week 4.5-5.5)
- [x] Install @azure/msal-browser and @azure/msal-react - **ISSUE-013** ✅
- [x] Create MSAL configuration - **ISSUE-013** ✅
- [x] Install first shadcn components (Input, Button, Card, Label) - **ISSUE-013** ✅
- [x] Build LoginPageMSAL.tsx (first TypeScript component) - **ISSUE-013** ✅
- [x] Create useMsalAuth.ts hook - **ISSUE-013** ✅
- [x] Extend token manager for MSAL tokens - **ISSUE-013** ✅
- [x] Update HTTP client for dual auth support - **ISSUE-013** ✅
- [x] Implement feature flag switching (VITE_AUTH_PROVIDER) - **ISSUE-013** ✅
- [ ] Test both auth systems independently - **ISSUE-013** ⏳ (Manual testing pending)

### 0.5.5 Widget Architecture POC (Week 5.5-6.5)
- [ ] Implement widget registry - **ISSUE-014**
- [ ] Create widget type definitions - **ISSUE-014**
- [ ] Create widget renderer component - **ISSUE-014**
- [ ] Implement TextInputWidget (proof-of-concept) - **ISSUE-014**
- [ ] Validate 3-layer architecture (Radix → shadcn → OpenPortal → Registry) - **ISSUE-014**
- [ ] Build demo page - **ISSUE-014**
- [ ] Write tests for registry and TextInputWidget - **ISSUE-014**

### Success Criteria
- ✅ Dev server starts in <1s (vs 10-30s with CRA)
- ✅ HMR updates in <100ms (vs 1-3s)
- ✅ TypeScript strict mode enabled for new files
- ✅ Both auth systems work (custom OAuth + MSAL)
- ✅ TextInputWidget renders from JSON configuration
- ✅ All existing tests pass (41 auth tests)
- ✅ Widget architecture validated

**Total Effort:** ~21 days (4 weeks)

---

## Phase 1: Core Platform (MVP Renderer) (Weeks 7-14)

**Objective:** Build the foundational rendering engine with minimal viable functionality.

### Frontend Work

#### 1.1 Authentication & Bootstrap (Week 3-4)
- [x] Login page implementation - **Completed via ISSUE-007**
- [x] OAuth integration (callback handler) - **Completed via ISSUE-008**
- [x] Token management (storage, refresh) - **Completed via ISSUE-009**
- [x] Bootstrap API integration (including branding reference) - **Completed via ISSUE-010-bootstrap-api**
- [x] User context management - **Completed via ISSUE-007**
- [ ] Tenant identification and context
- [ ] Basic branding loading (logos, colors)
- [ ] Default branding configuration

#### 1.2 Routing & Page Loading (Week 4-5)
- [ ] Route resolver implementation
- [ ] Page configuration loader
- [ ] Cache management (ETag support)
- [ ] Deep linking support
- [ ] Route guards and redirects

#### 1.3 Widget Registry & Core Widgets (Week 5-7)
- [ ] Widget registry system
- [ ] Layout widgets:
  - Page
  - Section
  - Grid
  - Card
- [ ] Form widgets:
  - TextInput
  - Select
  - DatePicker
  - Checkbox
- [ ] Data display:
  - Table (basic)
  - KPI card
- [ ] Dialog widgets:
  - Modal (basic)
  - Toast/Notification

#### 1.4 Action Engine (Week 7-8)
- [ ] Action execution framework
- [ ] Core action types:
  - `executeAction`
  - `apiCall`
  - `navigate`
  - `setState`
  - `showToast`
- [ ] Error handling
- [ ] Action chaining (sequence, parallel)

#### 1.5 Form Handling (Week 8-9)
- [ ] Form state management
- [ ] Client-side validation
- [ ] Server-side validation integration
- [ ] Form submission handling
- [ ] Error display

#### 1.6 Data Layer (Week 9-10)
- [ ] Datasource system
- [ ] HTTP datasource implementation
- [ ] Fetch policy enforcement
- [ ] Query caching
- [ ] Loading states

### Backend Work

#### 1.1 Core APIs (Week 3-5)
- [ ] Authentication endpoints
- [x] `/ui/bootstrap` implementation (with tenant and branding info) - **Frontend completed via ISSUE-010-bootstrap-api** ⚠️ Backend pending
- [ ] `/ui/branding` endpoint implementation
- [ ] `/ui/routes/resolve` implementation
- [ ] `/ui/pages/:pageId` implementation
- [ ] Config storage schema
- [ ] Branding storage schema (tenant_branding table)
- [ ] Default branding configuration

#### 1.2 Actions & Validation (Week 5-7)
- [ ] `/ui/actions/execute` endpoint
- [ ] Action handler framework
- [ ] Validation service
- [ ] Permission checking

#### 1.3 Sample Configurations (Week 7-10)
- [ ] Dashboard page configuration
- [ ] Profile page configuration
- [ ] Listings page configuration
- [ ] Menu configuration

### Integration & Testing (Week 10)
- [ ] End-to-end integration testing
- [ ] Performance benchmarking
- [ ] Security audit
- [ ] Documentation review

### Phase 1 Success Criteria
✓ **3 fully functional pages** built entirely from configuration
✓ User can log in, navigate, view data, and submit forms
✓ Configuration changes reflect without frontend redeployment
✓ Caching works correctly
✓ Performance meets baseline targets (<2s page load)

---

## Phase 2: Forms & Workflows (Weeks 11-16)

**Objective:** Add advanced form capabilities and workflow support.

### 2.1 Advanced Form Features (Week 11-12)
- [ ] Conditional field visibility
- [ ] Cross-field validation
- [ ] Computed/derived fields
- [ ] Async lookups (typeahead, remote select)
- [ ] Field-level permissions
- [ ] Dynamic field generation

### 2.2 Complex Validation (Week 12-13)
- [ ] Multi-step validation
- [ ] Async validation with debouncing
- [ ] Custom validation expressions
- [ ] Validation error aggregation
- [ ] Warning vs error severity

### 2.3 Modal Workflows (Week 13-14)
- [ ] Modal page system
- [ ] Modal data passing
- [ ] Modal return values
- [ ] Multi-step modals
- [ ] Nested modals support

### 2.4 Specialized Workflows (Week 14-16)
- [ ] Wizard component
- [ ] Image picker modal
- [ ] Record selector modal
- [ ] File upload with preview
- [ ] Drag-and-drop interfaces

### 2.5 Role-Based UI (Week 15-16)
- [ ] Field-level visibility by role
- [ ] Action-level permissions
- [ ] Dynamic permission checking
- [ ] Permission-based menu filtering

### Phase 2 Success Criteria
✓ Complex forms with conditional logic work correctly
✓ Modal subflows integrate seamlessly
✓ Permission system enforces access control
✓ Validation provides excellent UX

---

## Phase 3: Data & Realtime (Weeks 17-22)

**Objective:** Enhance data visualization and add realtime capabilities.

### 3.1 Advanced Tables (Week 17-18)
- [ ] Server-side pagination
- [ ] Sorting
- [ ] Filtering (client and server)
- [ ] Column configuration
- [ ] Row actions
- [ ] Bulk actions
- [ ] Row selection
- [ ] Exportable data

### 3.2 Charts & Visualization (Week 18-19)
- [ ] Chart widget implementation
  - Line charts
  - Bar charts
  - Pie charts
  - Area charts
- [ ] Chart configuration system
- [ ] Data transformation for charts
- [ ] Interactive charts (drill-down)
- [ ] Chart theming

### 3.3 WebSocket Integration (Week 19-21)
- [ ] WebSocket client
- [ ] Topic subscription system
- [ ] Datasource WebSocket support
- [ ] Live data updates
- [ ] Connection management
- [ ] Reconnection logic
- [ ] Presence indicators

### 3.4 Data Refresh Policies (Week 21-22)
- [ ] Interval-based refresh
- [ ] Background refresh
- [ ] Stale-while-revalidate
- [ ] Manual refresh triggers
- [ ] Optimistic updates
- [ ] Conflict resolution

### Phase 3 Success Criteria
✓ Advanced tables handle large datasets efficiently
✓ Charts render correctly and update live
✓ WebSocket connections are stable
✓ Real-time updates work reliably

---

## Phase 4: Scale & Governance (Weeks 23-28)

**Objective:** Production-readiness, tooling, and operational excellence.

### 4.1 Multi-Tenancy (Week 23-24)
- [ ] Tenant-specific configurations
- [ ] Tenant override system
- [ ] Tenant isolation
- [ ] Tenant-specific themes
- [ ] Feature flags per tenant

### 4.2 Configuration Governance (Week 24-25)
- [ ] Config version control
- [ ] Config validation pipeline
- [ ] Config linting rules
- [ ] Config testing framework
- [ ] Config deployment pipeline
- [ ] Rollback mechanism

### 4.3 Developer Tools (Week 25-26)
- [ ] Config editor/builder
- [ ] Page preview tool
- [ ] Widget documentation
- [ ] Action debugger
- [ ] Configuration validator
- [ ] Mock data generator

### 4.4 Performance Optimization (Week 26-27)
- [ ] Code splitting by route
- [ ] Lazy loading widgets
- [ ] Bundle size optimization
- [ ] Render performance tuning
- [ ] Database query optimization
- [ ] CDN setup for configs

### 4.5 Monitoring & Observability (Week 27-28)
- [ ] Frontend error tracking
- [ ] Performance monitoring
- [ ] User analytics
- [ ] Backend tracing
- [ ] Audit logging
- [ ] Alerting system

### Phase 4 Success Criteria
✓ System supports multiple tenants
✓ Configuration changes follow governed process
✓ Developer tooling enables rapid iteration
✓ Performance metrics meet production standards
✓ Monitoring provides actionable insights

---

## Phase 5: Production Launch (Week 29+)

### Pre-Launch Activities
- [ ] Load testing
- [ ] Security penetration testing
- [ ] Disaster recovery testing
- [ ] Documentation completion
- [ ] Training materials
- [ ] Support runbooks

### Launch Activities
- [ ] Staged rollout
- [ ] Monitoring dashboard setup
- [ ] On-call rotation
- [ ] Go-live checklist
- [ ] Rollback plan ready

### Post-Launch
- [ ] Performance monitoring
- [ ] Bug triage and fixes
- [ ] User feedback collection
- [ ] Feature prioritization for next iteration

---

## Ongoing Activities

### Throughout All Phases
- Weekly sprint planning
- Daily standups
- Code reviews
- Automated testing
- Documentation updates
- Stakeholder demos

### Quality Gates
- Unit test coverage >80%
- Integration test coverage for critical paths
- Performance benchmarks met
- Security scans passing
- Accessibility compliance (WCAG 2.1 AA)
- Documentation complete

---

## Resource Requirements

### Team Composition
- **Frontend Developers:** 2-3
- **Backend Developers:** 2-3
- **UI/UX Designer:** 1
- **QA Engineer:** 1
- **DevOps Engineer:** 1
- **Product Owner:** 1
- **Tech Lead/Architect:** 1

### Infrastructure
- Development environment
- Staging environment
- Production environment
- CI/CD pipeline
- Monitoring stack
- Version control (Git)

---

## Risk Management

### Technical Risks
- **Complex state management** → Mitigate with thorough design and testing
- **Performance at scale** → Load testing early and often
- **WebSocket reliability** → Implement robust reconnection logic
- **Configuration complexity** → Build validation and testing tools

### Project Risks
- **Scope creep** → Strict phase boundaries and MVP focus
- **Timeline slippage** → Buffer time in estimates, regular checkpoints
- **Team availability** → Cross-training, documentation
- **Technology changes** → Minimize dependencies, modular design

---

## Overall Progress Summary

### Phase 0: Discovery & Foundation - ✅ **100% Complete**
- ✅ Widget taxonomy (ISSUE-001)
- ✅ Configuration schema (ISSUE-002)
- ✅ Action catalog (ISSUE-003)
- ✅ Technical stack finalization (ISSUE-004)
- ✅ Development environment setup (ISSUE-005)
- ✅ Project repository structure (ISSUE-006)

### Phase 0.5: Technology Stack Migration - 🚀 **80% Complete** (4/5 issues complete)
- ✅ Vite + TypeScript 5 + BiomeJS (ISSUE-010) - **COMPLETE**
- ✅ Tailwind CSS + shadcn/ui setup (ISSUE-011) - **COMPLETE**
- ✅ TanStack Router migration (ISSUE-012) - **COMPLETE**
- ✅ Azure MSAL parallel implementation (ISSUE-013) - **COMPLETE**
- ⏳ Widget registry + TextInputWidget POC (ISSUE-014) - pending

**Note:** Phase 0.5 inserted to migrate technology stack before Phase 1 continues. See ADR-012 for rationale.

### Phase 1.1: Authentication & Bootstrap - 🚀 **85% Complete**
- ✅ Login page implementation (ISSUE-007)
- ✅ OAuth integration (ISSUE-008)
- ✅ Token management (ISSUE-009)
- ✅ Bootstrap API integration - Frontend (ISSUE-010-bootstrap-api) ⚠️ Backend pending
- ⏳ Tenant identification (pending - deferred until after Phase 0.5)
- ⏳ Branding system (pending - deferred until after Phase 0.5)

### Phase 1.2: Routing & Page Loading - ⏳ **0% Complete**
- Pending (resumes after Phase 0.5)

### Phase 1.3: Widget Registry & Core Widgets - ⏳ **0% Complete**
- Pending (resumes after Phase 0.5)

---

**Version:** 2.2  
**Last Updated:** January 21, 2026  
**Status:** Active Development - Phase 0.5 (Technology Stack Migration) & Phase 1.1 (Authentication & Bootstrap)
