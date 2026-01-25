/**
 * ScatterChart Component
 * Renders scatter plots with Recharts
 */

import {
  CartesianGrid,
  Legend,
  ScatterChart as RechartsScatterChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ScatterChartConfig } from './types';
import {
  formatTick,
  formatTooltipValue,
  getChartDimensions,
  getLegendProps,
  getSeriesColor,
} from './utils';

interface ScatterChartProps {
  config: ScatterChartConfig;
  data: Record<string, unknown>[];
  onDataClick?: (data: unknown) => void;
}

export function ScatterChart({ config, data, onDataClick }: ScatterChartProps) {
  const {
    title,
    subtitle,
    width,
    height,
    responsive = true,
    series,
    xAxis,
    yAxis,
    tooltip,
    legend,
    theme,
    dotSize,
    shape = 'circle',
    animation = true,
  } = config;

  const dimensions = getChartDimensions(width, height, responsive);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload as Record<string, unknown>;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        {Object.entries(data).map(([key, value]) => (
          <p key={key} className="text-sm">
            {key}: {formatTooltipValue(value as number, key, yAxis?.tickFormat)[0]}
          </p>
        ))}
      </div>
    );
  };

  return (
    <Card>
      {(title || subtitle) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
          <RechartsScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {xAxis?.showGrid !== false && <CartesianGrid strokeDasharray="3 3" />}

            <XAxis
              type="number"
              dataKey={xAxis?.label || 'x'}
              name={xAxis?.label || 'X'}
              hide={xAxis?.show === false}
              tickFormatter={value => formatTick(value, xAxis?.tickFormat)}
              domain={xAxis?.domain as [number, number] | undefined}
            />

            <YAxis
              type="number"
              dataKey={yAxis?.label || 'y'}
              name={yAxis?.label || 'Y'}
              hide={yAxis?.show === false}
              tickFormatter={value => formatTick(value, yAxis?.tickFormat)}
              domain={yAxis?.domain as [number, number] | undefined}
            />

            {tooltip?.enabled !== false && (
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            )}

            {legend?.show !== false && <Legend {...getLegendProps(legend?.position)} />}

            {series.map((s, index) => (
              <Scatter
                key={s.id}
                name={s.name}
                data={data}
                fill={s.color || getSeriesColor(index, theme)}
                shape={shape}
                isAnimationActive={animation}
                onClick={onDataClick ? () => onDataClick(s) : undefined}
                {...(dotSize && { r: dotSize })}
              />
            ))}
          </RechartsScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
