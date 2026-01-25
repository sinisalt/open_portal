import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AuthProvider } from './components/AuthProvider';
import { initializeMsal } from './config/msalConfig';
import { MenuProvider } from './contexts/MenuContext';
import reportWebVitals from './reportWebVitals';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

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
        <AuthProvider>
          <MenuProvider>
            <RouterProvider router={router} />
          </MenuProvider>
        </AuthProvider>
      </React.StrictMode>
    );
  });
} else {
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <MenuProvider>
          <RouterProvider router={router} />
        </MenuProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
