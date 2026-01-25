/**
 * Header Component
 *
 * Unified header container with logo, top menu, and user menu.
 * Includes mobile hamburger menu support.
 */

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { HeaderProps } from '@/types/menu.types';
import { TopMenu } from '../TopMenu/TopMenu';
import { UserMenu } from './UserMenu';

export function Header({
  logo,
  companyName,
  topMenuItems = [],
  user,
  onUserMenuClick,
  onMobileMenuToggle,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Mobile menu toggle */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMobileMenuToggle}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            {/* Mobile menu content will be added in integration phase */}
            <div className="p-4">
              <h2 className="text-lg font-semibold">Menu</h2>
              {/* SideMenu will be rendered here in integration phase */}
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo and company name */}
        <div className="flex items-center gap-3">
          {logo && (
            <div className="flex h-8 w-8 items-center justify-center">
              {typeof logo === 'string' ? (
                <img
                  src={logo}
                  alt={companyName || 'Logo'}
                  className="h-full w-full object-contain"
                />
              ) : (
                logo
              )}
            </div>
          )}
          {companyName && (
            <span className="hidden text-lg font-semibold sm:inline-block">{companyName}</span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Top menu (desktop) */}
        {topMenuItems.length > 0 && <TopMenu items={topMenuItems} className="mr-4" />}

        {/* User menu */}
        {user && <UserMenu user={user} onAction={onUserMenuClick} />}
      </div>
    </header>
  );
}
