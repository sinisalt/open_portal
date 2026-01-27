/**
 * BadgeWidget Component
 *
 * Generic badge/tag component for displaying status indicators, labels, and categories.
 * Supports icons, multiple variants, sizes, and optional remove functionality.
 */

import * as Icons from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { BadgeWidgetConfig } from './types';

export function BadgeWidget({ config, bindings, events }: WidgetProps<BadgeWidgetConfig>) {
  const {
    label,
    variant = 'default',
    size = 'default',
    icon,
    removable,
    onRemoveActionId,
    className,
  } = config;

  // Icon component
  const IconComponent = icon
    ? (Icons[icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>)
    : null;

  // Close icon for removable badges
  const CloseIcon = Icons.X as React.ComponentType<{ className?: string }>;

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    default: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  // Variant-specific classes for success and warning (extend shadcn's default variants)
  const variantClasses = {
    success: 'bg-green-100 text-green-800 hover:bg-green-100/80 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 border-yellow-200',
  };

  // Handle remove click
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveActionId && events?.onActionClick) {
      events.onActionClick(onRemoveActionId);
    }
  };

  return (
    <Badge
      variant={variant as 'default' | 'secondary' | 'destructive' | 'outline'}
      className={cn(
        'inline-flex items-center gap-1.5',
        sizeClasses[size],
        variant === 'success' && variantClasses.success,
        variant === 'warning' && variantClasses.warning,
        removable && 'pr-1',
        bindings?.className as string,
        className
      )}
    >
      {IconComponent && <IconComponent className="h-3 w-3" />}
      <span>{label}</span>
      {removable && (
        <button
          type="button"
          onClick={handleRemove}
          className="ml-1 rounded-full hover:bg-black/10 p-0.5 transition-colors"
          aria-label="Remove badge"
        >
          <CloseIcon className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
}

BadgeWidget.displayName = 'BadgeWidget';
