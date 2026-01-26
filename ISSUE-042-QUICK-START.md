# Issue #042: Quick Start Guide

## 📋 Planning Complete - Ready to Start Implementation

### Start Here

**For Quick Overview:** Read `ISSUE-042-EXECUTIVE-SUMMARY.md` (5 min read)

**For Full Details:**
1. `ISSUE-042-EXECUTIVE-SUMMARY.md` - Overview and Q&A
2. `ISSUE-042-SPA-REDESIGN-PLAN.md` - Complete 6-week plan
3. `ISSUE-042-MISSING-COMPONENTS.md` - Component specifications
4. `ISSUE-042-DEMO-DATA-SPEC.md` - Data structures and configs

---

## 🚀 Week 1 Implementation Checklist

### Day 1: shadcn Components Installation

```bash
# Install required shadcn components
npx shadcn@latest add sidebar
npx shadcn@latest add scroll-area
npx shadcn@latest add separator
```

**Verify:** Components installed in `src/components/ui/`

---

### Day 2-3: MenuContext Provider

**File:** `src/contexts/MenuContext.tsx`

**Interface:**
```typescript
interface MenuContextValue {
  topMenuItems: MenuItem[]
  sideMenuItems: MenuItem[]
  footerMenuItems: MenuItem[]
  activeItemId: string | null
  sidebarCollapsed: boolean
  isLoading: boolean
  
  updateMenus: (config: MenuConfiguration) => void
  setActiveItem: (itemId: string | null) => void
  toggleSidebar: () => void
  loadMenuConfig: (context: string) => Promise<void>
}
```

**Tasks:**
- [ ] Create context and provider
- [ ] Implement state management
- [ ] Add menu update logic
- [ ] Create useMenu() hook
- [ ] Write unit tests

**Test:**
```typescript
const { updateMenus, topMenuItems } = useMenu()
updateMenus({ topMenu: [...], sideMenu: [...] })
expect(topMenuItems).toHaveLength(3)
```

---

### Day 3-4: AppLayout Component

**File:** `src/components/layouts/AppLayout.tsx`

**Structure:**
```typescript
<div className="flex min-h-screen">
  <Sidebar>
    <SideMenu items={sideMenuItems} />
  </Sidebar>
  
  <div className="flex-1 flex flex-col">
    <Header>
      <TopMenu items={topMenuItems} />
    </Header>
    
    <main className="flex-1">
      {children}
    </main>
    
    <Footer>
      <FooterMenu items={footerMenuItems} />
    </Footer>
  </div>
</div>
```

**Tasks:**
- [ ] Create AppLayout component
- [ ] Integrate shadcn Sidebar
- [ ] Add responsive behavior
- [ ] Implement collapse/expand
- [ ] Style with Tailwind
- [ ] Write tests

**Test:** Verify menus don't unmount on route change

---

### Day 4: Menu Configuration Service

**File:** `src/services/menuConfigService.ts`

**Functions:**
```typescript
export async function loadMenuConfig(context: 'public' | 'dashboard'): Promise<MenuConfiguration>
export function cacheMenuConfig(context: string, config: MenuConfiguration): void
export function getCachedMenuConfig(context: string): MenuConfiguration | null
```

**Tasks:**
- [ ] Create service
- [ ] Implement API calls
- [ ] Add caching logic
- [ ] Handle errors
- [ ] Write tests

---

### Day 5: Update __root.tsx

**File:** `src/routes/__root.tsx`

**Updated Structure:**
```typescript
<ThemeProvider>
  <BootstrapProvider>
    <BrandingProvider>
      <MenuProvider>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </MenuProvider>
    </BrandingProvider>
  </BootstrapProvider>
</ThemeProvider>
```

**Tasks:**
- [ ] Wrap with MenuProvider
- [ ] Replace simple div with AppLayout
- [ ] Test navigation
- [ ] Verify menus persist
- [ ] Check theme application

---

