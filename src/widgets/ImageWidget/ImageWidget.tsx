/**
 * ImageWidget Component
 *
 * Generic image display with aspect ratio control and responsive behavior.
 * Supports lazy loading, various fit options, and click interactions.
 */

import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { ImageWidgetConfig } from './types';

export function ImageWidget({ config, bindings, events }: WidgetProps<ImageWidgetConfig>) {
  const {
    src,
    alt,
    width = 'auto',
    height = 'auto',
    aspectRatio = 'auto',
    objectFit = 'cover',
    rounded = 'md',
    lazy = true,
    caption,
    clickable = false,
  } = config;

  // Aspect ratio classes
  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '3:2': 'aspect-[3/2]',
    '21:9': 'aspect-[21/9]',
    auto: '',
  };

  // Object fit classes
  const objectFitClasses = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  };

  // Border radius classes
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  // Handle image click
  const handleClick = () => {
    if (clickable && events?.onClick) {
      events.onClick({ imageUrl: src });
    }
  };

  // Container classes
  const containerClasses = cn(
    'overflow-hidden',
    roundedClasses[rounded],
    clickable && 'cursor-pointer hover:opacity-90 transition-opacity',
    bindings?.className as string
  );

  // Image classes
  const imageClasses = cn(
    'w-full h-full',
    aspectRatioClasses[aspectRatio],
    objectFitClasses[objectFit]
  );

  // Container styles
  const containerStyle: React.CSSProperties = {
    width: width !== 'auto' ? width : undefined,
    height: height !== 'auto' ? height : undefined,
  };

  return (
    <div>
      {clickable ? (
        // biome-ignore lint/a11y/useSemanticElements: div needed to wrap image, semantic button would not allow img child
        <div
          className={containerClasses}
          style={containerStyle}
          onClick={handleClick}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`View ${alt}`}
        >
          <img
            src={src}
            alt={alt}
            className={imageClasses}
            loading={lazy ? 'lazy' : 'eager'}
            {...(bindings?.imageProps as React.ImgHTMLAttributes<HTMLImageElement>)}
          />
        </div>
      ) : (
        <div className={containerClasses} style={containerStyle}>
          <img
            src={src}
            alt={alt}
            className={imageClasses}
            loading={lazy ? 'lazy' : 'eager'}
            {...(bindings?.imageProps as React.ImgHTMLAttributes<HTMLImageElement>)}
          />
        </div>
      )}
      {caption && <p className="text-sm text-gray-600 mt-2 text-center">{caption}</p>}
    </div>
  );
}

ImageWidget.displayName = 'ImageWidget';
