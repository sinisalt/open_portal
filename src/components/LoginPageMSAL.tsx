import { useNavigate, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMsalAuth } from '@/hooks/useMsalAuth';

export function LoginPageMSAL() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/login' });
  const redirectTo = (search as { redirect?: string })?.redirect || '/';
  const { login, isLoading } = useMsalAuth();
  const [error, setError] = useState<string | null>(null);

  const handleMsalLogin = async () => {
    setError(null);
    try {
      await login();
      await navigate({ to: redirectTo });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in to OpenPortal</CardTitle>
          <CardDescription>Sign in with your Microsoft account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive rounded-md">
              {error}
            </div>
          )}

          <Button onClick={handleMsalLogin} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? 'Signing in...' : 'Sign in with Microsoft'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
