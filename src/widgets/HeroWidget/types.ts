/**
 * HeroWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Hero widget configuration
 *
 * Generic hero section component for prominent content display.
 * Can be used for homepage headers, feature announcements, product launches, etc.
 */
export interface HeroWidgetConfig extends BaseWidgetConfig {
  type: 'Hero';

  /** Hero title (main heading) */
  title: string;

  /** Hero subtitle (supporting text) */
  subtitle?: string;

  /** Background image URL */
  backgroundImage?: string;

  /** Background overlay opacity (0-100) */
  overlayOpacity?: number;

  /** Background overlay color */
  overlayColor?: string;

  /** Hero height (viewport height units or pixels) */
  height?: string;

  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right';

  /** Text color */
  textColor?: 'light' | 'dark' | 'auto';

  /** Call-to-action buttons */
  buttons?: Array<{
    id: string;
    label: string;
    actionId: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg';
  }>;
}
