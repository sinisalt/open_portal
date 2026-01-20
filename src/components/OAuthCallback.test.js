/**
 * OAuth Callback Component Tests
 *
 * Tests for OAuth callback flow including:
 * - Successful authentication
 * - State validation
 * - Error handling
 * - Redirect behavior
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import OAuthCallback from './OAuthCallback';
import * as authService from '../services/authService';

// Mock the auth service
jest.mock('../services/authService');

// Mock the useAuth hook
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login: jest.fn(),
    isAuthenticated: false,
  }),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('OAuthCallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  describe('successful authentication', () => {
    it('should handle OAuth callback successfully', async () => {
      // Mock successful OAuth callback
      const mockAuthData = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        expiresIn: 3600,
      };
      authService.handleOAuthCallback.mockResolvedValue(mockAuthData);

      // Set up sessionStorage
      sessionStorage.setItem('oauthRedirect', '/dashboard');

      render(
        <MemoryRouter initialEntries={['/auth/callback?code=test-code&state=test-state']}>
          <OAuthCallback />
        </MemoryRouter>
      );

      // Should show processing state initially
      expect(screen.getByText('Completing sign in...')).toBeInTheDocument();

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Sign in successful!')).toBeInTheDocument();
      });

      // Should call handleOAuthCallback with correct parameters
      expect(authService.handleOAuthCallback).toHaveBeenCalledWith(
        'test-code',
        'test-state',
        false
      );

      // Should redirect to stored destination
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        },
        { timeout: 2000 }
      );

      // Should clear oauth redirect from sessionStorage
      expect(sessionStorage.getItem('oauthRedirect')).toBeNull();
    });

    it('should redirect to home if no stored redirect URL', async () => {
      const mockAuthData = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: { id: '1', email: 'test@example.com' },
        expiresIn: 3600,
      };
      authService.handleOAuthCallback.mockResolvedValue(mockAuthData);

      render(
        <MemoryRouter initialEntries={['/auth/callback?code=test-code&state=test-state']}>
          <OAuthCallback />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign in successful!')).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
        },
        { timeout: 2000 }
      );
    });
  });

  describe('error handling', () => {
    it('should handle missing authorization code', async () => {
      render(
        <MemoryRouter initialEntries={['/auth/callback?state=test-state']}>
          <OAuthCallback />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign in failed')).toBeInTheDocument();
      });

      expect(screen.getByText('Missing authorization code')).toBeInTheDocument();

      // Should redirect to login after delay
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('/login', {
            replace: true,
            state: { error: 'Missing authorization code' },
          });
        },
        { timeout: 4000 }
      );
    });

    it('should handle missing state parameter', async () => {
      render(
        <MemoryRouter initialEntries={['/auth/callback?code=test-code']}>
          <OAuthCallback />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign in failed')).toBeInTheDocument();
      });

      expect(screen.getByText('Missing state parameter')).toBeInTheDocument();
    });

    it('should handle OAuth provider errors', async () => {
      render(
        <MemoryRouter
          initialEntries={[
            '/auth/callback?error=access_denied&error_description=User denied access',
          ]}
        >
          <OAuthCallback />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign in failed')).toBeInTheDocument();
      });

      expect(screen.getByText('User denied access')).toBeInTheDocument();
    });

    it('should handle OAuth provider error without description', async () => {
      render(
        <MemoryRouter initialEntries={['/auth/callback?error=server_error']}>
          <OAuthCallback />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign in failed')).toBeInTheDocument();
      });

      expect(screen.getByText(/OAuth provider returned error: server_error/)).toBeInTheDocument();
    });

    it('should handle token exchange failure', async () => {
      authService.handleOAuthCallback.mockRejectedValue(new Error('Token exchange failed'));

      render(
        <MemoryRouter initialEntries={['/auth/callback?code=test-code&state=test-state']}>
          <OAuthCallback />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign in failed')).toBeInTheDocument();
      });

      expect(screen.getByText('Token exchange failed')).toBeInTheDocument();
    });

    it('should handle state validation failure', async () => {
      authService.handleOAuthCallback.mockRejectedValue(
        new Error('Invalid state parameter. Possible CSRF attack.')
      );

      render(
        <MemoryRouter initialEntries={['/auth/callback?code=test-code&state=test-state']}>
          <OAuthCallback />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign in failed')).toBeInTheDocument();
      });

      expect(
        screen.getByText('Invalid state parameter. Possible CSRF attack.')
      ).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes for loading state', () => {
      render(
        <MemoryRouter initialEntries={['/auth/callback?code=test-code&state=test-state']}>
          <OAuthCallback />
        </MemoryRouter>
      );

      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper ARIA attributes for success state', async () => {
      authService.handleOAuthCallback.mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
        user: { id: '1', email: 'test@example.com' },
        expiresIn: 3600,
      });

      render(
        <MemoryRouter initialEntries={['/auth/callback?code=test-code&state=test-state']}>
          <OAuthCallback />
        </MemoryRouter>
      );

      await waitFor(() => {
        const successElement = screen.getByRole('status');
        expect(successElement).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('should have proper ARIA attributes for error state', async () => {
      render(
        <MemoryRouter initialEntries={['/auth/callback?error=access_denied']}>
          <OAuthCallback />
        </MemoryRouter>
      );

      await waitFor(() => {
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toHaveAttribute('aria-live', 'assertive');
      });
    });
  });

  describe('visual feedback', () => {
    it('should display processing message initially', () => {
      render(
        <MemoryRouter initialEntries={['/auth/callback?code=test-code&state=test-state']}>
          <OAuthCallback />
        </MemoryRouter>
      );

      expect(screen.getByText('Completing sign in...')).toBeInTheDocument();
      expect(
        screen.getByText('Please wait while we complete your authentication.')
      ).toBeInTheDocument();
    });

    it('should display success message on successful authentication', async () => {
      authService.handleOAuthCallback.mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
        user: { id: '1', email: 'test@example.com' },
        expiresIn: 3600,
      });

      render(
        <MemoryRouter initialEntries={['/auth/callback?code=test-code&state=test-state']}>
          <OAuthCallback />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign in successful!')).toBeInTheDocument();
      });

      expect(screen.getByText('Redirecting you to your destination...')).toBeInTheDocument();
    });

    it('should display error message and hint on failure', async () => {
      render(
        <MemoryRouter initialEntries={['/auth/callback?error=access_denied']}>
          <OAuthCallback />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign in failed')).toBeInTheDocument();
      });

      expect(
        screen.getByText('You will be redirected to the login page shortly.')
      ).toBeInTheDocument();
    });
  });
});
