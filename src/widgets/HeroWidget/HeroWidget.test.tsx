/**
 * HeroWidget Component Tests
 */

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HeroWidget } from './HeroWidget';
import type { HeroWidgetConfig } from './types';

describe('HeroWidget', () => {
  const baseConfig: HeroWidgetConfig = {
    id: 'hero-1',
    type: 'Hero',
    title: 'Welcome to OpenPortal',
  };

  it('renders title', () => {
    render(<HeroWidget config={baseConfig} />);
    expect(screen.getByText('Welcome to OpenPortal')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    const config: HeroWidgetConfig = {
      ...baseConfig,
      subtitle: 'Build amazing applications',
    };
    render(<HeroWidget config={config} />);
    expect(screen.getByText('Build amazing applications')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<HeroWidget config={baseConfig} />);
    expect(screen.queryByText('Build amazing applications')).not.toBeInTheDocument();
  });

  it('applies custom height', () => {
    const config: HeroWidgetConfig = {
      ...baseConfig,
      height: '80vh',
    };
    const { container } = render(<HeroWidget config={config} />);
    const heroElement = container.firstChild as HTMLElement;
    expect(heroElement).toHaveStyle({ height: '80vh' });
  });

  it('applies default height when not specified', () => {
    const { container } = render(<HeroWidget config={baseConfig} />);
    const heroElement = container.firstChild as HTMLElement;
    expect(heroElement).toHaveStyle({ height: '60vh' });
  });

  it('applies text alignment classes', () => {
    const config: HeroWidgetConfig = {
      ...baseConfig,
      textAlign: 'left',
    };
    const { container } = render(<HeroWidget config={config} />);
    const heroElement = container.firstChild as HTMLElement;
    expect(heroElement).toHaveClass('text-left', 'items-start');
  });

  it('renders CTA buttons', () => {
    const config: HeroWidgetConfig = {
      ...baseConfig,
      buttons: [
        { id: 'btn-1', label: 'Get Started', actionId: 'get-started' },
        { id: 'btn-2', label: 'Learn More', actionId: 'learn-more', variant: 'outline' },
      ],
    };
    render(<HeroWidget config={config} />);
    expect(screen.getByText('Get Started')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  it('calls onActionClick when button is clicked', () => {
    const mockOnActionClick = jest.fn();
    const config: HeroWidgetConfig = {
      ...baseConfig,
      buttons: [{ id: 'btn-1', label: 'Click Me', actionId: 'test-action' }],
    };
    const events = { onActionClick: mockOnActionClick };

    render(<HeroWidget config={config} events={events} />);
    const button = screen.getByText('Click Me');
    fireEvent.click(button);

    expect(mockOnActionClick).toHaveBeenCalledWith('test-action');
    expect(mockOnActionClick).toHaveBeenCalledTimes(1);
  });

  it('renders background image when provided', () => {
    const config: HeroWidgetConfig = {
      ...baseConfig,
      backgroundImage: 'https://example.com/bg.jpg',
    };
    const { container } = render(<HeroWidget config={config} />);
    const bgElement = container.querySelector('.bg-cover');
    expect(bgElement).toBeInTheDocument();
    expect(bgElement).toHaveStyle({
      backgroundImage: 'url(https://example.com/bg.jpg)',
    });
  });

  it('applies overlay with correct opacity', () => {
    const config: HeroWidgetConfig = {
      ...baseConfig,
      backgroundImage: 'https://example.com/bg.jpg',
      overlayOpacity: 60,
      overlayColor: '#000000',
    };
    const { container } = render(<HeroWidget config={config} />);
    const overlayElements = container.querySelectorAll('.absolute.inset-0');
    // Find the overlay (not the background image)
    const overlay = Array.from(overlayElements).find(
      el => (el as HTMLElement).style.opacity !== ''
    );
    expect(overlay).toHaveStyle({ opacity: '0.6' });
  });

  it('applies custom className from bindings', () => {
    const bindings = { className: 'custom-hero-class' };
    const { container } = render(<HeroWidget config={baseConfig} bindings={bindings} />);
    const heroElement = container.firstChild as HTMLElement;
    expect(heroElement).toHaveClass('custom-hero-class');
  });

  it('applies light text color', () => {
    const config: HeroWidgetConfig = {
      ...baseConfig,
      textColor: 'light',
    };
    const { container } = render(<HeroWidget config={config} />);
    const contentElement = container.querySelector('.z-10');
    expect(contentElement).toHaveClass('text-white');
  });

  it('applies dark text color', () => {
    const config: HeroWidgetConfig = {
      ...baseConfig,
      textColor: 'dark',
    };
    const { container } = render(<HeroWidget config={config} />);
    const contentElement = container.querySelector('.z-10');
    expect(contentElement).toHaveClass('text-gray-900');
  });

  it('auto-detects text color based on background image', () => {
    const config: HeroWidgetConfig = {
      ...baseConfig,
      backgroundImage: 'https://example.com/bg.jpg',
      textColor: 'auto',
    };
    const { container } = render(<HeroWidget config={config} />);
    const contentElement = container.querySelector('.z-10');
    expect(contentElement).toHaveClass('text-white');
  });

  it('handles button with custom size', () => {
    const config: HeroWidgetConfig = {
      ...baseConfig,
      buttons: [{ id: 'btn-1', label: 'Large Button', actionId: 'action-1', size: 'lg' }],
    };
    render(<HeroWidget config={config} />);
    expect(screen.getByText('Large Button')).toBeInTheDocument();
  });
});
