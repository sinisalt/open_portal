/**
 * LineChart Component
 * Renders line charts with Recharts
 */

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { LineChartConfig } from '../types';
import {
  formatTick,
  formatTooltipValue,
  getChartDimensions,
  getLegendProps,
  getSeriesColor,
} from '../utils';

interface LineChartProps {
  config: LineChartConfig;
  data: Record<string, unknown>[];
  onDataClick?: (data: unknown) => void;
}

export function LineChart({ config, data, onDataClick }: LineChartProps) {
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
    showDots = true,
    curve = 'monotone',
    connectNulls = false,
    animation = true,
  } = config;

  const dimensions = getChartDimensions(width, height, responsive);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-medium">{label}</p>
        {payload.map(entry => (
          <p key={entry.dataKey || entry.name} className="text-sm" style={{ color: entry.color }}>
            {entry.name}:{' '}
            {formatTooltipValue(entry.value as number, entry.name || '', yAxis?.tickFormat)[0]}
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
          <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {xAxis?.showGrid !== false && <CartesianGrid strokeDasharray="3 3" />}

            <XAxis
              dataKey={xAxis?.label || 'name'}
              hide={xAxis?.show === false}
              tickFormatter={value => formatTick(value, xAxis?.tickFormat)}
            />

            <YAxis
              hide={yAxis?.show === false}
              tickFormatter={value => formatTick(value, yAxis?.tickFormat)}
              domain={yAxis?.domain as [number, number] | undefined}
            />

            {tooltip?.enabled !== false && <Tooltip content={<CustomTooltip />} />}

            {legend?.show !== false && <Legend {...getLegendProps(legend?.position)} />}

            {series.map((s, index) => (
              <Line
                key={s.id}
                type={curve}
                dataKey={s.dataKey}
                stroke={s.color || getSeriesColor(index, theme)}
                name={s.name}
                strokeWidth={2}
                dot={showDots}
                connectNulls={connectNulls}
                isAnimationActive={animation}
                onClick={onDataClick ? () => onDataClick(s) : undefined}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
