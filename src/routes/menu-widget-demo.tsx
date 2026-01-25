/**
 * Menu Widget Demo Route
 *
 * Demo page for testing MenuWidget in all variants with different configurations
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { WidgetRenderer } from '@/core/renderer/WidgetRenderer';
import type { MenuItem } from '@/types/menu.types';
import type { MenuWidgetConfig } from '@/widgets/MenuWidget';

export const Route = createFileRoute('/menu-widget-demo')({
  component: MenuWidgetDemo,
});

function MenuWidgetDemo() {
  const [clickedItem, setClickedItem] = useState<MenuItem | null>(null);

  // Sample menu items for custom menu
  const customMenuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Home',
      route: '/',
      icon: 'home',
    },
    {
      id: 'products',
      label: 'Products',
      route: '/products',
      icon: 'package',
      children: [
        { id: 'all-products', label: 'All Products', route: '/products/all' },
        { id: 'featured', label: 'Featured', route: '/products/featured' },
      ],
    },
    {
      id: 'about',
      label: 'About',
      route: '/about',
      icon: 'info',
    },
  ];

  // Top menu configuration (using bootstrap menu)
  const topMenuConfig: MenuWidgetConfig = {
    id: 'demo-top-menu',
    type: 'TopMenu',
    variant: 'top',
  };

  // Top menu with custom items
  const topMenuCustomConfig: MenuWidgetConfig = {
    id: 'demo-top-menu-custom',
    type: 'TopMenu',
    variant: 'top',
    items: customMenuItems,
  };

  // Side menu configuration
  const sideMenuConfig: MenuWidgetConfig = {
    id: 'demo-side-menu',
    type: 'Sidebar',
    variant: 'side',
    collapsible: true,
    defaultCollapsed: false,
  };

  // Footer menu configuration
  const footerMenuConfig: MenuWidgetConfig = {
    id: 'demo-footer-menu',
    type: 'FooterMenu',
    variant: 'footer',
    columns: 1,
    items: [
      { id: 'privacy', label: 'Privacy Policy', route: '/privacy' },
      { id: 'terms', label: 'Terms of Service', route: '/terms' },
      { id: 'contact', label: 'Contact Us', route: '/contact' },
    ],
  };

  const handleItemClick = (item: MenuItem) => {
    setClickedItem(item);
    console.log('Menu item clicked:', item);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8 space-y-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">Menu Widget Demo</h1>
          <p className="text-muted-foreground">
            Testing MenuWidget component with various configurations
          </p>
        </div>

        {/* Last clicked item display */}
        {clickedItem && (
          <div className="p-4 bg-accent rounded-lg">
            <h3 className="font-semibold mb-2">Last Clicked Item:</h3>
            <pre className="text-sm">{JSON.stringify(clickedItem, null, 2)}</pre>
          </div>
        )}

        {/* Top Menu - Bootstrap */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Top Menu (Bootstrap)</h2>
            <p className="text-sm text-muted-foreground">
              Using default bootstrap menu from useMenu hook
            </p>
          </div>
          <div className="border rounded-lg p-4 bg-card">
            <WidgetRenderer config={topMenuConfig} events={{ onItemClick: handleItemClick }} />
          </div>
        </section>

        {/* Top Menu - Custom Items */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Top Menu (Custom Items)</h2>
            <p className="text-sm text-muted-foreground">
              Using custom menu items from configuration
            </p>
          </div>
          <div className="border rounded-lg p-4 bg-card">
            <WidgetRenderer
              config={topMenuCustomConfig}
              events={{ onItemClick: handleItemClick }}
            />
          </div>
        </section>

        {/* Side Menu */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Side Menu</h2>
            <p className="text-sm text-muted-foreground">
              Collapsible sidebar with bootstrap menu items
            </p>
          </div>
          <div className="border rounded-lg bg-card overflow-hidden" style={{ height: '400px' }}>
            <WidgetRenderer config={sideMenuConfig} events={{ onItemClick: handleItemClick }} />
          </div>
        </section>

        {/* Footer Menu */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Footer Menu</h2>
            <p className="text-sm text-muted-foreground">
              Horizontal footer menu with custom items
            </p>
          </div>
          <div className="border rounded-lg bg-card overflow-hidden">
            <WidgetRenderer config={footerMenuConfig} events={{ onItemClick: handleItemClick }} />
          </div>
        </section>

        {/* Configuration Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Configuration Examples</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Top Menu (Bootstrap):</h3>
              <pre className="p-4 bg-secondary rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(topMenuConfig, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Top Menu (Custom Items):</h3>
              <pre className="p-4 bg-secondary rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(topMenuCustomConfig, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Side Menu:</h3>
              <pre className="p-4 bg-secondary rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(sideMenuConfig, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Footer Menu:</h3>
              <pre className="p-4 bg-secondary rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(footerMenuConfig, null, 2)}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
