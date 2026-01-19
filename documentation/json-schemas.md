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

## RouteConfig Schema

Defines route-to-page mappings for the application router.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openportal.example.com/schemas/route-config.json",
  "title": "RouteConfig",
  "type": "object",
  "required": ["routes"],
  "properties": {
    "routes": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Route"
      },
      "minItems": 1
    },
    "notFoundPageId": {
      "type": "string",
      "description": "Page to show for 404 errors"
    },
    "errorPageId": {
      "type": "string",
      "description": "Page to show for general errors"
    }
  },
  "definitions": {
    "Route": {
      "type": "object",
      "required": ["path", "pageId"],
      "properties": {
        "path": {
          "type": "string",
          "description": "URL path pattern, supports :param syntax"
        },
        "pageId": {
          "type": "string",
          "description": "Page configuration ID to render"
        },
        "exact": {
          "type": "boolean",
          "default": false,
          "description": "Require exact path match"
        },
        "title": {
          "type": "string",
          "description": "Route display name"
        },
        "requiresAuth": {
          "type": "boolean",
          "default": true,
          "description": "Route requires authentication"
        },
        "permissions": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Required permissions to access route"
        },
        "params": {
          "type": "object",
          "description": "Default route parameters"
        },
        "metadata": {
          "type": "object",
          "description": "Additional route metadata"
        }
      }
    }
  }
}
```

**Example:**
```json
{
  "routes": [
    {
      "path": "/",
      "pageId": "dashboard",
      "exact": true,
      "title": "Dashboard"
    },
    {
      "path": "/users",
      "pageId": "user-list",
      "title": "Users",
      "permissions": ["users.view"]
    },
    {
      "path": "/users/:userId",
      "pageId": "user-detail",
      "title": "User Details",
      "permissions": ["users.view"]
    },
    {
      "path": "/settings",
      "pageId": "settings",
      "title": "Settings",
      "permissions": ["settings.manage"]
    }
  ],
  "notFoundPageId": "not-found",
  "errorPageId": "error"
}
```

---

## BootstrapConfig Schema

Defines initial application configuration loaded on startup.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openportal.example.com/schemas/bootstrap-config.json",
  "title": "BootstrapConfig",
  "type": "object",
  "required": ["schemaVersion", "apiBaseUrl"],
  "properties": {
    "schemaVersion": {
      "type": "string",
      "description": "Bootstrap schema version"
    },
    "apiBaseUrl": {
      "type": "string",
      "format": "uri",
      "description": "Base URL for all API calls"
    },
    "authConfig": {
      "$ref": "#/definitions/AuthConfig"
    },
    "theme": {
      "$ref": "#/definitions/ThemeConfig"
    },
    "features": {
      "type": "object",
      "description": "Feature flags",
      "additionalProperties": {
        "type": "boolean"
      }
    },
    "branding": {
      "$ref": "#/definitions/BrandingConfig"
    },
    "menu": {
      "$ref": "#/definitions/MenuConfig"
    },
    "routes": {
      "$ref": "#/definitions/RouteConfig"
    },
    "defaultPageId": {
      "type": "string",
      "description": "Default page to load after login"
    },
    "locale": {
      "type": "string",
      "default": "en-US",
      "description": "Default locale"
    },
    "timezone": {
      "type": "string",
      "description": "Default timezone (e.g., America/New_York)"
    }
  },
  "definitions": {
    "AuthConfig": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": {
          "type": "string",
          "enum": ["oauth2", "jwt", "saml", "basic"],
          "description": "Authentication method"
        },
        "loginUrl": {
          "type": "string",
          "format": "uri",
          "description": "Login page URL"
        },
        "logoutUrl": {
          "type": "string",
          "format": "uri",
          "description": "Logout endpoint URL"
        },
        "tokenEndpoint": {
          "type": "string",
          "format": "uri",
          "description": "OAuth2 token endpoint"
        },
        "refreshTokenEnabled": {
          "type": "boolean",
          "default": true,
          "description": "Enable automatic token refresh"
        },
        "sessionTimeout": {
          "type": "integer",
          "description": "Session timeout in seconds"
        }
      }
    },
    "ThemeConfig": {
      "type": "object",
      "properties": {
        "primaryColor": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$",
          "description": "Primary theme color (hex)"
        },
        "secondaryColor": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$",
          "description": "Secondary theme color (hex)"
        },
        "mode": {
          "type": "string",
          "enum": ["light", "dark", "auto"],
          "default": "light"
        },
        "fontFamily": {
          "type": "string",
          "description": "Primary font family"
        }
      }
    },
    "BrandingConfig": {
      "type": "object",
      "properties": {
        "tenantId": {
          "type": "string",
          "description": "Tenant identifier"
        },
        "companyName": {
          "type": "string",
          "description": "Company/tenant display name"
        },
        "logoUrl": {
          "type": "string",
          "format": "uri",
          "description": "Company logo URL"
        },
        "faviconUrl": {
          "type": "string",
          "format": "uri",
          "description": "Favicon URL"
        },
        "colors": {
          "type": "object",
          "properties": {
            "primary": {
              "type": "string",
              "pattern": "^#[0-9A-Fa-f]{6}$"
            },
            "secondary": {
              "type": "string",
              "pattern": "^#[0-9A-Fa-f]{6}$"
            },
            "accent": {
              "type": "string",
              "pattern": "^#[0-9A-Fa-f]{6}$"
            }
          }
        },
        "customCSS": {
          "type": "string",
          "description": "Custom CSS overrides"
        }
      }
    },
    "MenuConfig": {
      "type": "object",
      "required": ["items"],
      "properties": {
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/MenuItem"
          }
        },
        "position": {
          "type": "string",
          "enum": ["left", "top"],
          "default": "left"
        },
        "collapsible": {
          "type": "boolean",
          "default": true
        }
      }
    },
    "MenuItem": {
      "type": "object",
      "required": ["id", "label"],
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^[a-z][a-z0-9-]*$"
        },
        "label": {
          "type": "string",
          "description": "Menu item display text"
        },
        "icon": {
          "type": "string",
          "description": "Icon identifier"
        },
        "path": {
          "type": "string",
          "description": "Navigation path"
        },
        "url": {
          "type": "string",
          "format": "uri",
          "description": "External URL"
        },
        "children": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/MenuItem"
          },
          "description": "Submenu items"
        },
        "permissions": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Required permissions"
        },
        "badge": {
          "type": "object",
          "properties": {
            "text": {
              "type": "string"
            },
            "variant": {
              "type": "string",
              "enum": ["primary", "secondary", "success", "warning", "error"]
            }
          }
        },
        "order": {
          "type": "integer",
          "description": "Sort order"
        }
      }
    },
    "RouteConfig": {
      "type": "object",
      "description": "Reference to route configuration"
    }
  }
}
```

