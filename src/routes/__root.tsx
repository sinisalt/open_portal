import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { BootstrapProvider } from '@/contexts/BootstrapContext';
import { UserProvider } from '@/contexts/UserContext';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <BootstrapProvider>
      <UserProvider>
        <div className="min-h-screen bg-background">
          <Outlet />
        </div>
        {/* Dev tools only in development */}
        {import.meta.env.DEV && <TanStackRouterDevtools />}
      </UserProvider>
    </BootstrapProvider>
  );
}
