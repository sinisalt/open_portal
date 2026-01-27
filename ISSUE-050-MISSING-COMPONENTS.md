# Issue #050: Missing Components Analysis (REVISED)

**Date:** January 26, 2026 (Revised)  
**Purpose:** Correct component gap analysis following configuration-driven architecture

## ⚠️ Important Correction

**Original Error:** Proposed business-specific widgets (LocationWizardWidget, UserManagementWidget, etc.)

**Corrected Understanding:** Frontend provides **generic, reusable widgets**. Backend sends **JSON configurations** that define the UI.

---

## Current Widget Inventory (18 widgets) ✅

All existing widgets are **generic and configuration-driven**:

### Layout & Structure (5)
- ✅ **PageWidget** - Top-level page container
- ✅ **SectionWidget** - Content sections with optional titles  
- ✅ **GridWidget** - Responsive grid layouts
- ✅ **CardWidget** - Content cards
- ✅ **MenuWidget** - Dynamic menu rendering

### Form Inputs (4)
- ✅ **TextInputWidget** - Text input fields
- ✅ **SelectWidget** - Dropdown selections
- ✅ **DatePickerWidget** - Date selection
- ✅ **CheckboxWidget** - Boolean checkboxes

### Data Display (2)
- ✅ **TableWidget** - Data tables with sorting/filtering/pagination
- ✅ **KPIWidget** - Key performance indicators
- ✅ **ChartWidget** - Charts (line, bar, pie, area)

### Dialogs & Feedback (4)
- ✅ **ModalWidget** - Modal dialogs
- ✅ **ModalPageWidget** - Full-page modals
- ✅ **ToastWidget** - Toast notifications
- ✅ **WizardWidget** - Multi-step wizards (GENERIC!)

### Navigation (3)
- ✅ **TopMenu** - Horizontal top navigation
- ✅ **SideMenu** - Vertical sidebar navigation
- ✅ **FooterMenu** - Footer navigation
- ✅ **Header** - Application header with branding

---

## Missing GENERIC Components (10 new)

### 1. AppLayout Component (CRITICAL)

**Type:** Layout Component (not a widget)  
**Purpose:** Root SPA layout with persistent menus

**Why Needed:** Current __root.tsx renders pages in isolation without persistent menus.

**Props:**
```typescript
interface AppLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  showSidebar?: boolean
  showFooter?: boolean
}
```

**Priority:** CRITICAL  
**Time:** 6-8 hours

---

### 2. MenuContext Provider (CRITICAL)

**Type:** React Context (not a widget)  
**Purpose:** Global menu state management

**Why Needed:** Menus need to update based on route context without page reload.

**Context Interface:**
```typescript
interface MenuContextValue {
  topMenuItems: MenuItem[]
  sideMenuItems: MenuItem[]
  footerMenuItems: MenuItem[]
  activeItemId: string | null
  sidebarCollapsed: boolean
  
  updateMenus: (config: MenuConfiguration) => void
  setActiveItem: (itemId: string | null) => void
  toggleSidebar: () => void
}
```

**Priority:** CRITICAL  
**Time:** 6-8 hours

---

### 3. HeroWidget (HIGH)

**Type:** Widget  
**Purpose:** Generic hero section with background image, text, and CTA buttons

**Why Generic:** Can be used for ANY landing section (product launch, feature announcement, etc.)

**Props:**
```typescript
interface HeroWidgetConfig extends BaseWidgetConfig {
  type: 'Hero'
  backgroundImage: string
  title: string
  subtitle?: string
  ctaButtons?: Array<{
    text: string
    variant?: 'default' | 'primary' | 'secondary'
    actionId: string  // Backend defines action
  }>
  overlay?: {
    color: string
    opacity: number
  }
  height?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  textAlign?: 'left' | 'center' | 'right'
}
```

**Example Use Cases:**
- Homepage hero
- Feature announcement
- Product launch
- Marketing campaign

**shadcn:** card, button  
**Priority:** HIGH  
**Time:** 4-6 hours

---

### 4. ImageWidget (HIGH)

**Type:** Widget  
**Purpose:** Generic image display with aspect ratio control

**Why Generic:** Can display ANY image (avatar, product, logo, etc.)

