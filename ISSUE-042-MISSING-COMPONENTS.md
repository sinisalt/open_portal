# Issue #042: Missing Components Analysis

**Date:** January 26, 2026  
**Purpose:** Detailed analysis of components/widgets that need to be created for the SPA redesign

## Component Gap Analysis

### Current Widget Inventory (18 widgets)

#### Layout & Structure (5)
- ✅ **PageWidget** - Top-level page container
- ✅ **SectionWidget** - Content sections with optional titles
- ✅ **GridWidget** - Responsive grid layouts
- ✅ **CardWidget** - Content cards
- ✅ **MenuWidget** - Dynamic menu rendering

#### Form Inputs (4)
- ✅ **TextInputWidget** - Text input fields
- ✅ **SelectWidget** - Dropdown selections
- ✅ **DatePickerWidget** - Date selection
- ✅ **CheckboxWidget** - Boolean checkboxes

#### Data Display (2)
- ✅ **TableWidget** - Data tables with sorting/filtering
- ✅ **KPIWidget** - Key performance indicators
- ✅ **ChartWidget** - Charts (line, bar, pie, area)

#### Dialogs & Feedback (4)
- ✅ **ModalWidget** - Modal dialogs
- ✅ **ModalPageWidget** - Full-page modals
- ✅ **ToastWidget** - Toast notifications
- ✅ **WizardWidget** - Multi-step wizards

#### Navigation (3)
- ✅ **TopMenu** - Horizontal top navigation
- ✅ **SideMenu** - Vertical sidebar navigation
- ✅ **FooterMenu** - Footer navigation
- ✅ **Header** - Application header with branding

---

## Missing Components (8 new + 1 layout)

### 1. HeroWidget ⭐ NEW

**Purpose:** Landing page hero sections with background images and CTAs

**Use Cases:**
- Homepage hero banner
- Marketing landing pages
- Feature introductions

**Props Interface:**
```typescript
interface HeroWidgetConfig extends WidgetConfig {
  type: 'Hero'
  backgroundImage: string
  backgroundPosition?: 'center' | 'top' | 'bottom'
  title: string
  titleSize?: 'sm' | 'md' | 'lg' | 'xl'
  subtitle?: string
  ctaButtons?: Array<{
    text: string
    variant?: 'default' | 'primary' | 'secondary' | 'outline'
    action: ActionConfig
  }>
  overlay?: {
    enabled: boolean
    color?: string
    opacity?: number
  }
  height?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  textAlign?: 'left' | 'center' | 'right'
  textColor?: string
}
```

**shadcn Components:**
- `card` - For content container
- `button` - For CTA buttons
- `separator` - For visual separation

**Implementation Priority:** HIGH (needed for homepage)

**Estimated Time:** 4-6 hours

---

### 2. PricingWidget ⭐ NEW

**Purpose:** Display package comparison with pricing tiers

**Use Cases:**
- Pricing pages
- Package selection
- Feature comparisons

**Props Interface:**
```typescript
interface PricingPackage {
  id: string
  name: string
  price: number | string
  currency?: string
  period?: 'month' | 'year' | 'one-time'
  description?: string
  features: Array<string | { text: string, included: boolean }>
  featured?: boolean
  ctaText?: string
  ctaAction?: ActionConfig
  badge?: string
}

interface PricingWidgetConfig extends WidgetConfig {
  type: 'Pricing'
  packages: PricingPackage[]
  columns?: 2 | 3 | 4
  highlightFeatured?: boolean
  comparisonMode?: boolean
}
```

**shadcn Components:**
- `card` - For package cards
- `badge` - For "Featured" or "Popular" labels
- `button` - For CTA buttons
- `separator` - Between features

**Implementation Priority:** HIGH (needed for homepage)

**Estimated Time:** 6-8 hours

---

### 3. TeamMemberWidget ⭐ NEW

**Purpose:** Display team member profiles with photos and social links

**Use Cases:**
- Team/About pages
- Leadership profiles
- Employee directory

