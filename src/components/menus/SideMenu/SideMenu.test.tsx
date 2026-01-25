/**
 * SideMenu Component Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import type { MenuItem } from '@/types/menu.types';
import { SideMenu } from './SideMenu';

describe('SideMenu', () => {
  const mockItems: MenuItem[] = [
    {
      id: '1',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      order: 1,
    },
    {
      id: '2',
      label: 'Reports',
      icon: 'chart',
      route: '/reports',
      order: 2,
      children: [
        {
          id: '2-1',
          label: 'Sales',
          route: '/reports/sales',
          order: 1,
        },
        {
          id: '2-2',
          label: 'Analytics',
          route: '/reports/analytics',
          order: 2,
        },
      ],
    },
    {
      id: '3',
      label: 'Settings',
      icon: 'settings',
      route: '/settings',
      order: 3,
    },
  ];

  it('renders menu items with icons', () => {
    render(<SideMenu items={mockItems} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('expands and collapses menu groups', async () => {
    render(<SideMenu items={mockItems} />);

    // Initially, submenu items should not be visible
    expect(screen.queryByText('Sales')).not.toBeInTheDocument();
    expect(screen.queryByText('Analytics')).not.toBeInTheDocument();

    // Click to expand
    const reportsItem = screen.getByText('Reports');
    userEvent.click(reportsItem);

    // Now submenu items should be visible
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();

    // Click again to collapse
    userEvent.click(reportsItem);

    // Submenu items should be hidden again
    expect(screen.queryByText('Sales')).not.toBeInTheDocument();
  });

  it('highlights active item', () => {
    render(<SideMenu items={mockItems} activeItemId="1" />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-accent');
  });

  it('renders in collapsed mode', () => {
    const { container } = render(<SideMenu items={mockItems} collapsed={true} />);

    const aside = container.querySelector('aside');
    expect(aside).toHaveClass('w-16');

    // Labels should not be visible in collapsed mode (only icons)
    const dashboardText = screen.queryByText('Dashboard');
    expect(dashboardText).not.toBeInTheDocument();
  });

  it('calls onToggleCollapse when toggle button is clicked', async () => {
    const onToggleCollapse = jest.fn();

    render(<SideMenu items={mockItems} onToggleCollapse={onToggleCollapse} />);

    const toggleButton = screen.getByLabelText(/collapse sidebar|expand sidebar/i);
    userEvent.click(toggleButton);

    expect(onToggleCollapse).toHaveBeenCalled();
  });

  it('handles item click', async () => {
    const onItemClick = jest.fn();

    render(<SideMenu items={mockItems} onItemClick={onItemClick} />);

    const dashboardLink = screen.getByText('Dashboard');
    userEvent.click(dashboardLink);

    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        label: 'Dashboard',
      })
    );
  });

  it('handles disabled items', async () => {
    const onItemClick = jest.fn();
    const disabledItems: MenuItem[] = [
      {
        id: '1',
        label: 'Disabled Item',
        icon: 'lock',
        route: '/disabled',
        order: 1,
        disabled: true,
      },
    ];

    render(<SideMenu items={disabledItems} onItemClick={onItemClick} />);

    const disabledLink = screen.getByText('Disabled Item').closest('a');
    userEvent.click(disabledLink);

    expect(onItemClick).not.toHaveBeenCalled();
    expect(disabledLink).toHaveClass('opacity-50');
  });

  it('renders badges on menu items', () => {
    const itemsWithBadge: MenuItem[] = [
      {
        id: '1',
        label: 'Messages',
        icon: 'mail',
        route: '/messages',
        order: 1,
        badge: {
          text: '5',
          variant: 'danger',
        },
      },
    ];

    render(<SideMenu items={itemsWithBadge} />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders dividers', () => {
    const itemsWithDivider: MenuItem[] = [
      {
        id: '1',
        label: 'Item 1',
        icon: 'home',
        route: '/item1',
        order: 1,
        divider: true,
      },
      {
        id: '2',
        label: 'Item 2',
        icon: 'file',
        route: '/item2',
        order: 2,
      },
    ];

    const { container } = render(<SideMenu items={itemsWithDivider} />);

    const dividers = container.querySelectorAll('.bg-border');
    expect(dividers.length).toBeGreaterThan(0);
  });
});
