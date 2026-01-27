/**
 * HeroWidget Component
 *
 * Generic hero section for prominent content display.
 * Supports background images, overlay, customizable text, and CTA buttons.
 */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { HeroWidgetConfig } from './types';

export function HeroWidget({ config, bindings, events }: WidgetProps<HeroWidgetConfig>) {
  const {
    title,
    subtitle,
    backgroundImage,
    overlayOpacity = 40,
    overlayColor = '#000000',
    height = '60vh',
    textAlign = 'center',
    textColor = 'auto',
    buttons,
  } = config;

  // Convert overlay opacity to CSS value
  const overlayOpacityValue = Math.min(100, Math.max(0, overlayOpacity)) / 100;

  // Determine text color based on setting
  const textColorClass =
    textColor === 'light'
      ? 'text-white'
      : textColor === 'dark'
        ? 'text-gray-900'
        : backgroundImage
          ? 'text-white'
          : 'text-gray-900';

  // Text alignment classes
  const textAlignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  // Handle button click
  const handleButtonClick = (actionId: string) => {
    if (events?.onActionClick) {
      events.onActionClick(actionId);
    }
  };

  return (
    <div
      className={cn(
        'relative w-full flex flex-col justify-center',
        textAlignClasses[textAlign],
        bindings?.className as string
      )}
      style={{ height }}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Overlay */}
      {(backgroundImage || overlayColor) && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacityValue,
          }}
        />
      )}

      {/* Content */}
      <div className={cn('relative z-10 container mx-auto px-4', textColorClass)}>
        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{title}</h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto">{subtitle}</p>
        )}

        {/* CTA Buttons */}
        {buttons && buttons.length > 0 && (
          <div className={cn('flex gap-4', textAlign === 'center' && 'justify-center')}>
            {buttons.map(button => (
              <Button
                key={button.id}
                variant={button.variant || 'default'}
                size={button.size || 'lg'}
                onClick={() => handleButtonClick(button.actionId)}
              >
                {button.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

HeroWidget.displayName = 'HeroWidget';
