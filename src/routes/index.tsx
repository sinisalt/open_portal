import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import * as tokenManager from '@/services/tokenManager';
import { useHasPermission, useTenant, useUser } from '@/contexts/UserContext';

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
  const navigate = useNavigate();
  const user = useUser();
  const tenant = useTenant();
  const canViewDashboard = useHasPermission('dashboard.view');
  const canEditUsers = useHasPermission('users.edit');

  const userName = user?.name || user?.email || 'User';

  const handleLogout = () => {
    tokenManager.clearTokens();
    navigate({ to: '/login' });
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to OpenPortal</h1>
      <p className="text-muted-foreground mb-4">Hello, {userName}!</p>
      {tenant && <p className="text-muted-foreground mb-2">Organization: {tenant.name}</p>}
      <p className="text-muted-foreground mb-8">Configuration-driven business UI platform</p>

      {/* Show permissions demo */}
      <div className="mb-8 p-4 bg-muted rounded-md">
        <h2 className="text-lg font-semibold mb-2">Your Permissions</h2>
        <ul className="list-disc list-inside space-y-1">
          <li className={canViewDashboard ? 'text-green-600' : 'text-red-600'}>
            Dashboard View: {canViewDashboard ? '✓ Granted' : '✗ Denied'}
          </li>
          <li className={canEditUsers ? 'text-green-600' : 'text-red-600'}>
            Users Edit: {canEditUsers ? '✓ Granted' : '✗ Denied'}
          </li>
        </ul>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Logout
      </button>
    </div>
  );
}
