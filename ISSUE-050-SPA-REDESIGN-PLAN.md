# Issue #050: OpenPortal SPA Architecture Redesign with Multi-Tenant Theming

**Phase:** Major Architecture Enhancement  
**Component:** Full-stack  
**Priority:** High  
**Estimated Duration:** 4-6 weeks  
**Date Created:** January 26, 2026

## Problem Statement

The current OpenPortal application needs to be transformed into a true Single Page Application (SPA) where:
1. Menus (top/bottom/side) persist across navigation without reloading
2. Tenant-based branding is recognized via domain and loaded via bootstrap API
3. Menus dynamically update based on context but never fully remove
4. All components have consistent branding/styling (currently black/white with transparent backgrounds)
5. Protected routes trigger authentication flows
6. A comprehensive demo showcases all features with 3 different tenant themes

## Current State Analysis

### ✅ What We Have
- **React 19.2.3** with Vite 6 build system
- **TanStack Router v1.132** for file-based routing
- **Tailwind CSS v4.1** with shadcn/ui components
- **shadcn/ui** with 364 components available (sidebar, navigation, forms, charts, etc.)
- **Bootstrap API** implemented (tenant recognition, branding)
- **Menu Components**: TopMenu, SideMenu, FooterMenu, Header
- **Existing Widgets**: 18 widgets (Page, Section, Grid, Card, TextInput, Select, DatePicker, Checkbox, Table, KPI, Modal, Toast, Chart, Form, Wizard, MenuWidget)
- **Branding System**: Multi-tenant theming support documented
- **WebSocket Support**: Real-time data updates
- **Form Validation**: React Hook Form + Zod
- **Monitoring**: Full observability stack (Issue #041)

### ❌ What's Missing

#### Architecture Issues
- Current `__root.tsx` has no persistent menu structure
- Pages render in isolation without consistent layout
- Menu state doesn't persist across navigation
- No context-sensitive menu switching
- Branding not applied to all components

#### Missing Components/Widgets
1. **HeroWidget** - Hero image with overlay text for landing pages
2. **PricingWidget** - Package comparison cards (multi-column)
3. **TeamMemberWidget** - Team member profile cards
4. **LocationWizard** - Multi-step form for location creation
5. **UserTableWidget** - Advanced user management table
6. **LocationTableWidget** - Business location management table
7. **StatisticsWidget** - Dashboard statistics panels
8. **UserAvatarWidget** - User avatar with dropdown actions

#### Missing Demo Pages
- Homepage (hero, marketing, pricing)
- About Us page
- Team page
- Dashboard (protected)
- Users management page (protected)
- Locations management page (protected)

#### Missing Configuration
- Demo tenant configurations (3 tenants)
- Demo data generators
- Route-specific menu configurations
- Tenant branding variations

## Solution Design

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Browser Window                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Persistent Header                      │ │
│  │  Logo | Top Menu (Dynamic) | User Menu             │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌──────┬─────────────────────────────────────────────┐ │
│  │      │                                              │ │
│  │ Side │         Page Content                         │ │
│  │ Menu │         (Routes Change)                      │ │
│  │(Dyn) │         <Outlet />                          │ │
│  │      │                                              │ │
│  └──────┴─────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Persistent Footer                      │ │
│  │  Footer Links | Copyright | Social                 │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Changes

#### 1. SPA Root Layout (`src/routes/__root.tsx`)
```typescript
// New structure with persistent menus
<ThemeProvider>
  <BootstrapProvider>
    <BrandingProvider>
      <MenuProvider>
        <AppLayout>
          <Header />
          <div className="flex">
            <SideMenu />
            <main>
              <Outlet /> {/* Pages render here */}
            </main>
          </div>
          <Footer />
        </AppLayout>
      </MenuProvider>
    </BrandingProvider>
  </BootstrapProvider>
</ThemeProvider>
```

#### 2. Menu Context System
- **MenuContext**: Global state for menu configuration
- **useMenu()**: Hook to access/update menu state
- **Menu Update Flow**:
  1. Route changes → `beforeLoad` hook
  2. Load route-specific menu config from API
  3. Update MenuContext with new menu items
  4. Menus re-render with new items (no page reload)

#### 3. Tenant Branding Integration
- Bootstrap API called on app load
- Tenant identified by domain
- Branding configuration loaded and cached
- CSS variables injected for colors, fonts, spacing
- Logos loaded and applied to Header/Footer

#### 4. Protected Route Pattern
```typescript
// src/routes/dashboard.tsx
export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login', search: { redirect: '/dashboard' } })
    }
    
    // Load dashboard-specific menus
    const menus = await loadMenuConfig('dashboard')
    context.menuContext.setMenus(menus)
  },
  component: DashboardPage
})
```

## Implementation Plan

### Phase 1: SPA Layout Architecture (Week 1)

#### 1.1 Install Required shadcn Components
```bash
npx shadcn@latest add sidebar
npx shadcn@latest add scroll-area
npx shadcn@latest add separator
```

#### 1.2 Create MenuContext Provider
**File:** `src/contexts/MenuContext.tsx`
- State: `topMenuItems`, `sideMenuItems`, `footerMenuItems`, `activeItemId`
- Actions: `updateMenus()`, `setActiveItem()`, `toggleSidebar()`

#### 1.3 Create AppLayout Component
**File:** `src/components/layouts/AppLayout.tsx`
- Persistent header with TopMenu
- Collapsible SideMenu (shadcn sidebar)
- Main content area with Outlet
- Persistent footer with FooterMenu

#### 1.4 Update Root Route
**File:** `src/routes/__root.tsx`
- Wrap app with MenuProvider
- Replace simple div with AppLayout
- Add BrandingProvider for tenant themes

#### 1.5 Create Menu Configuration Service
**File:** `src/services/menuConfigService.ts`
- `loadMenuConfig(context: string)` - Load menus for route context
- Cache menu configurations
- Handle menu updates on route changes

**Deliverables:**
- ✅ MenuContext with state management
- ✅ AppLayout with persistent menus
- ✅ Menu configuration service
- ✅ Updated __root.tsx

---

### Phase 2: Missing Widgets Implementation (Week 2)

#### 2.1 HeroWidget
**File:** `src/widgets/HeroWidget/HeroWidget.tsx`

**Props:**
```typescript
{
  backgroundImage: string
  title: string
  subtitle?: string
  ctaButtons?: Array<{ text: string, action: ActionConfig }>
  overlay?: { opacity: number, color: string }
  height?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}
```

**shadcn components:** card, button

#### 2.2 PricingWidget
**File:** `src/widgets/PricingWidget/PricingWidget.tsx`

**Props:**
```typescript
{
  packages: Array<{
    name: string
    price: number | string
    currency?: string
    period?: string
    features: string[]
    featured?: boolean
    ctaText?: string
    ctaAction?: ActionConfig
  }>
  columns?: 2 | 3 | 4
}
```

**shadcn components:** card, badge, button

#### 2.3 TeamMemberWidget
**File:** `src/widgets/TeamMemberWidget/TeamMemberWidget.tsx`

**Props:**
```typescript
{
  members: Array<{
    name: string
    role: string
    bio?: string
    avatar?: string
    social?: { linkedin?: string, twitter?: string, github?: string }
  }>
  layout?: 'grid' | 'list'
  columns?: 2 | 3 | 4
}
```

**shadcn components:** card, avatar, button

#### 2.4 LocationWizardWidget
**File:** `src/widgets/LocationWizardWidget/LocationWizardWidget.tsx`

**3-Step Wizard:**
1. Basic Info (name, description, image)
2. Address Details (address, city, country, postal code)
3. Classification (tags, checkable options)

**shadcn components:** form, input, textarea, checkbox, button, tabs, separator

#### 2.5 UserManagementWidget
**File:** `src/widgets/UserManagementWidget/UserManagementWidget.tsx`

**Features:**
- User table with avatar, name, email, role, status
- Edit user modal
- Create user modal
- Delete confirmation dialog

**shadcn components:** table, dialog, form, avatar, badge, button

#### 2.6 LocationManagementWidget
**File:** `src/widgets/LocationManagementWidget/LocationManagementWidget.tsx`

**Features:**
- Location table with image, name, city, tags
- Create location wizard (modal)
- Edit/delete actions

**shadcn components:** table, dialog, badge, button

**Deliverables:**
- ✅ HeroWidget with tests
- ✅ PricingWidget with tests
- ✅ TeamMemberWidget with tests
- ✅ LocationWizardWidget with tests
- ✅ UserManagementWidget with tests
- ✅ LocationManagementWidget with tests

---

### Phase 3: Demo Pages Implementation (Week 3)

#### 3.1 Homepage Route
**File:** `src/routes/index.tsx`

**Structure:**
```typescript
<Page>
  <HeroWidget 
    backgroundImage="/demo/hero-bg.jpg"
    title="Welcome to OpenPortal"
    subtitle="API-Driven Business UI Platform"
    ctaButtons={[
      { text: "Get Started", action: { navigate: "/dashboard" } },
      { text: "Learn More", action: { navigate: "/about" } }
    ]}
  />
  
  <Section title="Why OpenPortal?">
    <Grid columns={3}>
      <Card>Feature 1</Card>
      <Card>Feature 2</Card>
      <Card>Feature 3</Card>
    </Grid>
  </Section>
  
  <PricingWidget 
    packages={[
      { name: "Starter", price: 29, features: [...] },
      { name: "Business", price: 99, features: [...], featured: true },
      { name: "Enterprise", price: 299, features: [...] },
      { name: "Custom", price: "Contact Us", features: [...] }
    ]}
  />
</Page>
```

**Menu Config:** Public menu (Home, About, Team, Login)

#### 3.2 About Us Route
**File:** `src/routes/about.tsx`

**Structure:**
```typescript
<Page>
  <Section title="About OpenPortal">
    <Card>
      <p>Company history and mission...</p>
    </Card>
  </Section>
  
  <Section title="Our Values">
    <Grid columns={3}>
      <Card>Innovation</Card>
      <Card>Excellence</Card>
      <Card>Partnership</Card>
    </Grid>
  </Section>
</Page>
```

**Menu Config:** Public menu

#### 3.3 Team Route
**File:** `src/routes/team.tsx`

**Structure:**
```typescript
<Page>
  <Section title="Our Team">
    <TeamMemberWidget 
      members={demoTeamData}
      layout="grid"
      columns={3}
    />
  </Section>
</Page>
```

**Menu Config:** Public menu

#### 3.4 Dashboard Route (Protected)
**File:** `src/routes/dashboard.tsx`

**Structure:**
```typescript
<Page>
  <Grid columns={3} gap="lg">
    <KPIWidget label="Total Users" value={1234} trend="+12%" />
    <KPIWidget label="Active Sessions" value={456} trend="+5%" />
    <KPIWidget label="Revenue" value="$123,456" trend="+18%" />
  </Grid>
  
  <Grid columns={2}>
    <ChartWidget 
      type="line"
      title="User Growth"
      datasourceId="user-growth"
    />
    <ChartWidget 
      type="bar"
      title="Revenue by Product"
      datasourceId="revenue-data"
    />
  </Grid>
  
  <TableWidget 
    title="Recent Transactions"
    datasourceId="transactions"
    columns={[...]}
  />
  
  <TableWidget 
    title="Top Locations"
    datasourceId="top-locations"
    columns={[...]}
  />
</Page>
```

**Menu Config:** 
- Top: Dashboard, Users, Locations
- Side: Overview, Analytics, Reports

#### 3.5 Users Route (Protected)
**File:** `src/routes/users.tsx`

**Structure:**
```typescript
<Page>
  <Section title="User Management">
    <UserManagementWidget 
      datasourceId="users"
      onCreateUser={handleCreateUser}
      onEditUser={handleEditUser}
      onDeleteUser={handleDeleteUser}
    />
  </Section>
</Page>
```

**Menu Config:**
- Top: Dashboard, Users, Locations
- Side: All Users, Invitations, Requests, Settings

#### 3.6 Locations Route (Protected)
**File:** `src/routes/locations.tsx`

**Structure:**
```typescript
<Page>
  <Section title="Location Management">
    <LocationManagementWidget 
      datasourceId="locations"
      onCreateLocation={handleCreateLocation}
      onEditLocation={handleEditLocation}
      onDeleteLocation={handleDeleteLocation}
    />
  </Section>
</Page>
```

**Menu Config:**
- Top: Dashboard, Users, Locations
- Side: All Locations, Add New, Map View, Import

**Deliverables:**
- ✅ All 6 routes implemented
- ✅ Route-specific menu configurations
- ✅ Protected route guards
- ✅ Demo data integrated

---

### Phase 4: Multi-Tenant Theming (Week 4)

#### 4.1 Tenant 1: Default Theme (Blue)
**File:** `backend/src/config/tenants/tenant1.json`

```json
{
  "tenantId": "tenant1",
  "name": "Acme Corporation",
  "domain": "acme.openportal.local",
  "branding": {
    "colors": {
      "primary": "#2563eb",
      "secondary": "#7c3aed",
      "accent": "#06b6d4"
    },
    "logos": {
      "primary": "/tenants/tenant1/logo.svg",
      "login": "/tenants/tenant1/logo-lg.svg"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    }
  }
}
```

#### 4.2 Tenant 2: Green Theme (Eco)
**File:** `backend/src/config/tenants/tenant2.json`

```json
{
  "tenantId": "tenant2",
  "name": "EcoTech Solutions",
  "domain": "eco.openportal.local",
  "branding": {
    "colors": {
      "primary": "#10b981",
      "secondary": "#059669",
      "accent": "#84cc16"
    },
    "logos": {
      "primary": "/tenants/tenant2/logo.svg",
      "login": "/tenants/tenant2/logo-lg.svg"
    },
    "fonts": {
      "heading": "Poppins",
      "body": "Open Sans"
    }
  }
}
```

#### 4.3 Tenant 3: Purple Theme (Creative)
**File:** `backend/src/config/tenants/tenant3.json`

```json
{
  "tenantId": "tenant3",
  "name": "Creative Studios",
  "domain": "creative.openportal.local",
  "branding": {
    "colors": {
      "primary": "#a855f7",
      "secondary": "#ec4899",
      "accent": "#f59e0b"
    },
    "logos": {
      "primary": "/tenants/tenant3/logo.svg",
      "login": "/tenants/tenant3/logo-lg.svg"
    },
    "fonts": {
      "heading": "Playfair Display",
      "body": "Lato"
    }
  }
}
```

#### 4.4 Branding Provider Enhancement
**File:** `src/contexts/BrandingContext.tsx`

- Load branding on bootstrap
- Inject CSS variables
- Load custom fonts
- Handle logo rendering
- Theme switching support

#### 4.5 Component Styling Updates
Update all widgets to use Tailwind classes with CSS variables:
- `bg-primary` instead of hardcoded colors
- `text-primary` for brand text colors
- Consistent spacing and borders
- Dark mode support

**Deliverables:**
- ✅ 3 tenant configurations
- ✅ BrandingProvider with dynamic theming
- ✅ All components using theme variables
- ✅ Logo loading and rendering
- ✅ Font loading support

---

### Phase 5: Data & Forms (Week 5)

#### 5.1 Demo Data Generators
**File:** `backend/src/data/generators/`

- `userGenerator.ts` - Generate 100+ demo users
- `locationGenerator.ts` - Generate 50+ demo locations
- `transactionGenerator.ts` - Generate transaction data
- `analyticsGenerator.ts` - Generate chart data

#### 5.2 Form Validation Schemas
**File:** `src/schemas/`

- `userSchema.ts` - User creation/edit validation
- `locationSchema.ts` - Location wizard validation
- `loginSchema.ts` - Login form validation

**Using Zod:**
```typescript
export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user", "viewer"]),
  // ...
})
```

#### 5.3 Dynamic Data Loading
**File:** `src/services/dataService.ts`

**Features:**
- Polling for real-time updates
- WebSocket subscriptions
- Cache invalidation
- Optimistic updates

#### 5.4 Backend API Endpoints
**File:** `backend/src/routes/demo.ts`

```typescript
GET  /api/demo/users
POST /api/demo/users
PUT  /api/demo/users/:id
DELETE /api/demo/users/:id

GET  /api/demo/locations
POST /api/demo/locations
PUT  /api/demo/locations/:id
DELETE /api/demo/locations/:id

GET  /api/demo/dashboard/kpi
GET  /api/demo/dashboard/charts/:type
GET  /api/demo/dashboard/transactions
```

**Deliverables:**
- ✅ Demo data generators
- ✅ Validation schemas for all forms
- ✅ Dynamic data loading service
- ✅ Backend API endpoints
- ✅ WebSocket integration for real-time updates

---

### Phase 6: Testing & Polish (Week 6)

#### 6.1 Component Tests
- Unit tests for all new widgets
- Integration tests for menu system
- Route navigation tests

#### 6.2 E2E Tests
**File:** `tests/e2e/spa-navigation.spec.ts`
- Test persistent menus across navigation
- Test menu updates on route change
- Test protected route access
- Test tenant theming

#### 6.3 Visual Regression Tests
- Screenshot tests for each tenant theme
- Compare layouts across tenants
- Verify branding consistency

#### 6.4 Performance Optimization
- Lazy load widgets
- Code splitting by route
- Image optimization
- Bundle size analysis

#### 6.5 Documentation
- Update architecture.md
- Create SPA navigation guide
- Document multi-tenant setup
- Create demo deployment guide

**Deliverables:**
- ✅ 100% test coverage for new components
- ✅ E2E test suite passing
- ✅ Performance benchmarks met
- ✅ Documentation updated

---

## Component Inventory

### Existing Components (Keep As-Is)
- ✅ PageWidget
- ✅ SectionWidget
- ✅ GridWidget
- ✅ CardWidget
- ✅ TextInputWidget
- ✅ SelectWidget
- ✅ DatePickerWidget
- ✅ CheckboxWidget
- ✅ TableWidget
- ✅ KPIWidget
- ✅ ModalWidget
- ✅ ToastWidget
- ✅ ChartWidget
- ✅ FormWidget
- ✅ WizardWidget
- ✅ MenuWidget
- ✅ TopMenu
- ✅ SideMenu
- ✅ FooterMenu
- ✅ Header

### New Components (To Be Created)
1. **HeroWidget** - Landing page hero sections
2. **PricingWidget** - Package comparison cards
3. **TeamMemberWidget** - Team member profiles
4. **LocationWizardWidget** - Multi-step location form
5. **UserManagementWidget** - Complete user CRUD
6. **LocationManagementWidget** - Complete location CRUD
7. **AppLayout** - SPA root layout component
8. **BrandingProvider** - Dynamic theming context

### shadcn Components to Install
```bash
# Phase 1
npx shadcn@latest add sidebar scroll-area separator

# Phase 2
npx shadcn@latest add avatar badge carousel aspect-ratio

# Phase 3
npx shadcn@latest add tabs breadcrumb skeleton

# Phase 4
npx shadcn@latest add toggle toggle-group command
```

## Demo Data Structure

### Users (100+ records)
```typescript
{
  id: string
  name: string
  email: string
  avatar: string
  role: 'admin' | 'user' | 'viewer'
  status: 'active' | 'inactive' | 'pending'
  lastLogin: Date
  createdAt: Date
}
```

### Locations (50+ records)
```typescript
{
  id: string
  name: string
  description: string
  image: string
  address: string
  city: string
  country: string
  postalCode: string
  tags: string[]
  options: {
    hasParking: boolean
    hasWifi: boolean
    is24Hours: boolean
    // ...
  }
  createdAt: Date
}
```

### Transactions (1000+ records)
```typescript
{
  id: string
  userId: string
  amount: number
  type: 'sale' | 'refund' | 'subscription'
  status: 'completed' | 'pending' | 'failed'
  timestamp: Date
}
```

## Menu Configuration Structure

### Public Menu (Homepage, About, Team)
```json
{
  "topMenu": [
    { "id": "home", "label": "Home", "path": "/" },
    { "id": "about", "label": "About", "path": "/about" },
    { "id": "team", "label": "Team", "path": "/team" }
  ],
  "sideMenu": [],
  "footerMenu": [
    { "id": "privacy", "label": "Privacy", "path": "/privacy" },
    { "id": "terms", "label": "Terms", "path": "/terms" }
  ],
  "showLoginButton": true
}
```

### Dashboard Menu (Protected Routes)
```json
{
  "topMenu": [
    { "id": "dashboard", "label": "Dashboard", "path": "/dashboard", "icon": "LayoutDashboard" },
    { "id": "users", "label": "Users", "path": "/users", "icon": "Users" },
    { "id": "locations", "label": "Locations", "path": "/locations", "icon": "MapPin" }
  ],
  "sideMenu": {
    "dashboard": [
      { "id": "overview", "label": "Overview", "path": "/dashboard" },
      { "id": "analytics", "label": "Analytics", "path": "/dashboard/analytics" },
      { "id": "reports", "label": "Reports", "path": "/dashboard/reports" }
    ],
    "users": [
      { "id": "all-users", "label": "All Users", "path": "/users" },
      { "id": "invitations", "label": "Invitations", "path": "/users/invitations" },
      { "id": "requests", "label": "Requests", "path": "/users/requests" },
      { "id": "settings", "label": "Settings", "path": "/users/settings" }
    ],
    "locations": [
      { "id": "all-locations", "label": "All Locations", "path": "/locations" },
      { "id": "add-location", "label": "Add New", "path": "/locations/new" },
      { "id": "map-view", "label": "Map View", "path": "/locations/map" },
      { "id": "import", "label": "Import", "path": "/locations/import" }
    ]
  },
  "footerMenu": []
}
```

## Success Criteria

### Functional Requirements
- ✅ Menus persist across navigation without page reload
- ✅ Side menu updates based on top menu selection
- ✅ Tenant branding loaded from domain recognition
- ✅ All components styled with tenant theme
- ✅ Protected routes redirect to login
- ✅ Forms validate with proper error messages
- ✅ Data tables load data dynamically (separate from widgets)
- ✅ Real-time data updates work (polling or WebSocket)

### Demo Requirements
- ✅ 6 demo pages fully functional
- ✅ 3 tenant themes working with different color schemes
- ✅ User management CRUD operations
- ✅ Location wizard with 3 steps
- ✅ Dashboard with live statistics
- ✅ All navigation flows work smoothly

### Technical Requirements
- ✅ No console errors or warnings
- ✅ TypeScript strict mode passes
- ✅ All tests passing
- ✅ Performance metrics acceptable (LCP < 2.5s)
- ✅ Accessibility audit passes (WCAG 2.1 Level AA)

## Risk Assessment

### High Risk
- **Menu state management complexity** - Mitigated by using React Context
- **Route-specific menu loading** - Mitigated by beforeLoad hooks
- **Theme switching performance** - Mitigated by CSS variables

### Medium Risk
- **Data synchronization with polling/WebSocket** - Use existing infrastructure
- **Form validation complexity** - Use Zod schemas
- **Tenant domain routing in development** - Use /etc/hosts for local testing

### Low Risk
- **shadcn component integration** - Already using successfully
- **Widget development** - Pattern well established
- **Demo data generation** - Straightforward implementation

## Development Timeline

| Week | Phase | Deliverables |
|------|-------|-------------|
| 1 | SPA Layout Architecture | MenuContext, AppLayout, Updated __root.tsx |
| 2 | Missing Widgets | 6 new widgets with tests |
| 3 | Demo Pages | 6 routes with configurations |
| 4 | Multi-Tenant Theming | 3 tenant themes, BrandingProvider |
| 5 | Data & Forms | Data generators, validation, APIs |
| 6 | Testing & Polish | E2E tests, optimization, documentation |

## Testing Strategy

### Unit Tests
- All new widgets have 80%+ coverage
- MenuContext actions tested
- Form validation schemas tested

### Integration Tests
- Menu updates on route change
- Protected route redirects
- Tenant theme application

### E2E Tests
- Complete user flows (public → login → dashboard → users → locations)
- Menu persistence across navigation
- Theme switching between tenants
- Form submissions with validation

## Documentation Updates

### Files to Update
- `documentation/architecture.md` - Add SPA layout section
- `documentation/widget-catalog.md` - Add new widgets
- `documentation/branding.md` - Update with implementation details
- `README.md` - Add demo information
- Create `documentation/spa-navigation.md` - Navigation guide
- Create `documentation/multi-tenant-setup.md` - Tenant configuration guide

## Next Steps

1. **Review and approve this plan**
2. **Create development branch** `feature/spa-redesign`
3. **Begin Phase 1 implementation**
4. **Daily standups to track progress**
5. **Weekly demos to stakeholders**

## Notes

- Use existing infrastructure wherever possible (no reinventing wheels)
- Leverage shadcn/ui components extensively
- Follow established widget patterns
- Maintain backward compatibility where feasible
- Document all architectural decisions

---

**Plan Version:** 1.0  
**Last Updated:** January 26, 2026  
**Status:** Ready for Review
