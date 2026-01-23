import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/forbidden')({
  component: ForbiddenComponent,
});

function ForbiddenComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-muted-foreground mb-4">403</h1>
      <h2 className="text-2xl font-semibold mb-2">Access Forbidden</h2>
      <p className="text-xl mb-8 text-muted-foreground">
        You don't have permission to access this page
      </p>
      <Link to="/" className="text-primary hover:underline">
        Go back home
      </Link>
    </div>
  );
}
