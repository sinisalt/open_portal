# Issue #029: Advanced Form Features (Conditional Fields, Cross-field Validation)

**Phase:** Phase 2 - Forms & Workflows  
**Weeks:** 11-12  
**Component:** Frontend  
**Estimated Effort:** 5 days  
**Priority:** Medium  
**Labels:** phase-2, frontend, forms, advanced

**Updated:** January 23, 2026 - Added shadcn/ui references for consistency with Phase 1 updates

## Description
Implement advanced form capabilities including conditional field visibility, cross-field validation, computed/derived fields, and dynamic field generation based on form state or external data.

**Note:** This issue builds on the form widgets implemented in Issue 017 (TextInput, Select, DatePicker, Checkbox) which use shadcn/ui components. Advanced features will leverage the same shadcn foundation.

## Acceptance Criteria
- [ ] Conditional field visibility based on other field values
- [ ] Cross-field validation rules
- [ ] Computed/derived field values
- [ ] Async field lookups (typeahead, remote select)
- [ ] Field-level permissions (show/hide/readonly based on role)
- [ ] Dynamic field generation
- [ ] Field dependency tracking
- [ ] Performance optimization for complex forms

## Conditional Visibility
```typescript
{
  type: "TextInput",
  props: { label: "Company Name" },
  visibility: {
    condition: "{{formData.employmentStatus}} === 'employed'"
  }
}
```

## Cross-field Validation
```typescript
{
  type: "TextInput",
  props: { label: "End Date" },
  validation: {
    custom: (value, formData) => {
      if (value < formData.startDate) {
        return "End date must be after start date";
      }
      return null; // null indicates no error
    }
  }
}
```

## Computed Fields
```typescript
{
  type: "TextInput",
  props: { label: "Total", readonly: true },
  computed: "{{formData.quantity}} * {{formData.price}}"
}
```

## Async Lookups
```typescript
{
  type: "Select",
  props: { 
    label: "User",
    searchable: true,
    async: true
  },
  datasource: {
    type: "http",
    config: {
      url: "/api/users/search?q={{searchTerm}}"
    }
  }
}
```

**Implementation Note:** Async lookups will use the searchable Select variant from Issue 017, which is built on shadcn Command + Popover components for optimal UX.

## Dependencies
- Depends on: #022 (Form handling system with React Hook Form)
- Depends on: #017 (Form widgets - TextInput, Select, DatePicker, Checkbox using shadcn/ui)
- References: shadcn Command + Popover for async typeahead

## Technical Notes
- Use reactive programming for field dependencies (React Hook Form watch/subscribe)
- Debounce async lookups (shadcn Command component supports this)
- Cache lookup results
- Minimize re-renders (React.memo, useMemo)
- Support complex conditional expressions
- Leverage shadcn/ui components from Issue 017 as foundation
- Radix UI primitives handle accessibility automatically

## Testing Requirements
- [ ] Test conditional visibility
- [ ] Test cross-field validation
- [ ] Test computed fields
- [ ] Test async lookups
- [ ] Performance testing with complex forms
- [ ] Integration tests

## Documentation
- [ ] Conditional logic guide
- [ ] Cross-field validation patterns
- [ ] Computed fields examples
- [ ] Async lookup configuration

## Deliverables
- Conditional visibility engine
- Cross-field validation
- Computed fields implementation
- Async lookup support
- Tests
- Documentation
