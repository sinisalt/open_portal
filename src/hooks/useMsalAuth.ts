import { InteractionRequiredAuthError, InteractionStatus } from '@azure/msal-browser';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useEffect, useState } from 'react';
import { loginRequest } from '@/config/msalConfig';

export interface MsalAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  error: Error | null;
}

export function useMsalAuth(): MsalAuthState & {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
} {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    if (isAuthenticated && accounts.length > 0) {
      setUser({
        id: accounts[0].localAccountId,
        name: accounts[0].name,
        email: accounts[0].username,
      });
    } else {
      setUser(null);
    }
  }, [isAuthenticated, accounts]);

  const login = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await instance.loginPopup(loginRequest);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await instance.logoutPopup();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (!isAuthenticated || accounts.length === 0) {
      return null;
    }

    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
      return response.accessToken;
    } catch (err) {
      if (err instanceof InteractionRequiredAuthError) {
        // Silent acquisition failed, need interaction
        const response = await instance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      }
      throw err;
    }
  };

  return {
    isAuthenticated,
    isLoading: isLoading || inProgress !== InteractionStatus.None,
    user,
    error,
    login,
    logout,
    getAccessToken,
  };
}
