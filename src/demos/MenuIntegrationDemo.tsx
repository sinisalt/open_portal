/**
 * Menu Integration Demo
 *
 * Demonstration of menu state integration with Bootstrap API
 */

import { ConnectedHeader } from '@/components/menus/Header/ConnectedHeader';
import { ConnectedSideMenu } from '@/components/menus/SideMenu/ConnectedSideMenu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMenuContext } from '@/contexts/MenuContext';
import { useBootstrap } from '@/hooks/useBootstrap';

export function MenuIntegrationDemo() {
  const { data: bootstrap, loading, error } = useBootstrap();
  const menuState = useMenuContext();

  return (
    <div className="min-h-screen bg-background">
      {/* Connected Header */}
      <ConnectedHeader />

      <div className="flex">
        {/* Connected Side Menu */}
        <ConnectedSideMenu className="border-r" />

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Menu Integration Demo</h1>
              <p className="mt-2 text-muted-foreground">
                Demonstration of menu components integrated with Bootstrap API and state management
              </p>
            </div>

            {/* Bootstrap Status */}
            <Card>
              <CardHeader>
                <CardTitle>Bootstrap API Status</CardTitle>
                <CardDescription>Menu data loaded from /ui/bootstrap endpoint</CardDescription>
              </CardHeader>
              <CardContent>
                {loading && <div className="text-muted-foreground">Loading bootstrap data...</div>}
                {error && <div className="text-destructive">Error: {error}</div>}
                {bootstrap && (
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold">Status:</span>{' '}
                      <span className="text-green-600">Connected</span>
                    </div>
                    <div>
                      <span className="font-semibold">User:</span> {bootstrap.user.name} (
                      {bootstrap.user.email})
                    </div>
                    <div>
                      <span className="font-semibold">Permissions:</span>{' '}
                      {bootstrap.permissions.join(', ')}
                    </div>
                    <div>
                      <span className="font-semibold">Menu Items:</span> {bootstrap.menu.length}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Menu State */}
            <Card>
              <CardHeader>
                <CardTitle>Menu State</CardTitle>
                <CardDescription>Current menu state managed by MenuContext</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Top Menu Items:</span>{' '}
                    {menuState.topMenu.length}
                  </div>
                  <div>
                    <span className="font-semibold">Side Menu Items:</span>{' '}
                    {menuState.sideMenu.length}
                  </div>
                  <div>
                    <span className="font-semibold">Footer Menu Items:</span>{' '}
                    {menuState.footerMenu.length}
                  </div>
                  <div>
                    <span className="font-semibold">Active Item:</span>{' '}
                    {menuState.activeItemId || 'None'}
                  </div>
                  <div>
                    <span className="font-semibold">Sidebar Collapsed:</span>{' '}
                    {menuState.sidebarCollapsed ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <span className="font-semibold">Expanded Groups:</span>{' '}
                    {menuState.expandedGroupIds.length > 0
                      ? menuState.expandedGroupIds.join(', ')
                      : 'None'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Features Demonstrated</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-2">
                  <li>
                    <strong>Bootstrap Integration:</strong> Menu data automatically loaded from
                    /ui/bootstrap API
                  </li>
                  <li>
                    <strong>Permission Filtering:</strong> Menu items filtered based on user
                    permissions
                  </li>
                  <li>
                    <strong>State Management:</strong> MenuContext manages menu state across all
                    components
                  </li>
                  <li>
                    <strong>Active Item Tracking:</strong> Current route automatically sets active
                    menu item
                  </li>
                  <li>
                    <strong>State Persistence:</strong> Sidebar collapse and expanded groups saved
                    to localStorage
                  </li>
                  <li>
                    <strong>Connected Components:</strong> ConnectedHeader and ConnectedSideMenu
                    automatically wire up state
                  </li>
                  <li>
                    <strong>Responsive Design:</strong> Menu adapts to mobile with drawer/sheet
                  </li>
                  <li>
                    <strong>Navigation Integration:</strong> TanStack Router handles all navigation
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Menu Data Preview */}
            {bootstrap && (
              <Card>
                <CardHeader>
                  <CardTitle>Menu Data Preview</CardTitle>
                  <CardDescription>Raw menu data from Bootstrap API</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">
                    {JSON.stringify(
                      {
                        topMenu: menuState.topMenu.map(item => ({
                          id: item.id,
                          label: item.label,
                          route: item.route,
                        })),
                        sideMenu: menuState.sideMenu.map(item => ({
                          id: item.id,
                          label: item.label,
                          route: item.route,
                          children: item.children?.length,
                        })),
                      },
                      null,
                      2
                    )}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Try It Out</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-inside list-decimal space-y-2">
                  <li>Click on menu items in the top menu or side menu to navigate</li>
                  <li>Collapse the sidebar using the toggle button to see icon-only mode</li>
                  <li>Expand/collapse menu groups in the side menu to organize navigation</li>
                  <li>Notice how the active item is highlighted based on the current route</li>
                  <li>Refresh the page - your sidebar state and expanded groups are remembered</li>
                  <li>
                    On mobile devices, the menu appears as a drawer accessed via the hamburger icon
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
