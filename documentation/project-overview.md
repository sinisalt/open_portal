# OpenPortal - API-Driven Business UI Platform

## Project Overview

OpenPortal is an **API-configured Business UI Platform** designed to completely separate presentation layer from business logic. The platform enables dynamic UI generation from backend configurations, allowing new features to be delivered without frontend code changes.

### Core Vision

Build a business UI platform that is:
- **Extensible & Reconfigurable via API** - Nothing is hardcoded; all configuration comes from API endpoints
- **Technology-agnostic backend** - Works with any backend as long as proper APIs/WebSockets exist
- **Frontend as a renderer** - React-based rendering engine with no embedded business logic
- **Zero frontend changes for new features** - New pages/features require only backend configuration updates

### Problem Statement

The current system suffers from:
- Business logic hardcoded in web pages and APIs
- Complex, lengthy process to implement changes
- Tight coupling between presentation and business logic
- Difficulty in maintaining and scaling

### Solution Approach

Move to a configuration-driven architecture where:
- **Logic lives in API endpoints** - Complete separation of concerns
- **Reusable, auto-configurable components** - Forms, widgets, pages defined via JSON
- **Dynamic page generation** - Pages created from configuration consumed by frontend
- **Frontend validation rules and actions** - Defined by backend, executed by frontend
- **No UI changes needed** - Adding features only requires backend API support

## Key Capabilities

### Authentication & Deep Linking
- Login page (username/password + OAuth)
- Post-authentication configuration fetch (menu, dashboard, permissions)
- Deep link support (e.g., `/profile/123` redirects to login, then returns to target)
- Route-specific configuration loading

### Caching Strategy
- **Static data** (page structure, visual/logic definitions) - Cached locally in browser
- **Dynamic data** (sales data, user-specific content) - Fetched on demand
- Smart cache invalidation based on data freshness requirements

### Standard Application Requirements
- Form data entry with validation
- Modal windows for sub-workflows (e.g., image selection for listings)
- Data visualization (graphs, tables)
- Page formatting (auto-format and fixed layout options)
- Dynamic content loading and updates

## Technology Stack

### Frontend
- **React** - Rendering engine and UI framework
- Modern JavaScript/TypeScript
- Component-based architecture

### Backend
- **Technology-agnostic** - Any backend that provides required APIs
- RESTful API endpoints
- WebSocket support for real-time interactivity

## Current Status

Project is in **planning and specification phase**. This documentation represents the consolidated vision from initial planning discussions and serves as the foundation for implementation.

## Next Steps

1. Complete formal technical specification
2. Define JSON schema for configuration structures
3. Build proof-of-concept with 3 sample pages
4. Implement core rendering engine
5. Develop widget library
6. Create backend API specification

---

**Last Updated:** January 2026
**Status:** Planning Phase
**Team:** Initial concept development
