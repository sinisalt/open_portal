/**
 * FooterMenu Component
 *
 * Horizontal footer navigation with multi-column support.
 * Used for secondary navigation and footer links.
 */

import type React from 'react';
import { cn } from '@/lib/utils';
import type { FooterMenuProps, MenuItem } from '@/types/menu.types';

export function FooterMenu({ items, columns = 1, onItemClick, className }: FooterMenuProps) {
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
    return (
      <a
        key={item.id}
        href={item.route}
        onClick={e => handleItemClick(item, e)}
        target={item.external ? '_blank' : undefined}
        rel={item.external ? 'noopener noreferrer' : undefined}
        className={cn(
          'text-sm text-muted-foreground transition-colors hover:text-foreground',
          item.disabled && 'pointer-events-none opacity-50'
        )}
        aria-label={item.label}
      >
        {item.label}
      </a>
    );
  };

  return (
    <footer className={cn('border-t bg-background py-6', className)}>
      <div className="container mx-auto px-4">
        <nav
          aria-label="Footer navigation"
          className={cn(
            'grid gap-4',
            columns === 1 && 'grid-cols-1',
            columns === 2 && 'grid-cols-1 md:grid-cols-2',
            columns === 3 && 'grid-cols-1 md:grid-cols-3',
            columns === 4 && 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
          )}
        >
          {columns === 1 ? (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {items.map(renderMenuItem)}
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex flex-col gap-2">
                {renderMenuItem(item)}
              </div>
            ))
          )}
        </nav>
      </div>
    </footer>
  );
}
