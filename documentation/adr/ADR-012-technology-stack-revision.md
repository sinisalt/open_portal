# ADR-012: Technology Stack Revision

**Status:** Accepted  
**Date:** 2026-01-20  
**Deciders:** Development Team  
**Supersedes:** ADR-001 (Build Tool), ADR-003 (UI Component Library), ADR-011 (TypeScript)

## Context

After completing Phase 0 and 75% of Phase 1.1 (Authentication), we identified significant technical debt and limitations in our original technology stack:

**Original Stack (ADR-001, ADR-003, ADR-004):**
- Build Tool: Create React App 5.0.1
- Language: JavaScript (JSConfig)
- UI Components: Custom widgets from scratch
- Router: React Router v6
- State: React Context API
- Testing: Jest + React Testing Library
- Code Quality: ESLint + Prettier

**Issues Identified:**
1. **Build Performance**: CRA dev server slow (10-30s startup), slow HMR
2. **Type Safety**: JavaScript lacks compile-time error detection
3. **UI Development Speed**: Building all widgets from scratch is slow
4. **Breaking Changes Risk**: Custom widgets mean all maintenance falls on us
5. **Developer Experience**: Modern tools offer significantly better DX
6. **Bundle Size**: CRA doesn't optimize as well as Vite
7. **Ecosystem Momentum**: React community moving toward Vite, TypeScript, shadcn

**Why Migrate NOW:**
- Only 9 issues completed (Phase 0 + partial Phase 1.1)
- Authentication code exists but is only ~540 lines (manageable to preserve)
- No widgets implemented yet (Phase 1.3 not started)
- Early migration prevents compounding technical debt
- Easier to migrate now than after building 12+ widgets

## Decision

**We will migrate to a modern technology stack before continuing Phase 1 development.**

The revised stack:
- **Build Tool**: Vite 6 (replacing CRA)
- **Language**: TypeScript 5 with strict mode (replacing JavaScript)
- **Routing**: TanStack Router v1.132 (replacing React Router v6)
- **Data Fetching**: TanStack Query v5.90
- **State Management**: TanStack Store v0.8 + React Context
- **UI Foundation**: shadcn/ui + Radix UI primitives (replacing custom widgets)
- **Styling**: Tailwind CSS v4.1
- **Authentication**: Azure MSAL (parallel to existing custom OAuth)
- **Forms**: React Hook Form + Zod (already in use)
- **Testing**: Vitest + Playwright (migrating from Jest)
- **Code Quality**: BiomeJS Ultracite preset (replacing ESLint + Prettier)
- **Animations**: Framer Motion
- **i18n**: React i18next

## Rationale

### Build Tool: Vite > CRA

**Why Vite:**
- ⚡ **10-100x faster**: Instant dev server start (<1s vs 10-30s)
- 🔥 **Lightning HMR**: <100ms vs seconds
- 📦 **Better bundling**: Rollup-based with tree-shaking
- 🎯 **Modern defaults**: ESM, fast refresh, optimized builds
- 📈 **Active development**: Vite 6 vs CRA in maintenance mode

**Migration Effort**: 2-3 days (ISSUE-010)

### Language: TypeScript 5 Strict > JavaScript

**Why TypeScript:**
- 🛡️ **Type safety**: Catch errors at compile time
- 🔧 **Better DX**: IntelliSense, autocomplete, refactoring
- 📚 **Self-documenting**: Interfaces = documentation
- 🐛 **Fewer runtime errors**: Type checking prevents common bugs
- 🌐 **Industry standard**: 80%+ of React projects use TypeScript

**Migration Strategy**:
- Enable TypeScript strict mode for NEW files
- Keep existing JavaScript files (.js, .jsx) functional
- Incrementally convert to TypeScript as files are touched

**Migration Effort**: Included in Vite migration (ISSUE-010)

### UI Components: shadcn/ui > Custom Widgets

**Why shadcn/ui:**
- ✅ **Accessible by default**: Built on Radix UI primitives (WCAG 2.1 AA)
- ⚡ **Fast development**: Install components as needed
- 🎨 **Fully customizable**: Copy-paste components into codebase
- 🏗️ **Not a library**: No npm dependency, full control
- 🔄 **No breaking changes**: We own the code after installation
- 📦 **Small bundle**: Only include components you use
- 🎯 **Tailwind-first**: Integrates perfectly with Tailwind CSS

**Widget Architecture (3 Layers):**
1. **Radix UI**: Headless, accessible primitives
2. **shadcn/ui**: Styled components (our customization layer)
3. **OpenPortal Widgets**: Configuration-driven wrappers
4. **Widget Registry**: Dynamic rendering from JSON configs

**Example:**
```typescript
// Layer 1: Radix UI (headless)
@radix-ui/react-label

// Layer 2: shadcn Input component
<Input /> // Tailwind-styled, accessible

// Layer 3: OpenPortal Widget
<TextInputWidget config={...} bindings={...} events={...} />

// Layer 4: Dynamic rendering
<WidgetRenderer config={{ type: 'TextInput', ... }} />
```

