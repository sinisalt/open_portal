# Getting Started with OpenPortal

## Overview

OpenPortal is an **API-driven Business UI Platform** that completely separates the presentation layer from business logic. Instead of hardcoding UI behavior in the frontend, the backend provides JSON configurations that tell the frontend what to render and how to behave.

## Key Benefits

- **Rapid Feature Delivery**: New features require only backend changes
- **Consistent UI**: Reusable widget library ensures consistency
- **Flexible Architecture**: Backend-agnostic design
- **Smart Performance**: Intelligent caching of static configurations
- **Real-time Ready**: Built-in WebSocket support

---

## Core Concepts

### 1. Configuration-Driven UI

Pages are described in JSON configuration files:

```json
{
  "pageId": "dashboard",
  "title": "Dashboard",
  "widgets": [
    {
      "id": "welcome-card",
      "type": "Card",
      "props": {
        "title": "Welcome Back!"
      }
    }
  ]
}
```

### 2. Widgets

Reusable UI components with stable contracts:
- **Props**: Configuration properties
- **Bindings**: Data connections
- **Events**: User interactions
- **Policy**: Visibility/permission rules

See [Widget Catalog](./widget-catalog.md) for all available widgets.

### 3. Datasources

Define how widgets get their data:

```json
{
  "id": "user-list-data",
  "kind": "http",
  "http": {
    "method": "GET",
    "url": "/api/users"
  }
}
```

### 4. Actions

Define what happens when users interact:

```json
{
  "id": "save-profile",
  "kind": "executeAction",
  "executeAction": {
    "actionId": "save-profile"
  }
}
```

### 5. Events

Connect user interactions to actions:

```json
{
  "on": "onSubmit",
  "do": ["validate-form", "save-profile"]
}
```

---

## Documentation Structure

### Getting Oriented
- **[idea.md](./idea.md)** - Quick overview and key concepts

### Understanding the Project
- **[project-overview.md](./project-overview.md)** - Vision, goals, and current status
- **[roadmap.md](./roadmap.md)** - Implementation timeline

### Technical Details
- **[architecture.md](./architecture.md)** - System architecture and data flows
- **[api-specification.md](./api-specification.md)** - Complete API documentation
- **[widget-catalog.md](./widget-catalog.md)** - Available widgets and contracts
- **[json-schemas.md](./json-schemas.md)** - Configuration schemas and examples

---

## How It Works

### Application Startup

1. User opens application
2. User authenticates on login page
3. Frontend calls `/ui/bootstrap` - gets user info, permissions, menu
4. Frontend navigates to default route (e.g., `/dashboard`)

### Page Load Flow

1. Router matches route `/dashboard`
2. Frontend calls `/ui/routes/resolve?path=/dashboard`
3. Backend returns `pageId: "dashboard-page"`
4. Frontend loads `/ui/pages/dashboard-page` (checks cache first)
5. Frontend executes datasources
6. Frontend renders page with widgets and data

### User Interaction

1. User fills form and clicks Submit
2. Frontend validates (client-side)
3. Event handler triggers action
4. Action calls `/ui/actions/execute`
5. Backend validates and processes
6. Backend returns result (success/error)
7. Frontend updates UI

---

## Example Configurations

### Simple Dashboard

```json
{
  "pageId": "dashboard",
  "title": "Dashboard",
  "widgets": [
    {
      "id": "revenue-kpi",
      "type": "KPI",
      "datasourceId": "revenue",
      "props": {
        "label": "Revenue",
        "format": "currency"
      },
      "bindings": {
        "value": {
          "dataPath": "datasources.revenue.value"
        }
      }
    }
  ],
  "datasources": [
    {
      "id": "revenue",
      "kind": "http",
      "http": {
        "method": "GET",
        "url": "/api/kpi/revenue"
      }
    }
  ]
}
```

### Simple Form

```json
{
  "pageId": "contact-form",
  "title": "Contact Us",
  "widgets": [
    {
      "id": "contact-form",
      "type": "Form",
      "props": {
        "fields": [
          {
            "id": "name",
            "label": "Name",
            "binding": "values.name",
            "component": "TextInput",
            "props": {"required": true}
          },
          {
            "id": "email",
            "label": "Email",
            "binding": "values.email",
            "component": "TextInput",
            "props": {"type": "email", "required": true}
          }
        ],
        "submitActionId": "submit-contact"
      }
    }
  ],
  "actions": [
    {
      "id": "submit-contact",
      "kind": "executeAction",
      "executeAction": {
        "actionId": "submit-contact-form"
      }
    }
  ]
}
```

---

## Next Steps

### For Product Team
1. Review the [roadmap](./roadmap.md)
2. Understand the [project overview](./project-overview.md)

### For Developers
1. Study the [architecture](./architecture.md)
2. Review the [API specification](./api-specification.md)
3. Familiarize with the [widget catalog](./widget-catalog.md)
4. Examine the [JSON schemas](./json-schemas.md)

---

## Current Status

**Phase:** Planning & Specification

All core documentation completed:
- ✅ Project overview and vision
- ✅ Technical architecture
- ✅ API specification
- ✅ Widget catalog
- ✅ JSON schemas
- ✅ Implementation roadmap

**Next Milestone:** Phase 0 - Discovery & Foundation (2 weeks)

---

**Last Updated:** January 18, 2026
**Status:** Planning Phase
