/**
 * SectionWidget Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionWidget } from './SectionWidget';
import type { SectionWidgetConfig } from './types';

describe('SectionWidget', () => {
  const baseConfig: SectionWidgetConfig = {
    id: 'test-section',
    type: 'Section',
  };

  it('renders section container', () => {
    const { container } = render(<SectionWidget config={baseConfig} />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('renders title', () => {
    const config: SectionWidgetConfig = {
      ...baseConfig,
      title: 'Test Section Title',
    };

    render(<SectionWidget config={config} />);
    expect(screen.getByText('Test Section Title')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    const config: SectionWidgetConfig = {
      ...baseConfig,
      title: 'Test Section',
      subtitle: 'Test Section Subtitle',
    };

    render(<SectionWidget config={config} />);
    expect(screen.getByText('Test Section Subtitle')).toBeInTheDocument();
  });

  it('renders content from children', () => {
    render(
      <SectionWidget config={baseConfig}>
        <div>Section content</div>
      </SectionWidget>
    );

    expect(screen.getByText('Section content')).toBeInTheDocument();
  });

  it('renders content from bindings', () => {
    render(<SectionWidget config={baseConfig} bindings={{ content: <div>Bound content</div> }} />);

    expect(screen.getByText('Bound content')).toBeInTheDocument();
  });

  it('renders with border using Card component', () => {
    const config: SectionWidgetConfig = {
      ...baseConfig,
      title: 'Bordered Section',
      bordered: true,
    };

    const { container } = render(<SectionWidget config={config} />);

    // Should render Card component
    expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
  });

  it('renders without border as plain section', () => {
    const config: SectionWidgetConfig = {
      ...baseConfig,
      title: 'Plain Section',
      bordered: false,
    };

    const { container } = render(<SectionWidget config={config} />);

    // Should render section element
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('renders collapse button when collapsible', () => {
    const config: SectionWidgetConfig = {
      ...baseConfig,
      title: 'Collapsible Section',
      collapsible: true,
    };

    render(<SectionWidget config={config} />);
    expect(screen.getByText('Collapse')).toBeInTheDocument();
  });

  it('toggles content when collapse button is clicked', async () => {
    const config: SectionWidgetConfig = {
      ...baseConfig,
      title: 'Collapsible Section',
      collapsible: true,
    };

    render(
      <SectionWidget config={config}>
        <div>Collapsible content</div>
      </SectionWidget>
    );

    // Content should be visible initially
    expect(screen.getByText('Collapsible content')).toBeInTheDocument();

    // Click collapse button
    const collapseButton = screen.getByText('Collapse');
    await userEvent.click(collapseButton);

    // Content should be hidden
    expect(screen.queryByText('Collapsible content')).not.toBeInTheDocument();
    expect(screen.getByText('Expand')).toBeInTheDocument();

    // Click expand button
    const expandButton = screen.getByText('Expand');
    await userEvent.click(expandButton);

    // Content should be visible again
    expect(screen.getByText('Collapsible content')).toBeInTheDocument();
  });

  it('starts collapsed when defaultCollapsed is true', () => {
    const config: SectionWidgetConfig = {
      ...baseConfig,
      title: 'Collapsed Section',
      collapsible: true,
      defaultCollapsed: true,
    };

    render(
      <SectionWidget config={config}>
        <div>Hidden content</div>
      </SectionWidget>
    );

    // Content should be hidden initially
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    expect(screen.getByText('Expand')).toBeInTheDocument();
  });

  it('calls onCollapse when collapsed', async () => {
    const onCollapse = jest.fn();
    const config: SectionWidgetConfig = {
      ...baseConfig,
      title: 'Test',
      collapsible: true,
    };

    render(
      <SectionWidget config={config} events={{ onCollapse }}>
        <div>Content</div>
      </SectionWidget>
    );

    const collapseButton = screen.getByText('Collapse');
    await userEvent.click(collapseButton);

    expect(onCollapse).toHaveBeenCalledTimes(1);
  });

  it('calls onExpand when expanded', async () => {
    const onExpand = jest.fn();
    const config: SectionWidgetConfig = {
      ...baseConfig,
      title: 'Test',
      collapsible: true,
      defaultCollapsed: true,
    };

    render(
      <SectionWidget config={config} events={{ onExpand }}>
        <div>Content</div>
      </SectionWidget>
    );

    const expandButton = screen.getByText('Expand');
    await userEvent.click(expandButton);

    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it('applies padding classes', () => {
    const { container, rerender } = render(
      <SectionWidget config={{ ...baseConfig, padding: 'sm' }} />
    );

    expect(container.querySelector('.p-3')).toBeInTheDocument();

    rerender(<SectionWidget config={{ ...baseConfig, padding: 'lg' }} />);
    expect(container.querySelector('.p-8')).toBeInTheDocument();
  });

  it('has proper accessibility attributes for collapsible', () => {
    const config: SectionWidgetConfig = {
      ...baseConfig,
      title: 'Test',
      collapsible: true,
    };

    render(<SectionWidget config={config} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-label', 'Collapse section');
  });

  it('renders without title or subtitle', () => {
    render(
      <SectionWidget config={baseConfig}>
        <div>Just content</div>
      </SectionWidget>
    );

    expect(screen.getByText('Just content')).toBeInTheDocument();
  });
});
