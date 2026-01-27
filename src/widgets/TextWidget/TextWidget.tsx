/**
 * TextWidget Component
 *
 * Generic text display widget with typography variants and styling options.
 * Supports headings, body text, captions, and code blocks.
 */

import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { TextWidgetConfig } from './types';

export function TextWidget({ config, bindings }: WidgetProps<TextWidgetConfig>) {
  const {
    content,
    variant = 'body',
    align = 'left',
    color,
    weight = 'normal',
    size,
    markdown = false,
    truncate,
    wrap = true,
  } = config;

  // Variant classes (typography presets)
  const variantClasses = {
    heading: 'text-4xl font-bold leading-tight',
    subheading: 'text-2xl font-semibold leading-snug',
    body: 'text-base leading-relaxed',
    caption: 'text-sm text-gray-600 leading-normal',
    code: 'font-mono text-sm bg-gray-100 px-2 py-1 rounded',
  };

  // Alignment classes
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  // Weight classes
  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  // Build base classes
  const baseClasses = cn(
    variantClasses[variant],
    alignClasses[align],
    // Only apply custom weight for body and caption variants
    (variant === 'body' || variant === 'caption') && weightClasses[weight],
    truncate && `line-clamp-${truncate}`,
    !wrap && 'whitespace-nowrap overflow-hidden text-ellipsis',
    bindings?.className as string
  );

  // Build inline styles
  const style: React.CSSProperties = {
    ...(color && { color }),
    ...(size && { fontSize: size }),
  };

  // For markdown support (future enhancement)
  if (markdown) {
    // TODO: Implement markdown parsing with react-markdown or similar
    // For now, just render as plain text with a warning
    console.warn('TextWidget: Markdown support not yet implemented. Rendering as plain text.');
  }

  // Render based on variant
  if (variant === 'heading') {
    return (
      <h1 className={baseClasses} style={style}>
        {content}
      </h1>
    );
  }

  if (variant === 'subheading') {
    return (
      <h2 className={baseClasses} style={style}>
        {content}
      </h2>
    );
  }

  if (variant === 'code') {
    return (
      <code className={baseClasses} style={style}>
        {content}
      </code>
    );
  }

  if (variant === 'caption') {
    return (
      <small className={baseClasses} style={style}>
        {content}
      </small>
    );
  }

  // Default: body text
  return (
    <p className={baseClasses} style={style}>
      {content}
    </p>
  );
}

TextWidget.displayName = 'TextWidget';
