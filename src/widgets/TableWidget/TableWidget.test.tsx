/**
 * TableWidget Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableWidget } from './TableWidget';
import type { TableWidgetConfig } from './types';

describe('TableWidget', () => {
  const baseConfig: TableWidgetConfig = {
    id: 'test-table',
    type: 'Table',
    columns: [
      { id: 'col1', label: 'Name', field: 'name' },
      { id: 'col2', label: 'Age', field: 'age', format: 'number' },
    ],
    rowKey: 'id',
  };

  const sampleData = [
    { id: 1, name: 'John Doe', age: 30 },
    { id: 2, name: 'Jane Smith', age: 25 },
    { id: 3, name: 'Bob Johnson', age: 35 },
  ];

  it('renders table with headers', () => {
    render(<TableWidget config={baseConfig} bindings={{ value: sampleData }} />);

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Age' })).toBeInTheDocument();
  });

  it('renders table rows with data', () => {
    render(<TableWidget config={baseConfig} bindings={{ value: sampleData }} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('formats number columns', () => {
    render(<TableWidget config={baseConfig} bindings={{ value: sampleData }} />);

    // Numbers should be formatted without decimals by default
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<TableWidget config={{ ...baseConfig, loading: true }} bindings={{ value: [] }} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<TableWidget config={baseConfig} bindings={{ value: [] }} />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders custom empty message', () => {
    render(
      <TableWidget
        config={{ ...baseConfig, emptyMessage: 'No users found' }}
        bindings={{ value: [] }}
      />
    );

    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('handles row click event', async () => {
    const onClick = jest.fn();

    render(
      <TableWidget config={baseConfig} bindings={{ value: sampleData }} events={{ onClick }} />
    );

    const row = screen.getByText('John Doe').closest('tr');
    expect(row).toBeInTheDocument();

    await userEvent.click(row!);

    expect(onClick).toHaveBeenCalledWith(sampleData[0]);
  });

  it('supports keyboard navigation for row click', async () => {
    const onClick = jest.fn();

    render(
      <TableWidget config={baseConfig} bindings={{ value: sampleData }} events={{ onClick }} />
    );

    const row = screen.getByText('John Doe').closest('tr');
    expect(row).toBeInTheDocument();

    row?.focus();
    await userEvent.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledWith(sampleData[0]);
  });

  it('applies column alignment', () => {
    const configWithAlignment: TableWidgetConfig = {
      ...baseConfig,
      columns: [
        { id: 'col1', label: 'Name', field: 'name', align: 'left' },
        { id: 'col2', label: 'Age', field: 'age', align: 'center' },
        { id: 'col3', label: 'Score', field: 'score', align: 'right' },
      ],
    };

    const data = [{ id: 1, name: 'John', age: 30, score: 95 }];

    render(<TableWidget config={configWithAlignment} bindings={{ value: data }} />);

    const ageHeader = screen.getByRole('columnheader', { name: 'Age' });
    expect(ageHeader).toHaveClass('text-center');

    const scoreHeader = screen.getByRole('columnheader', { name: 'Score' });
    expect(scoreHeader).toHaveClass('text-right');
  });

  it('applies column widths', () => {
    const configWithWidths: TableWidgetConfig = {
      ...baseConfig,
      columns: [
        { id: 'col1', label: 'Name', field: 'name', width: '200px' },
        { id: 'col2', label: 'Age', field: 'age', width: '100px' },
      ],
    };

    render(<TableWidget config={configWithWidths} bindings={{ value: sampleData }} />);

    const nameHeader = screen.getByRole('columnheader', { name: 'Name' });
    expect(nameHeader).toHaveStyle({ width: '200px' });

    const ageHeader = screen.getByRole('columnheader', { name: 'Age' });
    expect(ageHeader).toHaveStyle({ width: '100px' });
  });

  it('formats currency columns', () => {
    const configWithCurrency: TableWidgetConfig = {
      ...baseConfig,
      columns: [
        { id: 'col1', label: 'Name', field: 'name' },
        { id: 'col2', label: 'Salary', field: 'salary', format: 'currency' },
      ],
    };

    const data = [{ id: 1, name: 'John', salary: 50000 }];

    render(<TableWidget config={configWithCurrency} bindings={{ value: data }} />);

    expect(screen.getByText('$50,000.00')).toBeInTheDocument();
  });

  it('formats date columns', () => {
    const configWithDate: TableWidgetConfig = {
      ...baseConfig,
      columns: [
        { id: 'col1', label: 'Name', field: 'name' },
        {
          id: 'col2',
          label: 'Birth Date',
          field: 'birthDate',
          format: 'date',
        },
      ],
    };

    const data = [{ id: 1, name: 'John', birthDate: new Date('1990-01-15') }];

    render(<TableWidget config={configWithDate} bindings={{ value: data }} />);

    // Default format is 'PP' which outputs like "Jan 15, 1990"
    expect(screen.getByText(/Jan 15, 1990/)).toBeInTheDocument();
  });

  it('applies zebra striping', () => {
    render(
      <TableWidget config={{ ...baseConfig, striped: true }} bindings={{ value: sampleData }} />
    );

    const rows = screen.getAllByRole('row');
    // Skip header row (index 0), check data rows
    const dataRows = rows.slice(1);

    // Second data row (index 1) should have striped class
    expect(dataRows[1]).toHaveClass('bg-muted/50');
  });

  it('disables hover when hoverable is false', () => {
    render(
      <TableWidget config={{ ...baseConfig, hoverable: false }} bindings={{ value: sampleData }} />
    );

    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1); // Skip header

    expect(dataRows[0]).toHaveClass('hover:bg-transparent');
  });

  it('renders table caption', () => {
    render(
      <TableWidget
        config={{ ...baseConfig, caption: 'User List' }}
        bindings={{ value: sampleData }}
      />
    );

    expect(screen.getByText('User List')).toBeInTheDocument();
  });

  it('handles missing data gracefully', () => {
    render(<TableWidget config={baseConfig} />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('uses rowKey for React keys', () => {
    const { container } = render(
      <TableWidget config={baseConfig} bindings={{ value: sampleData }} />
    );

    const rows = container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(3);
  });

  it('handles null/undefined values in cells', () => {
    const dataWithNulls = [{ id: 1, name: 'John', age: null }];

    render(<TableWidget config={baseConfig} bindings={{ value: dataWithNulls }} />);

    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument(); // Em dash for null
  });

  it('makes rows clickable with cursor pointer when onClick is provided', () => {
    const onClick = jest.fn();

    render(
      <TableWidget config={baseConfig} bindings={{ value: sampleData }} events={{ onClick }} />
    );

    const row = screen.getByText('John Doe').closest('tr');
    expect(row).toHaveClass('cursor-pointer');
  });

  it('does not make rows clickable when onClick is not provided', () => {
    render(<TableWidget config={baseConfig} bindings={{ value: sampleData }} />);

    const row = screen.getByText('John Doe').closest('tr');
    expect(row).not.toHaveClass('cursor-pointer');
  });

  it('has proper accessibility attributes for clickable rows', () => {
    const onClick = jest.fn();

    render(
      <TableWidget config={baseConfig} bindings={{ value: sampleData }} events={{ onClick }} />
    );

    const row = screen.getByText('John Doe').closest('tr');
    expect(row).toHaveAttribute('role', 'button');
    expect(row).toHaveAttribute('tabIndex', '0');
  });

  it('formats numbers with custom decimals', () => {
    const configWithDecimals: TableWidgetConfig = {
      ...baseConfig,
      columns: [
        { id: 'col1', label: 'Name', field: 'name' },
        {
          id: 'col2',
          label: 'Score',
          field: 'score',
          format: 'number',
          formatOptions: { decimals: 2 },
        },
      ],
    };

    const data = [{ id: 1, name: 'John', score: 95.5 }];

    render(<TableWidget config={configWithDecimals} bindings={{ value: data }} />);

    expect(screen.getByText('95.50')).toBeInTheDocument();
  });
});
