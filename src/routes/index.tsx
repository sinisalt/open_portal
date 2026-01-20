import { createFileRoute, redirect } from '@tanstack/react-router';
import * as tokenManager from '@/services/tokenManager';

export const Route = createFileRoute('/')({
  component: HomePage,
  beforeLoad: async () => {
    // Require authentication
    if (!tokenManager.isAuthenticated()) {
      throw redirect({ to: '/login', search: { redirect: '/' } });
    }
  },
});

function HomePage() {
  // Get user info from tokenManager
  const user = tokenManager.getCurrentUser() as { name?: string; email?: string } | null;
  const userName = user?.name || user?.email || 'User';

  const handleLogout = () => {
    tokenManager.clearTokens();
    window.location.href = '/login';
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to OpenPortal</h1>
      <p className="text-muted-foreground mb-4">Hello, {userName}!</p>
      <p className="text-muted-foreground mb-8">
        Configuration-driven business UI platform
      </p>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Logout
      </button>
    </div>
  );
}
