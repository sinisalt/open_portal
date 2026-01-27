import { Link, Outlet, useLocation } from '@tanstack/react-router';
import { BookOpen, Bug, Code2, Database, Eye, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * DevToolsLayout - Main layout for developer tools
 *
 * Features:
 * - Tab navigation between tools
 * - Consistent layout and styling
 * - Active tab highlighting
 * - Responsive design
 */
export function DevToolsLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  const tools = [
    {
      id: 'validator',
      name: 'Config Validator',
      path: '/dev-tools/validator',
      icon: Code2,
      description: 'Validate configurations',
    },
    {
      id: 'widget-docs',
      name: 'Widget Docs',
      path: '/dev-tools/widget-docs',
      icon: BookOpen,
      description: 'Browse widget catalog',
    },
    {
      id: 'preview',
      name: 'Page Preview',
      path: '/dev-tools/preview',
      icon: Eye,
      description: 'Preview pages live',
    },
    {
      id: 'debugger',
      name: 'Action Debugger',
      path: '/dev-tools/debugger',
      icon: Bug,
      description: 'Debug actions',
    },
    {
      id: 'editor',
      name: 'Config Editor',
      path: '/dev-tools/editor',
      icon: Wrench,
      description: 'Build configurations',
    },
    {
      id: 'mock-data',
      name: 'Mock Data',
      path: '/dev-tools/mock-data',
      icon: Database,
      description: 'Generate test data',
    },
  ];

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Developer Tools</h1>
            <p className="text-sm text-muted-foreground">
              Configuration editor, debugger, and preview tools
            </p>
          </div>
          <Link
            to="/"
            className="rounded-md border border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            ← Back to App
          </Link>
        </div>
      </header>

      {/* Tool Navigation Tabs */}
      <nav className="border-b bg-card">
        <div className="flex overflow-x-auto px-6">
          {tools.map(tool => {
            const Icon = tool.icon;
            const isActive = currentPath.startsWith(tool.path);

            return (
              <Link
                key={tool.id}
                to={tool.path}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap',
                  'border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:border hover:text-foreground'
                )}
                title={tool.description}
              >
                <Icon className="h-4 w-4" />
                {tool.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Tool Content Area */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card px-6 py-3 text-center text-xs text-muted-foreground">
        OpenPortal Developer Tools - For development use only
      </footer>
    </div>
  );
}
