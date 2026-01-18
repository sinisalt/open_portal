# OpenPortal Documentation

Welcome to the OpenPortal documentation! This folder contains all the planning, architectural, and technical documentation for the OpenPortal project.

## 📚 Documentation Files

### Start Here
- **[getting-started.md](./getting-started.md)** - Introduction and orientation guide
- **[idea.md](./idea.md)** - Quick project overview and key concepts

### Detailed Scenarios (NEW)
- **[authentication-scenarios.md](./authentication-scenarios.md)** - Complete authentication flows
  - Username/password login with headers/payloads
  - OAuth/SSO integration (Google example)
  - Token refresh mechanism
  - Logout flow
  - Security considerations
- **[user-profile-scenarios.md](./user-profile-scenarios.md)** - User profile workflows
  - Profile viewing with side menu
  - Profile editing with validation
  - Sub-section navigation (API Keys, Audit History, Documents, Preferences)
  - Browser back/forward button integration
  - Static vs dynamic data caching with Redis
- **[user-journey-scenarios.md](./user-journey-scenarios.md)** - End-to-end user journeys
  - First-time login to dashboard
  - Profile editing and API key management
  - Real-time dashboard updates via WebSocket
  - Deep linking with authentication
  - Error handling and recovery
  - Multi-tab coordination

### Project Information
- **[project-overview.md](./project-overview.md)** - Vision, goals, problem statement, and current status
- **[roadmap.md](./roadmap.md)** - Traditional phased implementation plan and timeline

### Implementation Guides (NEW)
- **[ai-first-implementation-plan.md](./ai-first-implementation-plan.md)** - AI-assisted development plan
  - 125 atomic tasks for AI agents
  - TDD with mock API approach
  - Task dependencies and parallelization
  - 3-4x faster timeline vs traditional approach
- **[tdd-mock-api-guide.md](./tdd-mock-api-guide.md)** - Test-Driven Development guide
  - TDD principles and workflow (Red-Green-Refactor)
  - Mock API setup (JSON Server and MSW)
  - Complete examples with tests
  - Integration testing strategies
  - CI/CD configuration

### Technical Documentation
- **[architecture.md](./architecture.md)** - System architecture, components, data flows, and Redis caching
- **[api-specification.md](./api-specification.md)** - Complete API endpoint definitions
- **[widget-catalog.md](./widget-catalog.md)** - Widget library with props, events, and bindings (Ant Design-based)
- **[json-schemas.md](./json-schemas.md)** - JSON Schema definitions and examples

## 🎯 Quick Navigation by Role

### 👔 Product Managers & Stakeholders
Start with these documents to understand business value and timeline:
1. [project-overview.md](./project-overview.md)
2. [roadmap.md](./roadmap.md)
3. [idea.md](./idea.md)

### 💻 Frontend Developers
Focus on UI implementation details:
1. [getting-started.md](./getting-started.md)
2. [architecture.md](./architecture.md) - Frontend Architecture section
3. [widget-catalog.md](./widget-catalog.md)
4. [json-schemas.md](./json-schemas.md)

### 🔧 Backend Developers
Focus on API and configuration:
1. [getting-started.md](./getting-started.md)
2. [api-specification.md](./api-specification.md)
3. [architecture.md](./architecture.md) - Backend Architecture section
4. [json-schemas.md](./json-schemas.md)

### 🏗️ System Architects
Comprehensive technical overview:
1. [architecture.md](./architecture.md)
2. [api-specification.md](./api-specification.md)
3. [widget-catalog.md](./widget-catalog.md)
4. [roadmap.md](./roadmap.md)

## 📖 What is OpenPortal?

OpenPortal is an **API-driven Business UI Platform** where:
- Frontend is a generic React rendering engine
- Backend provides JSON configurations for all pages
- UI structure, logic, and validation come from APIs
- New features require zero frontend code changes

### Key Innovation

**Traditional Approach:**
```
Business Logic → Hardcoded in Frontend & Backend → Tight Coupling
```

**OpenPortal Approach:**
```
Business Logic → Backend Only → JSON Config → Generic Frontend Renderer
```

## 🚀 Current Status

**Phase:** Planning & Specification ✅

All foundational documentation has been completed:
- [x] Project vision and overview
- [x] Technical architecture design
- [x] Complete API specification
- [x] Widget catalog (30+ widgets)
- [x] JSON configuration schemas
- [x] Implementation roadmap (5 phases)

**Next:** Phase 0 - Discovery & Foundation (2 weeks)

## 📋 Documentation Standards

All documentation in this folder follows these standards:
- **Markdown format** for easy reading and version control
- **Comprehensive examples** to illustrate concepts
- **Version tracking** with last updated dates
- **Cross-references** between related documents
- **Status indicators** for current project phase

## 🔄 Keeping Documentation Updated

As the project evolves, please:
1. Update the "Last Updated" date when making changes
2. Maintain cross-references between documents
3. Add new examples as features are implemented
4. Keep the roadmap status current
5. Document architectural decisions

## 💡 Contributing

Found an error or want to improve the documentation?
- Flag errors for correction
- Suggest clarifications
- Propose additional examples
- Share feedback on structure

## 📞 Questions?

- **General questions:** Review [getting-started.md](./getting-started.md)
- **Technical details:** Consult relevant technical docs
- **Project status:** Check [roadmap.md](./roadmap.md)
- **Unclear sections:** Flag for documentation team

---

**Documentation Version:** 1.0  
**Project Status:** Planning Phase  
**Last Updated:** January 18, 2026
