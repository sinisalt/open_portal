# Issue #027: Sample Page Configurations (Dashboard, Profile, Listings)

**Phase:** Phase 1 - Core Platform (MVP Renderer)  
**Weeks:** 7-10  
**Component:** Backend  
**Estimated Effort:** 5 days  
**Priority:** High  
**Labels:** phase-1, backend, configuration, samples

## Description
Create sample page configurations for three essential page types (Dashboard, Profile, Listings) to demonstrate the platform's capabilities and serve as templates for future pages.

## Acceptance Criteria
- [ ] Dashboard page configuration
- [ ] User profile page configuration
- [ ] Listings/table page configuration
- [ ] Menu configuration linking to all pages
- [ ] Route configurations for all pages
- [ ] Sample datasources configured
- [ ] Sample actions configured
- [ ] All configurations stored in database
- [ ] Documentation for each configuration
- [ ] Screenshots/mockups of expected output

## Dashboard Page
**Features:**
- [ ] KPI cards displaying key metrics
- [ ] Chart widget showing trends
- [ ] Recent activity table
- [ ] Grid layout with responsive breakpoints
- [ ] Auto-refresh datasources
- [ ] Click actions on KPIs

**Example Structure:**
```json
{
  "id": "dashboard",
  "title": "Dashboard",
  "layout": {
    "type": "Page",
    "children": [
      {
        "type": "Section",
        "props": { "title": "Key Metrics" },
        "children": [
          {
            "type": "Grid",
            "props": { "columns": 12, "gap": "md" },
            "children": [
              {
                "type": "KPI",
                "props": { "span": 3, "label": "Total Users", "format": "number" },
                "bindings": { "value": "{{datasources.metrics.data.totalUsers}}" }
              }
            ]
          }
        ]
      }
    ]
  },
  "datasources": [
    {
      "id": "metrics",
      "type": "http",
      "config": { "url": "/api/dashboard/metrics" }
    }
  ]
}
```

## Profile Page
**Features:**
- [ ] User information display
- [ ] Editable form for profile updates
- [ ] Avatar upload
- [ ] Form validation
- [ ] Save button with action
- [ ] Success/error toasts

**Key Widgets:**
- Card layout
- TextInput widgets
- FileUpload for avatar
- Button with submit action
- Form validation rules

## Listings Page
**Features:**
- [ ] Data table with sample data
- [ ] Column configuration
- [ ] Row actions (view, edit, delete)
- [ ] Basic filtering
- [ ] Toolbar with actions (add new, refresh)

**Key Widgets:**
- Table widget
- Toolbar widget
- Modal for add/edit forms
- ConfirmDialog for delete

## Dependencies
- Depends on: #016 (Layout widgets)
- Depends on: #017 (Form widgets)
- Depends on: #018 (Data display widgets)
- Depends on: #025 (Backend endpoints to store configs)

## Sample Datasources
- [ ] `/api/dashboard/metrics` - Dashboard KPIs
- [ ] `/api/dashboard/chart-data` - Chart data
- [ ] `/api/dashboard/recent-activity` - Recent items
- [ ] `/api/users/:id` - User profile data
- [ ] `/api/items` - Listings data

## Sample Actions
- [ ] `user.updateProfile` - Update user profile
- [ ] `user.uploadAvatar` - Upload avatar image
- [ ] `item.create` - Create new item
- [ ] `item.update` - Update existing item
- [ ] `item.delete` - Delete item
- [ ] `dashboard.refresh` - Refresh dashboard data

## Menu Configuration
```json
{
  "items": [
    {
      "id": "dashboard",
      "label": "Dashboard",
      "icon": "dashboard",
      "path": "/dashboard"
    },
    {
      "id": "profile",
      "label": "Profile",
      "icon": "person",
      "path": "/profile"
    },
    {
      "id": "listings",
      "label": "Listings",
      "icon": "list",
      "path": "/listings"
    }
  ]
}
```

## Testing Requirements
- [ ] Validate all configurations against schemas
- [ ] Test page rendering with configurations
- [ ] Test all datasources
- [ ] Test all actions
- [ ] E2E tests for each page
- [ ] Visual regression tests

## Documentation
- [ ] Configuration walkthrough for each page
- [ ] Design decisions documentation
- [ ] Widget usage examples
- [ ] Action flow documentation
- [ ] Datasource configuration guide

## Deliverables
- Dashboard page configuration
- Profile page configuration
- Listings page configuration
- Menu configuration
- Route configurations
- Sample datasource configurations
- Sample action handlers
- Documentation
- Screenshots/mockups
