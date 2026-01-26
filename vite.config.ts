import path from 'node:path';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite({
      // Specifies the output path for the auto-generated route tree type definitions used by TanStack Router
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/widgets': path.resolve(__dirname, './src/widgets'),
      '@/core': path.resolve(__dirname, './src/core'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/tests': path.resolve(__dirname, './src/tests'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    chunkSizeWarningLimit: 600, // Raise from default 500KB to avoid noisy warnings for legitimately large vendor chunks (e.g. recharts ~319KB) that are already optimally split by manualChunks
    rollupOptions: {
      output: {
        // Advanced manual chunking strategy for better code splitting
        manualChunks: id => {
          // Core React libraries (critical, loaded first)
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }

          // TanStack ecosystem (routing, tables, virtual lists)
          if (
            id.includes('node_modules/@tanstack/react-router') ||
            id.includes('node_modules/@tanstack/react-table') ||
            id.includes('node_modules/@tanstack/react-virtual')
          ) {
            return 'tanstack';
          }

          // Radix UI primitives (large set of components)
          if (id.includes('node_modules/@radix-ui')) {
            return 'radix-ui';
          }

          // Data visualization libraries (heavy, lazy loaded)
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'charts';
          }

          // HTML canvas library (only used in specific features)
          if (id.includes('node_modules/html2canvas')) {
            return 'html2canvas';
          }

          // Form libraries (react-hook-form, zod)
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/zod')) {
            return 'form-libs';
          }

          // Date libraries (date-fns, react-day-picker)
          if (
            id.includes('node_modules/date-fns') ||
            id.includes('node_modules/react-day-picker')
          ) {
            return 'date-libs';
          }

          // UI utility libraries (clsx, tailwind-merge, class-variance-authority)
          if (
            id.includes('node_modules/clsx') ||
            id.includes('node_modules/tailwind-merge') ||
            id.includes('node_modules/class-variance-authority')
          ) {
            return 'ui-utils';
          }

          // Authentication libraries (MSAL)
          if (
            id.includes('node_modules/@azure/msal-browser') ||
            id.includes('node_modules/@azure/msal-react')
          ) {
            return 'auth-msal';
          }

          // Other vendor libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }

          // Widget chunks - split by category for better caching
          if (id.includes('src/widgets/')) {
            // Layout widgets
            if (
              id.includes('PageWidget') ||
              id.includes('SectionWidget') ||
              id.includes('GridWidget') ||
              id.includes('CardWidget')
            ) {
              return 'widgets-layout';
            }

            // Form widgets
            if (
              id.includes('TextInputWidget') ||
              id.includes('SelectWidget') ||
              id.includes('DatePickerWidget') ||
              id.includes('CheckboxWidget')
            ) {
              return 'widgets-form';
            }

            // Data widgets
            if (
              id.includes('TableWidget') ||
              id.includes('KPIWidget') ||
              id.includes('ChartWidget')
            ) {
              return 'widgets-data';
            }

            // Modal/Dialog widgets
            if (
              id.includes('ModalWidget') ||
              id.includes('ModalPageWidget') ||
              id.includes('WizardWidget') ||
              id.includes('ToastWidget')
            ) {
              return 'widgets-feedback';
            }

            // Navigation widgets
            if (id.includes('MenuWidget')) {
              return 'widgets-navigation';
            }

            // Default widget chunk
            return 'widgets-other';
          }
        },
      },
    },
  },
});
