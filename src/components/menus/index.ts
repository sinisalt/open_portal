/**
 * Menu Components
 *
 * Export all menu-related components for easy importing.
 */

export type {
  FooterMenuProps,
  HeaderProps,
  HeaderUser,
  MenuActions,
  MenuItem,
  MenuState,
  SideMenuProps,
  TopMenuProps,
} from '@/types/menu.types';
export { FooterMenu } from './FooterMenu/FooterMenu';
// Connected components (with state management)
export { ConnectedHeader } from './Header/ConnectedHeader';
export { Header } from './Header/Header';
export { UserMenu } from './Header/UserMenu';
export { ConnectedSideMenu } from './SideMenu/ConnectedSideMenu';
export { SideMenu } from './SideMenu/SideMenu';
export { MenuIcon } from './shared/MenuIcon';
export { TopMenu } from './TopMenu/TopMenu';
