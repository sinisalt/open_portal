/**
 * UI Feedback Action Handlers Tests
 *
 * Comprehensive tests for showToast and showDialog handlers
 */

import type { ActionContext } from '@/types/action.types';
import { showDialogHandler, showToastHandler } from './uiFeedbackHandlers';

describe('uiFeedbackHandlers', () => {
  let mockContext: ActionContext;
  let mockShowToast: jest.Mock;

  // Store original window methods
  const originalConfirm = window.confirm;
  const originalAlert = window.alert;

  beforeEach(() => {
    mockShowToast = jest.fn();
    mockContext = {
      pageState: {},
      initialPageState: {},
      formData: {},
      widgetStates: {},
      user: { id: 'user123', name: 'John Doe', email: 'john@example.com', roles: [] },
      permissions: ['read'],
      tenant: { id: 'tenant456', name: 'Acme Corp', brandingVersion: '1.0.0' },
      routeParams: {},
      queryParams: {},
      currentPath: '/test',
      navigate: jest.fn(),
      showToast: mockShowToast,
      fetch: jest.fn(),
      setState: jest.fn(),
      getState: jest.fn(),
    };

    // Mock window.confirm and window.alert
    window.confirm = jest.fn();
    window.alert = jest.fn();
  });

  afterEach(() => {
    window.confirm = originalConfirm;
    window.alert = originalAlert;
  });

  describe('showToastHandler', () => {
    describe('Toast Variants', () => {
      it('should show success toast', async () => {
        const result = await showToastHandler(
          { message: 'Operation successful', variant: 'success' },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(mockShowToast).toHaveBeenCalledWith('Operation successful', 'success', 5000);
      });

      it('should show error toast', async () => {
        const result = await showToastHandler(
          { message: 'Operation failed', variant: 'error' },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(mockShowToast).toHaveBeenCalledWith('Operation failed', 'error', 5000);
      });

      it('should show warning toast', async () => {
        const result = await showToastHandler(
          { message: 'Please review', variant: 'warning' },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(mockShowToast).toHaveBeenCalledWith('Please review', 'warning', 5000);
      });

      it('should show info toast', async () => {
        const result = await showToastHandler(
          { message: 'Information message', variant: 'info' },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(mockShowToast).toHaveBeenCalledWith('Information message', 'info', 5000);
      });
    });

    describe('Custom Message', () => {
      it('should show custom message', async () => {
        const customMessage = 'This is a custom notification message';
        const result = await showToastHandler(
          { message: customMessage, variant: 'success' },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(mockShowToast).toHaveBeenCalledWith(customMessage, 'success', 5000);
      });

      it('should handle multi-line messages', async () => {
        const message = 'Line 1\nLine 2\nLine 3';
        const result = await showToastHandler({ message, variant: 'info' }, mockContext);

        expect(result.success).toBe(true);
        expect(mockShowToast).toHaveBeenCalledWith(message, 'info', 5000);
      });
    });

    describe('Duration Configuration', () => {
      it('should use default duration (5000ms)', async () => {
        const result = await showToastHandler(
          { message: 'Test message', variant: 'success' },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(mockShowToast).toHaveBeenCalledWith('Test message', 'success', 5000);
      });

      it('should use custom duration', async () => {
        const result = await showToastHandler(
          { message: 'Test message', variant: 'success', duration: 3000 },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(mockShowToast).toHaveBeenCalledWith('Test message', 'success', 3000);
      });

      it('should handle short duration', async () => {
        const result = await showToastHandler(
          { message: 'Quick message', variant: 'info', duration: 1000 },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(mockShowToast).toHaveBeenCalledWith('Quick message', 'info', 1000);
      });

      it('should handle long duration', async () => {
        const result = await showToastHandler(
          { message: 'Important message', variant: 'warning', duration: 10000 },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(mockShowToast).toHaveBeenCalledWith('Important message', 'warning', 10000);
      });
    });

    describe('Parameter Validation', () => {
      it('should require message parameter', async () => {
        // biome-ignore lint/suspicious/noExplicitAny: Testing invalid params
        const result = await showToastHandler({ variant: 'success' } as any, mockContext);

        expect(result.success).toBe(false);
        expect(result.error?.message).toContain('message');
      });
    });

    describe('Return Value', () => {
      it('should return message and variant in data', async () => {
        const result = await showToastHandler({ message: 'Test', variant: 'success' }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data).toEqual({
          message: 'Test',
          variant: 'success',
        });
      });
    });

    describe('Error Handling', () => {
      it('should handle toast service errors', async () => {
        mockShowToast.mockImplementation(() => {
          throw new Error('Toast service error');
        });

        const result = await showToastHandler({ message: 'Test', variant: 'success' }, mockContext);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('SHOW_TOAST_ERROR');
      });
    });
  });

  describe('showDialogHandler', () => {
    describe('Dialog Variants', () => {
      it('should show confirm dialog and handle user confirmation', async () => {
        (window.confirm as jest.Mock).mockReturnValue(true);

        const result = await showDialogHandler(
          {
            title: 'Confirm Action',
            message: 'Are you sure you want to continue?',
            variant: 'confirm',
          },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(result.data?.confirmed).toBe(true);
        expect(window.confirm).toHaveBeenCalledWith(
          'Confirm Action\n\nAre you sure you want to continue?'
        );
      });

      it('should show confirm dialog and handle user cancellation', async () => {
        (window.confirm as jest.Mock).mockReturnValue(false);

        const result = await showDialogHandler(
          {
            title: 'Confirm Action',
            message: 'Are you sure?',
            variant: 'confirm',
          },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(result.data?.confirmed).toBe(false);
      });

      it('should show alert dialog', async () => {
        const result = await showDialogHandler(
          {
            title: 'Alert',
            message: 'This is an important message',
            variant: 'alert',
          },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(result.data?.confirmed).toBe(true);
        expect(window.alert).toHaveBeenCalledWith('Alert\n\nThis is an important message');
      });

      it('should show info dialog', async () => {
        const result = await showDialogHandler(
          {
            title: 'Information',
            message: 'Here is some information',
            variant: 'info',
          },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(window.alert).toHaveBeenCalledWith('Information\n\nHere is some information');
      });
    });

    describe('Parameter Validation', () => {
      it('should require title parameter', async () => {
        const result = await showDialogHandler(
          // biome-ignore lint/suspicious/noExplicitAny: Testing invalid params
          { message: 'Test message', variant: 'alert' } as any,
          mockContext
        );

        expect(result.success).toBe(false);
        expect(result.error?.message).toContain('title');
      });

      it('should require message parameter', async () => {
        const result = await showDialogHandler(
          // biome-ignore lint/suspicious/noExplicitAny: Testing invalid params
          { title: 'Test Title', variant: 'alert' } as any,
          mockContext
        );

        expect(result.success).toBe(false);
        expect(result.error?.message).toContain('message');
      });
    });

    describe('Custom Messages', () => {
      it('should handle multi-line messages', async () => {
        const message = 'Line 1\nLine 2\nLine 3';
        await showDialogHandler({ title: 'Multi-line', message, variant: 'alert' }, mockContext);

        expect(window.alert).toHaveBeenCalledWith(`Multi-line\n\n${message}`);
      });

      it('should handle long messages', async () => {
        const longMessage = 'A'.repeat(500);
        const result = await showDialogHandler(
          { title: 'Long Message', message: longMessage, variant: 'alert' },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(window.alert).toHaveBeenCalled();
      });
    });

    describe('Error Handling', () => {
      it('should handle dialog errors', async () => {
        (window.confirm as jest.Mock).mockImplementation(() => {
          throw new Error('Dialog error');
        });

        const result = await showDialogHandler(
          { title: 'Test', message: 'Test', variant: 'confirm' },
          mockContext
        );

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('SHOW_DIALOG_ERROR');
      });
    });

    describe('Return Value', () => {
      it('should return confirmed status', async () => {
        (window.confirm as jest.Mock).mockReturnValue(true);

        const result = await showDialogHandler(
          { title: 'Test', message: 'Test', variant: 'confirm' },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('confirmed', true);
      });
    });
  });
});