**Example:**
```json
{
  "schemaVersion": "1.0",
  "apiBaseUrl": "https://api.example.com",
  "authConfig": {
    "type": "oauth2",
    "loginUrl": "/auth/login",
    "logoutUrl": "/auth/logout",
    "tokenEndpoint": "/auth/token",
    "refreshTokenEnabled": true,
    "sessionTimeout": 3600
  },
  "theme": {
    "primaryColor": "#1976D2",
    "secondaryColor": "#424242",
    "mode": "light",
    "fontFamily": "Inter, sans-serif"
  },
  "branding": {
    "tenantId": "acme-corp",
    "companyName": "ACME Corporation",
    "logoUrl": "/assets/logo.png",
    "faviconUrl": "/assets/favicon.ico",
    "colors": {
      "primary": "#FF6B6B",
      "secondary": "#4ECDC4",
      "accent": "#FFE66D"
    }
  },
  "menu": {
    "items": [
      {
        "id": "dashboard",
        "label": "Dashboard",
        "icon": "dashboard",
        "path": "/",
        "order": 1
      },
      {
        "id": "users",
        "label": "Users",
        "icon": "people",
        "path": "/users",
        "permissions": ["users.view"],
        "order": 2
      },
      {
        "id": "reports",
        "label": "Reports",
        "icon": "assessment",
        "order": 3,
        "children": [
          {
            "id": "sales-report",
            "label": "Sales",
            "path": "/reports/sales"
          },
          {
            "id": "analytics-report",
            "label": "Analytics",
            "path": "/reports/analytics"
          }
        ]
      }
    ],
    "position": "left",
    "collapsible": true
  },
  "defaultPageId": "dashboard",
  "locale": "en-US",
  "timezone": "America/New_York",
  "features": {
    "enableNotifications": true,
    "enableDarkMode": true,
    "enableExport": false
  }
}
```

---

## ValidationRules Schema

