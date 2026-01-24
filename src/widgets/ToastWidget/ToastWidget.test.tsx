/**
 * ToastWidget Tests
 */

import { render, waitFor } from '@testing-library/react';
import { ToastWidget } from './ToastWidget';
import { toastManager } from './toastManager';
import type { ToastWidgetConfig } from './types';

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(() => 'toast-id-1'),
    error: jest.fn(() => 'toast-id-2'),
    warning: jest.fn(() => 'toast-id-3'),
    info: jest.fn(() => 'toast-id-4'),
    dismiss: jest.fn(),
  },
}));

// Import mocked sonner
import { toast as sonnerToast } from 'sonner';

describe('ToastWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseConfig: ToastWidgetConfig = {
    id: 'test-toast',
    type: 'Toast',
    message: 'Test message',
    variant: 'info',
  };

  it('renders without crashing', () => {
    const { container } = render(<ToastWidget config={baseConfig} />);
    expect(container).toBeInTheDocument();
  });

  it('shows info toast on mount', () => {
    render(<ToastWidget config={baseConfig} />);

    expect(sonnerToast.info).toHaveBeenCalledWith(
      'Test message',
      expect.objectContaining({
        duration: 3000,
      })
    );
  });

  it('shows success toast', () => {
    const config: ToastWidgetConfig = {
      ...baseConfig,
      variant: 'success',
    };

    render(<ToastWidget config={config} />);

    expect(sonnerToast.success).toHaveBeenCalledWith('Test message', expect.any(Object));
  });

  it('shows error toast', () => {
    const config: ToastWidgetConfig = {
      ...baseConfig,
      variant: 'error',
    };

    render(<ToastWidget config={config} />);

    expect(sonnerToast.error).toHaveBeenCalledWith('Test message', expect.any(Object));
  });

  it('shows warning toast', () => {
    const config: ToastWidgetConfig = {
      ...baseConfig,
      variant: 'warning',
    };

    render(<ToastWidget config={config} />);

    expect(sonnerToast.warning).toHaveBeenCalledWith('Test message', expect.any(Object));
  });

  it('passes description to toast', () => {
    const config: ToastWidgetConfig = {
      ...baseConfig,
      description: 'Test description',
    };

    render(<ToastWidget config={config} />);

    expect(sonnerToast.info).toHaveBeenCalledWith(
      'Test message',
      expect.objectContaining({
        description: 'Test description',
      })
    );
  });

  it('passes custom duration to toast', () => {
    const config: ToastWidgetConfig = {
      ...baseConfig,
      duration: 5000,
    };

    render(<ToastWidget config={config} />);

    expect(sonnerToast.info).toHaveBeenCalledWith(
      'Test message',
      expect.objectContaining({
        duration: 5000,
      })
    );
  });

  it('passes action button to toast', () => {
    const config: ToastWidgetConfig = {
      ...baseConfig,
      action: {
        label: 'Undo',
        actionId: 'undo-action',
      },
    };

    render(<ToastWidget config={config} />);

    expect(sonnerToast.info).toHaveBeenCalledWith(
      'Test message',
      expect.objectContaining({
        action: expect.objectContaining({
          label: 'Undo',
        }),
      })
    );
  });

  it('calls onActionClick when action is clicked', () => {
    const onActionClick = jest.fn();
    const config: ToastWidgetConfig = {
      ...baseConfig,
      action: {
        label: 'Undo',
        actionId: 'undo-action',
      },
    };

    render(<ToastWidget config={config} events={{ onActionClick }} />);

    // Get the action.onClick function that was passed to sonner
    const callArgs = (sonnerToast.info as jest.Mock).mock.calls[0];
    const actionHandler = callArgs[1].action.onClick;

    // Call the action handler
    actionHandler();

    expect(onActionClick).toHaveBeenCalledWith('undo-action');
  });

  it('calls onClose when toast is dismissed', () => {
    const onClose = jest.fn();

    render(<ToastWidget config={baseConfig} events={{ onClose }} />);

    // Get the onDismiss function that was passed to sonner
    const callArgs = (sonnerToast.info as jest.Mock).mock.calls[0];
    const dismissHandler = callArgs[1].onDismiss;

    // Call the dismiss handler
    dismissHandler();

    expect(onClose).toHaveBeenCalled();
  });

  it('dismisses toast on unmount', async () => {
    const { unmount } = render(<ToastWidget config={baseConfig} />);

    // Unmount component
    unmount();

    await waitFor(() => {
      expect(sonnerToast.dismiss).toHaveBeenCalledWith('toast-id-4');
    });
  });
});

describe('toastManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows success toast', () => {
    toastManager.success('Success message');

    expect(sonnerToast.success).toHaveBeenCalledWith(
      'Success message',
      expect.objectContaining({
        duration: 3000,
      })
    );
  });

  it('shows error toast', () => {
    toastManager.error('Error message');

    expect(sonnerToast.error).toHaveBeenCalledWith(
      'Error message',
      expect.objectContaining({
        duration: 3000,
      })
    );
  });

  it('shows warning toast', () => {
    toastManager.warning('Warning message');

    expect(sonnerToast.warning).toHaveBeenCalledWith(
      'Warning message',
      expect.objectContaining({
        duration: 3000,
      })
    );
  });

  it('shows info toast', () => {
    toastManager.info('Info message');

    expect(sonnerToast.info).toHaveBeenCalledWith(
      'Info message',
      expect.objectContaining({
        duration: 3000,
      })
    );
  });

  it('shows toast with custom options', () => {
    toastManager.show({
      message: 'Custom toast',
      variant: 'success',
      description: 'Custom description',
      duration: 5000,
    });

    expect(sonnerToast.success).toHaveBeenCalledWith(
      'Custom toast',
      expect.objectContaining({
        description: 'Custom description',
        duration: 5000,
      })
    );
  });

  it('dismisses specific toast', () => {
    toastManager.dismiss('toast-123');

    expect(sonnerToast.dismiss).toHaveBeenCalledWith('toast-123');
  });

  it('dismisses all toasts', () => {
    toastManager.dismissAll();

    expect(sonnerToast.dismiss).toHaveBeenCalledWith();
  });
});
