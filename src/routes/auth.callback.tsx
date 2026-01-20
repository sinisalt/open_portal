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
    const safeString = (value: unknown): string | undefined =>
      typeof value === 'string' ? value : undefined;

    return {
      code: safeString(search.code),
      state: safeString(search.state),
      error: safeString(search.error),
      error_description: safeString(search.error_description),
    };
  },
});