**Migration Effort**: 3 days setup (ISSUE-011), 1 day per widget (ISSUE-014+)

**Why NOT Custom Widgets Anymore:**
- ❌ **Slow development**: 2-3 days per widget vs 2-3 hours with shadcn
- ❌ **Maintenance burden**: We maintain all accessibility, styling, behavior
- ❌ **Reinventing wheel**: Radix already solved hard problems (focus management, keyboard nav, ARIA)
- ❌ **Less battle-tested**: Our components not as mature as Radix

**Supersedes**: ADR-003 (Custom Widget Library decision)

### Routing: TanStack Router > React Router v6

**Why TanStack Router:**
- 🔒 **Type-safe**: Full TypeScript integration with autocomplete
- 📂 **File-based**: Routes auto-generated from file structure
- ⚡ **Code splitting**: Automatic route-based splitting
- 🔍 **Type-safe search params**: Validated, type-safe query strings
- 🎯 **Better DX**: Less boilerplate, more type safety
- 🚀 **Modern patterns**: beforeLoad, loaders, improved navigation

**Migration Effort**: 3-4 days (ISSUE-012)

### Authentication: Azure MSAL (Parallel Implementation)

**Why Azure MSAL:**
- 🏢 **Enterprise ready**: First-class Azure AD support
- 🔐 **Secure by default**: Token handling, refresh, storage
- 📦 **Official library**: Microsoft-maintained
- 🔄 **Parallel approach**: Keep existing OAuth, add MSAL, feature flag switch

**Implementation Strategy:**
- Build MSAL authentication alongside existing OAuth
- Environment variable switches between providers
- Test both systems independently
- No disruption to existing auth work

**Files Preserved:**
- `src/components/LoginPage.js` (existing)
- `src/services/authService.js` (existing)
- `src/services/tokenManager.js` (extended)
- `src/hooks/useAuth.js` (existing)

**New Files:**
- `src/components/LoginPageMSAL.tsx` (parallel)
- `src/hooks/useMsalAuth.ts` (parallel)
- `src/config/msalConfig.ts`

**Migration Effort**: 4-5 days (ISSUE-013)

### Code Quality: BiomeJS > ESLint + Prettier

**Why BiomeJS:**
- ⚡ **100x faster**: Rust-based, single tool
- 🎯 **Unified**: Linting + formatting + import sorting
- 🔧 **Better defaults**: Ultracite preset is opinionated and good
- 📦 **Single dependency**: vs ESLint + Prettier + plugins
- 🚀 **Future-proof**: Modern tooling direction

**Migration Effort**: Included in Vite migration (ISSUE-010)

### Testing: Vitest > Jest

**Why Vitest:**
- ⚡ **Faster**: Vite-native, reuses build config
- 🎯 **API compatible**: Jest-like API, easy migration
- 🔄 **HMR for tests**: Instant test re-runs
- 📦 **Vite integration**: Shares config and plugins

**Migration Strategy:**
- Keep existing Jest tests for custom OAuth (41 tests)
- Use Vitest for new TypeScript code
- Measure coverage separately during transition
- Full migration to Vitest in Phase 2

**Migration Effort**: Incremental (new tests use Vitest)

## Phase 0.5: Migration Roadmap

We're inserting a **Phase 0.5** between Phase 0 and Phase 1 to execute this migration:

### ISSUE-010: Vite + TypeScript 5 Strict + BiomeJS (5 days)
- Remove CRA, install Vite
- Configure TypeScript strict mode
- Set up BiomeJS with Ultracite preset
- Verify existing JavaScript files work
- No code conversion yet

### ISSUE-011: Tailwind CSS v4.1 + shadcn/ui CLI (3 days)
- Install Tailwind CSS
- Initialize shadcn/ui CLI
- Create CSS variables and theme
- Map branding to Tailwind tokens
- DO NOT install components yet

### ISSUE-012: TanStack Router v1.132 (4 days)
- Remove React Router
- Set up file-based routing
- Migrate login and OAuth callback routes
- Implement route guards
- Update navigation hooks

### ISSUE-013: Azure MSAL Parallel Implementation (5 days)
- Install @azure/msal-browser and @azure/msal-react
- Build LoginPageMSAL.tsx (first TypeScript component)
- Install first shadcn components (Input, Button, Card, Label)
- Extend token manager for MSAL
- Feature flag switching (VITE_AUTH_PROVIDER)

### ISSUE-014: Widget Registry + TextInputWidget POC (4 days)
- Implement widget registry
- Create TextInputWidget using shadcn Input
- Validate 3-layer architecture
- Prove configuration-driven rendering
- Build demo page

**Total Migration Effort**: ~21 days (4 weeks)

## Alternatives Considered

### Alternative 1: Stay with CRA + JavaScript + Custom Widgets

**Pros:**
- No migration effort
- Keep existing decisions

