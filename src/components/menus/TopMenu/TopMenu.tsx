/**
 * TopMenu Component
 *
 * Horizontal navigation menu with dropdown submenus.
 * Used in the header for main navigation.
 */

import type React from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import type { MenuItem, TopMenuProps } from '@/types/menu.types';

export function TopMenu({ items, activeItemId, onItemClick, className }: TopMenuProps) {
  const handleItemClick = (item: MenuItem, event: React.MouseEvent) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    if (onItemClick) {
      event.preventDefault();
      onItemClick(item);
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = item.id === activeItemId;
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <NavigationMenuItem key={item.id}>
          <NavigationMenuTrigger
            className={cn(
              'h-10 px-4 py-2 text-sm font-medium transition-colors hover:text-primary',
              isActive && 'text-primary',
              item.disabled && 'pointer-events-none opacity-50'
            )}
          >
            {item.label}
            {item.badge && (
              <span
                className={cn(
                  'ml-2 rounded-full px-2 py-0.5 text-xs',
                  item.badge.variant === 'primary' && 'bg-primary text-primary-foreground',
                  item.badge.variant === 'warning' && 'bg-yellow-500 text-white',
                  item.badge.variant === 'danger' && 'bg-red-500 text-white',
                  (!item.badge.variant || item.badge.variant === 'default') &&
                    'bg-secondary text-secondary-foreground'
                )}
              >
                {item.badge.text}
              </span>
            )}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-1 p-2">
              {item.children?.map(child => (
                <li key={child.id}>
                  <NavigationMenuLink asChild>
                    <a
                      href={child.route}
                      onClick={e => handleItemClick(child, e)}
                      className={cn(
                        'block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                        child.id === activeItemId && 'bg-accent text-accent-foreground',
                        child.disabled && 'pointer-events-none opacity-50'
                      )}
                    >
                      <div className="text-sm font-medium leading-none">{child.label}</div>
                      {child.badge && (
                        <span
                          className={cn(
                            'mt-1 inline-block rounded-full px-2 py-0.5 text-xs',
                            child.badge.variant === 'primary' &&
                              'bg-primary text-primary-foreground',
                            child.badge.variant === 'warning' && 'bg-yellow-500 text-white',
                            child.badge.variant === 'danger' && 'bg-red-500 text-white',
                            (!child.badge.variant || child.badge.variant === 'default') &&
                              'bg-secondary text-secondary-foreground'
                          )}
                        >
                          {child.badge.text}
                        </span>
                      )}
                    </a>
                  </NavigationMenuLink>
                  {child.divider && <div className="my-1 h-px bg-border" />}
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      );
    }

    return (
      <NavigationMenuItem key={item.id}>
        <NavigationMenuLink asChild>
          <a
            href={item.route}
            onClick={e => handleItemClick(item, e)}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noopener noreferrer' : undefined}
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50',
              isActive && 'bg-accent text-accent-foreground',
              item.disabled && 'pointer-events-none opacity-50'
            )}
          >
            {item.label}
            {item.badge && (
              <span
                className={cn(
                  'ml-2 rounded-full px-2 py-0.5 text-xs',
                  item.badge.variant === 'primary' && 'bg-primary text-primary-foreground',
                  item.badge.variant === 'warning' && 'bg-yellow-500 text-white',
                  item.badge.variant === 'danger' && 'bg-red-500 text-white',
                  (!item.badge.variant || item.badge.variant === 'default') &&
                    'bg-secondary text-secondary-foreground'
                )}
              >
                {item.badge.text}
              </span>
            )}
          </a>
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  };

  return (
    <NavigationMenu className={cn('hidden md:flex', className)}>
      <NavigationMenuList>{items.map(renderMenuItem)}</NavigationMenuList>
    </NavigationMenu>
  );
}
