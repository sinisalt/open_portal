import { createFileRoute } from '@tanstack/react-router';
import OAuthCallback from '@/components/OAuthCallback.jsx';

type OAuthCallbackSearch = {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
};

export const Route = createFileRoute('/auth/callback')({
  component: OAuthCallback,
  validateSearch: (search: Record<string, unknown>): OAuthCallbackSearch => {
    return {
      code: search.code as string,
      state: search.state as string,
      error: search.error as string,
      error_description: search.error_description as string,
    };
  },
});
