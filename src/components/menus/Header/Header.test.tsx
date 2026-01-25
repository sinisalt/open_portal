/**
 * Header Component Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import type { MenuItem } from '@/types/menu.types';
import { Header } from './Header';

describe('Header', () => {
  const mockTopMenuItems: MenuItem[] = [
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
    },
  ];

  const mockUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://example.com/avatar.jpg',
  };

  it('renders company name', () => {
    render(<Header companyName="OpenPortal" />);

    expect(screen.getByText('OpenPortal')).toBeInTheDocument();
  });

  it('renders logo image', () => {
    render(<Header logo="https://example.com/logo.png" companyName="OpenPortal" />);

    const logo = screen.getByAltText('OpenPortal');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('renders logo component', () => {
    const LogoComponent = () => <div>Custom Logo</div>;
    render(<Header logo={<LogoComponent />} />);

    expect(screen.getByText('Custom Logo')).toBeInTheDocument();
  });

  it('renders top menu items', () => {
    render(<Header topMenuItems={mockTopMenuItems} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('renders user menu', () => {
    render(<Header user={mockUser} />);

    expect(screen.getByText('JD')).toBeInTheDocument(); // User initials
  });

  it('renders mobile menu toggle button', () => {
    render(<Header companyName="OpenPortal" />);

    const toggleButton = screen.getByLabelText('Toggle menu');
    expect(toggleButton).toBeInTheDocument();
  });

  it('calls onMobileMenuToggle when toggle button is clicked', async () => {
    const onMobileMenuToggle = jest.fn();

    render(<Header companyName="OpenPortal" onMobileMenuToggle={onMobileMenuToggle} />);

    const toggleButton = screen.getByLabelText('Toggle menu');
    userEvent.click(toggleButton);

    expect(onMobileMenuToggle).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(<Header companyName="OpenPortal" className="custom-header" />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('custom-header');
  });

  it('renders without top menu items', () => {
    render(<Header companyName="OpenPortal" />);

    // Should not throw an error
    expect(screen.getByText('OpenPortal')).toBeInTheDocument();
  });

  it('renders without user', () => {
    render(<Header companyName="OpenPortal" />);

    // Should not throw an error
    expect(screen.getByText('OpenPortal')).toBeInTheDocument();
  });
});
