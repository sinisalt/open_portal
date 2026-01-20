import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import './index.css';
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
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
