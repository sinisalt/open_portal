# User Profile Scenarios

## Overview

This document provides detailed user profile workflow scenarios with complete API flows, including navigation, edit forms, sub-menus, and browser history integration for the OpenPortal platform.

---

## Scenario 1: Accessing User Profile from Header Menu

### User Story
As a logged-in user, I want to access my profile by clicking on my profile picture so that I can view and manage my account information.

### Flow Diagram
```
User Clicks Avatar → Dropdown Menu Appears → Click "View Profile" → 
Navigate to /profile → Load Profile Page Config → Fetch Profile Data → Render Profile
```

### Step-by-Step Flow

#### Step 1: User Clicks Profile Avatar

The header component (part of the application shell) displays:
```javascript
// Header widget configuration (from bootstrap response)
{
  "id": "user-menu",
  "type": "Dropdown",
  "props": {
    "trigger": ["click"],
    "placement": "bottomRight"
  },
  "trigger": {
    "type": "Avatar",
    "props": {
      "src": "{{user.avatar}}",
      "alt": "{{user.name}}",
      "size": "default"
    }
  },
  "menu": [
    {
      "id": "view-profile",
      "label": "View Profile",
      "icon": "UserOutlined",
      "action": {
        "kind": "navigate",
        "navigate": {
          "to": "/profile"
        }
      }
    },
    {
      "id": "preferences",
      "label": "Preferences",
      "icon": "SettingOutlined",
      "action": {
        "kind": "navigate",
        "navigate": {
          "to": "/profile/preferences"
        }
      }
    },
    {
      "type": "divider"
    },
    {
      "id": "logout",
      "label": "Logout",
      "icon": "LogoutOutlined",
      "danger": true,
      "action": {
        "kind": "executeAction",
        "executeAction": {
          "actionId": "logout"
        }
      }
    }
  ]
}
```

#### Step 2: User Clicks "View Profile"

Frontend navigates to `/profile` using React Router:
```javascript
// Using browser's history API
window.history.pushState({}, '', '/profile');
// React Router will handle the route change
```

#### Step 3: Frontend Resolves Route

**HTTP Request:**
```http
GET /api/v1/ui/routes/resolve?path=/profile HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
X-Client-Version: 1.2.3
X-Request-ID: req_route_resolve_abc123
```

**Success Response (200 OK):**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: private, max-age=300
X-Request-ID: req_route_resolve_abc123

