import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ThemeProvider } from 'next-themes';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Toaster } from '@/components/ui/sonner';
import { BootstrapProvider } from '@/contexts/BootstrapContext';
import { MenuProvider } from '@/contexts/MenuContext';
import { UserProvider } from '@/contexts/UserContext';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <BootstrapProvider>
        <UserProvider>
          <MenuProvider>
            <AppLayout>
              <Outlet />
            </AppLayout>
            {/* Toast notifications */}
            <Toaster />
            {/* Dev tools only in development */}
            {import.meta.env.DEV && <TanStackRouterDevtools />}
          </MenuProvider>
        </UserProvider>
      </BootstrapProvider>
    </ThemeProvider>
  );
}
