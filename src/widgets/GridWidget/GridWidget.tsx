/**
 * GridWidget Component
 *
 * Responsive grid layout with configurable columns and gap spacing.
 * Uses CSS Grid with Tailwind utilities.
 */

import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { GridWidgetConfig } from './types';

export function GridWidget({ config, bindings, children }: WidgetProps<GridWidgetConfig>) {
  const { columns = 12, gap = 'md', responsive } = config;

  // Map gap to Tailwind gap classes
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  // Build responsive column classes
  const getColumnClass = (breakpoint: string, cols: number) => {
    if (cols === 1) return `${breakpoint}:grid-cols-1`;
    if (cols === 2) return `${breakpoint}:grid-cols-2`;
    if (cols === 3) return `${breakpoint}:grid-cols-3`;
    if (cols === 4) return `${breakpoint}:grid-cols-4`;
    if (cols === 5) return `${breakpoint}:grid-cols-5`;
    if (cols === 6) return `${breakpoint}:grid-cols-6`;
    if (cols === 7) return `${breakpoint}:grid-cols-7`;
    if (cols === 8) return `${breakpoint}:grid-cols-8`;
    if (cols === 9) return `${breakpoint}:grid-cols-9`;
    if (cols === 10) return `${breakpoint}:grid-cols-10`;
    if (cols === 11) return `${breakpoint}:grid-cols-11`;
    if (cols === 12) return `${breakpoint}:grid-cols-12`;
    return `${breakpoint}:grid-cols-12`;
  };

  // Base column class (mobile-first)
  const baseColumnClass = `grid-cols-${responsive?.xs || 1}`;

  // Build responsive classes
  const responsiveClasses = [
    responsive?.sm && getColumnClass('sm', responsive.sm),
    responsive?.md && getColumnClass('md', responsive.md),
    responsive?.lg && getColumnClass('lg', responsive.lg),
    responsive?.xl && getColumnClass('xl', responsive.xl),
  ].filter(Boolean);

  // If no responsive config, use default columns
  const columnClass = responsive
    ? [baseColumnClass, ...responsiveClasses].join(' ')
    : getColumnClass('', columns);

  return (
    <div className={cn('grid', columnClass, gapClasses[gap], bindings?.className as string)}>
      {bindings?.items || children}
    </div>
  );
}

GridWidget.displayName = 'GridWidget';
