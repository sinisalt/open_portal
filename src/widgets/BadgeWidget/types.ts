/**
 * BadgeWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * BadgeWidget configuration
 *
 * Generic badge/tag component for displaying status indicators, labels, categories, etc.
 * Can be used for user roles, status tags, categories, notification counts, etc.
 */
export interface BadgeWidgetConfig extends BaseWidgetConfig {
  type: 'Badge';

  /** Badge label text */
  label: string;

  /** Badge visual variant */
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

  /** Badge size */
  size?: 'sm' | 'default' | 'lg';

  /** Icon name (from lucide-react) to display before label */
  icon?: string;

  /** Whether the badge can be removed/dismissed */
  removable?: boolean;

  /** Action ID to execute when badge is removed */
  onRemoveActionId?: string;

  /** Custom CSS class for styling */
  className?: string;
}