Comprehensive validation rules for form fields and data.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openportal.example.com/schemas/validation-rules.json",
  "title": "ValidationRules",
  "type": "object",
  "properties": {
    "validators": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Validator"
      }
    }
  },
  "definitions": {
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
            "min",
            "max",
            "email",
            "url",
            "regex",
            "pattern",
            "custom",
            "oneOf",
            "date",
            "phoneNumber",
            "postalCode",
            "creditCard",
            "integer",
            "number",
            "alphanumeric",
            "alpha"
          ],
          "description": "Validator type"
        },
        "message": {
          "type": "string",
          "description": "Error message to display"
        },
        "value": {
          "description": "Validator parameter (e.g., min length value)"
        },
        "pattern": {
          "type": "string",
          "description": "Regex pattern for pattern/regex validators"
        },
        "options": {
          "type": "array",
          "description": "Valid options for oneOf validator"
        },
        "customValidatorId": {
          "type": "string",
          "description": "ID of custom validator function"
        },
        "async": {
          "type": "boolean",
          "default": false,
          "description": "Whether validation is asynchronous"
        },
        "debounceMs": {
          "type": "integer",
          "description": "Debounce time for async validation"
        },
        "severity": {
          "type": "string",
          "enum": ["error", "warning", "info"],
          "default": "error",
          "description": "Validation message severity"
        }
      }
    }
  }
}
```

**Example:**
```json
{
  "validators": [
    {
      "type": "required",
      "message": "This field is required",
      "severity": "error"
    },
    {
      "type": "minLength",
      "value": 8,
      "message": "Password must be at least 8 characters",
      "severity": "error"
    },
    {
      "type": "regex",
      "pattern": "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$",
      "message": "Password must contain letters and numbers",
      "severity": "error"
    },
    {
      "type": "email",
      "message": "Please enter a valid email address",
      "severity": "error"
    },
    {
      "type": "custom",
      "customValidatorId": "checkUsernameAvailable",
      "message": "Username is already taken",
      "async": true,
      "debounceMs": 500,
      "severity": "error"
    }
  ]
}
```

---

## Complete Widget Type Schemas

Individual schemas for each of the 12 core widgets based on Widget Taxonomy v1.

### TextInput Widget Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openportal.example.com/schemas/widgets/text-input.json",
  "title": "TextInputWidget",
  "type": "object",
  "allOf": [
    { "$ref": "../widget-base.json" }
  ],
  "properties": {
    "type": {
      "const": "TextInput"
    },
    "props": {
      "type": "object",
      "properties": {
        "label": { "type": "string" },
        "placeholder": { "type": "string" },
        "helpText": { "type": "string" },
        "type": {
          "type": "string",
          "enum": ["text", "email", "url", "tel", "search"],
          "default": "text"
        },
        "maxLength": {
          "type": "integer",
          "minimum": 1
        },
        "disabled": { "type": "boolean", "default": false },
        "readonly": { "type": "boolean", "default": false },
        "required": { "type": "boolean", "default": false },
        "autoFocus": { "type": "boolean", "default": false },
        "icon": { "type": "string" },
        "iconPosition": {
          "type": "string",
          "enum": ["start", "end"],
          "default": "start"
        }
      }
    },
    "bindings": {
      "type": "object",
      "properties": {
        "value": { "type": "string" }
      }
    },
    "events": {
      "type": "object",
      "properties": {
        "onChange": { "$ref": "../action-reference.json" },
        "onBlur": { "$ref": "../action-reference.json" },
        "onFocus": { "$ref": "../action-reference.json" },
        "onEnter": { "$ref": "../action-reference.json" }
      }
    }
  }
}
```

