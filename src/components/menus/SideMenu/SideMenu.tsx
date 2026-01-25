/**
 * SideMenu Component
 *
 * Vertical sidebar navigation with icons, collapsible groups,
 * and icon-only collapsed mode.
 */

import { ChevronDown, ChevronRight, Menu } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MenuItem, SideMenuProps } from '@/types/menu.types';
import { MenuIcon } from '../shared/MenuIcon';

export function SideMenu({
  items,
  activeItemId,
  collapsed = false,
  onToggleCollapse,
  onItemClick,
  className,
}: SideMenuProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

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

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isActive = item.id === activeItemId;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedIds.includes(item.id);
    const isMainItem = depth === 0;

    return (
      <div key={item.id}>
        <a
          href={item.route}
          onClick={e => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpanded(item.id);
            } else {
              handleItemClick(item, e);
            }
          }}
          target={item.external ? '_blank' : undefined}
          rel={item.external ? 'noopener noreferrer' : undefined}
          className={cn(
            'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus:bg-accent focus:text-accent-foreground focus:outline-none',
            isActive && 'bg-accent text-accent-foreground',
            item.disabled && 'pointer-events-none opacity-50',
            !isMainItem && 'pl-12',
            collapsed && isMainItem && 'justify-center px-2'
          )}
          title={collapsed ? item.label : undefined}
          aria-label={item.label}
          aria-current={isActive ? 'page' : undefined}
          aria-expanded={hasChildren ? isExpanded : undefined}
        >
          {isMainItem && item.icon && (
            <MenuIcon icon={item.icon} className={cn('h-5 w-5 shrink-0', collapsed && 'h-6 w-6')} />
          )}
          {!collapsed && (
            <>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs',
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
              {hasChildren && (
                <span className="shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </span>
              )}
            </>
          )}
        </a>

        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}

        {item.divider && !collapsed && <div className="my-2 h-px bg-border" />}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
      aria-label="Sidebar navigation"
    >
      {/* Collapse toggle button */}
      <div className={cn('flex items-center justify-end p-4', collapsed && 'justify-center')}>
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Menu items */}
      <nav className="flex-1 space-y-1 px-2">{items.map(item => renderMenuItem(item))}</nav>
    </aside>
  );
}
