/**
 * Chart utility functions
 */

import type { ChartTheme, ColorScheme } from './types';

/**
 * Default color palettes for different schemes
 */
const COLOR_PALETTES: Record<ColorScheme, string[]> = {
  default: [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ],
  primary: [
    'hsl(var(--primary))',
    'hsl(var(--primary) / 0.8)',
    'hsl(var(--primary) / 0.6)',
    'hsl(var(--primary) / 0.4)',
    'hsl(var(--primary) / 0.2)',
  ],
  secondary: [
    'hsl(var(--secondary))',
    'hsl(var(--secondary) / 0.8)',
    'hsl(var(--secondary) / 0.6)',
    'hsl(var(--secondary) / 0.4)',
    'hsl(var(--secondary) / 0.2)',
  ],
  success: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
  warning: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'],
  danger: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'],
  custom: [],
};

/**
 * Get color palette based on theme
 */
export function getColorPalette(theme?: ChartTheme): string[] {
  if (theme?.colors && theme.colors.length > 0) {
    return theme.colors;
  }

  const scheme = theme?.colorScheme || 'default';
  return COLOR_PALETTES[scheme];
}

/**
 * Get color for a specific series index
 */
export function getSeriesColor(index: number, theme?: ChartTheme): string {
  const palette = getColorPalette(theme);
  return palette[index % palette.length] || palette[0];
}

/**
 * Format number based on tick format
 */
export function formatTick(value: number | string, format?: string): string {
  if (typeof value === 'string') return value;

  if (!format) return String(value);

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    case 'percentage':
      return `${value}%`;
    case 'decimal':
      return value.toFixed(2);
    case 'compact':
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
      }).format(value);
    default:
      return String(value);
  }
}

/**
 * Format tooltip value
 */
export function formatTooltipValue(
  value: number | string,
  name: string,
  format?: string
): [string, string] {
  const formattedValue = typeof value === 'number' ? formatTick(value, format) : value;
  return [formattedValue, name];
}

/**
 * Calculate responsive chart dimensions
 */
export function getChartDimensions(
  width?: string | number,
  height?: number | string,
  responsive?: boolean
): { width?: string | number; height?: number | string } {
  if (responsive) {
    return {
      width: '100%',
      height: height || 400,
    };
  }

  return {
    width: width || '100%',
    height: height || 400,
  };
}

/**
 * Validate chart data
 */
export function validateChartData(data: unknown[]): data is Record<string, unknown>[] {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return false;
  return data.every(item => typeof item === 'object' && item !== null);
}

/**
 * Transform data for pie charts (calculate percentages)
 */
export function transformPieData(
  data: Record<string, unknown>[],
  valueKey: string,
  nameKey: string
): Array<{ name: string; value: number; percentage: number }> {
  const total = data.reduce((sum, item) => sum + Number(item[valueKey] || 0), 0);

  return data.map(item => ({
    name: String(item[nameKey]),
    value: Number(item[valueKey] || 0),
    percentage: total > 0 ? (Number(item[valueKey] || 0) / total) * 100 : 0,
  }));
}

/**
 * Export chart to PNG
 * Uses html2canvas to capture the chart
 */
export async function exportChartToPNG(
  chartRef: HTMLElement,
  filename: string = 'chart.png'
): Promise<void> {
  try {
    // Dynamically import html2canvas to avoid bundle bloat
    const html2canvas = await import('html2canvas');
    const canvas = await html2canvas.default(chartRef, {
      backgroundColor: '#ffffff',
      scale: 2,
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Failed to export chart to PNG:', error);
    throw error;
  }
}

/**
 * Export chart to SVG
 * Extracts the SVG element and downloads it
 */
export function exportChartToSVG(chartRef: HTMLElement, filename: string = 'chart.svg'): void {
  try {
    const svgElement = chartRef.querySelector('svg');
    if (!svgElement) {
      throw new Error('No SVG element found in chart');
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export chart to SVG:', error);
    throw error;
  }
}

/**
 * Get legend props based on configuration
 */
export function getLegendProps(position?: string): {
  verticalAlign: 'top' | 'middle' | 'bottom';
  align?: 'left' | 'center' | 'right';
  layout?: 'horizontal' | 'vertical';
} {
  switch (position) {
    case 'top':
      return { verticalAlign: 'top', align: 'center', layout: 'horizontal' };
    case 'bottom':
      return { verticalAlign: 'bottom', align: 'center', layout: 'horizontal' };
    case 'left':
      return { verticalAlign: 'middle', align: 'left', layout: 'vertical' };
    case 'right':
      return { verticalAlign: 'middle', align: 'right', layout: 'vertical' };
    default:
      return { verticalAlign: 'bottom', align: 'center', layout: 'horizontal' };
  }
}