{
  "pageId": "user-profile-page",
  "routeParams": {
    "userId": "user123"
  },
  "accessAllowed": true,
  "fallbackPageId": null,
  "breadcrumbs": [
    {
      "label": "Home",
      "route": "/dashboard"
    },
    {
      "label": "Profile",
      "route": "/profile"
    }
  ]
}
```

#### Step 4: Frontend Loads Page Configuration

**HTTP Request:**
```http
GET /api/v1/ui/pages/user-profile-page HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
If-None-Match: "profile-page-v1.2.3-abc123"
X-Client-Version: 1.2.3
X-Request-ID: req_page_config_def456
```

**Success Response (200 OK):**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: private, max-age=3600
ETag: "profile-page-v1.2.3-xyz789"
Last-Modified: Wed, 17 Jan 2024 12:00:00 GMT
X-Request-ID: req_page_config_def456

{
  "pageId": "user-profile-page",
  "schemaVersion": "1.0",
  "configVersion": "v1.2.3-20240117",
  "title": "Profile",
  "description": "User profile and settings",
  "layout": {
    "type": "grid",
    "grid": {
      "columns": 24,
      "gap": "md"
    }
  },
  "widgets": [
    {
      "id": "profile-layout",
      "type": "Layout",
      "layout": {
        "span": 24
      },
      "props": {
        "hasSider": true
      },
      "children": [
        {
          "id": "profile-sider",
          "type": "Sider",
          "props": {
            "width": 256,
            "theme": "light",
            "collapsible": false
          },
          "children": [
            {
              "id": "profile-menu",
              "type": "Menu",
              "props": {
                "mode": "inline",
                "selectedKeys": ["{{state.selectedMenuKey}}"],
                "defaultSelectedKeys": ["profile-info"]
              },
              "bindings": {
                "selectedKeys": {
                  "dataPath": "state.selectedMenuKey"
                }
              },
              "items": [
                {
                  "key": "profile-info",
                  "label": "Profile Information",
                  "icon": "UserOutlined",
                  "action": {
                    "kind": "navigate",
                    "navigate": {
                      "to": "/profile",
                      "replace": false
                    }
                  }
                },
                {
                  "key": "api-keys",
                  "label": "API Keys",
                  "icon": "KeyOutlined",
                  "action": {
                    "kind": "navigate",
                    "navigate": {
                      "to": "/profile/api-keys",
                      "replace": false
                    }
                  }
                },
                {
                  "key": "audit-history",
                  "label": "Audit History",
                  "icon": "HistoryOutlined",
                  "action": {
                    "kind": "navigate",
                    "navigate": {
                      "to": "/profile/audit-history",
                      "replace": false
                    }
                  }
                },
                {
                  "key": "documents",
                  "label": "Documents",
                  "icon": "FileTextOutlined",
                  "action": {
                    "kind": "navigate",
                    "navigate": {
                      "to": "/profile/documents",
                      "replace": false
                    }
                  }
                },
                {
                  "key": "preferences",
                  "label": "Preferences",
                  "icon": "SettingOutlined",
                  "action": {
                    "kind": "navigate",
                    "navigate": {
                      "to": "/profile/preferences",
                      "replace": false
                    }
                  }
                }
              ]
            }
          ]
        },
        {
          "id": "profile-content",
          "type": "Content",
          "props": {
            "padding": "24px"
          },
          "children": [
            {
              "id": "profile-card",
              "type": "Card",
              "props": {
                "title": "Profile Information",
                "bordered": false,
                "extra": [
                  {
                    "id": "edit-profile-btn",
                    "type": "Button",
                    "props": {
                      "type": "primary",
                      "icon": "EditOutlined"
                    },
                    "text": "Edit Profile",
                    "events": [
                      {
                        "on": "onClick",
                        "do": ["navigate-to-edit"]
                      }
                    ]
                  }
                ]
              },
              "children": [
                {
                  "id": "profile-display",
                  "type": "Descriptions",
                  "datasourceId": "profile-data",
                  "props": {
                    "bordered": true,
                    "column": 2,
                    "size": "default"
                  },
                  "bindings": {
                    "items": {
                      "dataPath": "datasources.profile-data"
                    }
                  },
                  "items": [
                    {
                      "label": "Full Name",
                      "key": "name",
                      "span": 2
                    },
                    {
                      "label": "Email",
                      "key": "email",
                      "span": 2
                    },
                    {
                      "label": "Phone",
                      "key": "phone"
                    },
                    {
                      "label": "Department",
                      "key": "department"
                    },
                    {
                      "label": "Job Title",
                      "key": "jobTitle"
                    },
                    {
                      "label": "Location",
                      "key": "location"
                    },
                    {
                      "label": "Member Since",
                      "key": "createdAt",
                      "render": {
                        "type": "date",
                        "format": "MMMM D, YYYY"
                      }
                    },
                    {
                      "label": "Last Login",
                      "key": "lastLogin",
                      "render": {
                        "type": "dateTime",
                        "format": "MMMM D, YYYY h:mm A"
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "datasources": [
    {
      "id": "profile-data",
      "kind": "http",
      "fetchPolicy": {
        "mode": "onMount",
        "cacheStrategy": "cache-first",
        "cacheTTL": 300
      },
      "http": {
        "method": "GET",
        "url": "/api/users/{{context.userId}}",
        "headers": {
          "Accept": "application/json"
        }
      }
    }
  ],
  "actions": [
    {
      "id": "navigate-to-edit",
      "kind": "navigate",
      "navigate": {
        "to": "/profile/edit",
        "replace": false
      }
    }
  ],
  "state": {
    "selectedMenuKey": "profile-info"
  },
  "events": [
    {
      "on": "onLoad",
      "do": ["fetchProfileData"]
    }
  ],
  "context": {
    "userId": "user123"
  },
  "generatedAt": "2024-01-17T12:00:00Z"
}
```

#### Step 5: Frontend Fetches Profile Data

