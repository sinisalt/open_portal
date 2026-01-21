import { MsalProvider } from '@azure/msal-react';
import type { ReactNode } from 'react';
import { msalInstance } from '@/config/msalConfig';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const authProvider = import.meta.env.VITE_AUTH_PROVIDER || 'custom';

  if (authProvider === 'msal') {
    return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
  }

  // Custom auth doesn't need provider
  return <>{children}</>;
}
