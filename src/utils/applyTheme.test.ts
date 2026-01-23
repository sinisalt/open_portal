/**
 * Theme Application Utilities Tests
 */

import type { BrandingConfig } from '@/types/branding.types';
import {
  applyBorderRadius,
  applyBrandingTheme,
  applyColorTheme,
  applySpacing,
  applyTypography,
  injectCustomCSS,
  loadGoogleFonts,
  removeBrandingTheme,
  updateFavicon,
} from './applyTheme';

describe('applyTheme', () => {
  beforeEach(() => {
    // Clear document head and reset styles
    document.head.innerHTML = '';
    document.documentElement.removeAttribute('style');
  });

  describe('applyColorTheme', () => {
    it('should apply primary colors as CSS variables', () => {
      const colors: BrandingConfig['colors'] = {
        primary: {
          50: '#e3f2fd',
          500: '#2196f3',
          900: '#0d47a1',
        },
      };

      applyColorTheme(colors);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--color-primary-50')).toBe('#e3f2fd');
      expect(root.style.getPropertyValue('--color-primary-500')).toBe('#2196f3');
      expect(root.style.getPropertyValue('--color-primary-900')).toBe('#0d47a1');
      expect(root.style.getPropertyValue('--color-primary')).toBe('#2196f3');
    });

    it('should apply secondary colors', () => {
      const colors: BrandingConfig['colors'] = {
        primary: { 500: '#2196f3' },
        secondary: {
          500: '#e91e63',
        },
      };

      applyColorTheme(colors);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--color-secondary-500')).toBe('#e91e63');
      expect(root.style.getPropertyValue('--color-secondary')).toBe('#e91e63');
    });

    it('should apply semantic colors', () => {
      const colors: BrandingConfig['colors'] = {
        primary: { 500: '#2196f3' },
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3',
      };

      applyColorTheme(colors);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--color-success')).toBe('#4caf50');
      expect(root.style.getPropertyValue('--color-warning')).toBe('#ff9800');
      expect(root.style.getPropertyValue('--color-error')).toBe('#f44336');
      expect(root.style.getPropertyValue('--color-info')).toBe('#2196f3');
    });

    it('should apply background colors', () => {
      const colors: BrandingConfig['colors'] = {
        primary: { 500: '#2196f3' },
        background: {
          default: '#ffffff',
          paper: '#f5f5f5',
        },
      };

      applyColorTheme(colors);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--color-background-default')).toBe('#ffffff');
      expect(root.style.getPropertyValue('--color-background-paper')).toBe('#f5f5f5');
    });

    it('should apply text colors', () => {
      const colors: BrandingConfig['colors'] = {
        primary: { 500: '#2196f3' },
        text: {
          primary: '#212121',
          secondary: '#757575',
          disabled: '#bdbdbd',
        },
      };

      applyColorTheme(colors);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--color-text-primary')).toBe('#212121');
      expect(root.style.getPropertyValue('--color-text-secondary')).toBe('#757575');
      expect(root.style.getPropertyValue('--color-text-disabled')).toBe('#bdbdbd');
    });
  });

  describe('applyTypography', () => {
    it('should apply font families as CSS variables', () => {
      const typography: BrandingConfig['typography'] = {
        fontFamily: {
          primary: "'Roboto', sans-serif",
          secondary: "'Open Sans', sans-serif",
        },
      };

      applyTypography(typography);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--font-family-primary')).toBe("'Roboto', sans-serif");
      expect(root.style.getPropertyValue('--font-family-secondary')).toBe(
        "'Open Sans', sans-serif"
      );
    });

    it('should apply font sizes as CSS variables', () => {
      const typography: BrandingConfig['typography'] = {
        fontFamily: {
          primary: "'Roboto', sans-serif",
        },
        sizes: {
          h1: '2.5rem',
          h2: '2rem',
          body1: '1rem',
        },
      };

      applyTypography(typography);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--font-size-h1')).toBe('2.5rem');
      expect(root.style.getPropertyValue('--font-size-h2')).toBe('2rem');
      expect(root.style.getPropertyValue('--font-size-body1')).toBe('1rem');
    });
  });

  describe('applySpacing', () => {
    it('should apply spacing unit as CSS variable', () => {
      const spacing: BrandingConfig['spacing'] = {
        unit: 8,
      };

      applySpacing(spacing);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--spacing-unit')).toBe('8px');
    });

    it('should apply spacing scale as CSS variables', () => {
      const spacing: BrandingConfig['spacing'] = {
        unit: 8,
        scale: [0, 4, 8, 16, 24],
      };

      applySpacing(spacing);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--spacing-0')).toBe('0px');
      expect(root.style.getPropertyValue('--spacing-1')).toBe('4px');
      expect(root.style.getPropertyValue('--spacing-2')).toBe('8px');
      expect(root.style.getPropertyValue('--spacing-3')).toBe('16px');
      expect(root.style.getPropertyValue('--spacing-4')).toBe('24px');
    });

    it('should handle undefined spacing gracefully', () => {
      applySpacing(undefined);
      // Should not throw and should not set any variables
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--spacing-unit')).toBe('');
    });
  });

  describe('applyBorderRadius', () => {
    it('should apply border radius values as CSS variables', () => {
      const borderRadius: BrandingConfig['borderRadius'] = {
        small: '4px',
        medium: '8px',
        large: '16px',
      };

      applyBorderRadius(borderRadius);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--border-radius-small')).toBe('4px');
      expect(root.style.getPropertyValue('--border-radius-medium')).toBe('8px');
      expect(root.style.getPropertyValue('--border-radius-large')).toBe('16px');
    });

    it('should handle undefined border radius gracefully', () => {
      applyBorderRadius(undefined);
      // Should not throw
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--border-radius-small')).toBe('');
    });
  });

  describe('loadGoogleFonts', () => {
    it('should create link element for Google Fonts', () => {
      const fonts = [
        {
          name: 'Roboto',
          weights: [300, 400, 700],
        },
        {
          name: 'Open Sans',
          weights: [400, 600],
        },
      ];

      loadGoogleFonts(fonts);

      const link = document.getElementById('google-fonts') as HTMLLinkElement;
      expect(link).toBeTruthy();
      expect(link.rel).toBe('stylesheet');
      expect(link.href).toContain('fonts.googleapis.com');
      expect(link.href).toContain('family=Roboto:wght@300,400,700');
      expect(link.href).toContain('family=Open+Sans:wght@400,600');
    });

    it('should remove existing Google Fonts link before adding new one', () => {
      const fonts1 = [{ name: 'Roboto', weights: [400] }];
      const fonts2 = [{ name: 'Open Sans', weights: [400] }];

      loadGoogleFonts(fonts1);
      const firstLink = document.getElementById('google-fonts');
      expect(firstLink).toBeTruthy();

      loadGoogleFonts(fonts2);
      const links = document.querySelectorAll('#google-fonts');
      expect(links.length).toBe(1); // Only one link should exist

      const newLink = document.getElementById('google-fonts') as HTMLLinkElement;
      expect(newLink.href).toContain('Open+Sans');
    });

    it('should handle empty font array gracefully', () => {
      loadGoogleFonts([]);
      const link = document.getElementById('google-fonts');
      expect(link).toBeNull();
    });
  });

  describe('updateFavicon', () => {
    it('should update favicon with new URL', () => {
      const faviconUrl = 'https://example.com/favicon.ico';

      updateFavicon(faviconUrl);

      const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      expect(link).toBeTruthy();
      expect(link.href).toBe(faviconUrl);
      expect(link.type).toBe('image/x-icon');
    });

    it('should remove existing favicon before adding new one', () => {
      // Add existing favicons
      const existingFavicon = document.createElement('link');
      existingFavicon.rel = 'icon';
      existingFavicon.href = 'https://old.example.com/favicon.ico';
      document.head.appendChild(existingFavicon);

      const newFaviconUrl = 'https://new.example.com/favicon.ico';
      updateFavicon(newFaviconUrl);

      const links = document.querySelectorAll('link[rel*="icon"]');
      expect(links.length).toBe(1);

      const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      expect(link.href).toBe(newFaviconUrl);
    });

    it('should handle empty favicon URL gracefully', () => {
      updateFavicon('');
      const link = document.querySelector('link[rel="icon"]');
      expect(link).toBeNull();
    });
  });

  describe('injectCustomCSS', () => {
    it('should inject custom CSS into document head', () => {
      const customCSS = '.custom-class { color: red; }';

      injectCustomCSS(customCSS);

      const style = document.getElementById('custom-branding-css');
      expect(style).toBeTruthy();
      expect(style?.textContent).toBe(customCSS);
    });

    it('should remove existing custom CSS before adding new one', () => {
      injectCustomCSS('.old-class { color: blue; }');
      injectCustomCSS('.new-class { color: green; }');

      const styles = document.querySelectorAll('#custom-branding-css');
      expect(styles.length).toBe(1);

      const style = document.getElementById('custom-branding-css');
      expect(style?.textContent).toBe('.new-class { color: green; }');
    });

    it('should handle empty CSS gracefully', () => {
      injectCustomCSS('');
      const style = document.getElementById('custom-branding-css');
      expect(style).toBeNull();
    });
  });

  describe('applyBrandingTheme', () => {
    it('should apply complete branding theme', () => {
      const branding: BrandingConfig = {
        logos: {
          primary: {
            url: 'https://example.com/logo.svg',
            altText: 'Logo',
          },
          login: {
            url: 'https://example.com/logo-login.svg',
            altText: 'Login Logo',
          },
          favicon: {
            url: 'https://example.com/favicon.ico',
          },
        },
        colors: {
          primary: {
            500: '#2196f3',
          },
        },
        typography: {
          fontFamily: {
            primary: "'Roboto', sans-serif",
          },
          googleFonts: [
            {
              name: 'Roboto',
              weights: [400, 700],
            },
          ],
        },
        spacing: {
          unit: 8,
        },
        borderRadius: {
          small: '4px',
        },
        customCSS: '.custom { color: red; }',
      };

      applyBrandingTheme(branding);

      // Check colors
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--color-primary')).toBe('#2196f3');

      // Check typography
      expect(root.style.getPropertyValue('--font-family-primary')).toBe("'Roboto', sans-serif");

      // Check spacing
      expect(root.style.getPropertyValue('--spacing-unit')).toBe('8px');

      // Check border radius
      expect(root.style.getPropertyValue('--border-radius-small')).toBe('4px');

      // Check Google Fonts loaded
      const fontsLink = document.getElementById('google-fonts');
      expect(fontsLink).toBeTruthy();

      // Check favicon updated
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      expect(favicon?.href).toBe('https://example.com/favicon.ico');

      // Check custom CSS injected
      const customCSS = document.getElementById('custom-branding-css');
      expect(customCSS?.textContent).toBe('.custom { color: red; }');
    });
  });

  describe('removeBrandingTheme', () => {
    it('should remove all branding customizations', () => {
      // Apply branding first
      const branding: BrandingConfig = {
        logos: {
          primary: {
            url: 'https://example.com/logo.svg',
            altText: 'Logo',
          },
          login: {
            url: 'https://example.com/logo-login.svg',
            altText: 'Login Logo',
          },
          favicon: {
            url: 'https://example.com/favicon.ico',
          },
        },
        colors: {
          primary: {
            50: '#e3f2fd',
            500: '#2196f3',
          },
        },
        typography: {
          fontFamily: {
            primary: "'Roboto', sans-serif",
          },
          googleFonts: [
            {
              name: 'Roboto',
              weights: [400],
            },
          ],
          sizes: {
            h1: '2rem',
          },
        },
        spacing: {
          unit: 8,
          scale: [0, 4, 8],
        },
        borderRadius: {
          small: '4px',
        },
        customCSS: '.custom { color: red; }',
      };

      applyBrandingTheme(branding);

      // Now remove everything
      removeBrandingTheme();

      const root = document.documentElement;

      // Check CSS variables removed
      expect(root.style.getPropertyValue('--color-primary')).toBe('');
      expect(root.style.getPropertyValue('--color-primary-500')).toBe('');
      expect(root.style.getPropertyValue('--font-family-primary')).toBe('');
      expect(root.style.getPropertyValue('--spacing-unit')).toBe('');
      expect(root.style.getPropertyValue('--border-radius-small')).toBe('');
      expect(root.style.getPropertyValue('--font-size-h1')).toBe('');
      expect(root.style.getPropertyValue('--spacing-0')).toBe('');

      // Check Google Fonts link removed
      expect(document.getElementById('google-fonts')).toBeNull();

      // Check custom CSS removed
      expect(document.getElementById('custom-branding-css')).toBeNull();
    });
  });
});
