/**
 * AppLayout Component
 *
 * Root SPA layout with persistent header, sidebar, and footer.
 * Menus never reload - only content changes on navigation.
 */

import { useLocation } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { FooterMenu } from '@/components/menus/FooterMenu/FooterMenu';
import { ConnectedHeader } from '@/components/menus/Header/ConnectedHeader';
import { ConnectedSideMenu } from '@/components/menus/SideMenu/ConnectedSideMenu';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useMenuContext } from '@/contexts/MenuContext';
import { useBootstrap } from '@/hooks/useBootstrap';
import { cn } from '@/lib/utils';

/**
 * AppLayout Props
 */
interface AppLayoutProps {
  /** Page content to render */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Hide header (default: false) */
  hideHeader?: boolean;
  /** Hide sidebar (default: false) */
  hideSidebar?: boolean;
  /** Hide footer (default: false) */
  hideFooter?: boolean;
}

/**
 * AppLayout Component
 *
 * Provides persistent menu layout for SPA navigation.
 * Menus update based on route context but never fully reload.
 */
export function AppLayout({
  children,
  className,
  hideHeader = false,
  hideSidebar = false,
  hideFooter = false,
}: AppLayoutProps) {
  const location = useLocation();
  const { setMenus, footerMenu, sidebarCollapsed } = useMenuContext();
  const { menus } = useBootstrap();

  /**
   * Load menus from bootstrap when they change
   */
  useEffect(() => {
    if (menus) {
      setMenus({
        top: menus.top || [],
        side: menus.side || [],
        footer: menus.footer || [],
      });
    }
  }, [menus, setMenus]);

  /**
   * Update active menu item based on current route
   */
  useEffect(() => {
    // Auto-detect active item based on current pathname
    // This will be enhanced in future iterations
    const pathname = location.pathname;
    console.log('Current route:', pathname);
  }, [location.pathname]);

  return (
    <SidebarProvider defaultOpen={!sidebarCollapsed}>
      <div className={cn('flex min-h-screen w-full', className)}>
        {/* Sidebar - Only shown on desktop unless hideSidebar is true */}
        {!hideSidebar && (
          <div className="hidden md:block">
            <ConnectedSideMenu />
          </div>
        )}

        {/* Main content area */}
        <SidebarInset className="flex flex-1 flex-col">
          {/* Header - Persistent across navigation */}
          {!hideHeader && <ConnectedHeader />}

          {/* Page content - Changes on navigation */}
          <main className="flex-1">
            <div className="container mx-auto px-4 py-6">{children}</div>
          </main>

          {/* Footer - Persistent across navigation */}
          {!hideFooter && footerMenu.length > 0 && <FooterMenu items={footerMenu} columns={4} />}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
