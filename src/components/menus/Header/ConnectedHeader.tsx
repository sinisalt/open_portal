/**
 * ConnectedHeader Component
 *
 * Header component connected to menu state via useMenu hook.
 * Automatically loads menus from bootstrap and handles navigation.
 */

import { useNavigate } from '@tanstack/react-router';
import { useBootstrap } from '@/hooks/useBootstrap';
import { useBranding } from '@/hooks/useBranding';
import { useTopMenu } from '@/hooks/useMenu';
import { Header } from './Header';

/**
 * Connected Header Props
 */
interface ConnectedHeaderProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Connected Header Component
 *
 * Integrates Header component with:
 * - Bootstrap API for user data
 * - Branding service for logo/company name
 * - Menu state management for top menu items
 * - Router for navigation
 */
export function ConnectedHeader({ className }: ConnectedHeaderProps) {
  const navigate = useNavigate();

  // Get user data from bootstrap
  const { user } = useBootstrap();

  // Get branding data
  const { logo, companyName } = useBranding();

  // Get top menu items with state management
  const { items, toggleMobileMenu } = useTopMenu();

  /**
   * Handle user menu action
   */
  const handleUserMenuAction = (action: string) => {
    switch (action) {
      case 'profile':
        navigate({ to: '/profile' });
        break;
      case 'settings':
        navigate({ to: '/settings' });
        break;
      case 'help':
        navigate({ to: '/help' });
        break;
      case 'logout':
        navigate({ to: '/logout' });
        break;
      default:
        console.warn(`Unknown user menu action: ${action}`);
    }
  };

  return (
    <Header
      logo={logo}
      companyName={companyName || 'OpenPortal'}
      topMenuItems={items}
      user={
        user
          ? {
              name: user.name,
              email: user.email,
              avatar: user.avatar,
            }
          : undefined
      }
      onUserMenuClick={handleUserMenuAction}
      onMobileMenuToggle={toggleMobileMenu}
      className={className}
    />
  );
}
