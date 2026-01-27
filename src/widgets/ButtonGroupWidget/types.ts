/**
 * ButtonGroupWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Button configuration within a button group
 */
export interface ButtonConfig {
  /** Unique identifier for the button */
  id: string;

  /** Button label text */
  label?: string;

  /** Icon name (e.g., from lucide-react) */
  icon?: string;

  /** Button variant */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';

  /** Action ID to execute on click */
  actionId?: string;

  /** External link URL (alternative to actionId) */
  href?: string;

  /** Whether the button is disabled */
  disabled?: boolean;

  /** Tooltip text */
  tooltip?: string;
}

/**
 * ButtonGroup widget configuration
 *
 * Generic button group component for displaying multiple related buttons.
 * Can be used for social links, action groups, filter options, navigation, etc.
 */
export interface ButtonGroupWidgetConfig extends BaseWidgetConfig {
  type: 'ButtonGroup';

  /** Array of buttons to display */
  buttons: ButtonConfig[];

  /** Group orientation */
  orientation?: 'horizontal' | 'vertical';

  /** Spacing between buttons */
  gap?: 'none' | 'sm' | 'md' | 'lg';

  /** Justify content alignment */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';

  /** Whether buttons should be full width */
  fullWidth?: boolean;

  /** Custom CSS class for the button group container */
  className?: string;
}
