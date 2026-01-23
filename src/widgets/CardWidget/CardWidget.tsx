/**
 * CardWidget Component
 *
 * Content card with title, actions, and configurable padding.
 * Uses shadcn/ui Card component built on Radix UI primitives.
 */

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { CardWidgetConfig } from './types';

export function CardWidget({ config, bindings, events, children }: WidgetProps<CardWidgetConfig>) {
  const {
    title,
    subtitle,
    image,
    elevation = 'sm',
    bordered = true,
    padding = 'md',
    actions,
  } = config;

  // Map elevation to shadow classes
  const elevationClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  // Map padding to spacing classes
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  // Card container classes
  const cardClasses = cn(
    elevationClasses[elevation],
    !bordered && 'border-0',
    bindings?.className as string
  );

  // Header padding classes
  const headerPadding = padding === 'none' ? 'p-0' : paddingClasses[padding];
  const contentPadding =
    padding === 'none'
      ? 'p-0'
      : padding === 'sm'
        ? 'p-3 pt-0'
        : padding === 'md'
          ? 'p-6 pt-0'
          : 'p-8 pt-0';
  const footerPadding =
    padding === 'none'
      ? 'p-0'
      : padding === 'sm'
        ? 'p-3 pt-0'
        : padding === 'md'
          ? 'p-6 pt-0'
          : 'p-8 pt-0';

  const handleActionClick = (actionId: string) => {
    if (events?.onActionClick) {
      events.onActionClick(actionId);
    }
  };

  return (
    <Card className={cardClasses}>
      {/* Optional Image */}
      {image && (
        <div className="overflow-hidden rounded-t-lg">
          <img src={image} alt={title || 'Card image'} className="w-full h-48 object-cover" />
        </div>
      )}

      {/* Header */}
      {(title || subtitle) && (
        <CardHeader className={cn('flex flex-col space-y-1.5', headerPadding)}>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
      )}

      {/* Content */}
      {(children || bindings?.content) && (
        <CardContent className={contentPadding}>{bindings?.content || children}</CardContent>
      )}

      {/* Footer with Actions */}
      {actions && actions.length > 0 && (
        <CardFooter className={cn('flex gap-2', footerPadding)}>
          {actions.map(action => (
            <Button
              key={action.id}
              variant={action.variant || 'default'}
              onClick={() => handleActionClick(action.actionId)}
            >
              {action.label}
            </Button>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}

CardWidget.displayName = 'CardWidget';