**Props Interface:**
```typescript
interface TeamMember {
  id: string
  name: string
  role: string
  bio?: string
  avatar?: string
  email?: string
  phone?: string
  social?: {
    linkedin?: string
    twitter?: string
    github?: string
    website?: string
  }
}

interface TeamMemberWidgetConfig extends WidgetConfig {
  type: 'TeamMember'
  members: TeamMember[]
  layout?: 'grid' | 'list'
  columns?: 2 | 3 | 4
  showBio?: boolean
  showSocial?: boolean
  showContact?: boolean
}
```

**shadcn Components:**
- `card` - For member cards
- `avatar` - For profile pictures
- `button` - For social links
- `separator` - Between sections

**Implementation Priority:** MEDIUM (needed for team page)

**Estimated Time:** 4-6 hours

---

### 4. LocationWizardWidget ⭐ NEW

**Purpose:** Multi-step form for creating/editing business locations

**Use Cases:**
- Location onboarding
- Location management
- Multi-step data entry

**Props Interface:**
```typescript
interface LocationWizardStep {
  id: string
  title: string
  description?: string
  fields: FormFieldConfig[]
}

interface LocationWizardConfig extends WidgetConfig {
  type: 'LocationWizard'
  steps: [
    {
      id: 'basic-info'
      title: 'Basic Information'
      fields: ['name', 'description', 'image']
    },
    {
      id: 'address'
      title: 'Address Details'
      fields: ['address', 'city', 'country', 'postalCode']
    },
    {
      id: 'classification'
      title: 'Classification'
      fields: ['tags', 'options']
    }
  ]
  onComplete: ActionConfig
  onCancel?: ActionConfig
  showProgress?: boolean
  allowSkip?: boolean
}
```

**shadcn Components:**
- `form` - Form wrapper
- `input` - Text inputs
- `textarea` - Description field
- `checkbox` - Options checkboxes
- `button` - Navigation buttons
- `tabs` - Step indicators
- `progress` - Completion progress
- `separator` - Between steps

**Implementation Priority:** HIGH (needed for locations page)

**Estimated Time:** 8-12 hours

---

### 5. UserManagementWidget ⭐ NEW

**Purpose:** Complete user CRUD with table, modals, and actions

**Use Cases:**
- User administration
- User directory
- Access management

**Props Interface:**
```typescript
interface UserManagementConfig extends WidgetConfig {
  type: 'UserManagement'
  datasourceId: string
  columns: TableColumnConfig[]
  actions: {
    create?: boolean
    edit?: boolean
    delete?: boolean
    bulkActions?: string[]
  }
  filters?: {
    role?: boolean
    status?: boolean
    search?: boolean
  }
  pagination?: boolean
  sorting?: boolean
}
```

**Features:**
- User table with avatar, name, email, role, status
- Create user modal with form
- Edit user modal with pre-filled data
- Delete confirmation dialog
- Bulk actions (activate, deactivate, delete)
- Search and filtering
- Role-based visibility

**shadcn Components:**
- `table` - User data table
- `dialog` - Create/edit modals
- `alert-dialog` - Delete confirmation
- `form` - Form in modals
- `avatar` - User avatars
- `badge` - Status badges
- `button` - Action buttons
- `dropdown-menu` - Row actions
- `checkbox` - Bulk selection
- `input` - Search field

**Implementation Priority:** HIGH (needed for users page)

**Estimated Time:** 10-14 hours

---

### 6. LocationManagementWidget ⭐ NEW

**Purpose:** Complete location CRUD with table, wizard, and actions

**Use Cases:**
- Business location management
- Store directory
- Office management

**Props Interface:**
```typescript
interface LocationManagementConfig extends WidgetConfig {
  type: 'LocationManagement'
  datasourceId: string
  columns: TableColumnConfig[]
  actions: {
    create?: boolean
    edit?: boolean
    delete?: boolean
    bulkActions?: string[]
  }
  wizardSteps?: LocationWizardStep[]
  filters?: {
    city?: boolean
    tags?: boolean
    search?: boolean
  }
  viewModes?: ['table', 'grid', 'map']
}
```

