# Issue #011: Migration - Tailwind CSS v4.1 + shadcn/ui CLI Setup

**Phase:** Phase 0.5 - Technology Stack Migration  
**Component:** Frontend UI Framework  
**Estimated Effort:** 3 days  
**Priority:** High  
**Labels:** phase-0.5, frontend, migration, ui-framework, styling

## Description
Set up Tailwind CSS v4.1 and initialize shadcn/ui CLI without installing any components yet. This establishes the styling foundation and component installation pipeline for the OpenPortal widget system.

## Context
OpenPortal widgets will be built on top of shadcn/ui components (which use Radix UI primitives). This issue sets up the infrastructure for incremental component installation as widgets are implemented. We're NOT installing all components at once - only the infrastructure.

## Acceptance Criteria
- [ ] Tailwind CSS v4.1 installed and configured
- [ ] PostCSS and autoprefixer configured
- [ ] Tailwind config with OpenPortal design tokens
- [ ] shadcn/ui CLI initialized (components.json)
- [ ] `@/components/ui` directory structure created
- [ ] `@/lib/utils.ts` with cn() utility created
- [ ] Basic theme mapping from branding.md to Tailwind
- [ ] Dark mode support configured
- [ ] NO shadcn components installed yet (installation deferred to widget issues)
- [ ] Existing styles continue to work (CSS coexistence)

## Dependencies
- Depends on: ISSUE-010 (Vite + TypeScript must be complete)
- Blocks: ISSUE-013 (Azure MSAL needs shadcn components)
- Blocks: ISSUE-014 (Widget registry needs shadcn setup)

## Installation Steps

### Step 1: Install Tailwind CSS v4.1
```bash
npm install -D tailwindcss@4.1.14 postcss autoprefixer
npx tailwindcss init -p
```

### Step 2: Configure Tailwind
Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // OpenPortal brand colors from branding.md
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Primary blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Secondary green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // shadcn-compatible semantic colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

### Step 3: Create CSS Variables
Create `src/index.css` with Tailwind directives and CSS variables:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;

    --secondary: 142.1 76.2% 36.3%;
    --secondary-foreground: 210 40% 98%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 142.1 70.6% 45.3%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Step 4: Initialize shadcn/ui CLI
```bash
npx shadcn@latest init
```

When prompted, configure:
- TypeScript: Yes
- Style: Default
- Base color: Slate
- CSS variables: Yes
- Tailwind config: tailwind.config.js
- Component path: src/components/ui
- Utils path: src/lib/utils.ts
- React Server Components: No
- Import alias: @/*

This creates `components.json`:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### Step 5: Create Utility Functions
Create `src/lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Install required dependencies:
```bash
npm install clsx tailwind-merge
npm install -D tailwindcss-animate
```

### Step 6: Update Vite Config for Path Aliases
Verify `vite.config.ts` has path alias:
```typescript
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Step 7: Create Component Directory Structure
```bash
mkdir -p src/components/ui
mkdir -p src/lib
mkdir -p src/widgets
```

Create `src/components/ui/README.md`:
```markdown
# shadcn/ui Components

This directory contains shadcn/ui components installed via CLI.

**DO NOT manually create files here.** Use:
```bash
npx shadcn@latest add <component-name>
```

Components are installed incrementally as widgets are implemented.

See: documentation/WIDGET-COMPONENT-MAPPING.md for the installation plan.
```

### Step 8: Verify Installation
Test that Tailwind works:
Create `src/components/TailwindTest.tsx`:
```typescript
export function TailwindTest() {
  return (
    <div className="bg-primary text-primary-foreground p-4 rounded-lg">
      Tailwind CSS is working! 🎨
    </div>
  )
}
```

## File Structure After Setup
```
src/
├── components/
│   └── ui/              # shadcn components (empty for now)
│       └── README.md
├── lib/
│   └── utils.ts         # cn() utility
├── widgets/             # OpenPortal widgets (to be created)
├── index.css            # Tailwind directives + CSS variables
└── ...
tailwind.config.js
postcss.config.js
components.json          # shadcn CLI config
```

## Testing Requirements
- [ ] Tailwind classes render correctly
- [ ] CSS variables defined and accessible
- [ ] Dark mode toggle works
- [ ] `cn()` utility merges classes correctly
- [ ] shadcn CLI can install components
- [ ] Existing CSS files still work (no conflicts)
- [ ] Dev server starts without Tailwind errors

## Design Token Mapping
Map OpenPortal branding to Tailwind (from `documentation/branding.md`):
- Primary Blue (#3b82f6) → `primary-500`
- Secondary Green (#22c55e) → `secondary-500`
- Neutral Gray (#6b7280) → `muted-foreground`
- Border Radius: 8px → `--radius: 0.5rem`
- Font Family: Inter → `font-sans`

## Component Installation Plan (Future Issues)
**DO NOT install these yet** - they will be installed incrementally:

| Widget (Issue) | shadcn Components to Install |
|----------------|------------------------------|
| ISSUE-013 (MSAL Auth) | `input`, `button`, `card`, `label` |
| ISSUE-014 (TextInput Widget) | Already have from ISSUE-013 |
| Phase 1.3 (Select Widget) | `select`, `popover`, `command` |
| Phase 1.3 (DatePicker) | `calendar`, `popover`, `button` |
| Phase 1.3 (Checkbox) | `checkbox`, `label` |
| Phase 1.3 (Table) | `table` |
| Phase 1.3 (Modal) | `dialog` |
| Phase 1.3 (Toast) | `toast` (or use Sonner) |

## Security Considerations
- [ ] No inline styles that bypass CSP
- [ ] Tailwind JIT doesn't expose sensitive data
- [ ] CSS class names don't leak information

## Documentation
- [ ] Update README.md with Tailwind commands
- [ ] Create `documentation/WIDGET-COMPONENT-MAPPING.md`
- [ ] Document theme customization approach
- [ ] Update `.github/copilot-instructions.md` with Tailwind patterns

## Success Metrics
- Tailwind CSS builds without errors
- shadcn CLI can install components successfully
- Design tokens mapped to CSS variables
- Dark mode toggle functional
- No CSS conflicts with existing styles

## Deliverables
- Tailwind CSS configuration
- shadcn/ui CLI setup
- CSS variables and theme
- `cn()` utility function
- Component directory structure
- Documentation updates

## Notes
- **No components installed yet** - only infrastructure
- Components installed incrementally as widgets built
- Existing CSS coexists with Tailwind during transition
- Dark mode uses class strategy for easy toggle