**Props:**
```typescript
interface ImageWidgetConfig extends BaseWidgetConfig {
  type: 'Image'
  src: string
  alt: string
  width?: string | number
  height?: string | number
  aspectRatio?: string  // e.g., "16:9", "1:1"
  fit?: 'cover' | 'contain' | 'fill'
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'full'
  loading?: 'lazy' | 'eager'
}
```

**shadcn:** avatar (for rounded images)  
**Priority:** HIGH  
**Time:** 2-3 hours

---

### 5. TextWidget (MEDIUM)

**Type:** Widget  
**Purpose:** Generic text/markdown display

**Why Generic:** Can display ANY text content (descriptions, articles, etc.)

**Props:**
```typescript
interface TextWidgetConfig extends BaseWidgetConfig {
  type: 'Text'
  content: string
  variant?: 'heading' | 'subheading' | 'body' | 'caption' | 'code'
  markdown?: boolean
  align?: 'left' | 'center' | 'right' | 'justify'
  color?: string  // CSS color or theme variable
}
```

**Priority:** MEDIUM  
**Time:** 2-3 hours

---

### 6. ButtonGroupWidget (MEDIUM)

**Type:** Widget  
**Purpose:** Generic button group (horizontal or vertical)

**Why Generic:** Can be used for ANY button group (social links, actions, filters, etc.)

**Props:**
```typescript
interface ButtonGroupWidgetConfig extends BaseWidgetConfig {
  type: 'ButtonGroup'
  buttons: Array<{
    id: string
    label?: string
    icon?: string
    variant?: 'default' | 'outline' | 'ghost'
    actionId?: string
    href?: string  // For links
  }>
  orientation?: 'horizontal' | 'vertical'
  gap?: 'sm' | 'md' | 'lg'
}
```

**shadcn:** button, button-group  
**Priority:** MEDIUM  
**Time:** 3-4 hours

---

### 7. BadgeWidget (MEDIUM)

**Type:** Widget  
**Purpose:** Generic badge/tag display

**Why Generic:** Can display ANY badge (status, category, tag, etc.)

**Props:**
```typescript
interface BadgeWidgetConfig extends BaseWidgetConfig {
  type: 'Badge'
  label: string
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  removable?: boolean
}
```

**shadcn:** badge  
**Priority:** MEDIUM  
**Time:** 2-3 hours

---

### 8. FileUploadWidget (HIGH)

**Type:** Widget  
**Purpose:** Generic file upload with drag-and-drop

**Why Generic:** Can upload ANY file type (images, documents, etc.)

**Props:**
```typescript
interface FileUploadWidgetConfig extends BaseWidgetConfig {
  type: 'FileUpload'
  label?: string
  accept?: string  // MIME types, e.g., "image/*"
  multiple?: boolean
  maxSize?: number  // bytes
  maxFiles?: number
  uploadUrl?: string
  preview?: boolean  // Show image preview
}
```

**Priority:** HIGH (needed for forms)  
**Time:** 5-6 hours

---

### 9. TextareaWidget (HIGH)

**Type:** Widget  
**Purpose:** Generic multi-line text input

**Why Generic:** Can be used for ANY long text (descriptions, comments, etc.)

**Props:**
```typescript
interface TextareaWidgetConfig extends BaseWidgetConfig {
  type: 'Textarea'
  label: string
  placeholder?: string
  rows?: number
  maxLength?: number
  required?: boolean
  disabled?: boolean
  helperText?: string
}
```

**shadcn:** textarea  
**Priority:** HIGH (needed for forms)  
**Time:** 2-3 hours

---

### 10. TagInputWidget (MEDIUM)

**Type:** Widget  
**Purpose:** Generic tag/chip input (add/remove tags)

**Why Generic:** Can be used for ANY tags (categories, keywords, skills, etc.)

**Props:**
```typescript
interface TagInputWidgetConfig extends BaseWidgetConfig {
  type: 'TagInput'
  label?: string
  placeholder?: string
  tags: string[]  // From bindings
  datasourceId?: string  // For autocomplete suggestions
  maxTags?: number
  allowCustom?: boolean  // Allow user-created tags
}
```

**Priority:** MEDIUM  
**Time:** 4-5 hours

---

## ❌ DO NOT Create (Business-Specific)

These were in the original plan but violate the architecture:

