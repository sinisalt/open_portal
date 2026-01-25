/**
 * PieChart Component
 * Renders pie/donut charts with Recharts
 */

import {
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PieChartConfig } from './types';
import {
  formatTooltipValue,
  getChartDimensions,
  getLegendProps,
  getSeriesColor,
  transformPieData,
} from './utils';

interface PieChartProps {
  config: PieChartConfig;
  data: Record<string, unknown>[];
  onDataClick?: (data: unknown) => void;
}

export function PieChart({ config, data, onDataClick }: PieChartProps) {
  const {
    title,
    subtitle,
    width,
    height,
    responsive = true,
    series,
    tooltip,
    legend,
    theme,
    innerRadius = 0,
    outerRadius = 80,
    startAngle = 0,
    endAngle = 360,
    showPercentage = false,
    labelPosition = 'outside',
    animation = true,
  } = config;

  const dimensions = getChartDimensions(width, height, responsive);

  // Get the first series for pie chart (pie charts typically have one data series)
  const primarySeries = series[0];
  if (!primarySeries) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>No data series configured for pie chart</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Transform data for pie chart
  const pieData = transformPieData(data, primarySeries.dataKey, 'name');

  // Custom label renderer
  const renderLabel = (entry: { name: string; value: number; percentage: number }) => {
    if (showPercentage) {
      return `${entry.name} (${entry.percentage.toFixed(1)}%)`;
    }
    return entry.name;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload as { name: string; value: number; percentage: number };

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-medium">{data.name}</p>
        <p className="text-sm">
          Value: {formatTooltipValue(data.value, '', config.yAxis?.tickFormat)[0]}
        </p>
        {showPercentage && <p className="text-sm">Percentage: {data.percentage.toFixed(1)}%</p>}
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
          <RechartsPieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {tooltip?.enabled !== false && <Tooltip content={<CustomTooltip />} />}

            {legend?.show !== false && <Legend {...getLegendProps(legend?.position)} />}

            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={labelPosition === 'outside'}
              label={labelPosition !== 'none' ? renderLabel : false}
              outerRadius={outerRadius}
              innerRadius={innerRadius}
              fill="#8884d8"
              dataKey="value"
              startAngle={startAngle}
              endAngle={endAngle}
              isAnimationActive={animation}
              onClick={onDataClick ? () => onDataClick(pieData) : undefined}
            >
              {pieData.map((entry, index) => (
                <Cell key={entry.name} fill={getSeriesColor(index, theme)} />
              ))}
            </Pie>
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
