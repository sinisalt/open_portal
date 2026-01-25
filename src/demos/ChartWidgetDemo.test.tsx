/**
 * ChartWidgetDemo Tests
 * Tests for the interactive chart demo component
 */

import { render, screen } from '@testing-library/react';
import { ChartWidgetDemo } from './ChartWidgetDemo';

// Mock the ChartWidget component to avoid complex Recharts rendering in tests
jest.mock('@/widgets/ChartWidget', () => ({
  ChartWidget: ({ config }: { config: { chart: { title?: string; type: string } } }) => (
    <div data-testid="chart-widget">
      <div data-testid="chart-type">{config.chart.type}</div>
      <div data-testid="chart-title">{config.chart.title}</div>
    </div>
  ),
}));

describe('ChartWidgetDemo', () => {
  it('renders the demo page with title and description', () => {
    render(<ChartWidgetDemo />);

    expect(screen.getByText('Chart Widget Demo')).toBeInTheDocument();
    expect(
      screen.getByText('Interactive demonstration of chart widget capabilities')
    ).toBeInTheDocument();
  });

  it('renders chart type selector with default line chart', () => {
    render(<ChartWidgetDemo />);

    expect(screen.getByText('Line Chart')).toBeInTheDocument();
    expect(screen.getByTestId('chart-type')).toHaveTextContent('line');
  });

  it('displays chart title for default line chart', () => {
    render(<ChartWidgetDemo />);

    expect(screen.getByTestId('chart-title')).toHaveTextContent('Revenue Trend');
  });

  it('displays configuration information', () => {
    render(<ChartWidgetDemo />);

    expect(screen.getByText('Configuration')).toBeInTheDocument();

    // Use getAllByText for labels that appear multiple times
    const chartTypeLabels = screen.getAllByText('Chart Type:');
    expect(chartTypeLabels.length).toBeGreaterThan(0);

    expect(screen.getByText('Title:')).toBeInTheDocument();
    expect(screen.getByText('Series Count:')).toBeInTheDocument();
    expect(screen.getByText('Data Points:')).toBeInTheDocument();
    expect(screen.getByText('Export Options:')).toBeInTheDocument();
  });

  it('displays features list', () => {
    render(<ChartWidgetDemo />);

    expect(screen.getByText('Chart Features')).toBeInTheDocument();
    expect(
      screen.getByText('Interactive tooltips showing data values on hover')
    ).toBeInTheDocument();
    expect(screen.getByText('Configurable legends with position control')).toBeInTheDocument();
    expect(screen.getByText('Export to PNG and SVG formats')).toBeInTheDocument();
  });

  it('shows correct series count for line chart', () => {
    render(<ChartWidgetDemo />);

    // Line chart has 2 series (revenue and costs)
    const configSection = screen.getByText('Configuration').closest('div');
    expect(configSection).toHaveTextContent('2');
  });

  it('shows correct data points count for line chart', () => {
    render(<ChartWidgetDemo />);

    // Sales data has 6 data points
    const configSection = screen.getByText('Configuration').closest('div');
    expect(configSection).toHaveTextContent('6');
  });

  it('shows export options for charts with export enabled', () => {
    render(<ChartWidgetDemo />);

    // Line chart has PNG and SVG export
    expect(screen.getByText('Export Options:')).toBeInTheDocument();
    const exportSection = screen.getByText('Export Options:').parentElement;
    expect(exportSection).toHaveTextContent('PNG');
    expect(exportSection).toHaveTextContent('SVG');
  });

  it('renders chart widget component', () => {
    render(<ChartWidgetDemo />);

    // Chart widget should be rendered
    expect(screen.getByTestId('chart-widget')).toBeInTheDocument();
  });

  it('displays all configuration details', () => {
    render(<ChartWidgetDemo />);

    // Check all configuration fields are present
    const configSection = screen.getByText('Configuration').closest('div');
    expect(configSection).toHaveTextContent('line'); // chart type
    expect(configSection).toHaveTextContent('Revenue Trend'); // title
  });
});
