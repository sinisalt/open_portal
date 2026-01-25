# Issue #030: Menu Components and Layout System

**Phase:** Phase 1.4 - Navigation & Menus  
**Weeks:** 10-11  
**Component:** Frontend  
**Estimated Effort:** 5 days  
**Priority:** High  
**Labels:** phase-1, frontend, menus, navigation, layout

**Created:** January 25, 2026  
**Note:** Originally numbered as #042, renumbered to #030 per issue reordering

## Description

Implement the core menu components for the OpenPortal platform including top menu (horizontal header navigation), side menu (vertical sidebar navigation), and footer menu (optional footer links). All menus must be responsive and support the configuration-driven architecture where menu structure comes from the backend API.

The platform requires three distinct menu types:
1. **Top Menu** - Horizontal navigation bar with text-based links and dropdown submenus
2. **Side Menu** - Vertical sidebar with icons and text for main items, text-only for sub-levels
3. **Footer Menu** - Horizontal footer navigation (rare but supported)

Additionally, a unified header component must integrate logo/branding with the top menu.

## Acceptance Criteria

### Top Menu Component
- [ ] Horizontal navigation bar component
- [ ] Text-based menu items
- [ ] Dropdown submenus (one level deep minimum)
- [ ] Hover and active states
- [ ] Responsive behavior (hamburger menu on mobile)
- [ ] Permission-based item filtering
- [ ] Click navigation handlers

### Side Menu Component
- [ ] Vertical sidebar component
- [ ] Main menu items with icons and text
- [ ] Submenu items (text-only, indented)
- [ ] Expandable/collapsible submenu groups
- [ ] Collapsed state (icons only)
- [ ] Active/selected item highlighting
- [ ] Smooth transitions and animations
- [ ] Responsive behavior (drawer on mobile)
- [ ] Permission-based item filtering

### Footer Menu Component
- [ ] Horizontal footer navigation
- [ ] Simple text links
- [ ] Multiple column support
- [ ] Responsive stacking on mobile

### Header Component
- [ ] Unified header container
- [ ] Logo/company name in top left
- [ ] Integration with branding service
- [ ] Top menu integration on right side
- [ ] User menu/avatar on far right
- [ ] Responsive layout

### General Requirements
- [ ] TypeScript implementation
- [ ] shadcn/ui component usage (navigation-menu, dropdown-menu)
- [ ] Tailwind CSS styling
- [ ] Dark mode support
- [ ] Keyboard navigation (arrow keys, Enter, Esc)
- [ ] ARIA attributes for accessibility
- [ ] Focus management
- [ ] Unit tests for all components
- [ ] Storybook stories for visual testing

## Use Cases

1. **User navigates via top menu**: Click "Dashboard" in top menu → navigate to /dashboard
2. **User opens submenu**: Hover over "Settings" → dropdown shows "Profile", "Account", "Preferences"
3. **User navigates via side menu**: Click "Listings" in sidebar → navigate to /listings
4. **User expands submenu in sidebar**: Click "Reports" → expands to show "Sales", "Inventory", "Analytics"
5. **User collapses sidebar**: Click collapse icon → sidebar shows icons only
6. **Mobile user opens menu**: Click hamburger → side menu slides in as drawer
7. **Menu refreshes dynamically**: Page navigation returns updated menu → UI updates without reload

## Technical Implementation

### shadcn/ui Components to Use

```bash
# Install required shadcn components
npx shadcn@latest add navigation-menu
npx shadcn@latest add dropdown-menu
npx shadcn@latest add sheet  # For mobile drawer
npx shadcn@latest add separator
npx shadcn@latest add avatar
npx shadcn@latest add button
```

### Component Structure

```
/src/components/menus/
  /TopMenu/
    TopMenu.tsx
    TopMenu.test.tsx
    TopMenuItem.tsx
    TopMenuDropdown.tsx
  /SideMenu/
    SideMenu.tsx
    SideMenu.test.tsx
    SideMenuItem.tsx
    SideMenuGroup.tsx
    SideMenuCollapse.tsx
  /FooterMenu/
    FooterMenu.tsx
    FooterMenu.test.tsx
  /Header/
    Header.tsx
    Header.test.tsx
    UserMenu.tsx
  /shared/
    MenuItem.tsx
    MenuIcon.tsx
    types.ts
    utils.ts
```

### TypeScript Interfaces

```typescript
// Menu item structure (from backend API)
interface MenuItem {
  id: string;
  label: string;
  icon?: string;  // Icon name (lucide-react)
  path?: string;  // Navigation path
  order: number;
  permissions?: string[];
  children?: MenuItem[];  // Submenu items
  badge?: {
    text: string;
    variant: 'default' | 'primary' | 'warning' | 'danger';
  };
  divider?: boolean;  // Show divider after item
  external?: boolean;  // Open in new tab
}

// Top menu props
interface TopMenuProps {
  items: MenuItem[];
  activeItemId?: string;
  onItemClick?: (item: MenuItem) => void;
  className?: string;
}

// Side menu props
interface SideMenuProps {
  items: MenuItem[];
  activeItemId?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onItemClick?: (item: MenuItem) => void;
  className?: string;
}

// Footer menu props
interface FooterMenuProps {
  items: MenuItem[];
  columns?: number;  // Number of columns (1-4)
  onItemClick?: (item: MenuItem) => void;
  className?: string;
}

// Header props
interface HeaderProps {
  logo?: React.ReactNode;
  companyName?: string;
  topMenuItems?: MenuItem[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onUserMenuClick?: (action: string) => void;
  className?: string;
}
```

