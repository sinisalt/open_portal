# JSON Schema Testing Guide

This guide explains how to validate OpenPortal configuration files against the JSON schemas defined in the documentation.

## Overview

The JSON schemas in `documentation/json-schemas.md` define the structure and validation rules for all OpenPortal configuration types. This document shows how to test and validate configurations against these schemas.

## Schema Coverage

The following schemas are fully documented and ready for validation:

### Core Configuration Schemas
- **PageConfig** - Complete page configuration including widgets, datasources, and actions
- **RouteConfig** - Route-to-page mappings for the application router
- **BootstrapConfig** - Initial application configuration loaded on startup
- **ValidationRules** - Comprehensive validation rules for form fields

### Sub-schemas
- **Widget** - Base widget configuration
- **Datasource** - Data source configuration (HTTP, WebSocket, static)
- **Action** - Action definitions and chaining
- **EventHandler** - Event handling configuration
- **Policy** - Permission and authorization policies
- **Binding** - Data binding configuration
- **Layout** - Layout configuration for grids and containers
- **FormConfig** - Form-specific configuration
- **AuthConfig** - Authentication configuration
- **ThemeConfig** - Theme configuration
- **BrandingConfig** - Tenant branding configuration
- **MenuConfig** - Navigation menu structure

### Individual Widget Schemas (12 Core Widgets)

All widgets from Widget Taxonomy v1 have complete schemas:

**Layout & Structure:**
1. Page
2. Section
3. Grid
4. Card

**Form Inputs:**
5. TextInput
6. Select
7. DatePicker
8. Checkbox

**Data Display:**
9. Table
10. KPI

**Dialogs & Feedback:**
11. Modal
12. Toast

## Example Configurations

Example configurations are provided in `test-schemas/examples/`:

- `simple-page.json` - Minimal valid page configuration
- `route-config.json` - Route configuration example
- `bootstrap-config.json` - Bootstrap configuration example

## Validation with Node.js

To validate configurations programmatically, use the AJV library:

```bash
npm install ajv
```

**Validation script example:**

```javascript
const Ajv = require('ajv');
const fs = require('fs');

const ajv = new Ajv({ allErrors: true });

// Load schema
const schema = JSON.parse(fs.readFileSync('./schemas/page-config.json', 'utf8'));

// Load configuration to validate
const config = JSON.parse(fs.readFileSync('./examples/simple-page.json', 'utf8'));

// Validate
const validate = ajv.compile(schema);
const valid = validate(config);

if (!valid) {
  console.error('Validation failed:');
  console.error(validate.errors);
} else {
  console.log('Configuration is valid!');
}
```

## Validation with Python

To validate using Python:

```bash
pip install jsonschema
```

**Validation script example:**

```python
import json
from jsonschema import validate, ValidationError

# Load schema
with open('./schemas/page-config.json', 'r') as f:
    schema = json.load(f)

# Load configuration
with open('./examples/simple-page.json', 'r') as f:
    config = json.load(f)

# Validate
try:
    validate(instance=config, schema=schema)
    print("Configuration is valid!")
except ValidationError as err:
    print(f"Validation failed: {err.message}")
```

## Manual Validation

For quick manual validation, use online tools:

1. **JSONSchemaLint** - https://jsonschemalint.com/
2. **JSON Schema Validator** - https://www.jsonschemavalidator.net/

### Steps:
1. Copy the schema from `documentation/json-schemas.md`
2. Copy the configuration to validate
3. Paste both into the online validator
4. Review validation results

## Common Validation Errors

### Missing Required Properties
```json
{
  "error": "Required property 'pageId' is missing",
  "path": "/"
}
```
**Solution:** Add the required property to your configuration.

### Invalid Type
```json
{
  "error": "Property 'padding' should be string, got number",
  "path": "/widgets/0/props/padding"
}
```
**Solution:** Check the schema for the correct type and convert your value.

### Invalid Enum Value
```json
{
  "error": "Value 'xlarge' is not in enum ['none', 'sm', 'md', 'lg']",
  "path": "/widgets/0/props/padding"
}
```
**Solution:** Use one of the allowed enum values.

### Pattern Mismatch
```json
{
  "error": "String does not match pattern '^[a-z][a-z0-9-]*$'",
  "path": "/pageId"
}
```
**Solution:** Ensure your string follows the required pattern (lowercase, alphanumeric with hyphens).

## Schema Versioning

All schemas include a `schemaVersion` field to support evolution:

```json
{
  "pageId": "my-page",
  "schemaVersion": "1.0",
  ...
}
```

The platform supports multiple schema versions simultaneously. See the "Schema Versioning Strategy" section in `json-schemas.md` for details.

## Testing Checklist

When creating or modifying configurations:

- [ ] Configuration validates against its schema
- [ ] All required fields are present
- [ ] All IDs follow naming conventions (lowercase, alphanumeric with hyphens)
- [ ] All action IDs reference valid actions
- [ ] All datasource IDs reference valid datasources
- [ ] All widget types are registered in the widget registry
- [ ] All permissions are valid
- [ ] URLs are properly formatted
- [ ] Dates are in ISO 8601 format
- [ ] Colors are in hex format (#RRGGBB)

## Issue #002 Acceptance Criteria ✅

All acceptance criteria from Issue #002 have been met:

- [x] JSON Schema created for PageConfig
- [x] JSON Schema created for WidgetConfig (individual schemas for all 12 core widgets)
- [x] JSON Schema created for ActionConfig
- [x] JSON Schema created for DatasourceConfig
- [x] JSON Schema created for RouteConfig
- [x] JSON Schema created for BootstrapConfig
- [x] JSON Schema created for MenuConfig
- [x] JSON Schema created for ValidationRules
- [x] JSON Schema created for BrandingConfig
- [x] All schemas include examples
- [x] Schemas support extensibility for custom widgets/actions
- [x] Schema validation rules documented
- [x] Documentation includes usage examples

## Next Steps

1. **Extract Schemas**: Extract individual schema definitions from `json-schemas.md` into separate `.json` files for programmatic use
2. **CI/CD Integration**: Add schema validation to the CI/CD pipeline
3. **Backend Validation**: Implement server-side schema validation before saving configurations
4. **Schema Registry**: Create a schema registry service for dynamic schema loading
5. **IDE Support**: Provide JSON schemas for IDE autocomplete and validation

## References

- Widget Taxonomy v1: `documentation/widget-taxonomy.md`
- Architecture: `documentation/architecture.md`
- API Specification: `documentation/api-specification.md`
- Roadmap: `documentation/roadmap.md`
