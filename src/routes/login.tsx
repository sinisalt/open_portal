import { createFileRoute, redirect } from '@tanstack/react-router';
import LoginPage from '@/components/LoginPage.jsx';
import * as tokenManager from '@/services/tokenManager';

type LoginSearch = {
  redirect?: string;
};

export const Route = createFileRoute('/login')({
  component: LoginPage,
  beforeLoad: async ({ search }) => {
    // If already authenticated, redirect to home or intended destination
    if (tokenManager.isAuthenticated()) {
      const redirectTo = search?.redirect || '/';
      throw redirect({ to: redirectTo });
    }
  },
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      redirect: (search.redirect as string) || undefined,
    };
  },
});
