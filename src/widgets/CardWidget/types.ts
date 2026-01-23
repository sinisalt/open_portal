/**
 * CardWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Card widget configuration
 */
export interface CardWidgetConfig extends BaseWidgetConfig {
  type: 'Card';

  /** Card title */
  title?: string;

  /** Card subtitle/description */
  subtitle?: string;

  /** Optional image URL */
  image?: string;

  /** Card elevation level */
  elevation?: 'none' | 'sm' | 'md' | 'lg';

  /** Show border */
  bordered?: boolean;

  /** Padding configuration */
  padding?: 'none' | 'sm' | 'md' | 'lg';

  /** Action buttons in footer */
  actions?: Array<{
    id: string;
    label: string;
    actionId: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }>;
}