**HTTP Request:**
```http
GET /api/users/user123 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
X-Client-Version: 1.2.3
X-Request-ID: req_profile_data_ghi789
```

**Success Response (200 OK):**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: private, max-age=300
ETag: "user123-profile-v1"
X-Request-ID: req_profile_data_ghi789

{
  "id": "user123",
  "name": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1 (555) 123-4567",
  "avatar": "https://cdn.example.com/avatars/user123.jpg",
  "department": "Engineering",
  "jobTitle": "Senior Software Engineer",
  "location": "New York, NY",
  "bio": "Passionate software engineer with 10+ years of experience.",
  "createdAt": "2020-03-15T10:00:00Z",
  "lastLogin": "2024-01-17T11:30:00Z",
  "emailVerified": true,
  "phoneVerified": false,
  "timezone": "America/New_York",
  "locale": "en-US"
}
```

#### Step 6: Frontend Renders Profile Page

The page is rendered with the fetched data, showing the profile information in a Descriptions component with an "Edit Profile" button.

---

## Scenario 2: Editing User Profile

### User Story
As a logged-in user, I want to edit my profile information so that my account details are up to date.

### Flow Diagram
```
Click "Edit Profile" → Navigate to /profile/edit → Load Edit Form Config → 
Fetch Current Data → User Modifies Fields → Click Save → Validate → 
Submit to API → Success → Navigate Back to /profile
```

### Step-by-Step Flow

#### Step 1: User Clicks "Edit Profile" Button

Frontend navigates to `/profile/edit`:
```javascript
window.history.pushState({}, '', '/profile/edit');
```

#### Step 2: Frontend Resolves Route and Loads Page Config

**Route Resolution Request:**
```http
GET /api/v1/ui/routes/resolve?path=/profile/edit HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "pageId": "user-profile-edit-page",
  "routeParams": {
    "userId": "user123"
  },
  "accessAllowed": true,
  "breadcrumbs": [
    {"label": "Home", "route": "/dashboard"},
    {"label": "Profile", "route": "/profile"},
    {"label": "Edit", "route": "/profile/edit"}
  ]
}
```

#### Step 3: Frontend Loads Edit Page Configuration

**HTTP Request:**
```http
GET /api/v1/ui/pages/user-profile-edit-page HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
X-Request-ID: req_page_edit_config_jkl012
```

**Success Response (200 OK):**
```json
{
  "pageId": "user-profile-edit-page",
  "schemaVersion": "1.0",
  "configVersion": "v1.2.3-20240117",
  "title": "Edit Profile",
  "widgets": [
    {
      "id": "profile-edit-layout",
      "type": "Layout",
      "props": {
        "hasSider": true
      },
      "children": [
        {
          "id": "profile-sider",
          "type": "Sider",
          "props": {
            "width": 256,
            "theme": "light"
          },
          "children": [
            {
              "id": "profile-menu",
              "type": "Menu",
              "props": {
                "mode": "inline",
                "selectedKeys": ["profile-info"]
              },
              "items": [
                {
                  "key": "profile-info",
                  "label": "Profile Information",
                  "icon": "UserOutlined",
                  "action": {
                    "kind": "navigate",
                    "navigate": {"to": "/profile"}
                  }
                },
                {
                  "key": "api-keys",
                  "label": "API Keys",
                  "icon": "KeyOutlined",
                  "action": {
                    "kind": "navigate",
                    "navigate": {"to": "/profile/api-keys"}
                  }
                },
                {
                  "key": "audit-history",
                  "label": "Audit History",
                  "icon": "HistoryOutlined",
                  "action": {
                    "kind": "navigate",
                    "navigate": {"to": "/profile/audit-history"}
                  }
                },
                {
                  "key": "documents",
                  "label": "Documents",
                  "icon": "FileTextOutlined",
                  "action": {
                    "kind": "navigate",
                    "navigate": {"to": "/profile/documents"}
                  }
                },
                {
                  "key": "preferences",
                  "label": "Preferences",
                  "icon": "SettingOutlined",
                  "action": {
                    "kind": "navigate",
                    "navigate": {"to": "/profile/preferences"}
                  }
                }
              ]
            }
          ]
        },
        {
          "id": "edit-content",
          "type": "Content",
          "props": {
            "padding": "24px"
          },
          "children": [
            {
              "id": "edit-form-card",
              "type": "Card",
              "props": {
                "title": "Edit Profile Information",
                "bordered": false
              },
              "children": [
                {
                  "id": "profile-edit-form",
                  "type": "Form",
                  "datasourceId": "profile-data",
                  "props": {
                    "layout": "vertical",
                    "size": "large",
                    "submitButtonText": "Save Changes",
                    "cancelButtonText": "Cancel",
                    "showCancelButton": true
                  },
                  "bindings": {
                    "initialValues": {
                      "dataPath": "datasources.profile-data"
                    }
                  },
                  "fields": [
                    {
                      "id": "firstName",
                      "name": "firstName",
                      "label": "First Name",
                      "component": "TextInput",
                      "props": {
                        "placeholder": "Enter your first name",
                        "maxLength": 50
                      },
                      "validation": {
                        "required": true,
                        "message": "First name is required"
                      }
                    },
                    {
                      "id": "lastName",
                      "name": "lastName",
                      "label": "Last Name",
                      "component": "TextInput",
                      "props": {
                        "placeholder": "Enter your last name",
                        "maxLength": 50
                      },
                      "validation": {
                        "required": true,
                        "message": "Last name is required"
                      }
                    },
                    {
                      "id": "email",
                      "name": "email",
                      "label": "Email",
                      "component": "TextInput",
                      "props": {
                        "type": "email",
                        "placeholder": "your.email@example.com",
                        "disabled": true
                      },
                      "validation": {
                        "required": true,
                        "type": "email",
                        "message": "Please enter a valid email"
                      },
                      "help": "Contact administrator to change email"
                    },
                    {
                      "id": "phone",
                      "name": "phone",
                      "label": "Phone Number",
                      "component": "TextInput",
                      "props": {
                        "placeholder": "+1 (555) 123-4567"
                      },
                      "validation": {
                        "pattern": "^\\+?[1-9]\\d{1,14}$",
                        "message": "Please enter a valid phone number"
                      }
                    },
                    {
                      "id": "jobTitle",
                      "name": "jobTitle",
                      "label": "Job Title",
                      "component": "TextInput",
                      "props": {
                        "placeholder": "e.g., Senior Software Engineer"
                      }
                    },
                    {
                      "id": "department",
                      "name": "department",
                      "label": "Department",
                      "component": "Select",
                      "props": {
                        "placeholder": "Select your department",
                        "options": [
                          {"label": "Engineering", "value": "Engineering"},
                          {"label": "Product", "value": "Product"},
                          {"label": "Design", "value": "Design"},
                          {"label": "Marketing", "value": "Marketing"},
                          {"label": "Sales", "value": "Sales"},
                          {"label": "Operations", "value": "Operations"},
                          {"label": "HR", "value": "HR"},
                          {"label": "Finance", "value": "Finance"}
                        ]
                      }
                    },
                    {
                      "id": "location",
                      "name": "location",
                      "label": "Location",
                      "component": "TextInput",
                      "props": {
                        "placeholder": "e.g., New York, NY"
                      }
                    },
                    {
                      "id": "bio",
                      "name": "bio",
                      "label": "Bio",
                      "component": "TextArea",
                      "props": {
                        "placeholder": "Tell us about yourself...",
                        "rows": 4,
                        "maxLength": 500,
                        "showCount": true
                      }
                    }
                  ],
                  "events": [
                    {
                      "on": "onSubmit",
                      "do": ["validate-form", "save-profile"]
                    },
                    {
                      "on": "onCancel",
                      "do": ["navigate-back"]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "datasources": [
    {
      "id": "profile-data",
      "kind": "http",
      "fetchPolicy": {
        "mode": "onMount"
      },
      "http": {
        "method": "GET",
        "url": "/api/users/{{context.userId}}"
      }
    }
  ],
  "actions": [
    {
      "id": "save-profile",
      "kind": "executeAction",
      "executeAction": {
        "actionId": "update-user-profile",
        "onSuccess": [
          {
            "kind": "showToast",
            "showToast": {
              "type": "success",
              "message": "Profile updated successfully"
            }
          },
          {
            "kind": "navigate",
            "navigate": {
              "to": "/profile",
              "replace": false
            }
          }
        ],
        "onError": [
          {
            "kind": "showToast",
            "showToast": {
              "type": "error",
              "message": "Failed to update profile"
            }
          }
        ]
      }
    },
    {
      "id": "navigate-back",
      "kind": "navigate",
      "navigate": {
        "to": "/profile",
        "replace": false
      }
    }
  ],
  "context": {
    "userId": "user123"
  }
}
```

#### Step 4: User Modifies Fields and Clicks "Save Changes"

**Frontend performs client-side validation first:**
```javascript
// All fields pass validation
const formValues = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com", // Disabled, not editable
  phone: "+1 (555) 987-6543", // Modified
  jobTitle: "Lead Software Engineer", // Modified
  department: "Engineering",
  location: "San Francisco, CA", // Modified
  bio: "Passionate software engineer with 10+ years of experience in building scalable systems."
};
```

#### Step 5: Frontend Calls Save Action

**HTTP Request:**
```http
POST /api/v1/ui/actions/execute HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
Accept: application/json
X-Client-Version: 1.2.3
X-Request-ID: req_save_profile_mno345

{
  "actionId": "update-user-profile",
  "context": {
    "formValues": {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1 (555) 987-6543",
      "jobTitle": "Lead Software Engineer",
      "department": "Engineering",
      "location": "San Francisco, CA",
      "bio": "Passionate software engineer with 10+ years of experience in building scalable systems."
    },
    "routeParams": {
      "userId": "user123"
    }
  }
}
```

#### Step 6: Backend Validates and Updates Profile

**Success Response (200 OK):**
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Request-ID: req_save_profile_mno345

{
  "success": true,
  "result": {
    "id": "user123",
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "phone": "+1 (555) 987-6543",
    "jobTitle": "Lead Software Engineer",
    "department": "Engineering",
    "location": "San Francisco, CA",
    "bio": "Passionate software engineer with 10+ years of experience in building scalable systems.",
    "updatedAt": "2024-01-17T13:30:00Z"
  },
  "messages": [
    {
      "type": "success",
      "text": "Profile updated successfully"
    }
  ],
  "navigate": null,
  "patches": [
    {
      "op": "set",
      "path": "user.phone",
      "value": "+1 (555) 987-6543"
    },
    {
      "op": "set",
      "path": "user.jobTitle",
      "value": "Lead Software Engineer"
    },
    {
      "op": "set",
      "path": "user.location",
      "value": "San Francisco, CA"
    }
  ]
}
```

**Validation Error Response (400 Bad Request):**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json
X-Request-ID: req_save_profile_mno345

{
  "success": false,
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Validation failed",
      "fieldErrors": [
        {
          "path": "values.phone",
          "message": "Phone number format is invalid",
          "severity": "error"
        }
      ]
    }
  ]
}
```

#### Step 7: Frontend Handles Success and Navigates

```javascript
// Show success toast
showToast({
  type: 'success',
  message: 'Profile updated successfully'
});

// Navigate back to profile view
window.history.pushState({}, '', '/profile');
```

---

## Scenario 3: Navigating to Sub-Sections (API Keys)

### User Story
As a logged-in user, I want to view and manage my API keys from my profile.

### Step-by-Step Flow

#### Step 1: User Clicks "API Keys" in Profile Sidebar

Frontend navigates to `/profile/api-keys`:
```javascript
window.history.pushState({}, '', '/profile/api-keys');
```

#### Step 2: Frontend Resolves Route

**HTTP Request:**
```http
GET /api/v1/ui/routes/resolve?path=/profile/api-keys HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "pageId": "user-api-keys-page",
  "routeParams": {
    "userId": "user123"
  },
  "accessAllowed": true,
  "breadcrumbs": [
    {"label": "Home", "route": "/dashboard"},
    {"label": "Profile", "route": "/profile"},
    {"label": "API Keys", "route": "/profile/api-keys"}
  ]
}
```

#### Step 3: Frontend Loads Page Configuration

**HTTP Request:**
```http
GET /api/v1/ui/pages/user-api-keys-page HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
If-None-Match: "api-keys-page-v1.2.3"
```

**Success Response (200 OK):**
```json
{
  "pageId": "user-api-keys-page",
  "title": "API Keys",
  "widgets": [
    {
      "id": "api-keys-layout",
      "type": "Layout",
      "props": {
        "hasSider": true
      },
      "children": [
        {
          "id": "profile-sider",
          "type": "Sider",
          "props": {
            "width": 256,
            "theme": "light"
          },
          "children": [
            {
              "id": "profile-menu",
              "type": "Menu",
              "props": {
                "mode": "inline",
                "selectedKeys": ["api-keys"]
              },
              "items": [
                {
                  "key": "profile-info",
                  "label": "Profile Information",
                  "icon": "UserOutlined",
                  "action": {"kind": "navigate", "navigate": {"to": "/profile"}}
                },
                {
                  "key": "api-keys",
                  "label": "API Keys",
                  "icon": "KeyOutlined",
                  "action": {"kind": "navigate", "navigate": {"to": "/profile/api-keys"}}
                },
                {
                  "key": "audit-history",
                  "label": "Audit History",
                  "icon": "HistoryOutlined",
                  "action": {"kind": "navigate", "navigate": {"to": "/profile/audit-history"}}
                },
                {
                  "key": "documents",
                  "label": "Documents",
                  "icon": "FileTextOutlined",
                  "action": {"kind": "navigate", "navigate": {"to": "/profile/documents"}}
                },
                {
                  "key": "preferences",
                  "label": "Preferences",
                  "icon": "SettingOutlined",
                  "action": {"kind": "navigate", "navigate": {"to": "/profile/preferences"}}
                }
              ]
            }
          ]
        },
        {
          "id": "api-keys-content",
          "type": "Content",
          "props": {
            "padding": "24px"
          },
          "children": [
            {
              "id": "api-keys-card",
              "type": "Card",
              "props": {
                "title": "API Keys",
                "bordered": false,
                "extra": [
                  {
                    "type": "Button",
                    "props": {
                      "type": "primary",
                      "icon": "PlusOutlined"
                    },
                    "text": "Create New Key",
                    "events": [
                      {
                        "on": "onClick",
                        "do": ["show-create-key-modal"]
                      }
                    ]
                  }
                ]
              },
              "children": [
                {
                  "id": "api-keys-table",
                  "type": "Table",
                  "datasourceId": "api-keys-data",
                  "props": {
                    "rowKey": "id",
                    "pagination": {
                      "pageSize": 10
                    }
                  },
                  "bindings": {
                    "data": {
                      "dataPath": "datasources.api-keys-data.items"
                    },
                    "loading": {
                      "dataPath": "datasources.api-keys-data.loading"
                    }
                  },
                  "columns": [
                    {
                      "title": "Name",
                      "dataIndex": "name",
                      "key": "name"
                    },
                    {
                      "title": "Key",
                      "dataIndex": "key",
                      "key": "key",
                      "render": {
                        "type": "masked",
                        "maskChar": "*",
                        "visibleChars": 8
                      }
                    },
                    {
                      "title": "Created",
                      "dataIndex": "createdAt",
                      "key": "createdAt",
                      "render": {
                        "type": "date",
                        "format": "MMM D, YYYY"
                      }
                    },
                    {
                      "title": "Last Used",
                      "dataIndex": "lastUsed",
                      "key": "lastUsed",
                      "render": {
                        "type": "dateTime",
                        "format": "MMM D, YYYY h:mm A",
                        "emptyText": "Never"
                      }
                    },
                    {
                      "title": "Status",
                      "dataIndex": "status",
                      "key": "status",
                      "render": {
                        "type": "tag",
                        "colorMap": {
                          "active": "green",
                          "revoked": "red",
                          "expired": "orange"
                        }
                      }
                    },
                    {
                      "title": "Actions",
                      "key": "actions",
                      "render": {
                        "type": "actions",
                        "actions": [
                          {
                            "id": "copy-key",
                            "type": "icon",
                            "icon": "CopyOutlined",
                            "tooltip": "Copy Key",
                            "action": {
                              "kind": "executeAction",
                              "executeAction": {
                                "actionId": "copy-api-key"
                              }
                            }
                          },
                          {
                            "id": "revoke-key",
                            "type": "icon",
                            "icon": "DeleteOutlined",
                            "tooltip": "Revoke Key",
                            "danger": true,
                            "action": {
                              "kind": "executeAction",
                              "executeAction": {
                                "actionId": "revoke-api-key"
                              }
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "datasources": [
    {
      "id": "api-keys-data",
      "kind": "http",
      "fetchPolicy": {
        "mode": "onMount",
        "refetchInterval": 30000
      },
      "http": {
        "method": "GET",
        "url": "/api/users/{{context.userId}}/api-keys"
      }
    }
  ],
  "actions": [
    {
      "id": "show-create-key-modal",
      "kind": "modal",
      "modal": {
        "modalPageId": "create-api-key-modal",
        "width": 600
      }
    },
    {
      "id": "copy-api-key",
      "kind": "executeAction",
      "executeAction": {
        "actionId": "copy-to-clipboard"
      }
    },
    {
      "id": "revoke-api-key",
      "kind": "executeAction",
      "executeAction": {
        "actionId": "revoke-key"
      }
    }
  ],
  "context": {
    "userId": "user123"
  }
}
```

#### Step 4: Frontend Fetches API Keys Data

**HTTP Request:**
```http
GET /api/users/user123/api-keys HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
X-Request-ID: req_api_keys_pqr678
```

**Success Response (200 OK):**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: private, no-cache
X-Request-ID: req_api_keys_pqr678

{
  "items": [
    {
      "id": "key_abc123",
      "name": "Production API Key",
      "key": "sk_live_abc123xyz789********",
      "createdAt": "2023-06-15T10:00:00Z",
      "lastUsed": "2024-01-17T10:30:00Z",
      "status": "active",
      "permissions": ["read", "write"]
    },
    {
      "id": "key_def456",
      "name": "Development Key",
      "key": "sk_test_def456uvw012********",
      "createdAt": "2023-12-01T14:20:00Z",
      "lastUsed": null,
      "status": "active",
      "permissions": ["read"]
    },
    {
      "id": "key_ghi789",
      "name": "Old Integration Key",
      "key": "sk_live_ghi789rst345********",
      "createdAt": "2023-01-10T09:00:00Z",
      "lastUsed": "2023-11-20T15:45:00Z",
      "status": "revoked",
      "permissions": ["read", "write"]
    }
  ],
  "meta": {
    "total": 3,
    "active": 2,
    "revoked": 1
  }
}
```

---

## Scenario 4: Browser Navigation (Back/Forward)

### User Story
As a user navigating through profile sections, I want the browser back and forward buttons to work as expected.

### Navigation Flow Example

```
1. User starts at: /dashboard
   Browser history: [/dashboard]

2. User navigates to profile: /profile
   Browser history: [/dashboard, /profile]

3. User clicks "API Keys": /profile/api-keys
   Browser history: [/dashboard, /profile, /profile/api-keys]

4. User clicks "Edit" in API Keys: /profile/api-keys/edit/key_abc123
   Browser history: [/dashboard, /profile, /profile/api-keys, /profile/api-keys/edit/key_abc123]

5. User clicks browser BACK button
   Current: /profile/api-keys
   Browser history: [/dashboard, /profile, /profile/api-keys] (pointer at api-keys)

6. User clicks browser BACK button again
   Current: /profile
   Browser history: [/dashboard, /profile] (pointer at profile)

7. User clicks browser FORWARD button
   Current: /profile/api-keys
   Browser history: [/dashboard, /profile, /profile/api-keys] (pointer at api-keys)
```

### Implementation

**Frontend Router Integration:**
```javascript
// React Router handles browser history automatically
import { useNavigate, useLocation } from 'react-router-dom';

function ProfileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Navigate with history.pushState (adds to history)
  const goToApiKeys = () => {
    navigate('/profile/api-keys'); // Adds to history
  };
  
  // Navigate with history.replaceState (replaces current entry)
  const replaceRoute = () => {
    navigate('/profile/api-keys', { replace: true });
  };
  
  // Go back
  const goBack = () => {
    navigate(-1); // Same as browser back button
  };
  
  // Go forward
  const goForward = () => {
    navigate(1); // Same as browser forward button
  };
}

// Listen to browser back/forward
useEffect(() => {
  const handlePopState = (event) => {
    // Router will automatically re-resolve and load the page
    console.log('Browser navigation:', location.pathname);
  };
  
  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, [location]);
```

---

## Scenario 5: Configuration Caching Strategy

### Static Configuration (Cached in Browser)

The following data is **cached** in the browser using ETag:

1. **Page Structure** (widget tree, layout)
2. **Form Definitions** (fields, validation rules)
3. **Menu Structure** (navigation items)
4. **Action Definitions**
5. **Datasource Definitions** (not the data itself)

**Cache Flow:**
```
1. First Request: GET /ui/pages/user-profile-page
   Response: 200 OK, ETag: "v1.2.3-abc123"
   → Cache in browser (IndexedDB or localStorage)

2. Subsequent Requests: GET /ui/pages/user-profile-page
   Request Header: If-None-Match: "v1.2.3-abc123"
   Response: 304 Not Modified
   → Use cached config

3. Config Updated: GET /ui/pages/user-profile-page
   Request Header: If-None-Match: "v1.2.3-abc123"
   Response: 200 OK, ETag: "v1.2.4-def456"
   → Update cache with new config
```

### Dynamic Data (Not Cached)

The following data is **always fetched fresh**:

1. **Profile Data** (current values)
2. **API Keys List** (real-time status)
3. **Audit History** (recent activities)
4. **Documents** (current documents)

**Fetch Flow:**
```
Every page load → Fetch fresh data from datasources
Data can have short TTL (e.g., 5 minutes) for transient caching
Use Redis on backend for caching expensive queries
```

### Redis Caching Strategy

**Backend Implementation:**
```javascript
// Cache page configurations in Redis
async function getPageConfig(pageId, userId) {
  const cacheKey = `page-config:${pageId}:v${configVersion}`;
  
  // Try to get from Redis first
  let config = await redis.get(cacheKey);
  
  if (!config) {
    // Generate config from database/templates
    config = await generatePageConfig(pageId, userId);
    
    // Store in Redis with 1-hour TTL
    await redis.setex(cacheKey, 3600, JSON.stringify(config));
  } else {
    config = JSON.parse(config);
  }
  
  return config;
}

// Cache user-specific data with short TTL
async function getUserProfile(userId) {
  const cacheKey = `user-profile:${userId}`;
  
  let profile = await redis.get(cacheKey);
  
  if (!profile) {
    profile = await database.users.findById(userId);
    await redis.setex(cacheKey, 300, JSON.stringify(profile)); // 5 min TTL
  } else {
    profile = JSON.parse(profile);
  }
  
  return profile;
}

// Invalidate cache on update
async function updateUserProfile(userId, updates) {
  await database.users.update(userId, updates);
  await redis.del(`user-profile:${userId}`); // Invalidate cache
  return await getUserProfile(userId);
}
```

---

## Summary of Profile Workflow

### Complete User Journey

1. **Initial Access**
   - User clicks avatar → Dropdown shows
   - User clicks "View Profile" → Navigate to /profile
   - Load page config (cached) → Fetch profile data (dynamic)
   - Render profile with side menu

2. **Navigation Within Profile**
   - Click "API Keys" → Navigate to /profile/api-keys
   - Same side menu, different content area
   - Browser history updated, back button works

3. **Editing Profile**
   - Click "Edit Profile" → Navigate to /profile/edit
   - Load edit form config → Pre-fill with current data
   - User modifies → Validates → Saves
   - Success → Navigate back to /profile

4. **Sub-Section Navigation**
   - Click through: Profile → API Keys → Audit History → Documents
   - Each click: pushState → Resolve route → Load config → Fetch data
   - Browser back/forward works as expected

5. **Cache Behavior**
   - Page configs: Cached with ETag (long TTL)
   - User data: Fresh on every load
   - Backend: Redis caching for performance

---

**Version:** 1.0
**Last Updated:** January 18, 2026
**Related Documents:**
- [Authentication Scenarios](./authentication-scenarios.md)
- [API Specification](./api-specification.md)
- [Architecture](./architecture.md)