### Select Widget Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openportal.example.com/schemas/widgets/select.json",
  "title": "SelectWidget",
  "type": "object",
  "allOf": [
    { "$ref": "../widget-base.json" }
  ],
  "properties": {
    "type": {
      "const": "Select"
    },
    "props": {
      "type": "object",
      "required": ["options"],
      "properties": {
        "label": { "type": "string" },
        "placeholder": { "type": "string" },
        "helpText": { "type": "string" },
        "options": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["value", "label"],
            "properties": {
              "value": {
                "oneOf": [
                  { "type": "string" },
                  { "type": "number" }
                ]
              },
              "label": { "type": "string" },
              "disabled": { "type": "boolean" },
              "icon": { "type": "string" }
            }
          }
        },
        "disabled": { "type": "boolean", "default": false },
        "required": { "type": "boolean", "default": false },
        "searchable": { "type": "boolean", "default": false },
        "clearable": { "type": "boolean", "default": false }
      }
    },
    "bindings": {
      "type": "object",
      "properties": {
        "value": {
          "oneOf": [
            { "type": "string" },
            { "type": "number" }
          ]
        }
      }
    },
    "events": {
      "type": "object",
      "properties": {
        "onChange": { "$ref": "../action-reference.json" },
        "onSearch": { "$ref": "../action-reference.json" }
      }
    }
  }
}
```

### Table Widget Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openportal.example.com/schemas/widgets/table.json",
  "title": "TableWidget",
  "type": "object",
  "allOf": [
    { "$ref": "../widget-base.json" }
  ],
  "properties": {
    "type": {
      "const": "Table"
    },
    "props": {
      "type": "object",
      "required": ["columns", "rowKey"],
      "properties": {
        "columns": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "label", "field"],
            "properties": {
              "id": { "type": "string" },
              "label": { "type": "string" },
              "field": { "type": "string" },
              "sortable": { "type": "boolean", "default": false },
              "width": {
                "oneOf": [
                  { "type": "number" },
                  { "type": "string" }
                ]
              },
              "align": {
                "type": "string",
                "enum": ["left", "center", "right"],
                "default": "left"
              },
              "format": {
                "type": "string",
                "enum": ["text", "number", "currency", "date", "custom"],
                "default": "text"
              },
              "formatOptions": { "type": "object" }
            }
          },
          "minItems": 1
        },
        "rowKey": { "type": "string" },
        "selectable": { "type": "boolean", "default": false },
        "multiSelect": { "type": "boolean", "default": false },
        "pagination": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean", "default": false },
            "pageSize": { "type": "integer", "minimum": 1 },
            "serverSide": { "type": "boolean", "default": false }
          }
        },
        "sorting": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean", "default": false },
            "serverSide": { "type": "boolean", "default": false },
            "defaultSort": {
              "type": "object",
              "properties": {
                "field": { "type": "string" },
                "direction": {
                  "type": "string",
                  "enum": ["asc", "desc"]
                }
              }
            }
          }
        },
        "filtering": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean", "default": false },
            "serverSide": { "type": "boolean", "default": false }
          }
        },
        "rowActions": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "label", "actionId"],
            "properties": {
              "id": { "type": "string" },
              "label": { "type": "string" },
              "icon": { "type": "string" },
              "actionId": { "type": "string" }
            }
          }
        },
        "bulkActions": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "label", "actionId"],
            "properties": {
              "id": { "type": "string" },
              "label": { "type": "string" },
              "actionId": { "type": "string" }
            }
          }
        },
        "emptyMessage": { "type": "string" },
        "loading": { "type": "boolean", "default": false }
      }
    },
    "bindings": {
      "type": "object",
      "properties": {
        "data": {
          "type": "array"
        },
        "selection": {},
        "pagination": {
          "type": "object",
          "properties": {
            "page": { "type": "integer" },
            "pageSize": { "type": "integer" },
            "totalCount": { "type": "integer" }
          }
        },
        "sorting": {
          "type": "object"
        },
        "filters": {
          "type": "object"
        }
      }
    },
    "events": {
      "type": "object",
      "properties": {
        "onRowSelect": { "$ref": "../action-reference.json" },
        "onRowClick": { "$ref": "../action-reference.json" },
        "onRowAction": { "$ref": "../action-reference.json" },
        "onBulkAction": { "$ref": "../action-reference.json" },
        "onPageChange": { "$ref": "../action-reference.json" },
        "onSortChange": { "$ref": "../action-reference.json" },
        "onFilterChange": { "$ref": "../action-reference.json" }
      }
    }
  }
}
```

