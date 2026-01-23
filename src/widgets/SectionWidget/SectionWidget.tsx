/**
 * SectionWidget Component
 *
 * Content grouping component with optional title and collapsible functionality.
 * Uses shadcn Card for bordered sections, semantic section element otherwise.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { SectionWidgetConfig } from './types';

export function SectionWidget({
  config,
  bindings,
  events,
  children,
}: WidgetProps<SectionWidgetConfig>) {
  const {
    title,
    subtitle,
    collapsible = false,
    defaultCollapsed = false,
    bordered = false,
    padding = 'md',
  } = config;

  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Map padding to spacing classes
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);

    // Trigger events
    if (newState && events?.onCollapse) {
      events.onCollapse();
    } else if (!newState && events?.onExpand) {
      events.onExpand();
    }
  };

  // Render bordered section using Card
  if (bordered) {
    return (
      <Card className={bindings?.className as string}>
        {(title || subtitle) && (
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {title && <CardTitle>{title}</CardTitle>}
                {subtitle && <CardDescription>{subtitle}</CardDescription>}
              </div>
              {collapsible && (
                <button
                  type="button"
                  onClick={toggleCollapse}
                  className="text-sm font-medium hover:underline"
                  aria-expanded={!isCollapsed}
                  aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
                >
                  {isCollapsed ? 'Expand' : 'Collapse'}
                </button>
              )}
            </div>
          </CardHeader>
        )}
        {!isCollapsed && <CardContent>{bindings?.content || children}</CardContent>}
      </Card>
    );
  }

  // Render simple section without border
  return (
    <section className={cn('space-y-4', paddingClasses[padding], bindings?.className as string)}>
      {(title || subtitle) && (
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {title && <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>}
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {collapsible && (
            <button
              type="button"
              onClick={toggleCollapse}
              className="text-sm font-medium hover:underline"
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
            >
              {isCollapsed ? 'Expand' : 'Collapse'}
            </button>
          )}
        </div>
      )}
      {!isCollapsed && <div>{bindings?.content || children}</div>}
    </section>
  );
}

SectionWidget.displayName = 'SectionWidget';
