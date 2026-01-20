/**
 * Login Page Component
 *
 * Provides authentication UI with:
 * - Username/password login
 * - OAuth provider integration
 * - Form validation
 * - Error handling
 * - Deep link preservation
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import * as authService from '../services/authService';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/login' });
  const { login, isAuthenticated } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [oauthProviders, setOauthProviders] = useState([]);

  // Form validation
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = search?.redirect || '/';
      navigate({ to: redirectTo, replace: true });
    }
  }, [isAuthenticated, navigate, search]);

  // Load OAuth providers
  useEffect(() => {
    authService
      .getOAuthProviders()
      .then(providers => setOauthProviders(providers))
      .catch(() => {
        // Silently fail if OAuth providers can't be loaded
        setOauthProviders([]);
      });
  }, []);

  /**
   * Validate email format
   */
  const validateEmail = value => {
    if (!value) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  /**
   * Validate password
   */
  const validatePassword = value => {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async e => {
    e.preventDefault();

    // Clear previous errors
    setError(null);
    setEmailError('');
    setPasswordError('');

    // Validate form
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    if (emailErr || passwordErr) {
      setEmailError(emailErr);
      setPasswordError(passwordErr);
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password, rememberMe);

      // Get redirect URL from search params or default to home
      const redirectTo = search?.redirect || '/';
      navigate({ to: redirectTo, replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle OAuth provider click
   */
  const handleOAuthLogin = providerId => {
    const redirectUrl = search?.redirect || '/';
    authService.initiateOAuth(providerId, redirectUrl);
  };

  /**
   * Handle input blur (for validation)
   */
  const handleEmailBlur = () => {
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setPasswordError(validatePassword(password));
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo" aria-label="Company Logo">
            {/* Logo placeholder - will be replaced with branding */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="48" height="48" rx="8" fill="#4F46E5" />
              <path d="M24 12L36 20V36L24 44L12 36V20L24 12Z" fill="white" />
            </svg>
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="login-error" role="alert">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${emailError ? 'form-input-error' : ''}`}
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              onBlur={handleEmailBlur}
              placeholder="your@email.com"
              autoComplete="email"
              required
              disabled={isLoading}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
            />
            {emailError && (
              <p id="email-error" className="form-error" role="alert">
                {emailError}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${passwordError ? 'form-input-error' : ''}`}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                onBlur={handlePasswordBlur}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={isLoading}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'password-error' : undefined}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
            {passwordError && (
              <p id="password-error" className="form-error" role="alert">
                {passwordError}
              </p>
            )}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" className="forgot-link">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {oauthProviders.length > 0 && (
          <>
            <div className="divider">
              <span>Or continue with</span>
            </div>

            <div className="oauth-providers">
              {oauthProviders.map(provider => (
                <button
                  key={provider.id}
                  type="button"
                  className="oauth-button"
                  onClick={() => handleOAuthLogin(provider.id)}
                  disabled={isLoading}
                >
                  {provider.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
