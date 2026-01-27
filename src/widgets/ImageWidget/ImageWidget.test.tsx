/**
 * ImageWidget Component Tests
 */

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ImageWidget } from './ImageWidget';
import type { ImageWidgetConfig } from './types';

describe('ImageWidget', () => {
  const baseConfig: ImageWidgetConfig = {
    id: 'image-1',
    type: 'Image',
    src: 'https://example.com/image.jpg',
    alt: 'Test image',
  };

  it('renders image with src and alt', () => {
    render(<ImageWidget config={baseConfig} />);
    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('applies default lazy loading', () => {
    render(<ImageWidget config={baseConfig} />);
    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('disables lazy loading when lazy is false', () => {
    const config: ImageWidgetConfig = {
      ...baseConfig,
      lazy: false,
    };
    render(<ImageWidget config={config} />);
    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('applies aspect ratio classes', () => {
    const config: ImageWidgetConfig = {
      ...baseConfig,
      aspectRatio: '16:9',
    };
    render(<ImageWidget config={config} />);
    const img = screen.getByAltText('Test image');
    expect(img).toHaveClass('aspect-video');
  });

  it('applies square aspect ratio', () => {
    const config: ImageWidgetConfig = {
      ...baseConfig,
      aspectRatio: '1:1',
    };
    render(<ImageWidget config={config} />);
    const img = screen.getByAltText('Test image');
    expect(img).toHaveClass('aspect-square');
  });

  it('applies object fit cover by default', () => {
    render(<ImageWidget config={baseConfig} />);
    const img = screen.getByAltText('Test image');
    expect(img).toHaveClass('object-cover');
  });

  it('applies object fit contain', () => {
    const config: ImageWidgetConfig = {
      ...baseConfig,
      objectFit: 'contain',
    };
    render(<ImageWidget config={config} />);
    const img = screen.getByAltText('Test image');
    expect(img).toHaveClass('object-contain');
  });

  it('applies rounded classes', () => {
    const config: ImageWidgetConfig = {
      ...baseConfig,
      rounded: 'full',
    };
    const { container } = render(<ImageWidget config={config} />);
    const imageContainer = container.firstChild?.firstChild as HTMLElement;
    expect(imageContainer).toHaveClass('rounded-full');
  });

  it('applies custom width and height', () => {
    const config: ImageWidgetConfig = {
      ...baseConfig,
      width: '300px',
      height: '200px',
    };
    const { container } = render(<ImageWidget config={config} />);
    const imageContainer = container.firstChild?.firstChild as HTMLElement;
    expect(imageContainer).toHaveStyle({ width: '300px', height: '200px' });
  });

  it('renders caption when provided', () => {
    const config: ImageWidgetConfig = {
      ...baseConfig,
      caption: 'Beautiful landscape',
    };
    render(<ImageWidget config={config} />);
    expect(screen.getByText('Beautiful landscape')).toBeInTheDocument();
  });

  it('does not render caption when not provided', () => {
    render(<ImageWidget config={baseConfig} />);
    expect(screen.queryByText('Beautiful landscape')).not.toBeInTheDocument();
  });

  it('handles click when clickable is true', () => {
    const mockOnClick = jest.fn();
    const config: ImageWidgetConfig = {
      ...baseConfig,
      clickable: true,
    };
    const events = { onClick: mockOnClick };

    render(<ImageWidget config={config} events={events} />);
    const container = screen.getByRole('button');
    fireEvent.click(container);

    expect(mockOnClick).toHaveBeenCalledWith({ imageUrl: 'https://example.com/image.jpg' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events when clickable', () => {
    const mockOnClick = jest.fn();
    const config: ImageWidgetConfig = {
      ...baseConfig,
      clickable: true,
    };
    const events = { onClick: mockOnClick };

    render(<ImageWidget config={config} events={events} />);
    const container = screen.getByRole('button');

    // Test Enter key
    fireEvent.keyDown(container, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    // Test Space key
    fireEvent.keyDown(container, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  it('has accessible label when clickable', () => {
    const config: ImageWidgetConfig = {
      ...baseConfig,
      clickable: true,
    };

    render(<ImageWidget config={config} />);
    const container = screen.getByRole('button');

    expect(container).toHaveAttribute('aria-label', 'View Test image');
  });

  it('does not respond to click when clickable is false', () => {
    const mockOnClick = jest.fn();
    const config: ImageWidgetConfig = {
      ...baseConfig,
      clickable: false,
    };
    const events = { onClick: mockOnClick };

    const { container } = render(<ImageWidget config={config} events={events} />);
    const imageContainer = container.querySelector('div > div');
    if (imageContainer) {
      fireEvent.click(imageContainer);
    }

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('applies custom className from bindings', () => {
    const bindings = { className: 'custom-image-class' };
    const { container } = render(<ImageWidget config={baseConfig} bindings={bindings} />);
    const imageContainer = container.firstChild?.firstChild as HTMLElement;
    expect(imageContainer).toHaveClass('custom-image-class');
  });

  it('applies hover styles when clickable', () => {
    const config: ImageWidgetConfig = {
      ...baseConfig,
      clickable: true,
    };
    const { container } = render(<ImageWidget config={config} />);
    const imageContainer = container.firstChild?.firstChild as HTMLElement;
    expect(imageContainer).toHaveClass('cursor-pointer', 'hover:opacity-90', 'transition-opacity');
  });

  it('does not apply hover styles when not clickable', () => {
    const { container } = render(<ImageWidget config={baseConfig} />);
    const imageContainer = container.firstChild?.firstChild as HTMLElement;
    expect(imageContainer).not.toHaveClass('cursor-pointer');
  });

  it('sets role and tabIndex when clickable', () => {
    const config: ImageWidgetConfig = {
      ...baseConfig,
      clickable: true,
    };
    render(<ImageWidget config={config} />);
    const container = screen.getByRole('button');
    expect(container).toHaveAttribute('tabIndex', '0');
  });

  it('does not set role when not clickable', () => {
    render(<ImageWidget config={baseConfig} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
