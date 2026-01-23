/**
 * Branding Type Definitions
 *
 * Type definitions for tenant-specific branding configuration
 */

/**
 * Logo configuration
 */
export interface LogoConfig {
  url: string;
  altText: string;
  width?: number;
  height?: number;
}

/**
 * Mobile icon configuration
 */
export interface MobileIcons {
  icon192?: string;
  icon512?: string;
}

/**
 * Logos configuration
 */
export interface LogosConfig {
  primary: LogoConfig;
  login: LogoConfig;
  favicon?: {
    url: string;
  };
  mobileIcons?: MobileIcons;
}

/**
 * Color palette configuration (Material Design style)
 */
export interface ColorPalette {
  50?: string;
  100?: string;
  200?: string;
  300?: string;
  400?: string;
  500: string; // Primary shade (required)
  600?: string;
  700?: string;
  800?: string;
  900?: string;
}

/**
 * Background colors
 */
export interface BackgroundColors {
  default: string;
  paper: string;
}

/**
 * Text colors
 */
export interface TextColors {
  primary: string;
  secondary: string;
  disabled?: string;
}

/**
 * Colors configuration
 */
export interface ColorsConfig {
  primary: ColorPalette;
  secondary?: ColorPalette;
  success?: string;
  warning?: string;
  error?: string;
  info?: string;
  background?: BackgroundColors;
  text?: TextColors;
}

/**
 * Google Font configuration
 */
export interface GoogleFont {
  name: string;
  weights: number[];
}

/**
 * Font family configuration
 */
export interface FontFamily {
  primary: string;
  secondary?: string;
}

/**
 * Font sizes
 */
export interface FontSizes {
  h1?: string;
  h2?: string;
  h3?: string;
  h4?: string;
  h5?: string;
  h6?: string;
  body1?: string;
  body2?: string;
  caption?: string;
}

/**
 * Typography configuration
 */
export interface TypographyConfig {
  fontFamily: FontFamily;
  googleFonts?: GoogleFont[];
  sizes?: FontSizes;
}

/**
 * Spacing configuration
 */
export interface SpacingConfig {
  unit: number; // Base spacing unit in pixels
  scale?: number[]; // Spacing scale multipliers
}

/**
 * Border radius configuration
 */
export interface BorderRadiusConfig {
  small?: string;
  medium?: string;
  large?: string;
}

/**
 * Branding configuration
 */
export interface BrandingConfig {
  logos: LogosConfig;
  colors: ColorsConfig;
  typography: TypographyConfig;
  spacing?: SpacingConfig;
  borderRadius?: BorderRadiusConfig;
  customCSS?: string; // Additional custom CSS
}

/**
 * Full branding response from API
 */
export interface BrandingResponse {
  tenantId: string;
  version: string;
  lastUpdated?: string;
  isDefault?: boolean;
  branding: BrandingConfig;
  cacheControl?: string;
  etag?: string;
  message?: string; // Optional message (e.g., fallback notice)
}

/**
 * Branding error types
 */
export enum BrandingErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  AUTH_ERROR = 'AUTH_ERROR',
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
}

/**
 * Branding error with additional context
 */
export interface BrandingError extends Error {
  type: BrandingErrorType;
  originalError?: Error;
}

/**
 * Cached branding data with metadata
 */
export interface CachedBranding {
  data: BrandingResponse;
  version: string;
  timestamp: number;
}
