# OpenPortal - API-Driven Business UI Platform

## Quick Start

This project is building a revolutionary **API-configured Business UI Platform** where the frontend is a generic rendering engine and all UI structure, logic, validation, and workflows come from backend APIs.

## Documentation Structure

📁 **Core Documentation:**
- **[Project Overview](./project-overview.md)** - Vision, goals, and current status
- **[Architecture](./architecture.md)** - Technical architecture and data flows
- **[API Specification](./api-specification.md)** - Complete API endpoint definitions
- **[Implementation Roadmap](./roadmap.md)** - Phased development plan
- **[Widget Catalog](./widget-catalog.md)** - Complete widget library specification

## Key Concept

Traditional approach:
```
User Action → Hardcoded Frontend Logic → API Call → Backend Logic → Response
```

OpenPortal approach:
```
User Action → Generic Renderer → API (returns UI config + data) → Backend defines everything
```

## What Makes This Different

### ✅ Configuration-Driven
- Pages defined as JSON configurations
- No frontend code changes for new features
- Backend controls all UI behavior

### ✅ Truly Reusable
- Widget library with stable contracts
- Forms, tables, charts, modals all configurable
- Layout system with responsive support

### ✅ Smart Caching
- Static UI configs cached with ETags
- Dynamic data fetched on demand
- Optimized for performance

### ✅ Real-time Capable
- WebSocket integration
- Live data updates
- Reactive UI changes

## Technology Stack

- **Frontend:** React 19+ with TypeScript
- **UI Library:** Ant Design (antd) - MIT License
- **Backend:** Technology-agnostic (REST APIs + WebSockets)
- **Configuration:** JSON Schema-based
- **Caching:** 
  - Frontend: Browser-native (ETag, IndexedDB, React Query)
  - Backend: Redis (multi-layer caching strategy)

## Current Status: Planning Phase

We are currently in the specification and planning phase. All architectural decisions and technical specifications have been documented.

**Next Steps:**
1. Set up development environment
2. Finalize JSON schemas
3. Build MVP with 3 sample pages
4. Implement core rendering engine

## Example: Dashboard Configuration

```json
{
  "pageId": "dashboard",
  "title": "Dashboard",
  "widgets": [
    {
      "id": "revenue-kpi",
      "type": "KPI",
      "datasourceId": "revenue-data",
      "props": { "label": "Revenue", "format": "currency" }
    },
    {
      "id": "sales-chart",
      "type": "Chart",
      "datasourceId": "sales-data",
      "props": { "chartType": "line", "height": 400 }
    }
  ],
  "datasources": [
    {
      "id": "revenue-data",
      "kind": "http",
      "http": { "method": "GET", "url": "/api/kpi/revenue" }
    }
  ]
}
```

This configuration generates a complete, functional dashboard page without any frontend code changes!

## Learn More

Start with the **[Project Overview](./project-overview.md)** for a comprehensive introduction, then explore the other documentation files based on your interest:

- Developers → Architecture + Widget Catalog
- Product Team → Roadmap + API Specification  
- Leadership → Project Overview

## Contributing

This project is in the planning phase. Documentation contributions and architectural feedback are welcome!

---

**Last Updated:** January 18, 2026
**Status:** Planning & Specification Phase
**Contact:** Development Team
