import { type Configuration, PublicClientApplication } from '@azure/msal-browser';

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: import.meta.env.VITE_AZURE_AUTHORITY || 'https://login.microsoftonline.com/common',
    redirectUri:
      import.meta.env.VITE_AZURE_REDIRECT_URI || `${window.location.origin}/auth/callback`,
  },
  cache: {
    cacheLocation: 'localStorage', // or 'sessionStorage'
  },
};

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL (must be called before using the instance)
export const initializeMsal = async () => {
  await msalInstance.initialize();
};

// Scopes for token requests
export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
};
