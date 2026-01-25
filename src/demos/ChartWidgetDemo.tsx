/**
 * Chart Widget Demo
 * Demonstrates usage of various chart types
 */

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  AreaChartConfig,
  BarChartConfig,
  ChartType,
  ChartWidgetConfig,
  LineChartConfig,
  PieChartConfig,
  ScatterChartConfig,
} from '@/widgets/ChartWidget';
import { ChartWidget } from '@/widgets/ChartWidget';

/**
 * Sample data for charts
 */
const salesData = [
  { month: 'Jan', revenue: 4200, costs: 2400, profit: 1800 },
  { month: 'Feb', revenue: 3800, costs: 2200, profit: 1600 },
  { month: 'Mar', revenue: 5100, costs: 2800, profit: 2300 },
  { month: 'Apr', revenue: 4600, costs: 2600, profit: 2000 },
  { month: 'May', revenue: 5800, costs: 3000, profit: 2800 },
  { month: 'Jun', revenue: 6200, costs: 3200, profit: 3000 },
];

const marketShareData = [
  { name: 'Product A', value: 35 },
  { name: 'Product B', value: 25 },
  { name: 'Product C', value: 20 },
  { name: 'Product D', value: 12 },
  { name: 'Product E', value: 8 },
];

const scatterData = [
  { x: 100, y: 200, z: 200 },
  { x: 120, y: 100, z: 260 },
  { x: 170, y: 300, z: 400 },
  { x: 140, y: 250, z: 280 },
  { x: 150, y: 400, z: 500 },
  { x: 110, y: 280, z: 200 },
];

/**
 * Chart configurations
 */
const chartConfigs: Record<ChartType, ChartWidgetConfig> = {
  line: {
    id: 'line-chart',
    type: 'Chart',
    chart: {
      type: 'line',
      title: 'Revenue Trend',
      subtitle: 'Monthly revenue and costs over time',
      series: [
        {
          id: 'revenue',
          name: 'Revenue',
          dataKey: 'revenue',
          color: '#3b82f6',
        },
        {
          id: 'costs',
          name: 'Costs',
          dataKey: 'costs',
          color: '#ef4444',
        },
      ],
      xAxis: {
        label: 'month',
        showGrid: true,
      },
      yAxis: {
        label: 'Amount',
        tickFormat: 'currency',
        showGrid: true,
      },
      tooltip: {
        enabled: true,
      },
      legend: {
        show: true,
        position: 'bottom',
      },
      export: {
        png: true,
        svg: true,
        filename: 'revenue-trend',
      },
    } as LineChartConfig,
  },
  bar: {
    id: 'bar-chart',
    type: 'Chart',
    chart: {
      type: 'bar',
      title: 'Monthly Profit',
      subtitle: 'Profit comparison across months',
      series: [
        {
          id: 'profit',
          name: 'Profit',
          dataKey: 'profit',
          color: '#10b981',
        },
      ],
      xAxis: {
        label: 'month',
        showGrid: false,
      },
      yAxis: {
        label: 'Profit',
        tickFormat: 'currency',
        showGrid: true,
      },
      tooltip: {
        enabled: true,
      },
      legend: {
        show: false,
      },
      orientation: 'vertical',
      export: {
        png: true,
        filename: 'monthly-profit',
      },
    } as BarChartConfig,
  },
  pie: {
    id: 'pie-chart',
    type: 'Chart',
    chart: {
      type: 'pie',
      title: 'Market Share',
      subtitle: 'Product distribution by market share',
      series: [
        {
          id: 'share',
          name: 'Market Share',
          dataKey: 'value',
        },
      ],
      tooltip: {
        enabled: true,
      },
      legend: {
        show: true,
        position: 'right',
      },
      showPercentage: true,
      labelPosition: 'outside',
      theme: {
        colorScheme: 'default',
      },
      export: {
        svg: true,
        filename: 'market-share',
      },
    } as PieChartConfig,
  },
  area: {
    id: 'area-chart',
    type: 'Chart',
    chart: {
      type: 'area',
      title: 'Revenue vs Costs',
      subtitle: 'Stacked area chart showing revenue components',
      series: [
        {
          id: 'revenue',
          name: 'Revenue',
          dataKey: 'revenue',
          color: '#3b82f6',
        },
        {
          id: 'costs',
          name: 'Costs',
          dataKey: 'costs',
          color: '#ef4444',
        },
      ],
      xAxis: {
        label: 'month',
        showGrid: true,
      },
      yAxis: {
        label: 'Amount',
        tickFormat: 'currency',
        showGrid: true,
      },
      tooltip: {
        enabled: true,
      },
      legend: {
        show: true,
        position: 'top',
      },
      stacked: false,
      opacity: 0.4,
      export: {
        png: true,
        filename: 'revenue-vs-costs',
      },
    } as AreaChartConfig,
  },
  scatter: {
    id: 'scatter-chart',
    type: 'Chart',
    chart: {
      type: 'scatter',
      title: 'Performance Analysis',
      subtitle: 'X-Y correlation scatter plot',
      series: [
        {
          id: 'scatter',
          name: 'Data Points',
          dataKey: 'z',
          color: '#8b5cf6',
        },
      ],
      xAxis: {
        label: 'x',
        showGrid: true,
      },
      yAxis: {
        label: 'y',
        showGrid: true,
      },
      tooltip: {
        enabled: true,
      },
      legend: {
        show: false,
      },
      dotSize: 8,
      shape: 'circle',
    } as ScatterChartConfig,
  },
};

