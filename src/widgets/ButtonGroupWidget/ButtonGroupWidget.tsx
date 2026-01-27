/**
 * ButtonGroupWidget Component
 *
 * Generic button group component for displaying multiple related buttons.
 * Supports horizontal/vertical orientation, various spacing options, and both action triggers and links.
 */

import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { ButtonGroupWidgetConfig } from './types';

export function ButtonGroupWidget({
  config,
  bindings,
  events,
}: WidgetProps<ButtonGroupWidgetConfig>) {
  const {
    buttons,
    orientation = 'horizontal',
    gap = 'md',
    justify = 'start',
    fullWidth = false,
    className,
  } = config;

  // Gap size mapping
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  // Justify content mapping
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  // Handle button click
  const handleButtonClick = (actionId: string) => {
    if (events?.onActionClick) {
      events.onActionClick(actionId);
    }
  };

  // Render button with optional icon
  const renderButton = (button: (typeof buttons)[number]) => {
    const IconComponent = button.icon
      ? (Icons[button.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>)
      : null;

    const buttonContent = (
      <>
        {IconComponent && <IconComponent className="h-4 w-4" />}
        {button.label && <span>{button.label}</span>}
      </>
    );

    const buttonElement = button.href ? (
      <Button
        key={button.id}
        variant={button.variant || 'default'}
        size={button.size || 'default'}
        disabled={button.disabled}
        asChild
        className={cn(fullWidth && 'w-full')}
      >
        <a href={button.href} target="_blank" rel="noopener noreferrer">
          {buttonContent}
        </a>
      </Button>
    ) : (
      <Button
        key={button.id}
        variant={button.variant || 'default'}
        size={button.size || 'default'}
        disabled={button.disabled}
        onClick={() => button.actionId && handleButtonClick(button.actionId)}
        className={cn(fullWidth && 'w-full')}
      >
        {buttonContent}
      </Button>
    );

    // Wrap with tooltip if provided
    if (button.tooltip) {
      return (
        <TooltipProvider key={button.id}>
          <Tooltip>
            <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
            <TooltipContent>
              <p>{button.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return buttonElement;
  };

  return (
    <div
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        gapClasses[gap],
        justifyClasses[justify],
        bindings?.className as string,
        className
      )}
    >
      {buttons.map(renderButton)}
    </div>
  );
}

ButtonGroupWidget.displayName = 'ButtonGroupWidget';
