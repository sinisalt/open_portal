# JSON Configuration Schemas

## Overview

This document provides JSON Schema definitions for the core configuration objects used in the OpenPortal platform.

---

## Core Schema: PageConfig

Complete page configuration including widgets, datasources, and actions.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openportal.example.com/schemas/page-config.json",
  "title": "PageConfig",
  "type": "object",
  "required": ["pageId", "schemaVersion", "widgets"],
  "properties": {
    "pageId": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9-]*$",
      "description": "Unique page identifier"
    },
    "schemaVersion": {
      "type": "string",
      "description": "Schema compatibility version"
    },
    "configVersion": {
      "type": "string",
      "description": "Config version for cache invalidation"
    },
    "title": {
      "type": "string",
      "description": "Page title"
    },
    "description": {
      "type": "string",
      "description": "Page description"
    },
    "layout": {
      "$ref": "#/definitions/Layout"
    },
    "widgets": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Widget"
      },
      "minItems": 1
    },
    "datasources": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Datasource"
      }
    },
    "actions": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Action"
      }
    },
    "events": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/EventHandler"
      }
    },
    "policy": {
      "$ref": "#/definitions/Policy"
    },
    "generatedAt": {
      "type": "string",
      "format": "date-time"
    }
  },
  "definitions": {
    "Layout": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": {
          "type": "string",
          "enum": ["grid", "flex", "tabs", "stack"]
        },
        "grid": {
          "type": "object",
          "properties": {
            "columns": {
              "type": "integer",
              "minimum": 1,
              "maximum": 24,
              "default": 12
            },
            "gap": {
              "type": "string",
              "enum": ["none", "xs", "sm", "md", "lg", "xl"]
            }
          }
        }
      }
    },
    "Widget": {
      "type": "object",
      "required": ["id", "type"],
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^[a-z][a-z0-9-]*$"
        },
        "type": {
          "type": "string",
          "description": "Widget type from registry"
        },
        "props": {
          "type": "object",
          "description": "Widget-specific properties"
        },
        "bindings": {
          "type": "object",
          "additionalProperties": {
            "$ref": "#/definitions/Binding"
          }
        },
        "datasourceId": {
          "type": "string"
        },
        "children": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Widget"
          }
        },
        "events": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/EventHandler"
          }
        },
        "policy": {
          "$ref": "#/definitions/Policy"
        }
      }
    },
    "Binding": {
      "type": "object",
      "properties": {
        "statePath": {
          "type": "string",
          "description": "Dot path into page state"
        },
        "dataPath": {
          "type": "string",
          "description": "Dot path into datasource response"
        },
        "mode": {
          "type": "string",
          "enum": ["read", "write", "twoWay"],
          "default": "read"
        }
      }
    },
    "Datasource": {
      "type": "object",
      "required": ["id", "kind"],
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^[a-z][a-z0-9-]*$"
        },
        "kind": {
          "type": "string",
          "enum": ["http", "websocket", "static"]
        },
        "fetchPolicy": {
          "$ref": "#/definitions/FetchPolicy"
        },
        "http": {
          "type": "object",
          "required": ["method", "url"],
          "properties": {
            "method": {
              "type": "string",
              "enum": ["GET", "POST", "PUT", "PATCH", "DELETE"]
            },
            "url": {
              "type": "string"
            },
            "headers": {
              "type": "object",
              "additionalProperties": {
                "type": "string"
              }
            }
          }
        }
      }
    },
    "FetchPolicy": {
      "type": "object",
      "properties": {
        "mode": {
          "type": "string",
          "enum": ["onMount", "always", "manual", "interval", "websocket"],
          "default": "onMount"
        },
        "intervalSeconds": {
          "type": "integer",
          "minimum": 1
        }
      }
    },
    "Action": {
      "type": "object",
      "required": ["id", "kind"],
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^[a-z][a-z0-9-]*$"
        },
        "kind": {
          "type": "string",
          "enum": [
            "executeAction",
            "apiCall",
            "navigate",
            "openModal",
            "closeModal",
            "setState",
            "showToast"
          ]
        },
        "executeAction": {
          "type": "object",
          "properties": {
            "endpoint": {
              "type": "string",
              "default": "/ui/actions/execute"
            },
            "actionId": {
              "type": "string"
            }
          }
        },
        "navigate": {
          "type": "object",
          "required": ["to"],
          "properties": {
            "to": {
              "type": "string"
            },
            "replace": {
              "type": "boolean",
              "default": false
            }
          }
        },
        "showToast": {
          "type": "object",
          "required": ["message"],
          "properties": {
            "message": {
              "type": "string"
            },
            "variant": {
              "type": "string",
              "enum": ["success", "error", "warning", "info"],
              "default": "info"
            }
          }
        }
      }
    },
    "EventHandler": {
      "type": "object",
      "required": ["on", "do"],
      "properties": {
        "on": {
          "type": "string",
          "description": "Event name (e.g., onClick, onSubmit)"
        },
        "when": {
          "type": "string",
          "description": "Optional condition expression"
        },
        "do": {
          "type": "array",
          "items": {
            "type": "string",
            "description": "Action ID to execute"
          },
          "minItems": 1
        }
      }
    },
    "Policy": {
      "type": "object",
      "properties": {
        "allow": {
          "type": "boolean",
          "description": "If false, element is hidden/blocked"
        },
        "requireAllPermissions": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "requireAnyPermissions": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

---

## Example: Complete Dashboard Page Configuration

```json
{
  "pageId": "dashboard",
  "schemaVersion": "1.0",
  "configVersion": "v1.2.3-20240118",
  "title": "Dashboard",
  "description": "Main application dashboard",
  "layout": {
    "type": "grid",
    "grid": {
      "columns": 12,
      "gap": "md"
    }
  },
  "widgets": [
    {
      "id": "header-section",
      "type": "Section",
      "props": {
        "title": "Overview",
        "padding": "lg"
      },
      "children": [
        {
          "id": "revenue-kpi",
          "type": "KPI",
          "props": {
            "label": "Total Revenue",
            "format": "currency",
            "showTrend": true
          },
          "datasourceId": "revenue-data",
          "bindings": {
            "value": {
              "dataPath": "datasources.revenue-data.value"
            },
            "trend": {
              "dataPath": "datasources.revenue-data.trend"
            }
          },
          "events": [
            {
              "on": "onClick",
              "do": ["navigate-to-revenue-details"]
            }
          ]
        },
        {
          "id": "orders-kpi",
          "type": "KPI",
          "props": {
            "label": "Total Orders",
            "format": "number",
            "showTrend": true
          },
          "datasourceId": "orders-data",
          "bindings": {
            "value": {
              "dataPath": "datasources.orders-data.value"
            }
          }
        }
      ]
    },
    {
      "id": "chart-section",
      "type": "Section",
      "props": {
        "title": "Sales Trend",
        "collapsible": true
      },
      "children": [
        {
          "id": "sales-chart",
          "type": "Chart",
          "props": {
            "chartType": "line",
            "height": 400,
            "legend": {
              "show": true,
              "position": "bottom"
            }
          },
          "datasourceId": "sales-trend-data",
          "bindings": {
            "data": {
              "dataPath": "datasources.sales-trend-data.series"
            }
          }
        }
      ]
    },
    {
      "id": "recent-orders-section",
      "type": "Section",
      "props": {
        "title": "Recent Orders"
      },
      "children": [
        {
          "id": "orders-table",
          "type": "Table",
          "props": {
            "columns": [
              {
                "id": "order-id",
                "label": "Order ID",
                "field": "id",
                "sortable": true
              },
              {
                "id": "customer",
                "label": "Customer",
                "field": "customerName",
                "sortable": true
              },
              {
                "id": "amount",
                "label": "Amount",
                "field": "amount",
                "format": "currency",
                "align": "right"
              },
              {
                "id": "status",
                "label": "Status",
                "field": "status"
              }
            ],
            "rowKey": "id",
            "pagination": {
              "enabled": true,
              "pageSize": 10,
              "serverSide": true
            },
            "rowActions": [
              {
                "id": "view-order",
                "label": "View",
                "actionId": "navigate-to-order"
              }
            ]
          },
          "datasourceId": "recent-orders-data",
          "bindings": {
            "data": {
              "dataPath": "datasources.recent-orders-data.rows"
            },
            "pagination": {
              "dataPath": "datasources.recent-orders-data.pagination"
            }
          },
          "events": [
            {
              "on": "onRowClick",
              "do": ["navigate-to-order"]
            },
            {
              "on": "onPageChange",
              "do": ["refresh-orders-table"]
            }
          ]
        }
      ]
    }
  ],
  "datasources": [
    {
      "id": "revenue-data",
      "kind": "http",
      "fetchPolicy": {
        "mode": "onMount"
      },
      "http": {
        "method": "GET",
        "url": "/api/kpi/revenue"
      }
    },
    {
      "id": "orders-data",
      "kind": "http",
      "fetchPolicy": {
        "mode": "onMount"
      },
      "http": {
        "method": "GET",
        "url": "/api/kpi/orders"
      }
    },
    {
      "id": "sales-trend-data",
      "kind": "http",
      "fetchPolicy": {
        "mode": "onMount"
      },
      "http": {
        "method": "GET",
        "url": "/api/analytics/sales-trend",
        "query": {
          "period": "30d"
        }
      }
    },
    {
      "id": "recent-orders-data",
      "kind": "http",
      "fetchPolicy": {
        "mode": "onMount"
      },
      "http": {
        "method": "GET",
        "url": "/api/orders/recent"
      }
    }
  ],
  "actions": [
    {
      "id": "navigate-to-revenue-details",
      "kind": "navigate",
      "navigate": {
        "to": "/analytics/revenue"
      }
    },
    {
      "id": "navigate-to-order",
      "kind": "navigate",
      "navigate": {
        "to": "/orders/{{context.row.id}}"
      }
    },
    {
      "id": "refresh-orders-table",
      "kind": "executeAction",
      "executeAction": {
        "actionId": "refresh-orders"
      }
    }
  ],
  "events": [
    {
      "on": "onLoad",
      "do": []
    }
  ],
  "generatedAt": "2024-01-18T10:00:00Z"
}
```

---

## Form Configuration Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openportal.example.com/schemas/form-config.json",
  "title": "FormConfig",
  "type": "object",
  "required": ["id", "fields"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9-]*$"
    },
    "title": {
      "type": "string"
    },
    "fields": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/FormField"
      },
      "minItems": 1
    },
    "submitActionId": {
      "type": "string"
    },
    "layout": {
      "$ref": "#/definitions/Layout"
    }
  },
  "definitions": {
    "FormField": {
      "type": "object",
      "required": ["id", "binding", "component"],
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^[a-z][a-z0-9-]*$"
        },
        "label": {
          "type": "string"
        },
        "binding": {
          "type": "string",
          "description": "Dot path in form values"
        },
        "component": {
          "type": "string",
          "enum": [
            "TextInput",
            "Textarea",
            "Select",
            "DatePicker",
            "Checkbox",
            "FileUpload"
          ]
        },
        "props": {
          "type": "object"
        },
        "validators": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Validator"
          }
        },
        "visibilityPolicy": {
          "type": "object"
        }
      }
    },
    "Validator": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "required",
            "minLength",
            "maxLength",
            "email",
            "regex"
          ]
        },
        "message": {
          "type": "string"
        },
        "value": {
          "description": "Validator parameter value"
        }
      }
    },
    "Layout": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["grid", "stack"]
        }
      }
    }
  }
}
```

---

## Example: User Profile Form

```json
{
  "id": "profile-form",
  "title": "Edit Profile",
  "layout": {
    "type": "grid",
    "columns": 2,
    "gap": "md"
  },
  "fields": [
    {
      "id": "name",
      "label": "Full Name",
      "binding": "values.name",
      "component": "TextInput",
      "props": {
        "placeholder": "Enter your full name",
        "required": true
      },
      "validators": [
        {
          "type": "required",
          "message": "Name is required"
        },
        {
          "type": "minLength",
          "value": 2,
          "message": "Name must be at least 2 characters"
        }
      ]
    },
    {
      "id": "email",
      "label": "Email Address",
      "binding": "values.email",
      "component": "TextInput",
      "props": {
        "type": "email",
        "placeholder": "your@email.com",
        "required": true
      },
      "validators": [
        {
          "type": "required",
          "message": "Email is required"
        },
        {
          "type": "email",
          "message": "Please enter a valid email address"
        }
      ]
    },
    {
      "id": "phone",
      "label": "Phone Number",
      "binding": "values.phone",
      "component": "TextInput",
      "props": {
        "type": "tel",
        "placeholder": "+1 (555) 000-0000"
      }
    },
    {
      "id": "birthdate",
      "label": "Date of Birth",
      "binding": "values.birthdate",
      "component": "DatePicker",
      "props": {
        "format": "MM/DD/YYYY",
        "maxDate": "today"
      }
    },
    {
      "id": "bio",
      "label": "Biography",
      "binding": "values.bio",
      "component": "Textarea",
      "props": {
        "rows": 4,
        "maxLength": 500,
        "placeholder": "Tell us about yourself"
      }
    },
    {
      "id": "avatar",
      "label": "Profile Picture",
      "binding": "values.avatar",
      "component": "FileUpload",
      "props": {
        "accept": "image/*",
        "maxSize": 5242880,
        "showPreview": true
      }
    }
  ],
  "submitActionId": "save-profile"
}
```

---

## Validation

All configuration files should be validated against their respective schemas before deployment. Use standard JSON Schema validation tools.

### Validation Tools
- Node.js: `ajv` package
- Python: `jsonschema` package
- Online: [JSONSchemaLint](https://jsonschemalint.com/)

### CI/CD Integration

```bash
# Example validation script
npm install ajv ajv-cli -g
ajv validate -s page-config.schema.json -d dashboard-page.json
```

---

**Version:** 1.0
**Last Updated:** January 2026
