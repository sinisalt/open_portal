/**
 * CardWidget Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardWidget } from './CardWidget';
import type { CardWidgetConfig } from './types';

describe('CardWidget', () => {
  const baseConfig: CardWidgetConfig = {
    id: 'test-card',
    type: 'Card',
  };

  it('renders empty card with no props', () => {
    const { container } = render(<CardWidget config={baseConfig} />);
    expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
  });

  it('renders title and subtitle', () => {
    const config: CardWidgetConfig = {
      ...baseConfig,
      title: 'Test Card Title',
      subtitle: 'Test Card Subtitle',
    };

    render(<CardWidget config={config} />);

    expect(screen.getByText('Test Card Title')).toBeInTheDocument();
    expect(screen.getByText('Test Card Subtitle')).toBeInTheDocument();
  });

  it('renders content from children', () => {
    render(
      <CardWidget config={baseConfig}>
        <div>Card content</div>
      </CardWidget>
    );

    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders content from bindings', () => {
    render(<CardWidget config={baseConfig} bindings={{ content: <div>Bound content</div> }} />);

    expect(screen.getByText('Bound content')).toBeInTheDocument();
  });

  it('renders image when provided', () => {
    const config: CardWidgetConfig = {
      ...baseConfig,
      image: 'https://example.com/image.jpg',
      title: 'Card with Image',
    };

    render(<CardWidget config={config} />);

    const img = screen.getByAltText('Card with Image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders actions in footer', () => {
    const config: CardWidgetConfig = {
      ...baseConfig,
      title: 'Card with Actions',
      actions: [
        { id: 'action1', label: 'Save', actionId: 'save-action' },
        { id: 'action2', label: 'Cancel', actionId: 'cancel-action', variant: 'outline' },
      ],
    };

    render(<CardWidget config={config} />);

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onActionClick when action button is clicked', async () => {
    const onActionClick = jest.fn();
    const config: CardWidgetConfig = {
      ...baseConfig,
      actions: [{ id: 'action1', label: 'Click Me', actionId: 'test-action' }],
    };

    render(<CardWidget config={config} events={{ onActionClick }} />);

    const button = screen.getByText('Click Me');
    await userEvent.click(button);

    expect(onActionClick).toHaveBeenCalledWith('test-action');
  });

  it('applies elevation classes', () => {
    const { container, rerender } = render(
      <CardWidget config={{ ...baseConfig, elevation: 'none' }} />
    );

    expect(container.querySelector('.shadow-none')).toBeInTheDocument();

    rerender(<CardWidget config={{ ...baseConfig, elevation: 'lg' }} />);
    expect(container.querySelector('.shadow-lg')).toBeInTheDocument();
  });

  it('hides border when bordered is false', () => {
    const { container } = render(<CardWidget config={{ ...baseConfig, bordered: false }} />);

    expect(container.querySelector('.border-0')).toBeInTheDocument();
  });

  it('applies padding configuration', () => {
    const config: CardWidgetConfig = {
      ...baseConfig,
      title: 'Test',
      padding: 'sm',
    };

    const { container } = render(<CardWidget config={config} />);

    // Check that padding classes are applied
    expect(container.querySelector('.p-3')).toBeInTheDocument();
  });

  it('handles multiple actions with different variants', () => {
    const config: CardWidgetConfig = {
      ...baseConfig,
      actions: [
        { id: 'primary', label: 'Primary', actionId: 'primary', variant: 'default' },
        { id: 'secondary', label: 'Secondary', actionId: 'secondary', variant: 'secondary' },
        { id: 'destructive', label: 'Delete', actionId: 'delete', variant: 'destructive' },
      ],
    };

    render(<CardWidget config={config} />);

    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Secondary')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
