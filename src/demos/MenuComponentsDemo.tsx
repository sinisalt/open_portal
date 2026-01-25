/**
 * Menu Components Demo
 *
 * Interactive demonstration of menu components including:
 * - TopMenu (horizontal navigation with dropdowns)
 * - SideMenu (vertical sidebar with collapsible groups)
 * - FooterMenu (footer navigation)
 * - Header (unified header with logo and user menu)
 */

import { useState } from 'react';
import { FooterMenu } from '@/components/menus/FooterMenu/FooterMenu';
import { Header } from '@/components/menus/Header/Header';
import { SideMenu } from '@/components/menus/SideMenu/SideMenu';
import { TopMenu } from '@/components/menus/TopMenu/TopMenu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { MenuItem } from '@/types/menu.types';

export function MenuComponentsDemo() {
  const [activeItemId, setActiveItemId] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [clickedItem, setClickedItem] = useState<MenuItem | null>(null);

  // Sample menu data
  const topMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      route: '/dashboard',
      order: 1,
    },
    {
      id: 'reports',
      label: 'Reports',
      route: '/reports',
      order: 2,
      children: [
        {
          id: 'reports-sales',
          label: 'Sales Reports',
          route: '/reports/sales',
          order: 1,
        },
        {
          id: 'reports-analytics',
          label: 'Analytics',
          route: '/reports/analytics',
          order: 2,
        },
        {
          id: 'reports-inventory',
          label: 'Inventory',
          route: '/reports/inventory',
          order: 3,
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      route: '/settings',
      order: 3,
      badge: {
        text: '3',
        variant: 'primary',
      },
    },
  ];

  const sideMenuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home',
      route: '/',
      order: 1,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      order: 2,
    },
    {
      id: 'listings',
      label: 'Listings',
      icon: 'file',
      route: '/listings',
      order: 3,
      badge: {
        text: '12',
        variant: 'default',
      },
    },
    {
      id: 'reports-group',
      label: 'Reports',
      icon: 'chart',
      route: '/reports',
      order: 4,
      children: [
        {
          id: 'reports-sales',
          label: 'Sales',
          route: '/reports/sales',
          order: 1,
        },
        {
          id: 'reports-analytics',
          label: 'Analytics',
          route: '/reports/analytics',
          order: 2,
        },
        {
          id: 'reports-inventory',
          label: 'Inventory',
          route: '/reports/inventory',
          order: 3,
        },
      ],
    },
    {
      id: 'users',
      label: 'Users',
      icon: 'users',
      route: '/users',
      order: 5,
      divider: true,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      route: '/settings',
      order: 6,
    },
  ];

  const footerMenuItems: MenuItem[] = [
    {
      id: 'about',
      label: 'About Us',
      route: '/about',
      order: 1,
    },
    {
      id: 'contact',
      label: 'Contact',
      route: '/contact',
      order: 2,
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      route: '/privacy',
      order: 3,
    },
    {
      id: 'terms',
      label: 'Terms of Service',
      route: '/terms',
      order: 4,
    },
  ];

  const handleItemClick = (item: MenuItem) => {
    setActiveItemId(item.id);
    setClickedItem(item);
    console.log('Menu item clicked:', item);
  };

  const handleUserMenuClick = (action: string) => {
    console.log('User menu action:', action);
    alert(`User menu action: ${action}`);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="mb-2 text-4xl font-bold">Menu Components Demo</h1>
          <p className="text-muted-foreground">
            Interactive demonstration of OpenPortal menu components with dynamic behavior and
            responsive design.
          </p>
        </div>

        {/* Last clicked item display */}
        {clickedItem && (
          <Card>
            <CardHeader>
              <CardTitle>Last Clicked Item</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="rounded-md bg-muted p-4 text-sm">
                {JSON.stringify(clickedItem, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Header Component Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Header Component</CardTitle>
            <CardDescription>
              Unified header with logo, company name, top menu, and user menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Header
              companyName="OpenPortal"
              topMenuItems={topMenuItems}
              user={{
                name: 'John Doe',
                email: 'john.doe@example.com',
              }}
              onUserMenuClick={handleUserMenuClick}
            />
          </CardContent>
        </Card>

        {/* Top Menu Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Top Menu Component</CardTitle>
            <CardDescription>
              Horizontal navigation with dropdown submenus (hover to see dropdowns)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border bg-muted/20 p-4">
              <TopMenu
                items={topMenuItems}
                activeItemId={activeItemId}
                onItemClick={handleItemClick}
              />
            </div>
          </CardContent>
        </Card>

        {/* Side Menu Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Side Menu Component</CardTitle>
            <CardDescription>
              Vertical sidebar with icons, collapsible groups, and icon-only mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setActiveItemId('dashboard')}>
                  Set Active: Dashboard
                </Button>
                <Button variant="outline" size="sm" onClick={() => setActiveItemId('settings')}>
                  Set Active: Settings
                </Button>
              </div>

              <div className="h-[500px] overflow-hidden rounded-md border bg-muted/20">
                <SideMenu
                  items={sideMenuItems}
                  activeItemId={activeItemId}
                  collapsed={sidebarCollapsed}
                  onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                  onItemClick={handleItemClick}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Menu Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Footer Menu Component</CardTitle>
            <CardDescription>Footer navigation with multi-column support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-medium">Single Column</h3>
                <div className="rounded-md border">
                  <FooterMenu items={footerMenuItems} columns={1} onItemClick={handleItemClick} />
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium">Two Columns</h3>
                <div className="rounded-md border">
                  <FooterMenu items={footerMenuItems} columns={2} onItemClick={handleItemClick} />
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium">Four Columns</h3>
                <div className="rounded-md border">
                  <FooterMenu items={footerMenuItems} columns={4} onItemClick={handleItemClick} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>Key capabilities of the menu components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">Top Menu</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Horizontal navigation bar</li>
                  <li>Text-based menu items</li>
                  <li>Dropdown submenus (hover to reveal)</li>
                  <li>Badge support for notifications</li>
                  <li>Active state highlighting</li>
                  <li>Keyboard navigation (Tab, Enter)</li>
                  <li>Hidden on mobile (accessible via hamburger)</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Side Menu</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Vertical sidebar navigation</li>
                  <li>Icons and text for main items</li>
                  <li>Text-only submenus</li>
                  <li>Collapsible groups (click to expand/collapse)</li>
                  <li>Icon-only mode (collapsed state)</li>
                  <li>Active item highlighting</li>
                  <li>Badge support</li>
                  <li>Dividers between sections</li>
                  <li>Smooth transitions</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Footer Menu</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Horizontal footer navigation</li>
                  <li>Multi-column support (1-4 columns)</li>
                  <li>Responsive stacking on mobile</li>
                  <li>Simple text links</li>
                  <li>External link support</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Header</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Unified header container</li>
                  <li>Logo and company name</li>
                  <li>Top menu integration</li>
                  <li>User avatar and dropdown menu</li>
                  <li>Mobile hamburger menu</li>
                  <li>Sticky positioning</li>
                  <li>Backdrop blur effect</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Try It</CardTitle>
            <CardDescription>Interact with the menu components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Top Menu:</strong> Hover over "Reports" to see dropdown submenu
              </p>
              <p>
                <strong>Side Menu:</strong> Click "Reports" to expand/collapse the submenu
              </p>
              <p>
                <strong>Collapse:</strong> Click the collapse button or use the toggle buttons
              </p>
              <p>
                <strong>Active State:</strong> Click any menu item to see it highlighted
              </p>
              <p>
                <strong>User Menu:</strong> Click the user avatar to see profile actions
              </p>
              <p>
                <strong>Mobile:</strong> Resize browser to see responsive behavior
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MenuComponentsDemo;
