import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import App from './App';

// Mock the useAuth hook
jest.mock('./hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const { useAuth } = require('./hooks/useAuth');

describe('App', () => {
  it('should redirect to login when not authenticated', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });
  });

  it('should show home page when authenticated', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<App />);

    const welcomeText = await screen.findByText('Welcome to OpenPortal');
    const greetingText = await screen.findByText('Hello, Test User!');

    expect(welcomeText).toBeInTheDocument();
    expect(greetingText).toBeInTheDocument();
  });

  it('should show loading state', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<App />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