## ✅ Week 1 Success Criteria

- [ ] Menus render and don't reload on navigation
- [ ] Sidebar collapses/expands
- [ ] Menu items update based on context
- [ ] No console errors
- [ ] All tests passing
- [ ] TypeScript compiles without errors

---

## 📊 Progress Tracking

### Completed
- [x] Repository exploration and analysis
- [x] Documentation review
- [x] shadcn component catalog
- [x] Comprehensive planning (4 documents)
- [x] Component specifications
- [x] Demo data design
- [x] Risk assessment
- [x] Timeline estimation

### Week 1 (Current)
- [ ] shadcn components installed
- [ ] MenuContext created
- [ ] AppLayout created
- [ ] Menu config service created
- [ ] __root.tsx updated
- [ ] Week 1 tests passing

### Weeks 2-6 (Pending)
- Week 2: New widgets (Hero, Pricing, Team, LocationWizard)
- Week 3: Management widgets + Demo pages
- Week 4: Multi-tenant theming (3 tenants)
- Week 5: Data & Forms (generators, validation, APIs)
- Week 6: Testing & Polish (E2E, performance, docs)

---

## 🔧 Development Commands

```bash
# Start dev server
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📝 Commit Message Convention

```
feat(menu): Add MenuContext provider with state management

- Implement MenuContext with top/side/footer menu items
- Add updateMenus() and setActiveItem() actions
- Create useMenu() hook for components
- Add unit tests with 90% coverage

Relates to #042
```

---

## 🐛 Troubleshooting

### Issue: shadcn components not found
**Solution:**
```bash
# Verify components.json exists
cat components.json

# Re-run installation
npx shadcn@latest add sidebar --overwrite
```

### Issue: Menu items not updating
**Solution:**
1. Check MenuContext is wrapped at root
2. Verify useMenu() is called in components
3. Check console for errors in updateMenus()
4. Debug with React DevTools

### Issue: Sidebar not responsive
**Solution:**
1. Check Tailwind breakpoints
2. Verify shadcn Sidebar props
3. Test on different screen sizes
4. Check for CSS conflicts

---

## 📚 Key Resources

### Documentation
- [TanStack Router Docs](https://tanstack.com/router/latest)
- [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/radix/sidebar)
- [React Context API](https://react.dev/reference/react/createContext)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Project Docs
- `documentation/architecture.md` - System architecture
- `documentation/widget-catalog.md` - Widget specifications
- `documentation/branding.md` - Multi-tenant theming
- `documentation/menu-management-plan.md` - Menu system (if exists)

---

## 🎯 Daily Checklist Template

**Day X - [Date]**

**Goal:** [What you're working on]

**Tasks:**
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

**Completed:**
- [x] Completed task 1
- [x] Completed task 2

**Blockers:**
- None / [Describe blocker]

**Notes:**
- [Any important notes or decisions]

**Tomorrow:**
- [x] Next task planned

---

## 🔗 Quick Links

- **GitHub Repo:** https://github.com/sinisalt/open_portal
- **Branch:** `feature/spa-redesign` (to be created)
- **Issue Number:** #042
- **Planning Docs:** `ISSUE-042-*.md` files
- **shadcn Components:** https://ui.shadcn.com/docs/components

---

## 💡 Tips for Success

1. **Start Small:** Get MenuContext working first, then add features
2. **Test Early:** Write tests alongside code, not after
3. **Commit Often:** Small, focused commits are easier to review
4. **Ask Questions:** Reference planning docs for clarification
5. **Use DevTools:** React and TanStack Router DevTools are invaluable
6. **Check Examples:** Look at existing widgets for patterns
7. **Review PRs:** Get feedback early and often

---

**Status:** 📋 Planning Complete  
**Ready to Start:** Week 1 - SPA Layout Architecture  
**Estimated Duration:** 5 working days  
**Next Milestone:** Persistent menus functional

Good luck! 🚀
