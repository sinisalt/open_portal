/**
 * AppLayout Component Tests
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from 'next-themes';
import { BootstrapProvider } from '@/contexts/BootstrapContext';
import { MenuProvider } from '@/contexts/MenuContext';
import { UserProvider } from '@/contexts/UserContext';
import { AppLayout } from './AppLayout';

// Mock TanStack Router
jest.mock('@tanstack/react-router', () => ({
  useLocation: () => ({ pathname: '/test' }),
  useRouter: () => ({
    state: {
      location: {
        pathname: '/test',
      },
    },
  }),
}));

// Mock the menu components
jest.mock('@/components/menus/Header/ConnectedHeader', () => ({
  ConnectedHeader: () => <div data-testid="mock-header">Header</div>,
}));

jest.mock('@/components/menus/SideMenu/ConnectedSideMenu', () => ({
  ConnectedSideMenu: () => <div data-testid="mock-sidemenu">SideMenu</div>,
}));

jest.mock('@/components/menus/FooterMenu/FooterMenu', () => ({
  FooterMenu: () => <div data-testid="mock-footer">Footer</div>,
}));

// Mock the sidebar components
jest.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
  SidebarInset: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-inset">{children}</div>
  ),
}));

// Mock hooks
jest.mock('@/hooks/useBootstrap', () => ({
  useBootstrap: () => ({
    data: {
      menu: [],
      user: null,
      permissions: [],
      tenant: null,
      defaults: null,
      featureFlags: {},
    },
    loading: false,
    error: null,
    loaded: true,
    permissions: [],
    refresh: jest.fn(),
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider attribute="class">
      <BootstrapProvider>
        <UserProvider>
          <MenuProvider>{ui}</MenuProvider>
        </UserProvider>
      </BootstrapProvider>
    </ThemeProvider>
  );
};

describe('AppLayout', () => {
  it('renders children content', () => {
    renderWithProviders(
      <AppLayout>
        <div data-testid="test-content">Test Content</div>
      </AppLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders header by default', () => {
    renderWithProviders(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
  });

  it('hides header when hideHeader prop is true', () => {
    renderWithProviders(
      <AppLayout hideHeader>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.queryByTestId('mock-header')).not.toBeInTheDocument();
  });

  it('renders sidebar by default on desktop', () => {
    renderWithProviders(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );

    // Sidebar should be in the document
    expect(screen.getByTestId('mock-sidemenu')).toBeInTheDocument();
  });

  it('hides sidebar when hideSidebar prop is true', () => {
    renderWithProviders(
      <AppLayout hideSidebar>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.queryByTestId('mock-sidemenu')).not.toBeInTheDocument();
  });

  it('hides footer when hideFooter prop is true', () => {
    renderWithProviders(
      <AppLayout hideFooter>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.queryByTestId('mock-footer')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <AppLayout className="custom-class">
        <div>Content</div>
      </AppLayout>
    );

    const layoutDiv = container.querySelector('.custom-class');
    expect(layoutDiv).toBeInTheDocument();
  });

  it('wraps content with SidebarProvider', () => {
    renderWithProviders(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
  });

  it('wraps main content with SidebarInset', () => {
    renderWithProviders(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByTestId('sidebar-inset')).toBeInTheDocument();
  });

  it('renders all components in correct hierarchy', () => {
    renderWithProviders(
      <AppLayout>
        <div data-testid="test-content">Content</div>
      </AppLayout>
    );

    // Verify all major components are present
    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-inset')).toBeInTheDocument();
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidemenu')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('allows hiding all menu components', () => {
    renderWithProviders(
      <AppLayout hideHeader hideSidebar hideFooter>
        <div data-testid="test-content">Content</div>
      </AppLayout>
    );

    // Only content should be visible
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-sidemenu')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-footer')).not.toBeInTheDocument();
  });
});