**Features:**
- Location table with image, name, city, tags
- Create location wizard (modal)
- Edit location form
- Delete confirmation
- Tag filtering
- City filtering
- Map view (future)

**shadcn Components:**
- `table` - Location table
- `dialog` - Wizard modal
- `form` - Wizard forms
- `badge` - Tag badges
- `button` - Actions
- `dropdown-menu` - Row actions
- `input` - Search
- `tabs` - View modes

**Implementation Priority:** HIGH (needed for locations page)

**Estimated Time:** 10-14 hours

---

### 7. AppLayout Component ⭐ NEW

**Purpose:** Root layout with persistent menus for SPA

**Use Cases:**
- Main application layout
- Menu persistence
- Route transitions

**Props Interface:**
```typescript
interface AppLayoutProps {
  children: React.ReactNode
  menuConfig?: MenuConfiguration
  showHeader?: boolean
  showSidebar?: boolean
  showFooter?: boolean
  sidebarCollapsed?: boolean
  onSidebarToggle?: () => void
}
```

**Features:**
- Persistent header with TopMenu
- Collapsible sidebar with SideMenu
- Main content area with route outlet
- Persistent footer
- Responsive layout
- Theme-aware styling

**shadcn Components:**
- `sidebar` - Main sidebar component
- `scroll-area` - Scrollable content
- `separator` - Visual separation
- `button` - Toggle buttons

**Implementation Priority:** CRITICAL (foundation for SPA)

**Estimated Time:** 6-8 hours

---

### 8. BrandingProvider Component ⭐ NEW

**Purpose:** Context provider for dynamic tenant theming

**Use Cases:**
- Multi-tenant theming
- Dynamic brand switching
- CSS variable injection

**Context Interface:**
```typescript
interface BrandingContextValue {
  tenantId: string | null
  branding: BrandingConfig | null
  isLoading: boolean
  error: Error | null
  
  loadBranding: (tenantId: string) => Promise<void>
  applyTheme: (branding: BrandingConfig) => void
  resetTheme: () => void
}

interface BrandingConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    success: string
    warning: string
    error: string
    background: Record<string, string>
    text: Record<string, string>
  }
  logos: {
    primary: string
    login: string
    favicon: string
  }
  fonts: {
    heading: string
    body: string
  }
  spacing?: Record<string, string>
  borders?: Record<string, string>
}
```

**Features:**
- Load branding from bootstrap API
- Inject CSS variables dynamically
- Load custom fonts (Google Fonts or hosted)
- Update logos in Header/Footer
- Cache branding configuration
- Support theme switching

**Implementation Priority:** HIGH (needed for tenant theming)

**Estimated Time:** 8-10 hours

---

### 9. MenuContext Provider 🔄 ENHANCEMENT

**Purpose:** Enhanced menu state management for SPA navigation

**Existing:** Basic menu types defined
**Enhancement Needed:**
- Context provider implementation
- Menu update on route change
- Active item tracking
- Sidebar collapse state
- Menu configuration caching

**Context Interface:**
```typescript
interface MenuContextValue {
  topMenuItems: MenuItem[]
  sideMenuItems: MenuItem[]
  footerMenuItems: MenuItem[]
  activeItemId: string | null
  sidebarCollapsed: boolean
  isLoading: boolean
  
  updateMenus: (config: MenuConfiguration) => void
  setActiveItem: (itemId: string | null) => void
  toggleSidebar: () => void
  loadMenuConfig: (context: string) => Promise<void>
}
```

**Implementation Priority:** CRITICAL (foundation for menu system)

**Estimated Time:** 6-8 hours

---

## shadcn Components Installation Plan

### Phase 1: Core Components (Already Installed)
```bash
✅ button
✅ card
✅ input
✅ label
✅ checkbox
✅ select
✅ table
✅ dialog
✅ avatar
✅ badge
✅ form
```

