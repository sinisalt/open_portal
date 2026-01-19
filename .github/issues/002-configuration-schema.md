# Issue #002: Configuration Schema Draft (JSON Schema)

**Phase:** Phase 0 - Discovery & Foundation  
**Weeks:** 1-2  
**Component:** Documentation  
**Estimated Effort:** 4 days  
**Priority:** High  
**Labels:** phase-0, documentation, foundation, schema

## Description
Define and document the JSON Schema for all configuration structures used in the OpenPortal platform, including page configurations, widget configurations, action definitions, datasource configurations, and routing configurations.

## Context
The configuration schema is the contract between the backend and frontend. It defines how pages, widgets, actions, and data are described in JSON format. This schema will be used for validation, documentation, and tooling.

## Acceptance Criteria
- [ ] JSON Schema created for PageConfig
- [ ] JSON Schema created for WidgetConfig
- [ ] JSON Schema created for ActionConfig
- [ ] JSON Schema created for DatasourceConfig
- [ ] JSON Schema created for RouteConfig
- [ ] JSON Schema created for BootstrapConfig
- [ ] JSON Schema created for MenuConfig
- [ ] JSON Schema created for ValidationRules
- [ ] JSON Schema created for BrandingConfig
- [ ] All schemas include examples
- [ ] Schemas support extensibility for custom widgets/actions
- [ ] Schema validation rules documented
- [ ] Documentation includes usage examples

## Dependencies
- Depends on: #001 (Widget Taxonomy must be defined first)

## Technical Notes
- Use JSON Schema Draft-07 or later
- Ensure schemas support composition (allOf, oneOf, anyOf)
- Define clear naming conventions
- Include default values where appropriate
- Support both static and dynamic property resolution
- Consider versioning strategy for schema evolution

## Schema Components
1. **PageConfig**: Top-level page structure
2. **WidgetConfig**: Individual widget configuration
3. **ActionConfig**: Action definitions and chaining
4. **DatasourceConfig**: Data fetching and caching
5. **RouteConfig**: Route-to-page mapping
6. **BootstrapConfig**: Initial app configuration
7. **MenuConfig**: Navigation menu structure
8. **ValidationRules**: Form validation rules
9. **BrandingConfig**: Tenant branding configuration

## Testing Requirements
- [ ] Validate all example configurations against schemas
- [ ] Create test cases for invalid configurations
- [ ] Verify schema validation catches common errors

## Documentation
- [ ] Create json-schemas.md with all schema definitions
- [ ] Include comprehensive examples for each schema
- [ ] Document schema evolution strategy
- [ ] Add validation guidelines

## Deliverables
- Complete JSON Schema definitions
- Schema documentation with examples
- Schema validation guidelines
