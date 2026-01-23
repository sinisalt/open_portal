import { createFileRoute, redirect } from '@tanstack/react-router';
import { useHasPermission, useUser } from '@/contexts/UserContext';
import * as tokenManager from '@/services/tokenManager';

export const Route = createFileRoute('/admin')({
  component: AdminPage,
  beforeLoad: async ({ location }) => {
    // Check authentication
    if (!tokenManager.isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: { redirect: location.pathname },
      });
    }

    // Note: Permission checking is currently handled in the component as a temporary guard.
    // TODO: Move permission checks into beforeLoad (using bootstrap/route-guard data),
    //       aligned with the route guard TODO in useRouteGuard.ts.
  },
});

function AdminPage() {
  const user = useUser();
  const canAccessAdmin = useHasPermission('admin.access');

  // Redirect if no permission (component-level guard)
  if (!canAccessAdmin) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Access Denied</h1>
        <p className="text-muted-foreground mb-4">
          You don't have permission to access the admin panel.
        </p>
        <a href="/" className="text-primary hover:underline">
          Return to Home
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">Admin Panel</h1>
      <p className="text-muted-foreground mb-4">Welcome, {user?.name}!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        <div className="p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p className="text-muted-foreground mb-4">Manage users and permissions</p>
          <button
            type="button"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            View Users
          </button>
        </div>

        <div className="p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-2">System Settings</h2>
          <p className="text-muted-foreground mb-4">Configure system settings</p>
          <button
            type="button"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            View Settings
          </button>
        </div>

        <div className="p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Audit Logs</h2>
          <p className="text-muted-foreground mb-4">View system audit logs</p>
          <button
            type="button"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            View Logs
          </button>
        </div>
      </div>
    </div>
  );
}