### DatePicker Widget Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openportal.example.com/schemas/widgets/date-picker.json",
  "title": "DatePickerWidget",
  "type": "object",
  "allOf": [
    { "$ref": "../widget-base.json" }
  ],
  "properties": {
    "type": {
      "const": "DatePicker"
    },
    "props": {
      "type": "object",
      "properties": {
        "label": { "type": "string" },
        "placeholder": { "type": "string" },
        "helpText": { "type": "string" },
        "format": {
          "type": "string",
          "default": "YYYY-MM-DD",
          "description": "Display format (e.g., YYYY-MM-DD, MM/DD/YYYY)"
        },
        "minDate": {
          "type": "string",
          "format": "date-time",
          "description": "Minimum selectable date (ISO 8601)"
        },
        "maxDate": {
          "type": "string",
          "format": "date-time",
          "description": "Maximum selectable date (ISO 8601)"
        },
        "disabled": { "type": "boolean", "default": false },
        "required": { "type": "boolean", "default": false },
        "showTime": { "type": "boolean", "default": false }
      }
    },
    "bindings": {
      "type": "object",
      "properties": {
        "value": {
          "type": "string",
          "format": "date-time",
          "description": "ISO 8601 date string"
        }
      }
    },
    "events": {
      "type": "object",
      "properties": {
        "onChange": { "$ref": "../action-reference.json" }
      }
    }
  }
}
```

### Checkbox Widget Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openportal.example.com/schemas/widgets/checkbox.json",
  "title": "CheckboxWidget",
  "type": "object",
  "allOf": [
    { "$ref": "../widget-base.json" }
  ],
  "properties": {
    "type": {
      "const": "Checkbox"
    },
    "props": {
      "type": "object",
      "properties": {
        "label": { "type": "string" },
        "helpText": { "type": "string" },
        "disabled": { "type": "boolean", "default": false },
        "required": { "type": "boolean", "default": false }
      }
    },
    "bindings": {
      "type": "object",
      "properties": {
        "value": {
          "type": "boolean",
          "description": "Checked state"
        }
      }
    },
    "events": {
      "type": "object",
      "properties": {
        "onChange": { "$ref": "../action-reference.json" }
      }
    }
  }
}
```

### Page Widget Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openportal.example.com/schemas/widgets/page.json",
  "title": "PageWidget",
  "type": "object",
  "allOf": [
    { "$ref": "../widget-base.json" }
  ],
  "properties": {
    "type": {
      "const": "Page"
    },
    "props": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "description": "Page title (browser tab)"
        },
        "description": {
          "type": "string",
          "description": "Page description for metadata"
        },
        "theme": {
          "type": "object",
          "description": "Page-specific theme overrides"
        },
        "padding": {
          "type": "string",
          "enum": ["none", "sm", "md", "lg"],
          "default": "md"
        }
      }
    },
    "events": {
      "type": "object",
      "properties": {
        "onLoad": { "$ref": "../action-reference.json" }
      }
    }
  }
}
```

### Section Widget Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openportal.example.com/schemas/widgets/section.json",
  "title": "SectionWidget",
  "type": "object",
  "allOf": [
    { "$ref": "../widget-base.json" }
  ],
  "properties": {
    "type": {
      "const": "Section"
    },
    "props": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "subtitle": { "type": "string" },
        "collapsible": { "type": "boolean", "default": false },
        "defaultCollapsed": { "type": "boolean", "default": false },
        "bordered": { "type": "boolean", "default": false },
        "padding": {
          "type": "string",
          "enum": ["none", "sm", "md", "lg"],
          "default": "md"
        }
      }
    },
    "events": {
      "type": "object",
      "properties": {
        "onExpand": { "$ref": "../action-reference.json" },
        "onCollapse": { "$ref": "../action-reference.json" }
      }
    }
  }
}
```

### Grid Widget Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openportal.example.com/schemas/widgets/grid.json",
  "title": "GridWidget",
  "type": "object",
  "allOf": [
    { "$ref": "../widget-base.json" }
  ],
  "properties": {
    "type": {
      "const": "Grid"
    },
    "props": {
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
          "enum": ["none", "xs", "sm", "md", "lg", "xl"],
          "default": "md"
        },
        "responsive": {
          "type": "object",
          "properties": {
            "xs": { "type": "integer", "description": "Columns < 576px" },
            "sm": { "type": "integer", "description": "Columns ≥ 576px" },
            "md": { "type": "integer", "description": "Columns ≥ 768px" },
            "lg": { "type": "integer", "description": "Columns ≥ 992px" },
            "xl": { "type": "integer", "description": "Columns ≥ 1200px" }
          }
        }
      }
    }
  }
}
```

### Card Widget Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openportal.example.com/schemas/widgets/card.json",
  "title": "CardWidget",
  "type": "object",
  "allOf": [
    { "$ref": "../widget-base.json" }
  ],
  "properties": {
    "type": {
      "const": "Card"
    },
    "props": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "subtitle": { "type": "string" },
        "image": {
          "type": "string",
          "format": "uri",
          "description": "Header image URL"
        },
        "elevation": {
          "type": "string",
          "enum": ["none", "sm", "md", "lg"],
          "default": "sm"
        },
        "bordered": { "type": "boolean", "default": false },
        "padding": {
          "type": "string",
          "enum": ["none", "sm", "md", "lg"],
          "default": "md"
        },
        "actions": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "label", "actionId"],
            "properties": {
              "id": { "type": "string" },
              "label": { "type": "string" },
              "actionId": { "type": "string" }
            }
          }
        }
      }
    },
    "events": {
      "type": "object",
      "properties": {
        "onActionClick": { "$ref": "../action-reference.json" }
      }
    }
  }
}
```

