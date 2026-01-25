/**
 * TopMenu Component Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import type { MenuItem } from '@/types/menu.types';
import { TopMenu } from './TopMenu';

describe('TopMenu', () => {
  const mockItems: MenuItem[] = [
    {
      id: '1',
      label: 'Dashboard',
      route: '/dashboard',
      order: 1,
    },
    {
      id: '2',
      label: 'Reports',
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
      route: '/settings',
      order: 3,
      badge: {
        text: '3',
        variant: 'primary',
      },
    },
  ];

  it('renders menu items', () => {
    render(<TopMenu items={mockItems} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders badges', () => {
    render(<TopMenu items={mockItems} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('handles item click', async () => {
    const onItemClick = jest.fn();

    render(<TopMenu items={mockItems} onItemClick={onItemClick} />);

    const dashboardLink = screen.getByText('Dashboard');
    userEvent.click(dashboardLink);

    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        label: 'Dashboard',
      })
    );
  });

  it('highlights active item', () => {
    render(<TopMenu items={mockItems} activeItemId="1" />);

    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink).toHaveClass('bg-accent');
  });

  it('renders dropdown for items with children', () => {
    render(<TopMenu items={mockItems} />);

    const reportsButton = screen.getByText('Reports');
    expect(reportsButton).toBeInTheDocument();
  });

  it('handles disabled items', async () => {
    const onItemClick = jest.fn();
    const disabledItems: MenuItem[] = [
      {
        id: '1',
        label: 'Disabled Item',
        route: '/disabled',
        order: 1,
        disabled: true,
      },
    ];

    render(<TopMenu items={disabledItems} onItemClick={onItemClick} />);

    const disabledLink = screen.getByText('Disabled Item');
    userEvent.click(disabledLink);

    expect(onItemClick).not.toHaveBeenCalled();
    expect(disabledLink).toHaveClass('opacity-50');
  });

  it('renders external link correctly', () => {
    const externalItems: MenuItem[] = [
      {
        id: '1',
        label: 'External Link',
        route: 'https://example.com',
        order: 1,
        external: true,
      },
    ];

    render(<TopMenu items={externalItems} />);

    const link = screen.getByText('External Link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('applies custom className', () => {
    const { container } = render(<TopMenu items={mockItems} className="custom-class" />);

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('custom-class');
  });
});
