/**
 * Image Optimization Utilities
 *
 * Provides utilities for optimizing image loading and rendering:
 * - Lazy loading with Intersection Observer
 * - Progressive image loading (blur-up effect)
 * - Responsive image sources
 * - WebP/AVIF format detection
 * - Image preloading
 *
 * Usage:
 * ```tsx
 * import { OptimizedImage } from '@/utils/imageOptimization';
 *
 * <OptimizedImage
 *   src="/images/hero.jpg"
 *   alt="Hero image"
 *   width={800}
 *   height={600}
 *   loading="lazy"
 * />
 * ```
 */

import { useEffect, useRef, useState } from 'react';

/**
 * Image optimization constants
 */
const IMAGE_PRELOAD_MARGIN = '50px';

/**
 * Image optimization options
 */
export interface ImageOptimizationOptions {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Image width */
  width?: number;
  /** Image height */
  height?: number;
  /** Loading strategy: lazy, eager, or auto */
  loading?: 'lazy' | 'eager' | 'auto';
  /** CSS classes */
  className?: string;
  /** Placeholder while loading */
  placeholder?: string;
  /** Enable blur-up effect */
  blurUp?: boolean;
  /** Responsive image sources */
  srcSet?: string;
  /** Image sizes attribute */
  sizes?: string;
  /** Error handler */
  onError?: (error: Error) => void;
  /** Load handler */
  onLoad?: () => void;
}

/**
 * Check if WebP format is supported
 */
export function supportsWebP(): boolean {
  if (typeof document === 'undefined') return false;

  const elem = document.createElement('canvas');
  if (elem.getContext?.('2d')) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
}

/**
 * Check if AVIF format is supported
 */
export async function supportsAVIF(): Promise<boolean> {
  if (typeof Image === 'undefined') return false;

  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src =
      'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
}

/**
 * Get optimized image source with format detection
 */
export function getOptimizedImageSrc(src: string): string {
  // If already a data URL or external, return as-is
  if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // Add WebP conversion if supported
  // This would typically be handled by a CDN or image optimization service
  // For now, return the original source
  return src;
}

/**
 * Lazy load hook using Intersection Observer
 */
export function useLazyImage(enabled = true) {
  const [isVisible, setIsVisible] = useState(!enabled);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!enabled || isVisible) return;

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        }
      },
      {
        rootMargin: IMAGE_PRELOAD_MARGIN, // Load images before they come into view
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [enabled, isVisible]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return { imgRef, isVisible, isLoaded, handleLoad };
}

/**
 * Optimized Image Component
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  loading = 'lazy',
  className = '',
  placeholder,
  blurUp = false,
  srcSet,
  sizes,
  onError,
  onLoad,
}: ImageOptimizationOptions) {
  const lazy = loading === 'lazy';
  const { imgRef, isVisible, isLoaded, handleLoad } = useLazyImage(lazy);

  // Build image classes
  const imageClasses = [
    className,
    blurUp && !isLoaded ? 'blur-sm transition-all duration-300' : '',
    blurUp && isLoaded ? 'blur-0' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Handle errors
  const handleError = (_e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (onError) {
      onError(new Error('Image failed to load'));
    }
  };

  // Handle load
  const handleImageLoad = () => {
    handleLoad();
    if (onLoad) {
      onLoad();
    }
  };

  return (
    <img
      ref={imgRef}
      src={isVisible ? getOptimizedImageSrc(src) : placeholder}
      srcSet={isVisible ? srcSet : undefined}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={loading === 'auto' ? undefined : loading}
      className={imageClasses}
      onLoad={handleImageLoad}
      onError={handleError}
      decoding="async"
    />
  );
}

/**
 * Preload images
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
}

/**
 * Preload multiple images
 */
export async function preloadImages(sources: string[]): Promise<undefined[]> {
  return Promise.all(sources.map(preloadImage));
}

/**
 * Generate responsive image srcSet
 */
export function generateSrcSet(baseSrc: string, widths: number[]): string {
  return widths
    .map(width => {
      // In production, this would call an image CDN/optimizer
      // For now, return the same source with width descriptor
      return `${baseSrc} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(
  breakpoints: Array<{ maxWidth: string; imageWidth: string }>
): string {
  return breakpoints.map(bp => `(max-width: ${bp.maxWidth}) ${bp.imageWidth}`).join(', ');
}

/**
 * Blur up placeholder generator
 * Creates a tiny base64 encoded placeholder for blur-up effect
 */
export function generateBlurPlaceholder(
  _width: number,
  _height: number,
  color = '#f0f0f0'
): string {
  // Create a tiny 10x10 canvas
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 10;
  canvas.height = 10;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // Fill with color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 10, 10);

  // Return as data URL
  return canvas.toDataURL('image/jpeg', 0.1);
}

/**
 * Background image lazy loading helper
 */
export function useLazyBackgroundImage(src: string, enabled = true) {
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(undefined);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) {
      setBackgroundImage(`url(${src})`);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Preload image before setting
            const img = new Image();
            img.onload = () => {
              setBackgroundImage(`url(${src})`);
            };
            img.src = src;
            observer.disconnect();
          }
        }
      },
      {
        rootMargin: IMAGE_PRELOAD_MARGIN,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [src, enabled]);

  return { elementRef, backgroundImage };
}

/**
 * Image format detector
 */
export class ImageFormatDetector {
  private static webpSupport: boolean | null = null;
  private static avifSupport: boolean | null = null;

  static async detectFormats() {
    if (ImageFormatDetector.webpSupport === null) {
      ImageFormatDetector.webpSupport = supportsWebP();
    }

    if (ImageFormatDetector.avifSupport === null) {
      ImageFormatDetector.avifSupport = await supportsAVIF();
    }

    return {
      webp: ImageFormatDetector.webpSupport,
      avif: ImageFormatDetector.avifSupport,
    };
  }

  static async getBestFormat(): Promise<'avif' | 'webp' | 'jpeg'> {
    const formats = await ImageFormatDetector.detectFormats();

    if (formats.avif) return 'avif';
    if (formats.webp) return 'webp';
    return 'jpeg';
  }
}
