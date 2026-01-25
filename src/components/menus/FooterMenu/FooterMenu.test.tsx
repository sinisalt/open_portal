/**
 * FooterMenu Component Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import type { MenuItem } from '@/types/menu.types';
import { FooterMenu } from './FooterMenu';

describe('FooterMenu', () => {
  const mockItems: MenuItem[] = [
    {
      id: '1',
      label: 'About Us',
      route: '/about',
      order: 1,
    },
    {
      id: '2',
      label: 'Contact',
      route: '/contact',
      order: 2,
    },
    {
      id: '3',
      label: 'Privacy Policy',
      route: '/privacy',
      order: 3,
    },
    {
      id: '4',
      label: 'Terms of Service',
      route: '/terms',
      order: 4,
    },
  ];

  it('renders footer menu items', () => {
    render(<FooterMenu items={mockItems} />);

    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('handles item click', async () => {
    const onItemClick = jest.fn();

    render(<FooterMenu items={mockItems} onItemClick={onItemClick} />);

    const aboutLink = screen.getByText('About Us');
    userEvent.click(aboutLink);

    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        label: 'About Us',
      })
    );
  });

  it('renders in single column by default', () => {
    const { container } = render(<FooterMenu items={mockItems} />);

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('grid-cols-1');
  });

  it('renders in multiple columns', () => {
    const { container } = render(<FooterMenu items={mockItems} columns={2} />);

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('md:grid-cols-2');
  });

  it('renders in four columns', () => {
    const { container } = render(<FooterMenu items={mockItems} columns={4} />);

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('md:grid-cols-4');
  });

  it('handles external links', () => {
    const externalItems: MenuItem[] = [
      {
        id: '1',
        label: 'External Link',
        route: 'https://example.com',
        order: 1,
        external: true,
      },
    ];

    render(<FooterMenu items={externalItems} />);

    const link = screen.getByText('External Link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('handles disabled items', async () => {
    const onItemClick = jest.fn();
    const disabledItems: MenuItem[] = [
      {
        id: '1',
        label: 'Disabled Link',
        route: '/disabled',
        order: 1,
        disabled: true,
      },
    ];

    render(<FooterMenu items={disabledItems} onItemClick={onItemClick} />);

    const disabledLink = screen.getByText('Disabled Link');
    userEvent.click(disabledLink);

    expect(onItemClick).not.toHaveBeenCalled();
    expect(disabledLink).toHaveClass('opacity-50');
  });

  it('applies custom className', () => {
    const { container } = render(<FooterMenu items={mockItems} className="custom-footer" />);

    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('custom-footer');
  });
});
