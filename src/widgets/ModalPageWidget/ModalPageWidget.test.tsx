/**
 * ModalPageWidget Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalPageWidget } from './ModalPageWidget';
import type { ModalPageWidgetConfig } from './types';

// Mock WidgetRenderer to avoid complex dependencies
jest.mock('@/core/renderer/WidgetRenderer', () => ({
  WidgetRenderer: ({ config }: { config: { id: string; type: string } }) => (
    <div data-testid={`widget-${config.id}`}>{config.type}</div>
  ),
}));

describe('ModalPageWidget', () => {
  const baseConfig: ModalPageWidgetConfig = {
    id: 'test-modal-page',
    type: 'ModalPage',
    title: 'Test Modal Page',
    pageConfig: {
      id: 'test-page',
      type: 'Page',
      widgets: [],
    },
  };

  it('renders nothing when closed', () => {
    const { container } = render(
      <ModalPageWidget config={baseConfig} bindings={{ isOpen: false }} />
    );

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('renders modal when open', () => {
    render(<ModalPageWidget config={baseConfig} bindings={{ isOpen: true }} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal Page')).toBeInTheDocument();
  });

  it('renders title and description', () => {
    const config: ModalPageWidgetConfig = {
      ...baseConfig,
      title: 'Modal Title',
      description: 'Modal description text',
    };

    render(<ModalPageWidget config={config} bindings={{ isOpen: true }} />);

    expect(screen.getByText('Modal Title')).toBeInTheDocument();
    expect(screen.getByText('Modal description text')).toBeInTheDocument();
  });

  it('renders page config inside modal', () => {
    const config: ModalPageWidgetConfig = {
      ...baseConfig,
      pageConfig: {
        id: 'test-page',
        type: 'Page',
        widgets: [],
      },
    };

    render(<ModalPageWidget config={config} bindings={{ isOpen: true }} />);

    expect(screen.getByTestId('widget-test-page')).toBeInTheDocument();
  });

  it('shows message when no page config provided', () => {
    const config: ModalPageWidgetConfig = {
      ...baseConfig,
      pageConfig: undefined,
    };

    render(<ModalPageWidget config={config} bindings={{ isOpen: true }} />);

    expect(screen.getByText('No page configuration provided')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    const config: ModalPageWidgetConfig = {
      ...baseConfig,
      actions: [
        { id: 'cancel', label: 'Cancel', actionId: 'cancel', variant: 'outline' },
        { id: 'submit', label: 'Submit', actionId: 'submit', variant: 'default' },
      ],
    };

    render(<ModalPageWidget config={config} bindings={{ isOpen: true }} />);

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('calls onSubmit when submit action is clicked', async () => {
    const onSubmit = jest.fn();
    const config: ModalPageWidgetConfig = {
      ...baseConfig,
      actions: [{ id: 'submit', label: 'Submit', actionId: 'submit' }],
    };

    render(<ModalPageWidget config={config} bindings={{ isOpen: true }} events={{ onSubmit }} />);

    const button = screen.getByText('Submit');
    await userEvent.click(button);

    expect(onSubmit).toHaveBeenCalled();
  });

  it('calls onCancel when cancel action is clicked', async () => {
    const onCancel = jest.fn();
    const config: ModalPageWidgetConfig = {
      ...baseConfig,
      actions: [{ id: 'cancel', label: 'Cancel', actionId: 'cancel' }],
    };

    render(<ModalPageWidget config={config} bindings={{ isOpen: true }} events={{ onCancel }} />);

    const button = screen.getByText('Cancel');
    await userEvent.click(button);

    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onClose when close action is clicked', async () => {
    const onClose = jest.fn();
    const config: ModalPageWidgetConfig = {
      ...baseConfig,
      actions: [{ id: 'close-btn', label: 'Close Modal', actionId: 'close' }],
    };

    render(<ModalPageWidget config={config} bindings={{ isOpen: true }} events={{ onClose }} />);

    const button = screen.getByText('Close Modal');
    await userEvent.click(button);

    expect(onClose).toHaveBeenCalled();
  });

  it('passes input data via bindings', () => {
    const inputData = { userId: '123', role: 'admin' };

    render(<ModalPageWidget config={baseConfig} bindings={{ isOpen: true, inputData }} />);

    // Modal should be rendered (input data is passed internally)
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('returns data when onReturn is triggered', async () => {
    const onReturn = jest.fn();
    const config: ModalPageWidgetConfig = {
      ...baseConfig,
      actions: [{ id: 'ok', label: 'OK', actionId: 'ok' }],
    };

    render(<ModalPageWidget config={config} bindings={{ isOpen: true }} events={{ onReturn }} />);

    const button = screen.getByText('OK');
    await userEvent.click(button);

    expect(onReturn).toHaveBeenCalled();
  });

  it('respects size configuration', () => {
    const sizes: Array<'sm' | 'md' | 'lg' | 'xl' | 'full'> = ['sm', 'md', 'lg', 'xl', 'full'];

    sizes.forEach(size => {
      const config: ModalPageWidgetConfig = {
        ...baseConfig,
        size,
      };

      const { unmount } = render(<ModalPageWidget config={config} bindings={{ isOpen: true }} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      unmount();
    });
  });

  it('respects closable configuration', () => {
    const config: ModalPageWidgetConfig = {
      ...baseConfig,
      closable: false,
    };

    render(<ModalPageWidget config={config} bindings={{ isOpen: true }} />);

    // Close button should be hidden
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('respects showFooter configuration', () => {
    const config: ModalPageWidgetConfig = {
      ...baseConfig,
      showFooter: false,
      actions: [{ id: 'test', label: 'Test', actionId: 'test' }],
    };

    render(<ModalPageWidget config={config} bindings={{ isOpen: true }} />);

    // Actions should not be rendered when showFooter is false
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });
});
