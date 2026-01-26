import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { DevToolsLayout } from '@/tools/components/DevToolsLayout';

/**
 * Dev Tools Layout Route
 *
 * Parent route for all developer tools
 * Provides consistent layout and navigation
 */
export const Route = createFileRoute('/dev-tools')({
  beforeLoad: async () => {
    // Only allow access in development mode
    if (!import.meta.env.DEV) {
      throw redirect({
        to: '/',
        replace: true,
      });
    }
  },
  component: DevToolsLayout,
});
