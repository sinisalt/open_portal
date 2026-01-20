# Architecture Decision Records (ADRs)

## Overview

This directory contains Architecture Decision Records (ADRs) for the OpenPortal project. Each ADR documents a significant architectural or technical decision, including context, alternatives considered, and rationale.

## ADR Format

Each ADR follows this structure:

```markdown
# ADR-XXX: [Title]

**Status:** [Accepted | Superseded | Deprecated]
**Date:** YYYY-MM-DD
**Deciders:** [Team/Role]

## Context

What is the issue we're trying to solve?

## Decision

What is the change we're proposing?

## Alternatives Considered

What other options were considered?

## Consequences

What are the positive and negative consequences of this decision?

## References

Links to related documentation or resources.
```

## Index of ADRs

### Frontend Decisions

- [ADR-001: Build Tool Selection](./ADR-001-build-tool.md) - Create React App
- [ADR-002: State Management](./ADR-002-state-management.md) - React Context API + Hooks
- [ADR-003: UI Component Library](./ADR-003-ui-component-library.md) - Custom Widget Library
- [ADR-004: Routing Library](./ADR-004-routing.md) - React Router v6
- [ADR-005: Form Management](./ADR-005-forms.md) - React Hook Form
- [ADR-006: HTTP Client](./ADR-006-http-client.md) - Native Fetch API
- [ADR-007: WebSocket Client](./ADR-007-websocket.md) - Native WebSocket API
- [ADR-008: Testing Framework](./ADR-008-testing.md) - Jest + React Testing Library
- [ADR-009: E2E Testing](./ADR-009-e2e-testing.md) - Playwright
- [ADR-010: CSS Approach](./ADR-010-css-approach.md) - CSS Modules
- [ADR-011: TypeScript Configuration](./ADR-011-typescript.md) - Strict Mode
- [ADR-012: Code Quality Tools](./ADR-012-code-quality.md) - ESLint + Prettier

### Backend Decisions

- [ADR-013: Backend Runtime](./ADR-013-backend-runtime.md) - Node.js 18+ LTS
- [ADR-014: Backend Framework](./ADR-014-backend-framework.md) - Express.js
- [ADR-015: Database Selection](./ADR-015-database.md) - PostgreSQL 14+
- [ADR-016: ORM Selection](./ADR-016-orm.md) - Prisma
- [ADR-017: Caching Solution](./ADR-017-caching.md) - Redis 7+
- [ADR-018: WebSocket Server](./ADR-018-websocket-server.md) - ws library
- [ADR-019: Authentication Strategy](./ADR-019-authentication.md) - JWT + Refresh Tokens
- [ADR-020: API Documentation](./ADR-020-api-documentation.md) - OpenAPI 3.0
- [ADR-021: Validation Library](./ADR-021-validation.md) - Zod
- [ADR-022: Backend Testing](./ADR-022-backend-testing.md) - Jest
- [ADR-023: Logging Library](./ADR-023-logging.md) - Pino

### Infrastructure Decisions

- [ADR-024: Git Workflow](./ADR-024-git-workflow.md) - Trunk-Based Development
- [ADR-025: CI/CD Platform](./ADR-025-ci-cd.md) - GitHub Actions
- [ADR-026: Containerization](./ADR-026-docker.md) - Docker
- [ADR-027: Development Environment](./ADR-027-development-environment.md) - Docker Compose
- [ADR-028: Monitoring and Error Tracking](./ADR-028-monitoring.md) - Deferred Decision

## How to Create a New ADR

1. Copy the ADR template
2. Number it sequentially (ADR-029, ADR-030, etc.)
3. Fill in all sections
4. Update this README's index
5. Commit and create PR

## Superseding ADRs

When a decision changes:
1. Create a new ADR documenting the new decision
2. Update the old ADR's status to "Superseded by ADR-XXX"
3. Reference the old ADR in the new one

## Status Definitions

- **Accepted**: Decision is active and should be followed
- **Superseded**: Decision has been replaced by a newer ADR
- **Deprecated**: Decision is no longer relevant but kept for historical context

---

**Last Updated:** January 20, 2026
