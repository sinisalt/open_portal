/**
 * OAuth Callback Component
 *
 * Handles OAuth provider redirects:
 * - Validates state parameter (CSRF protection)
 * - Exchanges authorization code for tokens
 * - Handles errors gracefully
 * - Redirects to intended destination
 */

import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import * as authService from '../services/authService';
import './OAuthCallback.css';

function OAuthCallback() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/auth/callback' });

  const [status, setStatus] = useState('processing'); // processing, success, error
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get parameters from URL
        const code = search?.code;
        const state = search?.state;
        const errorParam = search?.error;
        const errorDescription = search?.error_description;

        // Check for OAuth provider errors
        if (errorParam) {
          const errorMessage = errorDescription || `OAuth provider returned error: ${errorParam}`;
          throw new Error(errorMessage);
        }

        // Validate required parameters
        if (!code) {
          throw new Error('Missing authorization code');
        }

        if (!state) {
          throw new Error('Missing state parameter');
        }

        // Exchange code for tokens
        await authService.handleOAuthCallback(code, state, false);

        // handleOAuthCallback already stored the tokens in storage
        // Use window.location for full page reload to update auth context
        setStatus('success');

        // Redirect to intended destination
        const redirectUrl = sessionStorage.getItem('oauthRedirect') || '/';
        sessionStorage.removeItem('oauthRedirect');

        // Small delay to show success message
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setError(err.message || 'OAuth authentication failed');

        // Redirect to login after a delay
        setTimeout(() => {
          navigate({ to: '/login', replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [search, navigate]);

  return (
    <div className="oauth-callback-container">
      <div className="oauth-callback-card">
        {status === 'processing' && (
          <>
            <output className="oauth-callback-spinner" aria-live="polite">
              <div className="spinner"></div>
            </output>
            <h2>Completing sign in...</h2>
            <p>Please wait while we complete your authentication.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <output className="oauth-callback-success" aria-live="polite">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="32" cy="32" r="32" fill="#10B981" />
                <path
                  d="M20 32L28 40L44 24"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </output>
            <h2>Sign in successful!</h2>
            <p>Redirecting you to your destination...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="oauth-callback-error" role="alert" aria-live="assertive">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="32" cy="32" r="32" fill="#EF4444" />
                <path
                  d="M24 24L40 40M40 24L24 40"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2>Sign in failed</h2>
            <p className="error-message">{error}</p>
            <p className="error-hint">You will be redirected to the login page shortly.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default OAuthCallback;
