/**
 * PageWidget Component
 *
 * Top-level page container with header, content area, and optional footer.
 * Uses semantic HTML elements for accessibility.
 */

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { PageWidgetConfig } from './types';

export function PageWidget({ config, bindings, events, children }: WidgetProps<PageWidgetConfig>) {
  const { title, description, theme, padding = 'md' } = config;

  // Map padding to spacing classes
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-12',
  };

  // Call onLoad event when component mounts
  useEffect(() => {
    if (events?.onLoad) {
      events.onLoad();
    }
  }, [events]);

  // Apply theme styles
  const themeStyles = theme
    ? {
        backgroundColor: theme.background,
        color: theme.textColor,
      }
    : undefined;

  return (
    <div
      className={cn('min-h-screen flex flex-col', bindings?.className as string)}
      style={themeStyles}
    >
      {/* Header */}
      {(title || description) && (
        <header className={cn('border-b bg-background', paddingClasses[padding])}>
          {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
          {description && <p className="text-muted-foreground mt-2">{description}</p>}
        </header>
      )}

      {/* Main Content */}
      <main className={cn('flex-1', paddingClasses[padding])} aria-label={title || 'Page content'}>
        {bindings?.content || children}
      </main>

      {/* Footer (if provided via bindings) */}
      {bindings?.footer && (
        <footer className={cn('border-t bg-background', paddingClasses[padding])}>
          {bindings.footer}
        </footer>
      )}
    </div>
  );
}

PageWidget.displayName = 'PageWidget';
