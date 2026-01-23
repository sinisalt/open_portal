/**
 * Theme Application Utilities
 *
 * Utilities for applying branding theme to the application
 */

import type { BrandingConfig, GoogleFont } from '@/types/branding.types';

/**
 * Apply branding colors as CSS variables
 */
export function applyColorTheme(colors: BrandingConfig['colors']): void {
  const root = document.documentElement;

  // Primary colors
  if (colors.primary) {
    Object.entries(colors.primary).forEach(([shade, color]) => {
      root.style.setProperty(`--color-primary-${shade}`, color);
    });
    // Set main primary color
    root.style.setProperty('--color-primary', colors.primary['500']);
  }

  // Secondary colors
  if (colors.secondary) {
    Object.entries(colors.secondary).forEach(([shade, color]) => {
      root.style.setProperty(`--color-secondary-${shade}`, color);
    });
    root.style.setProperty('--color-secondary', colors.secondary['500']);
  }

  // Semantic colors
  if (colors.success) {
    root.style.setProperty('--color-success', colors.success);
  }
  if (colors.warning) {
    root.style.setProperty('--color-warning', colors.warning);
  }
  if (colors.error) {
    root.style.setProperty('--color-error', colors.error);
  }
  if (colors.info) {
    root.style.setProperty('--color-info', colors.info);
  }

  // Background colors
  if (colors.background) {
    root.style.setProperty('--color-background-default', colors.background.default);
    root.style.setProperty('--color-background-paper', colors.background.paper);
  }

  // Text colors
  if (colors.text) {
    root.style.setProperty('--color-text-primary', colors.text.primary);
    root.style.setProperty('--color-text-secondary', colors.text.secondary);
    if (colors.text.disabled) {
      root.style.setProperty('--color-text-disabled', colors.text.disabled);
    }
  }
}

/**
 * Apply typography settings as CSS variables
 */
export function applyTypography(typography: BrandingConfig['typography']): void {
  const root = document.documentElement;

  // Font families
  if (typography.fontFamily) {
    root.style.setProperty('--font-family-primary', typography.fontFamily.primary);
    if (typography.fontFamily.secondary) {
      root.style.setProperty('--font-family-secondary', typography.fontFamily.secondary);
    }
  }

  // Font sizes
  if (typography.sizes) {
    Object.entries(typography.sizes).forEach(([key, size]) => {
      root.style.setProperty(`--font-size-${key}`, size);
    });
  }
}

/**
 * Apply spacing configuration as CSS variables
 */
export function applySpacing(spacing: BrandingConfig['spacing']): void {
  if (!spacing) return;

  const root = document.documentElement;

  // Base spacing unit
  root.style.setProperty('--spacing-unit', `${spacing.unit}px`);

  // Spacing scale
  if (spacing.scale) {
    spacing.scale.forEach((value, index) => {
      root.style.setProperty(`--spacing-${index}`, `${value}px`);
    });
  }
}

/**
 * Apply border radius settings as CSS variables
 */
export function applyBorderRadius(borderRadius: BrandingConfig['borderRadius']): void {
  if (!borderRadius) return;

  const root = document.documentElement;

  if (borderRadius.small) {
    root.style.setProperty('--border-radius-small', borderRadius.small);
  }
  if (borderRadius.medium) {
    root.style.setProperty('--border-radius-medium', borderRadius.medium);
  }
  if (borderRadius.large) {
    root.style.setProperty('--border-radius-large', borderRadius.large);
  }
}

/**
 * Load Google Fonts dynamically
 */
export function loadGoogleFonts(fonts: GoogleFont[]): void {
  if (!fonts || fonts.length === 0) return;

  // Remove existing Google Fonts link if present
  const existingLink = document.getElementById('google-fonts');
  if (existingLink) {
    existingLink.remove();
  }

  // Build Google Fonts URL
  const fontFamilies = fonts
    .map(font => {
      const weights = font.weights.join(',');
      const familyName = font.name.replace(/\s/g, '+');
      return `family=${familyName}:wght@${weights}`;
    })
    .join('&');

  const googleFontsUrl = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;

  // Create and append new link element
  const link = document.createElement('link');
  link.id = 'google-fonts';
  link.rel = 'stylesheet';
  link.href = googleFontsUrl;
  document.head.appendChild(link);
}

/**
 * Update favicon
 */
export function updateFavicon(faviconUrl: string): void {
  if (!faviconUrl) return;

  // Remove existing favicon links
  const existingLinks = document.querySelectorAll('link[rel*="icon"]');
  existingLinks.forEach(link => {
    link.remove();
  });

  // Add new favicon
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/x-icon';
  link.href = faviconUrl;
  document.head.appendChild(link);
}

/**
 * Inject custom CSS
 */
export function injectCustomCSS(css: string): void {
  if (!css) return;

  // Remove existing custom branding CSS
  const existingStyle = document.getElementById('custom-branding-css');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create and append new style element
  const style = document.createElement('style');
  style.id = 'custom-branding-css';
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Apply complete branding theme
 */
export function applyBrandingTheme(branding: BrandingConfig): void {
  // Apply colors
  applyColorTheme(branding.colors);

  // Apply typography
  applyTypography(branding.typography);

  // Apply spacing
  if (branding.spacing) {
    applySpacing(branding.spacing);
  }

  // Apply border radius
  if (branding.borderRadius) {
    applyBorderRadius(branding.borderRadius);
  }

  // Load Google Fonts
  if (branding.typography.googleFonts) {
    loadGoogleFonts(branding.typography.googleFonts);
  }

  // Update favicon
  if (branding.logos.favicon) {
    updateFavicon(branding.logos.favicon.url);
  }

  // Inject custom CSS
  if (branding.customCSS) {
    injectCustomCSS(branding.customCSS);
  }
}

/**
 * Remove all branding theme customizations
 */
export function removeBrandingTheme(): void {
  const root = document.documentElement;

  // Remove all branding CSS variables
  const brandingVars = [
    // Colors
    '--color-primary',
    '--color-secondary',
    '--color-success',
    '--color-warning',
    '--color-error',
    '--color-info',
    '--color-background-default',
    '--color-background-paper',
    '--color-text-primary',
    '--color-text-secondary',
    '--color-text-disabled',
    // Typography
    '--font-family-primary',
    '--font-family-secondary',
    // Spacing
    '--spacing-unit',
    // Border radius
    '--border-radius-small',
    '--border-radius-medium',
    '--border-radius-large',
  ];

  brandingVars.forEach(varName => {
    root.style.removeProperty(varName);
  });

  // Remove dynamic color shades
  for (let i = 50; i <= 900; i += 50) {
    root.style.removeProperty(`--color-primary-${i}`);
    root.style.removeProperty(`--color-secondary-${i}`);
  }

  // Remove font sizes
  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body1', 'body2', 'caption'].forEach(key => {
    root.style.removeProperty(`--font-size-${key}`);
  });

  // Remove spacing scale
  for (let i = 0; i < 10; i++) {
    root.style.removeProperty(`--spacing-${i}`);
  }

  // Remove Google Fonts link
  const googleFontsLink = document.getElementById('google-fonts');
  if (googleFontsLink) {
    googleFontsLink.remove();
  }

  // Remove custom CSS
  const customCSS = document.getElementById('custom-branding-css');
  if (customCSS) {
    customCSS.remove();
  }
}
