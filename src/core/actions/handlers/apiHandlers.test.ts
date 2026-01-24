/**
 * API Action Handlers Tests
 *
 * Comprehensive tests for apiCall and executeAction handlers
 */

import type { ActionContext } from '@/types/action.types';
import { apiCallHandler, executeActionHandler } from './apiHandlers';

describe('apiHandlers', () => {
  let mockContext: ActionContext;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
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
      showToast: jest.fn(),
      fetch: mockFetch,
      setState: jest.fn(),
      getState: jest.fn(),
    };
  });

  describe('apiCallHandler', () => {
    describe('HTTP Methods', () => {
      it('should handle GET request', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ data: 'test' }),
        });

        const result = await apiCallHandler({ url: '/api/users', method: 'GET' }, mockContext);

        expect(result.success).toBe(true);
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/users',
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        );
      });

      it('should handle POST request with body', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 201,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ id: '123' }),
        });

        const body = { name: 'John', email: 'john@example.com' };
        const result = await apiCallHandler(
          { url: '/api/users', method: 'POST', body },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/users',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(body),
          })
        );
      });

      it('should handle PUT request', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ updated: true }),
        });

        const result = await apiCallHandler(
          { url: '/api/users/123', method: 'PUT', body: { name: 'Jane' } },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/users/123',
          expect.objectContaining({ method: 'PUT' })
        );
      });

      it('should handle DELETE request', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 204,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({}),
        });

        const result = await apiCallHandler(
          { url: '/api/users/123', method: 'DELETE' },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/users/123',
          expect.objectContaining({ method: 'DELETE' })
        );
      });

      it('should handle PATCH request', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ patched: true }),
        });

        const result = await apiCallHandler(
          { url: '/api/users/123', method: 'PATCH', body: { status: 'active' } },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/users/123',
          expect.objectContaining({ method: 'PATCH' })
        );
      });
    });

    describe('URL and Parameters', () => {
      it('should handle query parameters', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ data: [] }),
        });

        const result = await apiCallHandler(
          {
            url: '/api/users',
            method: 'GET',
            queryParams: { page: 1, limit: 10, filter: 'active' },
          },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/users?page=1&limit=10&filter=active',
          expect.any(Object)
        );
      });

      it('should handle custom headers', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ data: 'test' }),
        });

        const result = await apiCallHandler(
          {
            url: '/api/users',
            method: 'GET',
            headers: {
              'X-Custom-Header': 'custom-value',
              Authorization: 'Bearer token123',
            },
          },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/users',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'X-Custom-Header': 'custom-value',
              Authorization: 'Bearer token123',
            }),
          })
        );
      });

      it('should require url parameter', async () => {
        // biome-ignore lint/suspicious/noExplicitAny: Testing invalid params
        const result = await apiCallHandler({ method: 'GET' } as any, mockContext);

        expect(result.success).toBe(false);
        expect(result.error?.message).toContain('url');
      });
    });

    describe('Response Handling', () => {
      it('should parse JSON response', async () => {
        const responseData = { id: '123', name: 'John' };
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => responseData,
        });

        const result = await apiCallHandler({ url: '/api/users/123', method: 'GET' }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({
          status: 200,
          data: responseData,
        });
      });

      it('should include response headers', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({
            'content-type': 'application/json',
            'x-request-id': 'req-123',
          }),
          json: async () => ({ data: 'test' }),
        });

        const result = await apiCallHandler({ url: '/api/users', method: 'GET' }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data?.headers).toHaveProperty('content-type', 'application/json');
        expect(result.data?.headers).toHaveProperty('x-request-id', 'req-123');
      });

      it('should handle non-JSON response with error', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => '<html>Not JSON</html>',
        });

        const result = await apiCallHandler({ url: '/api/users', method: 'GET' }, mockContext);

        expect(result.success).toBe(false);
        expect(result.error?.message).toContain('Expected JSON response');
      });
    });

    describe('Error Handling', () => {
      it('should handle 400 validation errors', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            fieldErrors: { email: 'Invalid email format' },
          }),
        });

        const result = await apiCallHandler(
          { url: '/api/users', method: 'POST', body: {} },
          mockContext
        );

        expect(result.success).toBe(false);
        expect(result.error?.status).toBe(400);
        expect(result.error?.code).toBe('VALIDATION_ERROR');
        expect(result.error?.fieldErrors).toHaveProperty('email');
      });

      it('should handle 404 not found errors', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            message: 'User not found',
            code: 'NOT_FOUND',
          }),
        });

        const result = await apiCallHandler({ url: '/api/users/999', method: 'GET' }, mockContext);

        expect(result.success).toBe(false);
        expect(result.error?.status).toBe(404);
        expect(result.error?.message).toBe('User not found');
      });

      it('should handle 500 server errors', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 500,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            message: 'Internal server error',
            code: 'SERVER_ERROR',
          }),
        });

        const result = await apiCallHandler({ url: '/api/users', method: 'GET' }, mockContext);

        expect(result.success).toBe(false);
        expect(result.error?.status).toBe(500);
        expect(result.error?.code).toBe('SERVER_ERROR');
      });

      it('should handle network errors', async () => {
        mockFetch.mockRejectedValue(new Error('Network request failed'));

        const result = await apiCallHandler({ url: '/api/users', method: 'GET' }, mockContext);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('API_CALL_ERROR');
        expect(result.error?.message).toContain('Network request failed');
      });

      it('should handle timeout with AbortSignal', async () => {
        const abortError = new Error('The operation was aborted');
        abortError.name = 'AbortError';
        mockFetch.mockRejectedValue(abortError);

        const controller = new AbortController();
        controller.abort();

        const result = await apiCallHandler(
          { url: '/api/users', method: 'GET', timeout: 5000 },
          mockContext,
          controller.signal
        );

        expect(result.success).toBe(false);
        expect(result.error?.message).toContain('aborted');
      });
    });

    describe('Request Body', () => {
      it('should not include body in GET requests', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ data: 'test' }),
        });

        const result = await apiCallHandler(
          { url: '/api/users', method: 'GET', body: { invalid: 'should not be sent' } },
          mockContext
        );

        expect(result.success).toBe(true);
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[1]).not.toHaveProperty('body');
      });

      it('should include body in POST requests', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 201,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ id: '123' }),
        });

        const body = { name: 'John' };
        await apiCallHandler({ url: '/api/users', method: 'POST', body }, mockContext);

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/users',
          expect.objectContaining({
            body: JSON.stringify(body),
          })
        );
      });
    });
  });

  describe('executeActionHandler', () => {
    it('should call backend action endpoint', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ result: 'success' }),
      });

      const result = await executeActionHandler(
        { actionId: 'save-user', context: { userId: '123' } },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        '/ui/actions/execute',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionId: 'save-user',
            context: { userId: '123' },
          }),
        })
      );
    });

    it('should require actionId parameter', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: Testing invalid params
      const result = await executeActionHandler({} as any, mockContext);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('actionId');
    });

    it('should pass action context parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ result: 'success' }),
      });

      const actionContext = {
        userId: '123',
        formData: { name: 'John', email: 'john@example.com' },
      };

      await executeActionHandler(
        { actionId: 'update-profile', context: actionContext },
        mockContext
      );

      expect(mockFetch).toHaveBeenCalledWith(
        '/ui/actions/execute',
        expect.objectContaining({
          body: JSON.stringify({
            actionId: 'update-profile',
            context: actionContext,
          }),
        })
      );
    });

    it('should handle backend validation errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          fieldErrors: { email: 'Invalid email' },
        }),
      });

      const result = await executeActionHandler(
        { actionId: 'save-user', context: {} },
        mockContext
      );

      expect(result.success).toBe(false);
      expect(result.error?.status).toBe(400);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.fieldErrors).toHaveProperty('email');
    });

    it('should handle permission errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({
          message: 'Permission denied',
          code: 'PERMISSION_DENIED',
        }),
      });

      const result = await executeActionHandler(
        { actionId: 'delete-user', context: { userId: '123' } },
        mockContext
      );

      expect(result.success).toBe(false);
      expect(result.error?.status).toBe(403);
      expect(result.error?.code).toBe('PERMISSION_DENIED');
    });

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          message: 'Internal server error',
          code: 'SERVER_ERROR',
        }),
      });

      const result = await executeActionHandler(
        { actionId: 'save-user', context: {} },
        mockContext
      );

      expect(result.success).toBe(false);
      expect(result.error?.status).toBe(500);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await executeActionHandler(
        { actionId: 'save-user', context: {} },
        mockContext
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('EXECUTE_ACTION_ERROR');
    });

    it('should support action cancellation', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValue(abortError);

      const controller = new AbortController();
      controller.abort();

      const result = await executeActionHandler(
        { actionId: 'save-user', context: {} },
        mockContext,
        controller.signal
      );

      expect(result.success).toBe(false);
    });

    it('should return response data on success', async () => {
      const responseData = { userId: '123', message: 'User saved' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => responseData,
      });

      const result = await executeActionHandler(
        { actionId: 'save-user', context: {} },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(responseData);
    });
  });
});