### Component Examples

#### TopMenu Component
```typescript
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function TopMenu({ items, activeItemId, onItemClick }: TopMenuProps) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {items.map(item => (
          <NavigationMenuItem key={item.id}>
            {item.children ? (
              <DropdownMenu>
                <DropdownMenuTrigger>{item.label}</DropdownMenuTrigger>
                <DropdownMenuContent>
                  {item.children.map(child => (
                    <DropdownMenuItem key={child.id} onClick={() => onItemClick?.(child)}>
                      {child.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button onClick={() => onItemClick?.(item)}>{item.label}</button>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
```

#### SideMenu Component
```typescript
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SideMenu({ items, collapsed, activeItemId, onItemClick }: SideMenuProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  return (
    <aside className={cn('sidebar', collapsed && 'sidebar--collapsed')}>
      <nav className="sidebar__menu">
        {items.map(item => (
          <SideMenuItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            expanded={expandedIds.includes(item.id)}
            active={item.id === activeItemId}
            onToggle={() => toggleExpanded(item.id)}
            onClick={() => onItemClick?.(item)}
          />
        ))}
      </nav>
    </aside>
  );
}
```

### Responsive Behavior

- **Desktop (≥1024px)**: 
  - Top menu: Full horizontal menu
  - Side menu: Full sidebar (expanded by default)
  
- **Tablet (768px - 1023px)**:
  - Top menu: Condensed menu, some items in dropdown
  - Side menu: Collapsible sidebar (can toggle)
  
- **Mobile (<768px)**:
  - Top menu: Hamburger icon, opens drawer
  - Side menu: Hidden, accessible via hamburger
  - Footer menu: Single column stacked

### Icon Library

Use `lucide-react` for menu icons (already used in project):
```typescript
import { Home, Users, Settings, FileText, BarChart } from 'lucide-react';

const iconMap = {
  home: Home,
  users: Users,
  settings: Settings,
  list: FileText,
  dashboard: BarChart,
  // ... more mappings
};
```

## Dependencies

- **Depends on:** 
  - #011 (User Context Management) - for user data
  - #012 (Branding Service) - for logo/branding
  - #013 (Route Resolver) - for navigation
  
- **Blocks:**
  - #040 (Menu State Management) - needs these components
  - #041 (Menu Widget System) - needs base components

- **shadcn/ui components:**
  - navigation-menu
  - dropdown-menu
  - sheet (mobile drawer)
  - separator
  - avatar
  - button

## Deliverables

1. **TopMenu Component**
   - TopMenu.tsx (main component)
   - TopMenuItem.tsx (single item)
   - TopMenuDropdown.tsx (submenu dropdown)
   - TopMenu.test.tsx (tests)

2. **SideMenu Component**
   - SideMenu.tsx (main sidebar)
   - SideMenuItem.tsx (menu item with icon)
   - SideMenuGroup.tsx (expandable group)
   - SideMenu.test.tsx (tests)

3. **FooterMenu Component**
   - FooterMenu.tsx
   - FooterMenu.test.tsx

4. **Header Component**
   - Header.tsx (unified header)
   - UserMenu.tsx (user dropdown)
   - Header.test.tsx (tests)

5. **Shared Utilities**
   - MenuItem.tsx (shared item component)
   - MenuIcon.tsx (icon renderer)
   - types.ts (TypeScript interfaces)
   - utils.ts (helper functions)

6. **Tests**
   - Unit tests for all components
   - Accessibility tests (ARIA, keyboard nav)
   - Responsive behavior tests

7. **Documentation**
   - Component usage guide
   - Props documentation
   - Examples and demos
   - Storybook stories

## Testing Requirements

### Unit Tests
```typescript
describe('TopMenu', () => {
  it('renders menu items', () => {});
  it('handles item click', () => {});
  it('shows dropdown on hover', () => {});
  it('navigates on item click', () => {});
  it('filters items by permissions', () => {});
});

describe('SideMenu', () => {
  it('renders menu items with icons', () => {});
  it('expands/collapses groups', () => {});
  it('highlights active item', () => {});
  it('collapses to icon-only mode', () => {});
  it('shows mobile drawer on small screens', () => {});
});
```

### Accessibility Tests
- Keyboard navigation (Tab, Arrow keys, Enter, Esc)
- ARIA labels and roles
- Focus management
- Screen reader support

### Visual Tests
- Hover states
- Active states
- Collapsed states
- Mobile responsive layout
- Dark mode

## Performance Considerations

- Lazy load menu icons
- Memoize menu items
- Virtualize long menu lists (if >50 items)
- Debounce search/filter
- Minimize re-renders

## Migration Path

This issue implements the presentation layer only. Issue #040 will add:
- Bootstrap API integration
- Menu data fetching
- Dynamic menu refresh
- State management

## Notes

- All components must work with the configuration-driven architecture
- Menu structure comes from `/ui/bootstrap` API
- Permission filtering happens server-side, but UI should respect it
- Menu can be refreshed at any time (page navigation, action execution)
- Dark mode support is critical
- Mobile-first responsive design
- Accessibility is non-negotiable (WCAG 2.1 AA)

## Success Criteria

✅ Top menu renders horizontally with dropdowns  
✅ Side menu renders with icons and collapsible groups  
✅ Footer menu renders in columns  
✅ Header integrates logo and top menu  
✅ All menus are responsive (mobile drawer)  
✅ Keyboard navigation works  
✅ ARIA attributes present  
✅ Tests pass (>80% coverage)  
✅ Dark mode works  
✅ No performance issues (<100ms render)