**Cons:**
- Accumulating technical debt
- Slow build times persist
- No type safety
- Slow widget development (2-3 days each × 12 = 24-36 days)
- Maintenance burden for custom widgets

**Why Not Selected:** Technical debt would compound exponentially

### Alternative 2: Partial Migration (Vite only, keep JavaScript)

**Pros:**
- Faster builds
- Less migration work

**Cons:**
- Miss out on TypeScript benefits
- Still slow widget development
- Still maintaining custom widgets

**Why Not Selected:** Half measures don't solve core issues

### Alternative 3: Delay Migration to Phase 2

**Pros:**
- Complete Phase 1 first
- Defer migration work

**Cons:**
- 12+ widgets to migrate later
- More code to convert
- Harder to justify migration after investment
- Compounding technical debt

**Why Not Selected:** Migration cost increases exponentially with delay

## Consequences

### Positive

1. **10-100x Faster Builds**: Dev server <1s, HMR <100ms
2. **Type Safety**: Catch errors at compile time
3. **Faster Widget Development**: 2-3 hours vs 2-3 days per widget
4. **Better DX**: Modern tooling, better editor support
5. **Accessible by Default**: Radix UI handles complex ARIA patterns
6. **Future-Proof**: Aligned with React ecosystem direction
7. **Smaller Bundles**: Vite + tree-shaking + code splitting
8. **Easier Onboarding**: Modern stack attracts developers

### Negative

1. **Migration Time**: ~21 days (4 weeks) added to timeline
2. **Learning Curve**: Team learns new tools
3. **Dual Auth Systems**: Temporary complexity with both OAuth and MSAL
4. **Testing Complexity**: Jest + Vitest during transition
5. **Documentation Updates**: All guides need updating

### Neutral

1. **No Timeline Impact**: Migration inserted as Phase 0.5, doesn't delay Phase 2+
2. **Incremental TypeScript**: Existing JavaScript works, convert incrementally
3. **Parallel Auth**: Both systems coexist during transition
4. **Widget Architecture**: Still configuration-driven, just different foundation

## Implementation Plan

### Week 1: Build System
- ISSUE-010: Vite + TypeScript + BiomeJS (5 days)

### Week 2: Styling + Routing
- ISSUE-011: Tailwind + shadcn setup (3 days)
- ISSUE-012: TanStack Router (2 days start)

### Week 3: Routing + Auth
- ISSUE-012: TanStack Router (2 days finish)
- ISSUE-013: Azure MSAL (3 days start)

### Week 4: Auth + Widgets
- ISSUE-013: Azure MSAL (2 days finish)
- ISSUE-014: Widget Registry + TextInputWidget POC (4 days)

### Validation Criteria

After Phase 0.5:
- ✅ Dev server starts in <1s
- ✅ HMR updates in <100ms
- ✅ TypeScript strict mode enabled for new files
- ✅ Both auth systems work (custom OAuth + MSAL)
- ✅ TextInputWidget renders from configuration
- ✅ All existing tests pass
- ✅ Production build optimized

## Risk Management

### Risk 1: Migration Takes Longer Than Expected
**Mitigation:**
- Detailed issue breakdown
- Daily progress tracking
- Rollback plan for each issue

### Risk 2: Existing Auth Code Breaks
**Mitigation:**
- Preserve existing JavaScript files
- Test both auth systems independently
- Feature flag for easy switching

### Risk 3: Team Unfamiliar with Tools
**Mitigation:**
- Documentation for each tool
- Copilot instructions updated
- Incremental adoption (learn as we go)

### Risk 4: Widget Architecture Doesn't Work
**Mitigation:**
- ISSUE-014 validates architecture with POC
- Can revert to custom widgets if needed (unlikely)

## Success Metrics

- Dev server startup: <1s (vs 10-30s)
- HMR update: <100ms (vs 1-3s)
- Widget development time: 2-3 hours (vs 2-3 days)
- Type safety: 100% of new code
- Test coverage: Maintain >80%
- Bundle size: Maintained or reduced
- Accessibility: WCAG 2.1 AA (Radix ensures this)

## Review and Reevaluation

**Review Trigger**: End of Phase 0.5 (after ISSUE-014)

**Reevaluate if:**
- Migration significantly over budget (>30 days)
- Major blockers discovered
- Team strongly prefers old stack
- Architecture POC fails

**Rollback Plan:**
If migration fails, each issue has a rollback section.

## References

- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TanStack Router Documentation](https://tanstack.com/router)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Azure MSAL Documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-overview)
- [BiomeJS Documentation](https://biomejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)

## Related ADRs

- **Supersedes**: ADR-001 (Build Tool - CRA)
- **Supersedes**: ADR-003 (UI Component Library - Custom Widgets)
- **Updates**: ADR-011 (TypeScript - now strict mode)
- **Related**: ADR-002 (State Management - TanStack Store added)

---

**Last Updated:** January 20, 2026  
**Next Review:** End of Phase 0.5
