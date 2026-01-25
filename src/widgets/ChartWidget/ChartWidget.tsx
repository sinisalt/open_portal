/**
 * ChartWidget Component
 *
 * Main chart widget that renders different chart types based on configuration.
 * Supports line, bar, pie, area, and scatter charts with interactive features.
 */

import { Download } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { WidgetProps } from '@/types/widget.types';
import { AreaChart } from './AreaChart';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { PieChart } from './PieChart';
import { ScatterChart } from './ScatterChart';
import type { ChartWidgetConfig } from './types';
import { exportChartToPNG, exportChartToSVG, validateChartData } from './utils';

export function ChartWidget({ config, bindings, events }: WidgetProps<ChartWidgetConfig>) {
  const { chart, dataKey = 'value' } = config;
  const chartRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Get data from bindings
  const rawData = bindings?.[dataKey];
  const data: Record<string, unknown>[] = Array.isArray(rawData) ? rawData : [];

  // Handle data click events (drill-down)
  const handleDataClick = useCallback(
    (clickedData: unknown) => {
      if (chart.drillDown?.enabled && events?.onClick) {
        events.onClick(clickedData);
      }
    },
    [chart.drillDown, events]
  );

  // Handle export
  const handleExport = useCallback(
    async (format: 'png' | 'svg') => {
      if (!chartRef.current || isExporting) return;

      try {
        setIsExporting(true);
        const filename = chart.export?.filename || 'chart';

        if (format === 'png') {
          await exportChartToPNG(chartRef.current, `${filename}.png`);
        } else {
          exportChartToSVG(chartRef.current, `${filename}.svg`);
        }
      } catch (error) {
        console.error('Failed to export chart:', error);
      } finally {
        setIsExporting(false);
      }
    },
    [chart.export?.filename, isExporting]
  );

  // Validate data
  if (!validateChartData(data)) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
        <div className="text-center">
          <p className="text-sm font-medium">{chart.emptyMessage || 'No data available'}</p>
          <p className="text-sm text-muted-foreground">Please provide data in the correct format</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (chart.loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border p-8">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">Loading chart...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
        <p className="text-sm text-muted-foreground">{chart.emptyMessage || 'No data available'}</p>
      </div>
    );
  }

  // Render appropriate chart based on type
  const renderChart = () => {
    switch (chart.type) {
      case 'line':
        return <LineChart config={chart} data={data} onDataClick={handleDataClick} />;
      case 'bar':
        return <BarChart config={chart} data={data} onDataClick={handleDataClick} />;
      case 'pie':
        return <PieChart config={chart} data={data} onDataClick={handleDataClick} />;
      case 'area':
        return <AreaChart config={chart} data={data} onDataClick={handleDataClick} />;
      case 'scatter':
        return <ScatterChart config={chart} data={data} onDataClick={handleDataClick} />;
      default:
        return (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Unsupported chart type: {(chart as { type: string }).type}
            </p>
          </div>
        );
    }
  };

  // Render chart with export toolbar
  return (
    <div className="relative space-y-2">
      {/* Export toolbar */}
      {(chart.export?.png || chart.export?.svg) && (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Chart</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {chart.export.png && (
                <DropdownMenuItem onClick={() => handleExport('png')}>
                  Export as PNG
                </DropdownMenuItem>
              )}
              {chart.export.svg && (
                <DropdownMenuItem onClick={() => handleExport('svg')}>
                  Export as SVG
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Chart container */}
      <div ref={chartRef}>{renderChart()}</div>
    </div>
  );
}

ChartWidget.displayName = 'ChartWidget';