### KPI Widget Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openportal.example.com/schemas/widgets/kpi.json",
  "title": "KPIWidget",
  "type": "object",
  "allOf": [
    { "$ref": "../widget-base.json" }
  ],
  "properties": {
    "type": {
      "const": "KPI"
    },
    "props": {
      "type": "object",
      "required": ["label"],
      "properties": {
        "label": { "type": "string" },
        "format": {
          "type": "string",
          "enum": ["number", "currency", "percent"],
          "default": "number"
        },
        "formatOptions": {
          "type": "object",
          "properties": {
            "currency": {
              "type": "string",
              "description": "Currency code (e.g., USD, EUR)"
            }
          }
        },
        "showTrend": { "type": "boolean", "default": false },
        "trendDirection": {
          "type": "string",
          "enum": ["up", "down", "neutral"]
        },
        "trendValue": { "type": "string" },
        "icon": { "type": "string" },
        "color": { "type": "string" },
        "size": {
          "type": "string",
          "enum": ["sm", "md", "lg"],
          "default": "md"
        }
      }
    },
    "bindings": {
      "type": "object",
      "properties": {
        "value": {
          "type": "number",
          "description": "KPI numeric value"
        },
        "trend": {
          "type": "object",
          "properties": {
            "direction": {
              "type": "string",
              "enum": ["up", "down", "neutral"]
            },
            "value": { "type": "string" }
          }
        }
      }
    },
    "events": {
      "type": "object",
      "properties": {
        "onClick": { "$ref": "../action-reference.json" }
      }
    }
  }
}
```

### Modal Widget Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openportal.example.com/schemas/widgets/modal.json",
  "title": "ModalWidget",
  "type": "object",
  "allOf": [
    { "$ref": "../widget-base.json" }
  ],
  "properties": {
    "type": {
      "const": "Modal"
    },
    "props": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "size": {
          "type": "string",
          "enum": ["sm", "md", "lg", "xl", "full"],
          "default": "md"
        },
        "closable": { "type": "boolean", "default": true },
        "closeOnBackdrop": { "type": "boolean", "default": true },
        "showFooter": { "type": "boolean", "default": true },
        "actions": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "label", "actionId"],
            "properties": {
              "id": { "type": "string" },
              "label": { "type": "string" },
              "variant": {
                "type": "string",
                "enum": ["primary", "secondary", "text"],
                "default": "primary"
              },
              "actionId": { "type": "string" }
            }
          }
        }
      }
    },
    "bindings": {
      "type": "object",
      "properties": {
        "open": {
          "type": "boolean",
          "description": "Modal visibility state"
        }
      }
    },
    "events": {
      "type": "object",
      "properties": {
        "onClose": { "$ref": "../action-reference.json" },
        "onActionClick": { "$ref": "../action-reference.json" }
      }
    }
  }
}
```

### Toast Widget Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openportal.example.com/schemas/widgets/toast.json",
  "title": "ToastWidget",
  "type": "object",
  "allOf": [
    { "$ref": "../widget-base.json" }
  ],
  "properties": {
    "type": {
      "const": "Toast"
    },
    "props": {
      "type": "object",
      "required": ["variant", "message"],
      "properties": {
        "variant": {
          "type": "string",
          "enum": ["success", "error", "warning", "info"]
        },
        "message": { "type": "string" },
        "duration": {
          "type": "integer",
          "default": 5000,
          "description": "Auto-dismiss time in milliseconds"
        },
        "closable": { "type": "boolean", "default": true },
        "action": {
          "type": "object",
          "properties": {
            "label": { "type": "string" },
            "actionId": { "type": "string" }
          }
        }
      }
    },
    "events": {
      "type": "object",
      "properties": {
        "onClose": { "$ref": "../action-reference.json" },
        "onActionClick": { "$ref": "../action-reference.json" }
      }
    }
  }
}
```

---

## Schema Extensibility

The OpenPortal schema architecture supports extensibility for custom widgets and actions.

### Custom Widget Integration

Custom widgets can be registered by extending the base widget schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CustomChartWidget",
  "allOf": [
    { "$ref": "https://openportal.example.com/schemas/widget-base.json" }
  ],
  "properties": {
    "type": {
      "const": "CustomChart"
    },
    "props": {
      "type": "object",
      "properties": {
        "chartType": {
          "type": "string",
          "enum": ["bar", "line", "pie", "radar"]
        },
        "dataMapping": {
          "type": "object"
        }
      }
    }
  }
}
```

