/**
 * ChartWidget Tests
 */

import { render, screen } from '@testing-library/react';
import { ChartWidget } from './ChartWidget';
import type { ChartWidgetConfig } from './types';

describe('ChartWidget', () => {
  const mockData = [
    { name: 'Jan', value: 400, sales: 240 },
    { name: 'Feb', value: 300, sales: 200 },
    { name: 'Mar', value: 600, sales: 360 },
    { name: 'Apr', value: 500, sales: 400 },
    { name: 'May', value: 700, sales: 450 },
  ];

  describe('Line Chart', () => {
    it('renders line chart with data', () => {
      const config: ChartWidgetConfig = {
        id: 'line-chart',
        type: 'Chart',
        chart: {
          type: 'line',
          title: 'Sales Trend',
          series: [{ id: 'sales', name: 'Sales', dataKey: 'value' }],
        },
      };

      render(<ChartWidget config={config} bindings={{ value: mockData }} />);
      expect(screen.getByText('Sales Trend')).toBeInTheDocument();
    });

    it('shows empty state when no data provided', () => {
      const config: ChartWidgetConfig = {
        id: 'line-chart',
        type: 'Chart',
        chart: {
          type: 'line',
          series: [{ id: 'sales', name: 'Sales', dataKey: 'value' }],
          emptyMessage: 'No chart data',
        },
      };

      render(<ChartWidget config={config} bindings={{ value: [] }} />);
      expect(screen.getByText('No chart data')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      const config: ChartWidgetConfig = {
        id: 'line-chart',
        type: 'Chart',
        chart: {
          type: 'line',
          series: [{ id: 'sales', name: 'Sales', dataKey: 'value' }],
          loading: true,
        },
      };

      render(<ChartWidget config={config} bindings={{ value: mockData }} />);
      expect(screen.getByText('Loading chart...')).toBeInTheDocument();
    });
  });

  describe('Bar Chart', () => {
    it('renders bar chart with vertical orientation', () => {
      const config: ChartWidgetConfig = {
        id: 'bar-chart',
        type: 'Chart',
        chart: {
          type: 'bar',
          title: 'Monthly Revenue',
          orientation: 'vertical',
          series: [
            { id: 'revenue', name: 'Revenue', dataKey: 'value' },
            { id: 'sales', name: 'Sales', dataKey: 'sales' },
          ],
        },
      };

      render(<ChartWidget config={config} bindings={{ value: mockData }} />);
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    });

    it('renders bar chart with horizontal orientation', () => {
      const config: ChartWidgetConfig = {
        id: 'bar-chart',
        type: 'Chart',
        chart: {
          type: 'bar',
          title: 'Horizontal Bars',
          orientation: 'horizontal',
          series: [{ id: 'sales', name: 'Sales', dataKey: 'value' }],
        },
      };

      render(<ChartWidget config={config} bindings={{ value: mockData }} />);
      expect(screen.getByText('Horizontal Bars')).toBeInTheDocument();
    });
  });

  describe('Pie Chart', () => {
    it('renders pie chart', () => {
      const config: ChartWidgetConfig = {
        id: 'pie-chart',
        type: 'Chart',
        chart: {
          type: 'pie',
          title: 'Market Share',
          series: [{ id: 'share', name: 'Share', dataKey: 'value' }],
        },
      };

      render(<ChartWidget config={config} bindings={{ value: mockData }} />);
      expect(screen.getByText('Market Share')).toBeInTheDocument();
    });

    it('renders donut chart with inner radius', () => {
      const config: ChartWidgetConfig = {
        id: 'donut-chart',
        type: 'Chart',
        chart: {
          type: 'pie',
          title: 'Donut Chart',
          series: [{ id: 'share', name: 'Share', dataKey: 'value' }],
          innerRadius: 50,
        },
      };

      render(<ChartWidget config={config} bindings={{ value: mockData }} />);
      expect(screen.getByText('Donut Chart')).toBeInTheDocument();
    });
  });

  describe('Area Chart', () => {
    it('renders area chart', () => {
      const config: ChartWidgetConfig = {
        id: 'area-chart',
        type: 'Chart',
        chart: {
          type: 'area',
          title: 'Growth Area',
          series: [{ id: 'growth', name: 'Growth', dataKey: 'value' }],
        },
      };

      render(<ChartWidget config={config} bindings={{ value: mockData }} />);
      expect(screen.getByText('Growth Area')).toBeInTheDocument();
    });

    it('renders stacked area chart', () => {
      const config: ChartWidgetConfig = {
        id: 'stacked-area',
        type: 'Chart',
        chart: {
          type: 'area',
          title: 'Stacked Areas',
          series: [
            { id: 'series1', name: 'Series 1', dataKey: 'value' },
            { id: 'series2', name: 'Series 2', dataKey: 'sales' },
          ],
          stacked: true,
        },
      };

      render(<ChartWidget config={config} bindings={{ value: mockData }} />);
      expect(screen.getByText('Stacked Areas')).toBeInTheDocument();
    });
  });

  describe('Scatter Chart', () => {
    it('renders scatter chart', () => {
      const scatterData = [
        { x: 100, y: 200, z: 200 },
        { x: 120, y: 100, z: 260 },
        { x: 170, y: 300, z: 400 },
      ];

      const config: ChartWidgetConfig = {
        id: 'scatter-chart',
        type: 'Chart',
        chart: {
          type: 'scatter',
          title: 'Scatter Plot',
          series: [{ id: 'scatter', name: 'Data Points', dataKey: 'z' }],
          xAxis: { label: 'x' },
          yAxis: { label: 'y' },
        },
      };

      render(<ChartWidget config={config} bindings={{ value: scatterData }} />);
      expect(screen.getByText('Scatter Plot')).toBeInTheDocument();
    });
  });

  describe('Chart Configuration', () => {
    it('applies custom theme colors', () => {
      const config: ChartWidgetConfig = {
        id: 'themed-chart',
        type: 'Chart',
        chart: {
          type: 'line',
          series: [{ id: 'data', name: 'Data', dataKey: 'value', color: '#ff0000' }],
          theme: {
            colorScheme: 'custom',
            colors: ['#ff0000', '#00ff00', '#0000ff'],
          },
        },
      };

      render(<ChartWidget config={config} bindings={{ value: mockData }} />);
      // Chart should render without errors
      expect(screen.queryByText('No data available')).not.toBeInTheDocument();
    });

    it('handles axis configuration', () => {
      const config: ChartWidgetConfig = {
        id: 'axis-chart',
        type: 'Chart',
        chart: {
          type: 'line',
          series: [{ id: 'data', name: 'Data', dataKey: 'value' }],
          xAxis: {
            label: 'name',
            showGrid: true,
          },
          yAxis: {
            label: 'Value',
            tickFormat: 'currency',
            domain: [0, 1000],
          },
        },
      };

      render(<ChartWidget config={config} bindings={{ value: mockData }} />);
      expect(screen.queryByText('No data available')).not.toBeInTheDocument();
    });

    it('supports custom data key in bindings', () => {
      const config: ChartWidgetConfig = {
        id: 'custom-key-chart',
        type: 'Chart',
        chart: {
          type: 'line',
          series: [{ id: 'data', name: 'Data', dataKey: 'value' }],
        },
        dataKey: 'chartData',
      };

      render(<ChartWidget config={config} bindings={{ chartData: mockData }} />);
      expect(screen.queryByText('No data available')).not.toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('handles invalid data format', () => {
      const config: ChartWidgetConfig = {
        id: 'invalid-chart',
        type: 'Chart',
        chart: {
          type: 'line',
          series: [{ id: 'data', name: 'Data', dataKey: 'value' }],
        },
      };

      // @ts-expect-error - Testing invalid data format
      render(<ChartWidget config={config} bindings={{ value: 'invalid' }} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('handles unsupported chart type', () => {
      const config: ChartWidgetConfig = {
        id: 'unsupported-chart',
        type: 'Chart',
        chart: {
          // @ts-expect-error - Testing unsupported chart type
          type: 'unsupported',
          series: [{ id: 'data', name: 'Data', dataKey: 'value' }],
        },
      };

      render(<ChartWidget config={config} bindings={{ value: mockData }} />);
      expect(screen.getByText(/Unsupported chart type/)).toBeInTheDocument();
    });
  });
});