1. ~~LocationWizardWidget~~ → Use **WizardWidget** with location config
2. ~~UserManagementWidget~~ → Use **TableWidget + ModalWidget + FormWidget**
3. ~~LocationManagementWidget~~ → Use **TableWidget + ModalWidget + WizardWidget**
4. ~~TeamMemberWidget~~ → Use **CardWidget + GridWidget + ImageWidget**
5. ~~PricingWidget~~ → Use **CardWidget + GridWidget + BadgeWidget**

---

## Implementation Priority Matrix

| Component | Type | Priority | Time | Purpose |
|-----------|------|----------|------|---------|
| AppLayout | Layout | CRITICAL | 6-8h | SPA root with persistent menus |
| MenuContext | Context | CRITICAL | 6-8h | Menu state management |
| HeroWidget | Widget | HIGH | 4-6h | Generic hero sections |
| ImageWidget | Widget | HIGH | 2-3h | Generic image display |
| FileUploadWidget | Widget | HIGH | 5-6h | Generic file upload |
| TextareaWidget | Widget | HIGH | 2-3h | Multi-line text input |
| TextWidget | Widget | MEDIUM | 2-3h | Generic text display |
| ButtonGroupWidget | Widget | MEDIUM | 3-4h | Generic button groups |
| BadgeWidget | Widget | MEDIUM | 2-3h | Generic badges/tags |
| TagInputWidget | Widget | MEDIUM | 4-5h | Tag/chip input |

**Total Development Time:** 39-51 hours (vs 62-90 hours in original plan)

---

## How Demos Will Work

### Example: "Location Management" Page

**Backend sends JSON configuration:**
```json
{
  "pageId": "locations",
  "widgets": [
    {
      "id": "locations-table",
      "type": "Table",
      "datasourceId": "locations",
      "props": {
        "columns": [
          { "id": "image", "label": "", "field": "image", "format": "image" },
          { "id": "name", "label": "Name", "field": "name", "sortable": true },
          { "id": "city", "label": "City", "field": "city", "sortable": true },
          { "id": "tags", "label": "Tags", "field": "tags", "format": "badges" }
        ],
        "rowActions": [
          { "id": "edit", "label": "Edit", "actionId": "editLocation" },
          { "id": "delete", "label": "Delete", "actionId": "deleteLocation" }
        ]
      }
    },
    {
      "id": "create-location-wizard",
      "type": "Modal",
      "children": [
        {
          "type": "Wizard",
          "steps": [
            {
              "id": "step1",
              "label": "Basic Info",
              "widgets": [
                { "type": "TextInput", "id": "name" },
                { "type": "Textarea", "id": "description" },
                { "type": "FileUpload", "id": "image" }
              ]
            },
            {
              "id": "step2",
              "label": "Address",
              "widgets": [
                { "type": "TextInput", "id": "address" },
                { "type": "TextInput", "id": "city" },
                { "type": "Select", "id": "country" }
              ]
            },
            {
              "id": "step3",
              "label": "Classification",
              "widgets": [
                { "type": "TagInput", "id": "tags" },
                { "type": "Checkbox", "id": "hasParking" },
                { "type": "Checkbox", "id": "hasWifi" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

**Frontend renders using existing generic widgets - no custom LocationWizardWidget needed!**

---

## shadcn Components Installation

### Already Installed
- button, card, input, label, checkbox, select, table, dialog, avatar, badge, form

### Need to Install
```bash
# Week 1: SPA Layout
npx shadcn@latest add sidebar
npx shadcn@latest add scroll-area
npx shadcn@latest add separator

# Week 2: New Widgets
npx shadcn@latest add textarea
npx shadcn@latest add aspect-ratio
npx shadcn@latest add button-group
```

---

## Success Metrics

### Code Quality
- ✅ All widgets are generic and reusable
- ✅ No business logic in widgets
- ✅ Configuration-driven behavior
- ✅ TypeScript strict mode passes
- ✅ 80%+ test coverage

### Architecture
- ✅ Same widget can be used for multiple purposes
- ✅ Backend controls ALL business logic
- ✅ Frontend is purely presentational
- ✅ JSON configuration defines UI

---

**Document Version:** 2.0 (REVISED)  
**Last Updated:** January 26, 2026  
**Status:** Corrected - Reflects Configuration-Driven Architecture
