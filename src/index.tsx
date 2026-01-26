import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AuthProvider } from './components/AuthProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { initializeMsal } from './config/msalConfig';
import { MenuProvider } from './contexts/MenuContext';
import reportWebVitals from './reportWebVitals';
import { analyticsTracker } from './services/analyticsTracker';
import { errorTracker } from './services/errorTracker';
import { performanceMonitor } from './services/performanceMonitor';
// Import the generated route tree
import { routeTree } from './routeTree.gen';
import { registerWidgets } from './widgets';

// Register all widgets
registerWidgets();

// Create router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = ReactDOM.createRoot(rootElement);

// Initialize MSAL if using MSAL auth provider
const authProvider = import.meta.env.VITE_AUTH_PROVIDER || 'custom';
if (authProvider === 'msal') {
  initializeMsal().then(() => {
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <AuthProvider>
            <MenuProvider>
              <RouterProvider router={router} />
            </MenuProvider>
          </AuthProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
  });
} else {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <MenuProvider>
            <RouterProvider router={router} />
          </MenuProvider>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

// Enable performance monitoring
reportWebVitals((metric) => {
  // Send to performance monitor
  if (import.meta.env.DEV) {
    console.log('[Web Vitals]', metric);
  }
});

// Log initialization
if (import.meta.env.DEV) {
  console.log('[Monitoring] Services initialized:', {
    errorTracking: errorTracker !== undefined,
    performance: performanceMonitor !== undefined,
    analytics: analyticsTracker !== undefined,
  });
}
