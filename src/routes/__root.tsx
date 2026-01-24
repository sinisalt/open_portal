import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { BootstrapProvider } from '@/contexts/BootstrapContext';
import { UserProvider } from '@/contexts/UserContext';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <BootstrapProvider>
        <UserProvider>
          <div className="min-h-screen bg-background">
            <Outlet />
          </div>
          {/* Toast notifications */}
          <Toaster />
          {/* Dev tools only in development */}
          {import.meta.env.DEV && <TanStackRouterDevtools />}
        </UserProvider>
      </BootstrapProvider>
    </ThemeProvider>
  );
}
