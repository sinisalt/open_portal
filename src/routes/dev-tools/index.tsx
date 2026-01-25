import { createFileRoute, redirect } from '@tanstack/react-router';

/**
 * Dev Tools Index Route
 *
 * Redirects to the configuration validator by default
 */
export const Route = createFileRoute('/dev-tools/')({
  beforeLoad: async () => {
    // Only allow access in development mode
    if (!import.meta.env.DEV) {
      throw redirect({
        to: '/',
        replace: true,
      });
    }
  },
  component: () => {
    // Redirect to default tool (validator)
    throw redirect({
      to: '/dev-tools/validator',
      replace: true,
    });
  },
});
