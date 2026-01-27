import { randomUUID } from 'node:crypto';
import type { TenantBranding } from './database.js';

/**
 * Tenant Theme Configurations for Issue #050 Week 4
 *
 * Three distinct tenant themes to demonstrate multi-tenant theming:
 * 1. Acme Corporation - Blue professional theme
 * 2. EcoTech Solutions - Green eco-friendly theme
 * 3. Creative Studios - Purple creative theme
 */

/**
 * Acme Corporation Theme - Blue Professional
 *
 * A professional, corporate theme with blue as the primary color.
 * Suitable for: Enterprise SaaS, B2B platforms, financial services
 */
export const acmeCorporationTheme: TenantBranding = {
  id: randomUUID(),
  tenantId: 'acme-corp',
  version: '1.0.0',
  config: {
    logos: {
      primary: {
        url: '/logos/acme-logo.svg',
        altText: 'Acme Corporation',
        width: 180,
        height: 40,
      },
      login: {
        url: '/logos/acme-logo-large.svg',
        altText: 'Acme Corporation',
        width: 240,
        height: 80,
      },
      favicon: {
        url: '/logos/acme-favicon.ico',
      },
      mobileIcons: {
        icon192: '/logos/acme-icon-192.png',
        icon512: '/logos/acme-icon-512.png',
      },
    },
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6', // Primary shade - bright blue
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
      secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b', // Secondary shade - slate
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
      },
      success: '#10b981', // Emerald green
      warning: '#f59e0b', // Amber
      error: '#ef4444', // Red
      info: '#06b6d4', // Cyan
      background: {
        default: '#ffffff',
        paper: '#f8fafc',
      },
      text: {
        primary: '#0f172a',
        secondary: '#64748b',
        disabled: '#cbd5e1',
      },
    },
    typography: {
      fontFamily: {
        primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        secondary: "'Roboto Mono', monospace",
      },
      googleFonts: [
        {
          name: 'Inter',
          weights: [400, 500, 600, 700],
        },
        {
          name: 'Roboto Mono',
          weights: [400, 500],
        },
      ],
      sizes: {
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.75rem',
        h4: '1.5rem',
        h5: '1.25rem',
        h6: '1rem',
        body1: '1rem',
        body2: '0.875rem',
        caption: '0.75rem',
      },
    },
    spacing: {
      unit: 8,
      scale: [0, 8, 16, 24, 32, 40, 48, 64, 80, 96],
    },
    borderRadius: {
      small: '0.25rem',
      medium: '0.5rem',
      large: '1rem',
    },
    customCSS: `
      /* Acme Corporation Custom Styles */
      :root {
        --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      }
      
      /* Professional button styles */
      .btn-primary {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        box-shadow: var(--shadow-md);
      }
      
      .btn-primary:hover {
        box-shadow: var(--shadow-lg);
      }
    `,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * EcoTech Solutions Theme - Green Eco-Friendly
 *
 * An environmental, eco-friendly theme with green as the primary color.
 * Suitable for: Sustainability platforms, green tech, environmental services
 */