### Custom Action Types

Custom actions follow the same extension pattern:

```json
{
  "id": "custom-export",
  "kind": "custom",
  "custom": {
    "handlerId": "exportToExcel",
    "params": {
      "format": "xlsx",
      "includeHeaders": true
    }
  }
}
```

### Schema Composition

Use JSON Schema composition keywords for reusability:

**allOf** - Combine multiple schemas (inheritance):
```json
{
  "allOf": [
    { "$ref": "#/definitions/BaseWidget" },
    { "$ref": "#/definitions/FormWidget" }
  ]
}
```

**oneOf** - Exclusive choice between schemas:
```json
{
  "oneOf": [
    { "$ref": "#/definitions/HttpDatasource" },
    { "$ref": "#/definitions/WebsocketDatasource" },
    { "$ref": "#/definitions/StaticDatasource" }
  ]
}
```

**anyOf** - Match one or more schemas:
```json
{
  "anyOf": [
    { "required": ["email"] },
    { "required": ["phone"] }
  ]
}
```

---

## Schema Versioning Strategy

### Version Format

OpenPortal schemas follow semantic versioning:
- **Major version**: Breaking changes to schema structure
- **Minor version**: Backward-compatible additions
- **Patch version**: Clarifications and bug fixes

Example: `"schemaVersion": "1.2.0"`

### Backward Compatibility

1. **Additive Changes** (Minor version bump):
   - New optional properties
   - New enum values
   - New widget types
   - New action types

2. **Breaking Changes** (Major version bump):
   - Removing required properties
   - Changing property types
   - Removing enum values
   - Renaming properties

### Version Migration

The backend should support multiple schema versions simultaneously:

```json
{
  "pageId": "dashboard",
  "schemaVersion": "1.0",
  "configVersion": "v2.1.0-20260119",
  "widgets": [...]
}
```

Clients specify supported schema versions during bootstrap:
```json
{
  "supportedSchemaVersions": ["1.0", "1.1", "1.2"]
}
```

### Deprecation Policy

1. Mark deprecated fields with `"deprecated": true`
2. Maintain deprecated fields for at least 2 major versions
3. Document migration path in schema description
4. Emit warnings when deprecated fields are used

Example:
```json
{
  "oldFieldName": {
    "type": "string",
    "deprecated": true,
    "description": "DEPRECATED: Use newFieldName instead. Will be removed in v3.0"
  },
  "newFieldName": {
    "type": "string",
    "description": "Replacement for oldFieldName"
  }
}
```

---

## Schema Validation Guidelines

### Validation Levels

**1. Structure Validation** (JSON Schema):
- Property types and formats
- Required fields presence
- Enum value constraints
- Pattern matching

**2. Business Logic Validation**:
- Cross-field dependencies
- Reference integrity (action IDs, datasource IDs)
- Permission validity
- URL accessibility

**3. Performance Validation**:
- Configuration size limits
- Nesting depth limits
- Array size constraints

### Validation Best Practices

1. **Validate Early**: Validate configurations at creation/edit time, not at runtime
2. **Provide Context**: Include path to invalid field in error messages
3. **Suggest Fixes**: Offer correction suggestions when possible
4. **Batch Validation**: Report all errors, not just the first one
5. **Cache Results**: Cache validation results with configuration version

### Example Validation Error

```json
{
  "valid": false,
  "errors": [
    {
      "path": "/widgets/0/props/columns",
      "message": "Required property 'columns' is missing",
      "severity": "error",
      "suggestion": "Add at least one column definition"
    },
    {
      "path": "/datasources/1/http/url",
      "message": "Invalid URL format",
      "severity": "error",
      "suggestion": "URL must start with http:// or https://"
    },
    {
      "path": "/actions/0/executeAction/actionId",
      "message": "Referenced action 'unknown-action' not found",
      "severity": "error",
      "suggestion": "Check action ID or define the action"
    }
  ]
}
```

### Validation Tools Integration