### Phase 2: SPA Layout (Week 1)
```bash
npx shadcn@latest add sidebar
npx shadcn@latest add scroll-area
npx shadcn@latest add separator
npx shadcn@latest add navigation-menu  # Already installed
```

### Phase 3: New Widgets (Week 2)
```bash
npx shadcn@latest add carousel
npx shadcn@latest add aspect-ratio
npx shadcn@latest add alert-dialog
npx shadcn@latest add dropdown-menu  # Already installed
npx shadcn@latest add progress
npx shadcn@latest add tabs
```

### Phase 4: Additional Components (Week 3-4)
```bash
npx shadcn@latest add breadcrumb
npx shadcn@latest add skeleton
npx shadcn@latest add toggle
npx shadcn@latest add toggle-group
npx shadcn@latest add command
npx shadcn@latest add popover
```

---

## Implementation Priority Matrix

| Component | Priority | Complexity | Time | Dependencies |
|-----------|----------|------------|------|--------------|
| AppLayout | CRITICAL | Medium | 6-8h | MenuContext, sidebar |
| MenuContext | CRITICAL | Medium | 6-8h | None |
| BrandingProvider | HIGH | Medium | 8-10h | Bootstrap API |
| HeroWidget | HIGH | Low | 4-6h | card, button |
| PricingWidget | HIGH | Medium | 6-8h | card, badge, button |
| LocationWizard | HIGH | High | 8-12h | form, tabs, progress |
| UserManagement | HIGH | High | 10-14h | table, dialog, form |
| LocationManagement | HIGH | High | 10-14h | table, dialog, form |
| TeamMemberWidget | MEDIUM | Low | 4-6h | card, avatar |

**Total Estimated Time:** 62-90 hours (8-11 business days)

---

## Development Sequence

### Week 1: Foundation
1. **Day 1-2:** MenuContext + AppLayout
2. **Day 3:** BrandingProvider
3. **Day 4-5:** Test and integrate

### Week 2: Widgets Part 1
1. **Day 1:** HeroWidget
2. **Day 2:** PricingWidget
3. **Day 3:** TeamMemberWidget
4. **Day 4-5:** LocationWizard

### Week 3: Widgets Part 2
1. **Day 1-3:** UserManagementWidget
2. **Day 4-5:** LocationManagementWidget

---

## Testing Requirements

### Unit Tests (per component)
- Props validation
- Event handlers
- Conditional rendering
- Error states
- Loading states

### Integration Tests
- MenuContext + AppLayout
- BrandingProvider + Components
- Form submissions
- CRUD operations

### E2E Tests
- Complete user flows
- Menu navigation
- Theme switching
- Form wizards

**Testing Time:** ~30% of development time (20-30 hours)

---

## Documentation Requirements

### Per Component
- Props interface documentation
- Usage examples
- Configuration examples
- shadcn dependencies
- Styling customization guide

### Architecture Docs
- SPA navigation guide
- Menu system documentation
- Multi-tenant setup guide
- Component integration guide

**Documentation Time:** ~15% of development time (10-15 hours)

---

## Total Project Estimate

- **Development:** 62-90 hours
- **Testing:** 20-30 hours
- **Documentation:** 10-15 hours
- **Refactoring/Polish:** 10-15 hours

**Total:** 102-150 hours (13-19 business days)

**With 1 developer:** ~4-5 weeks  
**With 2 developers:** ~2-3 weeks

---

## Success Metrics

### Code Quality
- ✅ TypeScript strict mode passes
- ✅ No console errors or warnings
- ✅ BiomeJS linting passes
- ✅ 80%+ test coverage

### Performance
- ✅ Initial load < 2 seconds
- ✅ Route transitions < 100ms
- ✅ Bundle size < 500KB (gzipped)
- ✅ Lighthouse score > 90

### User Experience
- ✅ Smooth menu transitions
- ✅ Responsive on all devices
- ✅ Accessible (WCAG 2.1 AA)
- ✅ No layout shift on navigation

---

**Document Version:** 1.0  
**Last Updated:** January 26, 2026  
**Status:** Ready for Implementation
