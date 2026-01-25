/**
 * BarChart Component
 * Renders bar charts (vertical and horizontal) with Recharts
 */

import {
  Bar,
  CartesianGrid,
  Legend,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { BarChartConfig } from '../types';
import {
  formatTick,
  formatTooltipValue,
  getChartDimensions,
  getLegendProps,
  getSeriesColor,
} from '../utils';

interface BarChartProps {
  config: BarChartConfig;
  data: Record<string, unknown>[];
  onDataClick?: (data: unknown) => void;
}

export function BarChart({ config, data, onDataClick }: BarChartProps) {
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
    orientation = 'vertical',
    barSize,
    barGap = 4,
    stacked = false,
    animation = true,
  } = config;

  const dimensions = getChartDimensions(width, height, responsive);
  const isHorizontal = orientation === 'horizontal';

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
          <RechartsBarChart
            data={data}
            layout={isHorizontal ? 'vertical' : 'horizontal'}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            barGap={barGap}
          >
            {xAxis?.showGrid !== false && <CartesianGrid strokeDasharray="3 3" />}

            {isHorizontal ? (
              <>
                <XAxis
                  type="number"
                  hide={yAxis?.show === false}
                  tickFormatter={value => formatTick(value, yAxis?.tickFormat)}
                  domain={yAxis?.domain as [number, number] | undefined}
                />
                <YAxis
                  dataKey={xAxis?.label || 'name'}
                  type="category"
                  hide={xAxis?.show === false}
                  tickFormatter={value => formatTick(value, xAxis?.tickFormat)}
                />
              </>
            ) : (
              <>
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
              </>
            )}

            {tooltip?.enabled !== false && <Tooltip content={<CustomTooltip />} />}

            {legend?.show !== false && <Legend {...getLegendProps(legend?.position)} />}

            {series.map((s, index) => (
              <Bar
                key={s.id}
                dataKey={s.dataKey}
                fill={s.color || getSeriesColor(index, theme)}
                name={s.name}
                barSize={barSize}
                stackId={stacked ? 'stack' : s.stackId}
                isAnimationActive={animation}
                onClick={onDataClick ? () => onDataClick(s) : undefined}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