/**
 * Chart data mapping
 */
const chartDataMap: Record<ChartType, Record<string, unknown>[]> = {
  line: salesData,
  bar: salesData,
  pie: marketShareData,
  area: salesData,
  scatter: scatterData,
};

export function ChartWidgetDemo() {
  const [selectedChart, setSelectedChart] = useState<ChartType>('line');

  const config = chartConfigs[selectedChart];
  const data = chartDataMap[selectedChart];

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Chart Widget Demo</h1>
        <p className="text-muted-foreground">
          Interactive demonstration of chart widget capabilities
        </p>
      </div>

      {/* Chart Type Selector */}
      <div className="flex items-center gap-4">
        <label htmlFor="chart-type" className="text-sm font-medium">
          Chart Type:
        </label>
        <Select value={selectedChart} onValueChange={value => setSelectedChart(value as ChartType)}>
          <SelectTrigger id="chart-type" className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="pie">Pie Chart</SelectItem>
            <SelectItem value="area">Area Chart</SelectItem>
            <SelectItem value="scatter">Scatter Chart</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chart Display */}
      <div className="rounded-lg border p-4">
        <ChartWidget config={config} bindings={{ value: data }} />
      </div>

      {/* Configuration Info */}
      <div className="space-y-4 rounded-lg border p-4">
        <h2 className="text-xl font-semibold">Configuration</h2>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Chart Type:</span>{' '}
            <span className="text-muted-foreground">{selectedChart}</span>
          </div>
          <div>
            <span className="font-medium">Title:</span>{' '}
            <span className="text-muted-foreground">{config.chart.title}</span>
          </div>
          <div>
            <span className="font-medium">Series Count:</span>{' '}
            <span className="text-muted-foreground">{config.chart.series.length}</span>
          </div>
          <div>
            <span className="font-medium">Data Points:</span>{' '}
            <span className="text-muted-foreground">{data.length}</span>
          </div>
          <div>
            <span className="font-medium">Export Options:</span>{' '}
            <span className="text-muted-foreground">
              {config.chart.export?.png && 'PNG '}
              {config.chart.export?.svg && 'SVG'}
            </span>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-4 rounded-lg border p-4">
        <h2 className="text-xl font-semibold">Chart Features</h2>
        <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
          <li>Interactive tooltips showing data values on hover</li>
          <li>Configurable legends with position control</li>
          <li>Customizable axes with labels and grid lines</li>
          <li>Export to PNG and SVG formats</li>
          <li>Responsive sizing that adapts to container</li>
          <li>Theme integration with Tailwind CSS colors</li>
          <li>Loading and empty state handling</li>
          <li>Drill-down support for interactive filtering</li>
        </ul>
      </div>
    </div>
  );
}
