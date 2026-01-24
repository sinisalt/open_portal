/**
 * ModalWidget Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalWidget } from './ModalWidget';
import type { ModalWidgetConfig } from './types';

describe('ModalWidget', () => {
  const baseConfig: ModalWidgetConfig = {
    id: 'test-modal',
    type: 'Modal',
  };

  it('renders nothing when closed', () => {
    const { container } = render(<ModalWidget config={baseConfig} bindings={{ isOpen: false }} />);

    // Modal should not be visible in the document when closed
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('renders modal when open', () => {
    render(
      <ModalWidget config={baseConfig} bindings={{ isOpen: true }}>
        <div>Modal content</div>
      </ModalWidget>
    );

    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('renders title and description', () => {
    const config: ModalWidgetConfig = {
      ...baseConfig,
      title: 'Test Modal',
      description: 'This is a test modal description',
    };

    render(<ModalWidget config={config} bindings={{ isOpen: true }} />);

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('This is a test modal description')).toBeInTheDocument();
  });

  it('renders content from bindings', () => {
    render(
      <ModalWidget
        config={baseConfig}
        bindings={{ isOpen: true, content: <div>Bound content</div> }}
      />
    );

    expect(screen.getByText('Bound content')).toBeInTheDocument();
  });

  it('renders content from children when bindings.content is not provided', () => {
    render(
      <ModalWidget config={baseConfig} bindings={{ isOpen: true }}>
        <div>Children content</div>
      </ModalWidget>
    );

    expect(screen.getByText('Children content')).toBeInTheDocument();
  });

  it('renders action buttons in footer', () => {
    const config: ModalWidgetConfig = {
      ...baseConfig,
      title: 'Modal with Actions',
      actions: [
        { id: 'save', label: 'Save', actionId: 'save-action' },
        { id: 'cancel', label: 'Cancel', actionId: 'cancel-action', variant: 'outline' },
      ],
    };

    render(<ModalWidget config={config} bindings={{ isOpen: true }} />);

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onActionClick when action button is clicked', async () => {
    const onActionClick = jest.fn();
    const config: ModalWidgetConfig = {
      ...baseConfig,
      actions: [{ id: 'test', label: 'Test Action', actionId: 'test-action' }],
    };

    render(<ModalWidget config={config} bindings={{ isOpen: true }} events={{ onActionClick }} />);

    const button = screen.getByText('Test Action');
    await userEvent.click(button);

    expect(onActionClick).toHaveBeenCalledWith('test-action');
  });

  it('renders close button by default', () => {
    render(<ModalWidget config={baseConfig} bindings={{ isOpen: true }} />);

    // Check for close button (X)
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('hides close button when closable is false', () => {
    const config: ModalWidgetConfig = {
      ...baseConfig,
      closable: false,
    };

    render(<ModalWidget config={config} bindings={{ isOpen: true }} />);

    // Close button should not be present
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn();

    render(<ModalWidget config={baseConfig} bindings={{ isOpen: true }} events={{ onClose }} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('does not show footer when showFooter is false', () => {
    const config: ModalWidgetConfig = {
      ...baseConfig,
      title: 'No Footer Modal',
      showFooter: false,
      actions: [{ id: 'action1', label: 'Action', actionId: 'action' }],
    };

    render(<ModalWidget config={config} bindings={{ isOpen: true }} />);

    // Actions should not be rendered
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
  });

  it('does not show footer when no actions provided', () => {
    const config: ModalWidgetConfig = {
      ...baseConfig,
      title: 'No Actions Modal',
    };

    const { container } = render(<ModalWidget config={config} bindings={{ isOpen: true }} />);

    // Check that footer is not rendered
    expect(container.querySelector('[class*="flex-col-reverse"]')).not.toBeInTheDocument();
  });

  it('applies different size variants', () => {
    const { rerender } = render(
      <ModalWidget config={{ ...baseConfig, size: 'sm' }} bindings={{ isOpen: true }} />
    );

    // Dialog is rendered in a portal, check document body
    const dialogContent = document.querySelector('[role="dialog"]');
    expect(dialogContent).toBeInTheDocument();
    expect(dialogContent?.classList.contains('sm:max-w-sm')).toBe(true);

    rerender(<ModalWidget config={{ ...baseConfig, size: 'lg' }} bindings={{ isOpen: true }} />);

    const dialogContentLg = document.querySelector('[role="dialog"]');
    expect(dialogContentLg?.classList.contains('sm:max-w-lg')).toBe(true);

    rerender(<ModalWidget config={{ ...baseConfig, size: 'xl' }} bindings={{ isOpen: true }} />);

    const dialogContentXl = document.querySelector('[role="dialog"]');
    expect(dialogContentXl?.classList.contains('sm:max-w-xl')).toBe(true);
  });

  it('renders multiple action buttons with different variants', () => {
    const config: ModalWidgetConfig = {
      ...baseConfig,
      actions: [
        { id: 'primary', label: 'Primary', actionId: 'primary', variant: 'default' },
        { id: 'secondary', label: 'Secondary', actionId: 'secondary', variant: 'secondary' },
        { id: 'destructive', label: 'Delete', actionId: 'delete', variant: 'destructive' },
      ],
    };

    render(<ModalWidget config={config} bindings={{ isOpen: true }} />);

    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Secondary')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('handles modal without title or description', () => {
    render(
      <ModalWidget config={baseConfig} bindings={{ isOpen: true }}>
        <div>Content only</div>
      </ModalWidget>
    );

    expect(screen.getByText('Content only')).toBeInTheDocument();
  });
});
