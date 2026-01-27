/**
 * ImageWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Image widget configuration
 *
 * Generic image display component with aspect ratio control and responsive behavior.
 * Can be used for: avatars, product images, logos, gallery items, etc.
 */
export interface ImageWidgetConfig extends BaseWidgetConfig {
  type: 'Image';

  /** Image source URL */
  src: string;

  /** Alternative text for accessibility */
  alt: string;

  /** Image width (CSS value or 'auto') */
  width?: string;

  /** Image height (CSS value or 'auto') */
  height?: string;

  /** Aspect ratio (e.g., '16:9', '1:1', '4:3') */
  aspectRatio?: '16:9' | '1:1' | '4:3' | '3:2' | '21:9' | 'auto';

  /** How the image should fit within its container */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

  /** Border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';

  /** Enable lazy loading */
  lazy?: boolean;

  /** Optional caption below image */
  caption?: string;

  /** Enable click to zoom/enlarge */
  clickable?: boolean;
}
