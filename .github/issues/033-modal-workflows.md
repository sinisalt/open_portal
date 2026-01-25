# Issue #042: Modal Workflows and Multi-step Modals

**Phase:** Phase 2 - Forms & Workflows  
**Weeks:** 13-14  
**Component:** Frontend  
**Estimated Effort:** 5 days  
**Priority:** Medium  
**Labels:** phase-2, frontend, modals, workflows

**Updated:** January 23, 2026 - Added shadcn/ui references for consistency with Phase 1 updates

## Description
Implement modal workflow system including data passing between parent and modal, return values from modals, multi-step modal wizards, and nested modal support.

**Note:** This issue builds on the Modal widget implemented in Issue 019 which uses shadcn Dialog (built on @radix-ui/react-dialog). Radix Dialog supports nested modals and focus management automatically.

## Acceptance Criteria
- [ ] Modal page system (full page configs in modals)
- [ ] Data passing to modals (input props)
- [ ] Return values from modals (output data)
- [ ] Multi-step modal wizard component
- [ ] Step navigation (next, prev, jump)
- [ ] Step validation
- [ ] Nested modals support
- [ ] Modal state management
- [ ] Modal action handlers

## Use Cases
- Image picker modal
- Record selector modal
- Multi-step wizards (onboarding, checkout)
- Confirmation dialogs with forms
- Detail views

**Implementation Notes:**
- Modal container: shadcn Dialog from Issue 019
- Wizard stepper: shadcn Tabs or custom stepper component
- Nested modals: Radix Dialog supports multiple dialog layers with proper focus management
- Navigation: shadcn Button components for prev/next actions

## Dependencies
- Depends on: #019 (Basic modal widget using shadcn Dialog)
- Depends on: #029 (Advanced form features)
- Optional: shadcn Tabs for wizard stepper UI
- References: Radix Dialog nested modal support

## Deliverables
- Modal workflow system (builds on shadcn Dialog)
- Wizard component (using shadcn Tabs or custom stepper)
- Tests
- Documentation

## Technical Notes
- shadcn Dialog (Radix) handles focus trap and nested modals automatically
- Consider shadcn Tabs for wizard step navigation
- Use TanStack Router for modal routing if needed
