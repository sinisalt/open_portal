import { createFileRoute, redirect } from '@tanstack/react-router';
import { DynamicPage } from '@/components/DynamicPage';
import * as tokenManager from '@/services/tokenManager';

export const Route = createFileRoute('/$')({
  component: DynamicPageRoute,
  beforeLoad: async () => {
    // Require authentication
    if (!tokenManager.isAuthenticated()) {
      throw redirect({ to: '/login', search: { redirect: '/' } });
    }
  },
});

function DynamicPageRoute() {
  // The DynamicPage component will handle loading the page config
  // based on the current route path
  return <DynamicPage />;
}