export const ecoTechSolutionsTheme: TenantBranding = {
  id: randomUUID(),
  tenantId: 'ecotech-solutions',
  version: '1.0.0',
  config: {
    logos: {
      primary: {
        url: '/logos/ecotech-logo.svg',
        altText: 'EcoTech Solutions',
        width: 200,
        height: 45,
      },
      login: {
        url: '/logos/ecotech-logo-large.svg',
        altText: 'EcoTech Solutions',
        width: 260,
        height: 90,
      },
      favicon: {
        url: '/logos/ecotech-favicon.ico',
      },
      mobileIcons: {
        icon192: '/logos/ecotech-icon-192.png',
        icon512: '/logos/ecotech-icon-512.png',
      },
    },
    colors: {
      primary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e', // Primary shade - vibrant green
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
      },
      secondary: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280', // Secondary shade - gray
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
      success: '#10b981', // Emerald
      warning: '#f97316', // Orange
      error: '#dc2626', // Red
      info: '#14b8a6', // Teal
      background: {
        default: '#ffffff',
        paper: '#f9fafb',
      },
      text: {
        primary: '#111827',
        secondary: '#6b7280',
        disabled: '#d1d5db',
      },
    },
    typography: {
      fontFamily: {
        primary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        secondary: "'Source Code Pro', monospace",
      },
      googleFonts: [
        {
          name: 'Poppins',
          weights: [400, 500, 600, 700],
        },
        {
          name: 'Source Code Pro',
          weights: [400, 600],
        },
      ],
      sizes: {
        h1: '2.75rem',
        h2: '2.25rem',
        h3: '1.875rem',
        h4: '1.5rem',
        h5: '1.25rem',
        h6: '1rem',
        body1: '1rem',
        body2: '0.875rem',
        caption: '0.75rem',
      },
    },
    spacing: {
      unit: 8,
      scale: [0, 8, 16, 24, 32, 40, 48, 64, 80, 96],
    },
    borderRadius: {
      small: '0.375rem',
      medium: '0.75rem',
      large: '1.25rem',
    },
    customCSS: `
      /* EcoTech Solutions Custom Styles */
      :root {
        --shadow-eco: 0 4px 6px -1px rgb(34 197 94 / 0.1);
        --gradient-eco: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      }
      
      /* Eco-friendly card styles */
      .card-eco {
        border: 1px solid #bbf7d0;
        background: linear-gradient(to bottom, #ffffff 0%, #f0fdf4 100%);
      }
      
      /* Nature-inspired button */
      .btn-primary {
        background: var(--gradient-eco);
        border-radius: 0.75rem;
      }
      
      .btn-primary:hover {
        box-shadow: 0 0 20px rgb(34 197 94 / 0.3);
      }
    `,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Creative Studios Theme - Purple Creative
 *
 * A bold, creative theme with purple as the primary color.
 * Suitable for: Creative agencies, design studios, artistic platforms
 */
export const creativeStudiosTheme: TenantBranding = {
  id: randomUUID(),
  tenantId: 'creative-studios',
  version: '1.0.0',
  config: {
    logos: {
      primary: {
        url: '/logos/creative-logo.svg',
        altText: 'Creative Studios',
        width: 190,
        height: 42,
      },
      login: {
        url: '/logos/creative-logo-large.svg',
        altText: 'Creative Studios',
        width: 250,
        height: 85,
      },
      favicon: {
        url: '/logos/creative-favicon.ico',
      },
      mobileIcons: {
        icon192: '/logos/creative-icon-192.png',
        icon512: '/logos/creative-icon-512.png',
      },
    },
    colors: {
      primary: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7', // Primary shade - vivid purple
        600: '#9333ea',
        700: '#7e22ce',
        800: '#6b21a8',
        900: '#581c87',
      },
      secondary: {
        50: '#fdf4ff',
        100: '#fae8ff',
        200: '#f5d0fe',
        300: '#f0abfc',
        400: '#e879f9',
        500: '#d946ef', // Secondary shade - magenta
        600: '#c026d3',
        700: '#a21caf',
        800: '#86198f',
        900: '#701a75',
      },
      success: '#8b5cf6', // Purple success
      warning: '#fb923c', // Orange
      error: '#f43f5e', // Rose
      info: '#8b5cf6', // Purple info
      background: {
        default: '#ffffff',
        paper: '#faf5ff',
      },
      text: {
        primary: '#18181b',
        secondary: '#71717a',
        disabled: '#d4d4d8',
      },
    },
    typography: {
      fontFamily: {
        primary: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        secondary: "'JetBrains Mono', monospace",
      },
      googleFonts: [
        {
          name: 'Outfit',
          weights: [400, 500, 600, 700, 800],
        },
        {
          name: 'JetBrains Mono',
          weights: [400, 600],
        },
      ],
      sizes: {
        h1: '3rem',
        h2: '2.25rem',
        h3: '1.875rem',
        h4: '1.5rem',
        h5: '1.25rem',
        h6: '1rem',
        body1: '1rem',
        body2: '0.875rem',
        caption: '0.75rem',
      },
    },
    spacing: {
      unit: 8,
      scale: [0, 8, 16, 24, 32, 40, 48, 64, 80, 96],
    },
    borderRadius: {
      small: '0.5rem',
      medium: '1rem',
      large: '1.5rem',
    },
    customCSS: `
      /* Creative Studios Custom Styles */
      :root {
        --gradient-creative: linear-gradient(135deg, #a855f7 0%, #d946ef 100%);
        --gradient-creative-alt: linear-gradient(45deg, #a855f7 0%, #f0abfc 100%);
        --shadow-creative: 0 20px 25px -5px rgb(168 85 247 / 0.2);
      }
      
      /* Bold creative styles */
      .btn-primary {
        background: var(--gradient-creative);
        border-radius: 1rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .btn-primary:hover {
        background: var(--gradient-creative-alt);
        box-shadow: var(--shadow-creative);
        transform: translateY(-2px);
        transition: all 0.3s ease;
      }
      
      /* Creative card hover effects */
      .card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-creative);
      }
      
      /* Gradient text for headers */
      h1, h2, h3 {
        background: var(--gradient-creative);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    `,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Get all tenant themes
 */
export function getAllTenantThemes(): TenantBranding[] {
  return [acmeCorporationTheme, ecoTechSolutionsTheme, creativeStudiosTheme];
}

/**
 * Get tenant theme by tenant ID
 */
export function getTenantTheme(tenantId: string): TenantBranding | undefined {
  const themes = getAllTenantThemes();
  return themes.find((theme) => theme.tenantId === tenantId);
}
