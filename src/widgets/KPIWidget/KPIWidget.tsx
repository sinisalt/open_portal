/**
 * KPIWidget Component
 *
 * Key Performance Indicator display widget for showing metrics with trends.
 * Uses shadcn/ui Card components.
 */

import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatValue } from '@/lib/formatting';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { KPIWidgetConfig } from './types';

export function KPIWidget({ config, bindings, events }: WidgetProps<KPIWidgetConfig>) {
  const {
    label,
    format = 'number',
    formatOptions,
    showTrend = false,
    trend,
    icon,
    color,
    size = 'md',
    loading = false,
    description,
  } = config;

  // Get value from bindings
  const value = bindings?.value;

  // Size classes
  const sizeClasses = {
    sm: {
      card: 'p-3',
      title: 'text-xs',
      value: 'text-lg',
      icon: 'h-3 w-3',
      trend: 'text-xs',
    },
    md: {
      card: 'p-4',
      title: 'text-sm',
      value: 'text-2xl',
      icon: 'h-4 w-4',
      trend: 'text-xs',
    },
    lg: {
      card: 'p-6',
      title: 'text-base',
      value: 'text-3xl',
      icon: 'h-5 w-5',
      trend: 'text-sm',
    },
  };

  const sizes = sizeClasses[size];

  // Format the value
  const formattedValue = formatValue(value, format, formatOptions);

  // Trend icon and color
  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend.direction) {
      case 'up':
        return <ArrowUp className={cn(sizes.icon, 'text-green-600')} />;
      case 'down':
        return <ArrowDown className={cn(sizes.icon, 'text-red-600')} />;
      case 'neutral':
        return <Minus className={cn(sizes.icon, 'text-muted-foreground')} />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';

    switch (trend.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'neutral':
        return 'text-muted-foreground';
      default:
        return '';
    }
  };

  // Icon support is stubbed for MVP
  if (icon) {
    console.warn('KPI icon support not yet fully implemented in MVP.');
  }

  // Handle click event
  const handleClick = () => {
    if (events?.onClick) {
      events.onClick();
    }
  };

  return (
    <Card
      className={cn(
        'transition-colors',
        events?.onClick && 'cursor-pointer hover:bg-accent',
        sizes.card
      )}
      onClick={handleClick}
      style={color ? { borderColor: color } : undefined}
      role={events?.onClick ? 'button' : undefined}
      tabIndex={events?.onClick ? 0 : undefined}
      onKeyDown={e => {
        if (events?.onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn('font-medium', sizes.title)}>{label}</CardTitle>
        {icon && (
          <span className={cn('text-muted-foreground', sizes.icon)} aria-hidden="true">
            {/* Icon placeholder - would use lucide-react icon here */}
            {icon}
          </span>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <>
            {/* biome-ignore lint/a11y/useSemanticElements: role="status" is correct for dynamic KPI values */}
            <div className={cn('font-bold', sizes.value)} role="status" aria-live="polite">
              {formattedValue}
            </div>

            {description && (
              <p className={cn('mt-1 text-muted-foreground', sizes.trend)}>{description}</p>
            )}

            {showTrend && trend && (
              <div className={cn('mt-2 flex items-center space-x-1', sizes.trend, getTrendColor())}>
                {getTrendIcon()}
                <span>{trend.value}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

KPIWidget.displayName = 'KPIWidget';
