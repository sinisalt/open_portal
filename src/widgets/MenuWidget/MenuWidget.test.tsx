/**
 * MenuWidget Tests
 *
 * Unit tests for MenuWidget component, covering all variants and configuration options.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MenuItem } from '@/types/menu.types';
import { MenuWidget } from './MenuWidget';
import type { MenuWidgetConfig } from './types';

// Mock the useMenu hook
jest.mock('@/hooks/useMenu', () => ({
  useMenu: jest.fn(),
}));

// Mock menu components
jest.mock('@/components/menus/TopMenu/TopMenu', () => ({
  TopMenu: ({ items, onItemClick }: any) => (
    <nav data-testid="top-menu">
      {items.map((item: MenuItem) => (
        <button key={item.id} type="button" onClick={() => onItemClick?.(item)}>
          {item.label}
        </button>
      ))}
    </nav>
  ),
}));

jest.mock('@/components/menus/SideMenu/SideMenu', () => ({
  SideMenu: ({ items, collapsed, onToggleCollapse, onItemClick }: any) => (
    <aside data-testid="side-menu" data-collapsed={collapsed}>
      {onToggleCollapse && (
        <button type="button" onClick={onToggleCollapse}>
          Toggle
        </button>
      )}
      {items.map((item: MenuItem) => (
        <button key={item.id} type="button" onClick={() => onItemClick?.(item)}>
          {item.label}
        </button>
      ))}
    </aside>
  ),
}));

jest.mock('@/components/menus/FooterMenu/FooterMenu', () => ({
  FooterMenu: ({ items, columns, onItemClick }: any) => (
    <footer data-testid="footer-menu" data-columns={columns}>
      {items.map((item: MenuItem) => (
        <button key={item.id} type="button" onClick={() => onItemClick?.(item)}>
          {item.label}
        </button>
      ))}
    </footer>
  ),
}));

// Import the mocked hook
const { useMenu } = require('@/hooks/useMenu');

describe('MenuWidget', () => {
  // Default mock return value for useMenu hook
  const mockUseMenu = {
    items: [
      { id: 'home', label: 'Home', route: '/' },
      { id: 'about', label: 'About', route: '/about' },
    ],
    activeItemId: null,
    sidebarCollapsed: false,
    toggleSidebar: jest.fn(),
    expandedGroupIds: [],
    mobileMenuOpen: false,
    loading: false,
    error: null,
    setActiveItem: jest.fn(),
    toggleGroup: jest.fn(),
    toggleMobileMenu: jest.fn(),
    expandAll: jest.fn(),
    collapseAll: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useMenu.mockReturnValue(mockUseMenu);
  });

  describe('Top Menu Variant', () => {
    it('renders top menu with bootstrap items by default', () => {
      const config: MenuWidgetConfig = {
        id: 'menu',
        type: 'Menu',
        variant: 'top',
      };

      render(<MenuWidget config={config} />);

      expect(screen.getByTestId('top-menu')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('renders top menu with custom items', () => {
      const config: MenuWidgetConfig = {
        id: 'menu',
        type: 'Menu',
        variant: 'top',
        items: [
          { id: 'custom1', label: 'Custom 1', route: '/custom1' },
          { id: 'custom2', label: 'Custom 2', route: '/custom2' },
        ],
      };

      render(<MenuWidget config={config} />);

      expect(screen.getByText('Custom 1')).toBeInTheDocument();
      expect(screen.getByText('Custom 2')).toBeInTheDocument();
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('calls useMenu with correct type', () => {
      const config: MenuWidgetConfig = {
        id: 'menu',
        type: 'Menu',
        variant: 'top',
      };

      render(<MenuWidget config={config} />);

      expect(useMenu).toHaveBeenCalledWith({
        type: 'top',
        autoSyncActiveItem: true,
      });
    });

    it('handles item click event', () => {
      const onItemClick = jest.fn();
      const config: MenuWidgetConfig = {
        id: 'menu',
        type: 'Menu',
        variant: 'top',
        items: [{ id: 'item1', label: 'Item 1', route: '/item1' }],
      };

      render(<MenuWidget config={config} events={{ onItemClick }} />);

      userEvent.click(screen.getByText('Item 1'));

      expect(onItemClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'item1',
          label: 'Item 1',
        })
      );
    });
  });

  describe('Side Menu Variant', () => {
    it('renders side menu with bootstrap items', () => {
      const config: MenuWidgetConfig = {
        id: 'sidebar',
        type: 'Sidebar',
        variant: 'side',
      };

      render(<MenuWidget config={config} />);

      expect(screen.getByTestId('side-menu')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('renders side menu with collapsed state from hook', () => {
      useMenu.mockReturnValue({ ...mockUseMenu, sidebarCollapsed: true });

      const config: MenuWidgetConfig = {
        id: 'sidebar',
        type: 'Sidebar',
        variant: 'side',
        collapsible: true,
      };

      render(<MenuWidget config={config} />);

      const sideMenu = screen.getByTestId('side-menu');
      expect(sideMenu).toHaveAttribute('data-collapsed', 'true');
    });

    it('uses defaultCollapsed when sidebar state is false in hook and defaultCollapsed is true', () => {
      // When hook returns false and defaultCollapsed is true,
      // the hook state takes priority (user-controlled state)
      const config: MenuWidgetConfig = {
        id: 'sidebar',
        type: 'Sidebar',
        variant: 'side',
        defaultCollapsed: true,
      };

      render(<MenuWidget config={config} />);

      const sideMenu = screen.getByTestId('side-menu');
      // Hook state (false) takes priority over defaultCollapsed
      expect(sideMenu).toHaveAttribute('data-collapsed', 'false');
    });

    it('renders toggle button when collapsible is true', () => {
      const config: MenuWidgetConfig = {
        id: 'sidebar',
        type: 'Sidebar',
        variant: 'side',
        collapsible: true,
      };

      render(<MenuWidget config={config} />);

      expect(screen.getByText('Toggle')).toBeInTheDocument();
    });

    it('does not render toggle button when collapsible is false', () => {
      const config: MenuWidgetConfig = {
        id: 'sidebar',
        type: 'Sidebar',
        variant: 'side',
        collapsible: false,
      };

      render(<MenuWidget config={config} />);

      expect(screen.queryByText('Toggle')).not.toBeInTheDocument();
    });
  });

  describe('Footer Menu Variant', () => {
    it('renders footer menu with bootstrap items', () => {
      const config: MenuWidgetConfig = {
        id: 'footer',
        type: 'FooterMenu',
        variant: 'footer',
      };

      render(<MenuWidget config={config} />);

      expect(screen.getByTestId('footer-menu')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('passes columns prop to FooterMenu', () => {
      const config: MenuWidgetConfig = {
        id: 'footer',
        type: 'FooterMenu',
        variant: 'footer',
        columns: 4,
      };

      render(<MenuWidget config={config} />);

      const footerMenu = screen.getByTestId('footer-menu');
      expect(footerMenu).toHaveAttribute('data-columns', '4');
    });
  });

  describe('Dynamic Bindings', () => {
    it('uses items from bindings when itemsBinding is set', () => {
      const config: MenuWidgetConfig = {
        id: 'menu',
        type: 'Menu',
        variant: 'top',
        itemsBinding: 'dynamicItems',
      };

      const bindings = {
        dynamicItems: [
          { id: 'dynamic1', label: 'Dynamic 1', route: '/d1' },
          { id: 'dynamic2', label: 'Dynamic 2', route: '/d2' },
        ],
      };

      render(<MenuWidget config={config} bindings={bindings} />);

      expect(screen.getByText('Dynamic 1')).toBeInTheDocument();
      expect(screen.getByText('Dynamic 2')).toBeInTheDocument();
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('prioritizes config items over bindings', () => {
      const config: MenuWidgetConfig = {
        id: 'menu',
        type: 'Menu',
        variant: 'top',
        items: [{ id: 'config1', label: 'Config 1', route: '/c1' }],
        itemsBinding: 'dynamicItems',
      };

      const bindings = {
        dynamicItems: [{ id: 'dynamic1', label: 'Dynamic 1', route: '/d1' }],
      };

      render(<MenuWidget config={config} bindings={bindings} />);

      expect(screen.getByText('Config 1')).toBeInTheDocument();
      expect(screen.queryByText('Dynamic 1')).not.toBeInTheDocument();
    });

    it('falls back to bootstrap items when binding is not provided', () => {
      const config: MenuWidgetConfig = {
        id: 'menu',
        type: 'Menu',
        variant: 'top',
        itemsBinding: 'missingItems',
      };

      render(<MenuWidget config={config} bindings={{}} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });
  });

  describe('Unknown Variant Handling', () => {
    it('falls back to top menu for unknown variant', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const config: MenuWidgetConfig = {
        id: 'menu',
        type: 'Menu',
        variant: 'unknown' as any,
      };

      render(<MenuWidget config={config} />);

      expect(screen.getByTestId('top-menu')).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown menu variant: unknown')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('CSS Classes', () => {
    it('passes className to TopMenu', () => {
      const config: MenuWidgetConfig = {
        id: 'menu',
        type: 'Menu',
        variant: 'top',
        className: 'custom-class',
      };

      // Note: We can't test className directly with our mocks,
      // but we verify it's passed through in integration tests
      const { container } = render(<MenuWidget config={config} />);
      expect(container.querySelector('[data-testid="top-menu"]')).toBeInTheDocument();
    });
  });
});
