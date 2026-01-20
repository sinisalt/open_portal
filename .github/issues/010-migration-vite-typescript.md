# Issue #010: Migration - Vite + TypeScript 5 Strict + BiomeJS Setup

**Phase:** Phase 0.5 - Technology Stack Migration  
**Component:** Frontend Build System  
**Estimated Effort:** 5 days  
**Priority:** Critical  
**Labels:** phase-0.5, frontend, migration, build-tool, typescript

## Description
Migrate the project from Create React App to Vite 6, configure TypeScript 5 in strict mode, and set up BiomeJS (Ultracite preset) for linting and formatting. This is the foundation for the entire migration and must be completed before other migration issues.

## Context
The current Create React App setup is in maintenance mode and slower than modern alternatives. Vite provides instant server start, lightning-fast HMR, and optimized production builds. TypeScript 5 strict mode will catch errors early and improve code quality. BiomeJS replaces ESLint + Prettier with a faster, unified toolchain.

## Acceptance Criteria
- [ ] Vite 6 installed and configured
- [ ] React 19 plugin configured
- [ ] TypeScript 5 with strict mode enabled
- [ ] BiomeJS configured with Ultracite preset
- [ ] Development server running (`npm run dev`)
- [ ] Production build working (`npm run build`)
- [ ] All existing JavaScript files remain functional (no conversion yet)
- [ ] Environment variables migrated from CRA to Vite format
- [ ] Path aliases configured (@/ for src/)
- [ ] Hot Module Replacement (HMR) working
- [ ] Build output optimized (code splitting, minification)
- [ ] Legacy scripts removed (react-scripts)

## Dependencies
- Depends on: Current Phase 1.1 authentication work (ISSUE-007, ISSUE-008, ISSUE-009)
- Blocks: ISSUE-011 (shadcn setup requires Vite)
- Blocks: ISSUE-012 (TanStack Router)
- Blocks: ISSUE-013 (Azure MSAL)
- Blocks: ISSUE-014 (Widget registry)

## Migration Steps

### Step 1: Install Vite and Dependencies
```bash
# Remove CRA
npm uninstall react-scripts

# Install Vite
npm install -D vite @vitejs/plugin-react

# Install TypeScript 5
npm install -D typescript@5

# Install BiomeJS
npm install -D @biomejs/biome
```

### Step 2: Create Vite Configuration
Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
})
```

### Step 3: Update TypeScript Configuration
Update `tsconfig.json` for strict mode:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### Step 4: Configure BiomeJS
Create `biome.json`:
```json
{
  "$schema": "https://biomejs.dev/schemas/1.5.3/schema.json",
  "extends": ["@biomejs/biome-config-ultracite"],
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  }
}
```

### Step 5: Update index.html
Move `public/index.html` to root and update:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OpenPortal</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.jsx"></script>
  </body>
</html>
```

### Step 6: Update Environment Variables
- Rename `.env` files to use `VITE_` prefix
- Update all `process.env.REACT_APP_*` to `import.meta.env.VITE_*`

### Step 7: Update package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "biome check .",
    "lint:fix": "biome check --apply .",
    "format": "biome format --write ."
  }
}
```

### Step 8: Remove CRA Files
- Delete `public/index.html` (moved to root)
- Remove `.eslintrc` or `eslintConfig` in package.json
- Remove `.prettierrc`
- Update `.gitignore` (replace `/build` with `/dist` if needed)

### Step 9: Test Migration
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## File Structure Changes
```
Before:
public/index.html
src/index.js
jsconfig.json

After:
index.html (root)
src/index.jsx
tsconfig.json
tsconfig.node.json
vite.config.ts
biome.json
```

## Testing Requirements
- [ ] Existing tests still pass (Jest compatibility maintained)
- [ ] Dev server starts without errors
- [ ] Production build completes successfully
- [ ] All existing features work in dev mode
- [ ] All existing features work in production build
- [ ] HMR works for React components
- [ ] Environment variables are accessible
- [ ] Path aliases resolve correctly

## Security Considerations
- [ ] No secrets in environment variables
- [ ] Build output doesn't include sensitive data
- [ ] Source maps configured appropriately for production
- [ ] Content Security Policy compatible

## Documentation
- [ ] Update README.md with new commands
- [ ] Update CONTRIBUTING.md with BiomeJS usage
- [ ] Document environment variable changes
- [ ] Update `.github/copilot-instructions.md` with Vite patterns

## Rollback Plan
If migration fails:
1. Revert package.json changes
2. Restore react-scripts
3. Keep existing CRA setup
4. Document blockers for future attempt

## Success Metrics
- Dev server starts in <1s (vs 10-30s with CRA)
- HMR updates in <100ms
- Production build time <60s
- Bundle size maintained or reduced
- All existing tests pass

## Deliverables
- Vite configuration
- TypeScript strict mode setup
- BiomeJS configuration
- Updated scripts and documentation
- Verified working dev and production builds

## Notes
- Keep existing JavaScript files (.js, .jsx) - no conversion to TypeScript yet
- TypeScript strict mode will be used for NEW files only
- Existing tests remain in Jest (Vitest migration in later issue)
- This issue focuses on build tool migration only
