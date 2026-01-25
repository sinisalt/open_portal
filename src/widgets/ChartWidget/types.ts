/**
 * ChartWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Chart types supported by the widget
 */
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter';

/**
 * Chart orientation (for bar charts)
 */
export type ChartOrientation = 'vertical' | 'horizontal';

/**
 * Legend position
 */
export type LegendPosition = 'top' | 'right' | 'bottom' | 'left' | 'none';

/**
 * Chart color scheme
 */
export type ColorScheme =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'custom';

/**
 * Axis configuration
 */
export interface AxisConfig {
  /** Show axis */
  show?: boolean;

  /** Axis label */
  label?: string;

  /** Show grid lines */
  showGrid?: boolean;

  /** Tick format (e.g., currency, percentage) */
  tickFormat?: string;

  /** Tick values (for custom ticks) */
  tickValues?: (string | number)[];

  /** Domain (min, max) */
  domain?: [number | 'auto', number | 'auto'];
}

/**
 * Tooltip configuration
 */
export interface TooltipConfig {
  /** Enable tooltip */
  enabled?: boolean;

  /** Custom tooltip formatter */
  formatter?: string;

  /** Show label */
  showLabel?: boolean;
}

/**
 * Legend configuration
 */
export interface LegendConfig {
  /** Show legend */
  show?: boolean;

  /** Legend position */
  position?: LegendPosition;

  /** Legend alignment */
  align?: 'start' | 'center' | 'end';

  /** Vertical alignment */
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

/**
 * Chart data series
 */
export interface ChartSeries {
  /** Unique series identifier */
  id: string;

  /** Series name (for legend) */
  name: string;

  /** Data key to map from data array */
  dataKey: string;

  /** Series color (hex, rgb, or theme color) */
  color?: string;

  /** Series type (for combo charts) */
  type?: ChartType;

  /** Show data labels */
  showDataLabels?: boolean;

  /** Stack ID (for stacked charts) */
  stackId?: string;

  /** Y-axis ID (for dual-axis charts) */
  yAxisId?: string;
}

/**
 * Chart export options
 */
export interface ExportConfig {
  /** Enable PNG export */
  png?: boolean;

  /** Enable SVG export */
  svg?: boolean;

  /** Export filename */
  filename?: string;
}

/**
 * Chart theming
 */
export interface ChartTheme {
  /** Color scheme */
  colorScheme?: ColorScheme;

  /** Custom colors array */
  colors?: string[];

  /** Background color */
  backgroundColor?: string;

  /** Grid color */
  gridColor?: string;

  /** Text color */
  textColor?: string;
}

/**
 * Drill-down configuration
 */
export interface DrillDownConfig {
  /** Enable drill-down */
  enabled?: boolean;

  /** Action ID to execute on drill-down */
  actionId?: string;
}

/**
 * Base chart configuration
 */
export interface BaseChartConfig {
  /** Chart type */
  type: ChartType;

  /** Chart title */
  title?: string;

  /** Chart subtitle */
  subtitle?: string;

  /** Chart width (CSS value or 'auto') */
  width?: string | number;

  /** Chart height (CSS value or number in pixels) */
  height?: number | string;

  /** Responsive (auto-resize) */
  responsive?: boolean;

  /** Data series */
  series: ChartSeries[];

  /** X-axis configuration */
  xAxis?: AxisConfig;

  /** Y-axis configuration */
  yAxis?: AxisConfig;

  /** Secondary Y-axis (for dual-axis charts) */
  yAxisRight?: AxisConfig;

  /** Tooltip configuration */
  tooltip?: TooltipConfig;

  /** Legend configuration */
  legend?: LegendConfig;

  /** Chart theme */
  theme?: ChartTheme;

  /** Export configuration */
  export?: ExportConfig;

  /** Drill-down configuration */
  drillDown?: DrillDownConfig;

  /** Loading state */
  loading?: boolean;

  /** Empty message */
  emptyMessage?: string;

  /** Show data labels */
  showDataLabels?: boolean;

  /** Animation */
  animation?: boolean;
}

/**
 * Line chart specific configuration
 */
export interface LineChartConfig extends BaseChartConfig {
  type: 'line';

  /** Show dots on line */
  showDots?: boolean;

  /** Line curve type */
  curve?: 'linear' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';

  /** Connect null values */
  connectNulls?: boolean;
}

/**
 * Bar chart specific configuration
 */
export interface BarChartConfig extends BaseChartConfig {
  type: 'bar';

  /** Bar orientation */
  orientation?: ChartOrientation;

  /** Bar size */
  barSize?: number;

  /** Bar gap */
  barGap?: number;

  /** Enable stacking */
  stacked?: boolean;
}

/**
 * Pie chart specific configuration
 */
export interface PieChartConfig extends BaseChartConfig {
  type: 'pie';

  /** Inner radius (for donut charts, 0-100) */
  innerRadius?: number;

  /** Outer radius (0-100) */
  outerRadius?: number;

  /** Start angle (degrees) */
  startAngle?: number;

  /** End angle (degrees) */
  endAngle?: number;

  /** Show percentage labels */
  showPercentage?: boolean;

  /** Label position */
  labelPosition?: 'inside' | 'outside';
}

/**
 * Area chart specific configuration
 */
export interface AreaChartConfig extends BaseChartConfig {
  type: 'area';

  /** Area opacity (0-1) */
  opacity?: number;

  /** Enable stacking */
  stacked?: boolean;

  /** Curve type */
  curve?: 'linear' | 'monotone' | 'step';
}

/**
 * Scatter chart specific configuration
 */
export interface ScatterChartConfig extends BaseChartConfig {
  type: 'scatter';

  /** Dot size */
  dotSize?: number;

  /** Shape */
  shape?: 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye';
}

/**
 * Union type for all chart configurations
 */
export type ChartConfig =
  | LineChartConfig
  | BarChartConfig
  | PieChartConfig
  | AreaChartConfig
  | ScatterChartConfig;

/**
 * ChartWidget configuration
 */
export interface ChartWidgetConfig extends BaseWidgetConfig {
  type: 'Chart';

  /** Chart configuration */
  chart: ChartConfig;

  /** Data key in bindings (optional, defaults to 'value') */
  dataKey?: string;
}