**Node.js with AJV:**
```javascript
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(pageConfigSchema);

const valid = validate(pageConfig);
if (!valid) {
  console.error(validate.errors);
}
```

**Python with jsonschema:**
```python
import jsonschema
from jsonschema import validate

try:
    validate(instance=page_config, schema=page_config_schema)
except jsonschema.exceptions.ValidationError as err:
    print(err.message)
```

---

## Complete Schema Examples

### Minimal Valid Page Configuration

```json
{
  "pageId": "simple-page",
  "schemaVersion": "1.0",
  "widgets": [
    {
      "id": "main-page",
      "type": "Page",
      "props": {
        "title": "Simple Page"
      },
      "children": [
        {
          "id": "welcome-text",
          "type": "Text",
          "props": {
            "content": "Welcome to OpenPortal"
          }
        }
      ]
    }
  ]
}
```

### Complex Form with Validation

```json
{
  "pageId": "user-registration",
  "schemaVersion": "1.0",
  "title": "User Registration",
  "widgets": [
    {
      "id": "registration-form",
      "type": "Form",
      "props": {
        "title": "Create Account"
      },
      "children": [
        {
          "id": "username-input",
          "type": "TextInput",
          "props": {
            "label": "Username",
            "required": true,
            "minLength": 3,
            "maxLength": 20
          },
          "bindings": {
            "value": "form.username"
          },
          "validators": [
            {
              "type": "required",
              "message": "Username is required"
            },
            {
              "type": "minLength",
              "value": 3,
              "message": "Username must be at least 3 characters"
            },
            {
              "type": "regex",
              "pattern": "^[a-zA-Z0-9_]+$",
              "message": "Username can only contain letters, numbers, and underscores"
            },
            {
              "type": "custom",
              "customValidatorId": "checkUsernameAvailable",
              "message": "Username is already taken",
              "async": true,
              "debounceMs": 500
            }
          ]
        },
        {
          "id": "email-input",
          "type": "TextInput",
          "props": {
            "label": "Email",
            "type": "email",
            "required": true
          },
          "bindings": {
            "value": "form.email"
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
          "id": "password-input",
          "type": "TextInput",
          "props": {
            "label": "Password",
            "type": "password",
            "required": true
          },
          "bindings": {
            "value": "form.password"
          },
          "validators": [
            {
              "type": "required",
              "message": "Password is required"
            },
            {
              "type": "minLength",
              "value": 8,
              "message": "Password must be at least 8 characters"
            },
            {
              "type": "regex",
              "pattern": "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$",
              "message": "Password must contain letters, numbers, and special characters"
            }
          ]
        },
        {
          "id": "terms-checkbox",
          "type": "Checkbox",
          "props": {
            "label": "I agree to the Terms and Conditions",
            "required": true
          },
          "bindings": {
            "value": "form.agreedToTerms"
          },
          "validators": [
            {
              "type": "required",
              "message": "You must agree to the terms"
            }
          ]
        }
      ]
    }
  ],
  "actions": [
    {
      "id": "submit-registration",
      "kind": "apiCall",
      "apiCall": {
        "method": "POST",
        "url": "/api/users/register",
        "body": "{{form}}"
      },
      "onSuccess": ["show-success-toast", "navigate-to-dashboard"],
      "onError": ["show-error-toast"]
    },
    {
      "id": "show-success-toast",
      "kind": "showToast",
      "showToast": {
        "variant": "success",
        "message": "Registration successful! Welcome aboard."
      }
    },
    {
      "id": "show-error-toast",
      "kind": "showToast",
      "showToast": {
        "variant": "error",
        "message": "Registration failed. Please try again."
      }
    },
    {
      "id": "navigate-to-dashboard",
      "kind": "navigate",
      "navigate": {
        "to": "/dashboard"
      }
    }
  ]
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

**Version:** 2.0  
**Last Updated:** January 2026  
**Status:** Complete - Issue #002 Requirements Met

## Changelog

### Version 2.0 (January 2026)
- Added RouteConfig schema with examples
- Added BootstrapConfig schema with AuthConfig, ThemeConfig, BrandingConfig, MenuConfig
- Added comprehensive ValidationRules schema
- Added individual widget schemas (TextInput, Select, Table)
- Added schema extensibility documentation
- Added schema versioning strategy
- Added schema validation guidelines with examples
- Added complete schema examples (minimal and complex)
- Improved documentation structure
- All Issue #002 acceptance criteria met
