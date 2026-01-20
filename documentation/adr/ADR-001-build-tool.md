# ADR-001: Build Tool Selection

**Status:** Accepted  
**Date:** 2026-01-20  
**Deciders:** Development Team  
**Issue:** #004 - Technical Stack Finalization

## Context

We need to choose a build tool for the OpenPortal frontend. The build tool is responsible for:
- Development server with hot module replacement (HMR)
- Production build optimization (bundling, minification, code splitting)
- Asset processing (CSS, images, fonts)
- TypeScript compilation
- Environment configuration

The project already has Create React App (CRA) 5.0.1 installed and configured. We need to decide whether to keep it or migrate to a more modern build tool.

### Key Requirements

1. **Zero configuration**: Focus on development, not build tooling
2. **Fast development experience**: Quick startup and HMR
3. **Production optimization**: Efficient bundling and code splitting
4. **TypeScript support**: First-class TypeScript integration
5. **Testing integration**: Works with Jest and React Testing Library
6. **Stability**: Mature and well-maintained

## Decision

**We will continue using Create React App (CRA) 5.0.1 for Phase 0 and Phase 1.**

We will plan a migration to Vite in Phase 2 or Phase 3 if needed.

## Alternatives Considered

### Option 1: Create React App (CRA) - SELECTED ✅

**Pros:**
- ✅ Already installed and configured
- ✅ Zero configuration needed
- ✅ Mature and stable
- ✅ Excellent documentation
- ✅ Large community support
- ✅ Works out-of-the-box with Jest and React Testing Library
- ✅ Proven in production
- ✅ Focus on development, not tooling

**Cons:**
- ❌ Slower dev server compared to Vite
- ❌ In maintenance mode (React team focus on other tools)
- ❌ Larger bundle size compared to modern tools
- ❌ Webpack under the hood (older technology)

**Why Selected:**
- We're in early development phase (Phase 0/1)
- Stability and simplicity are more important than cutting-edge performance
- Already working and configured
- Team can focus on building features, not configuring build tools
- Performance is acceptable for MVP
- Can migrate to Vite later with minimal effort

### Option 2: Vite

**Pros:**
- ✅ Extremely fast dev server (native ES modules)
- ✅ Modern and actively developed
- ✅ Better production builds
- ✅ Smaller bundle sizes
- ✅ Excellent TypeScript support
- ✅ Plugin ecosystem growing rapidly

**Cons:**
- ❌ Requires migration effort from CRA
- ❌ Need to configure Jest integration
- ❌ Different mental model from CRA
- ❌ Time spent on migration instead of features

**Why Not Selected Now:**
- Migration effort not justified in early phase
- CRA is working fine for our current needs
- Can migrate later with minimal risk

### Option 3: Next.js

**Pros:**
- ✅ Excellent developer experience
- ✅ Server-side rendering (SSR)
- ✅ File-based routing
- ✅ Optimized performance
- ✅ Large ecosystem

**Cons:**
- ❌ Adds SSR complexity we don't need
- ❌ OpenPortal is a configuration-driven SPA, not SSR app
- ❌ File-based routing doesn't fit our dynamic routing model
- ❌ Overkill for our use case

**Why Not Selected:**
- SSR not needed (configuration-driven SPA)
- Dynamic routing from backend doesn't fit Next.js model
- Too opinionated for our architecture

### Option 4: Custom Webpack Config

**Pros:**
- ✅ Full control over build process
- ✅ Optimize exactly for our needs

**Cons:**
- ❌ Significant time investment
- ❌ Maintenance burden
- ❌ Reinventing the wheel
- ❌ Team needs webpack expertise

**Why Not Selected:**
- Time better spent building features
- CRA provides good defaults

## Consequences

### Positive

1. **Immediate productivity**: No migration or configuration time needed
2. **Team familiarity**: CRA is widely known and understood
3. **Stability**: Proven, battle-tested tool
4. **Focus on features**: Team focuses on OpenPortal, not build tooling
5. **Testing works**: Jest and React Testing Library work out-of-the-box

### Negative

1. **Slower dev server**: Dev server startup and HMR slower than Vite
2. **Maintenance mode**: CRA may not receive major updates
3. **Larger bundles**: Production bundles slightly larger than Vite
4. **Future migration**: Will need to migrate to Vite eventually

### Neutral

1. **Migration path exists**: Vite migration is straightforward
2. **Performance acceptable**: CRA performance is fine for MVP
3. **React 19 support**: CRA 5.0.1 works with React 19.2.3

## Implementation Notes

### Current Setup

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

### Future Migration to Vite (Phase 2+)

When we decide to migrate:

1. **Install Vite**:
   ```bash
   npm install -D vite @vitejs/plugin-react
   ```

2. **Create vite.config.ts**:
   ```typescript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     server: { port: 3000 },
   });
   ```

3. **Update package.json**:
   ```json
   {
     "scripts": {
       "start": "vite",
       "build": "vite build",
       "preview": "vite preview"
     }
   }
   ```

4. **Move index.html** to root and update paths

5. **Configure Jest** for Vite (use vitest or keep Jest)

**Estimated migration effort**: 1-2 days

## Success Metrics

- Development server starts in < 10 seconds ✅
- Hot module replacement works reliably ✅
- Production build completes in < 5 minutes ✅
- Bundle size < 500KB gzipped (target for Phase 1)
- Zero build-related blockers during Phase 1

## Review and Reevaluation

**Review Trigger**: End of Phase 1

**Reevaluate if:**
- Dev server performance becomes a blocker
- CRA stops receiving security updates
- Team size grows and parallel development suffers
- Bundle size exceeds targets significantly

## References

- [Create React App Documentation](https://create-react-app.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [React 19 with CRA](https://react.dev/blog/2024/12/05/react-19#install)
- [CRA to Vite Migration Guide](https://cathalmacdonnacha.com/migrating-from-create-react-app-cra-to-vite)

---

**Last Updated:** January 20, 2026  
**Next Review:** End of Phase 1
