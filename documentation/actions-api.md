# Actions API Documentation

## Overview

The Actions API provides a powerful framework for executing server-side business logic from the frontend. It supports CRUD operations, custom queries, validation, permission checking, and comprehensive audit logging.

## Table of Contents

- [Endpoint](#endpoint)
- [Authentication](#authentication)
- [Action Handlers](#action-handlers)
- [Request/Response Format](#requestresponse-format)
- [Core Actions](#core-actions)
- [Security](#security)
- [Error Handling](#error-handling)
- [Audit Logging](#audit-logging)
- [Examples](#examples)

## Endpoint

### POST /ui/actions/execute

Execute an action with permission checking, validation, and audit logging.

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "actionId": "string",
  "params": {
    // Action-specific parameters
  },
  "context": {
    "pageId": "string (optional)",
    "widgetId": "string (optional)"
  }
}
```

**Response:**
```json
{
  "success": boolean,
  "data": any,
  "errors": [
    {
      "field": "string (optional)",
      "message": "string",
      "code": "string (optional)"
    }
  ],
  "metadata": {
    "affectedRecords": number,
    "executionTime": number
  }
}
```

### GET /ui/actions/audit

Get action audit logs for the authenticated user.

**Query Parameters:**
- `limit` (optional): Maximum number of logs to return (default: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "actionId": "string",
      "userId": "string",
      "tenantId": "string",
      "params": object,
      "context": object,
      "success": boolean,
      "errorMessage": "string (optional)",
      "executionTimeMs": number,
      "ipAddress": "string",
      "userAgent": "string",
      "affectedRecords": number,
      "createdAt": "ISO8601"
    }
  ]
}
```

## Authentication

All action endpoints require JWT authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <JWT_TOKEN>
```

The user's roles and permissions are automatically extracted from the token and used for permission checking.

## Action Handlers

Each action handler implements the following interface:

```typescript
interface ActionHandler {
  id: string;                    // Unique action identifier
  permissions?: string[];        // Required permissions
  validate?: (params: any) => ValidationResult;  // Parameter validation
  execute: (params: any, context: ActionContext) => Promise<ActionResult>;
}
```

### Action Context

Every action receives a context object with:

```typescript
interface ActionContext {
  user: {
    id: string;
    email: string;
    roles: string[];
    tenantId: string;
  };
  tenant: {
    id: string;
  };
  permissions: string[];
  request: {
    ipAddress: string;
    userAgent: string;
  };
}
```

## Core Actions

### 1. createRecord

Create a new record in a collection.

**Action ID:** `createRecord`  
**Permissions:** `records.create`

**Parameters:**
```json
{
  "collection": "string",
  "data": {
    // Record fields
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:4000/ui/actions/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actionId": "createRecord",
    "params": {
      "collection": "tasks",
      "data": {
        "title": "My Task",
        "status": "pending"
      }
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "generated-id",
    "title": "My Task",
    "status": "pending",
    "createdAt": "2026-01-24T21:32:12.574Z",
    "updatedAt": "2026-01-24T21:32:12.574Z",
    "tenantId": "tenant-001",
    "createdBy": "user-id"
  },
  "metadata": {
    "affectedRecords": 1,
    "executionTime": 5
  }
}
```

### 2. updateRecord

Update an existing record.

**Action ID:** `updateRecord`  
**Permissions:** `records.update`

**Parameters:**
```json
{
  "collection": "string",
  "id": "string",
  "data": {
    // Fields to update
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:4000/ui/actions/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actionId": "updateRecord",
    "params": {
      "collection": "tasks",
      "id": "task-123",
      "data": {
        "status": "completed"
      }
    }
  }'
```

### 3. deleteRecord

Delete a record from a collection.

**Action ID:** `deleteRecord`  
**Permissions:** `records.delete`

**Parameters:**
```json
{
  "collection": "string",
  "id": "string"
}
```

**Example:**
```bash
curl -X POST http://localhost:4000/ui/actions/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actionId": "deleteRecord",
    "params": {
      "collection": "tasks",
      "id": "task-123"
    }
  }'
```

### 4. bulkUpdate

Update multiple records at once.

**Action ID:** `bulkUpdate`  
**Permissions:** `records.bulkUpdate`

**Parameters:**
```json
{
  "collection": "string",
  "ids": ["string"],
  "data": {
    // Fields to update
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:4000/ui/actions/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actionId": "bulkUpdate",
    "params": {
      "collection": "tasks",
      "ids": ["task-1", "task-2", "task-3"],
      "data": {
        "status": "completed"
      }
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": [/* updated records */],
    "notFound": [/* IDs not found */]
  },
  "metadata": {
    "affectedRecords": 3
  }
}
```

### 5. bulkDelete

Delete multiple records at once.

**Action ID:** `bulkDelete`  
**Permissions:** `records.bulkDelete`

**Parameters:**
```json
{
  "collection": "string",
  "ids": ["string"]
}
```

### 6. executeQuery

Query records from a collection with filtering, sorting, and pagination.

**Action ID:** `executeQuery`  
**Permissions:** `records.query`

**Parameters:**
```json
{
  "collection": "string",
  "filter": {
    // Key-value pairs for filtering
  },
  "sort": {
    "field": "string",
    "order": "asc" | "desc"
  },
  "limit": number,
  "offset": number
}
```

**Example:**
```bash
curl -X POST http://localhost:4000/ui/actions/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actionId": "executeQuery",
    "params": {
      "collection": "tasks",
      "filter": {
        "status": "pending"
      },
      "sort": {
        "field": "createdAt",
        "order": "desc"
      },
      "limit": 10,
      "offset": 0
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "records": [/* matching records */],
    "total": 25,
    "limit": 10,
    "offset": 0
  },
  "metadata": {
    "affectedRecords": 10,
    "executionTime": 12
  }
}
```

## Security

### Permission Checking

Each action can define required permissions. The system automatically checks if the user has the necessary permissions before executing the action.

**Role-Based Permissions:**
- **Admin role:** Has all permissions including bulk operations
- **User role:** Limited to create, update, and query operations

### Tenant Isolation

All records are automatically scoped to the user's tenant. Users can only access records from their own tenant.

### Rate Limiting

Action endpoints are protected by rate limiting:
- **Rate Limit:** 5 requests per minute per user
- **Response:** 429 Too Many Requests

### Input Validation

All action parameters are validated using Zod schemas before execution:
- Required fields
- Type checking
- Format validation
- Custom validation rules

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| ACTION_NOT_FOUND | 404 | Action ID does not exist |
| PERMISSION_DENIED | 403 | User lacks required permissions |
| VALIDATION_ERROR | 400 | Invalid request parameters |
| NOT_FOUND | 400 | Record not found |
| INTERNAL_ERROR | 500 | Server error during execution |

### Error Response Format

```json
{
  "success": false,
  "errors": [
    {
      "field": "collection",
      "message": "Collection name is required",
      "code": "VALIDATION_ERROR"
    }
  ]
}
```

## Audit Logging

All action executions are logged with the following information:

- **Action ID** - Which action was executed
- **User ID** - Who executed it
- **Tenant ID** - Which tenant
- **Parameters** - What parameters were used
- **Success/Failure** - Outcome
- **Execution Time** - How long it took
- **IP Address** - Where it came from
- **User Agent** - What client
- **Affected Records** - How many records changed
- **Timestamp** - When it happened

Audit logs can be retrieved using the `/ui/actions/audit` endpoint.

## Examples

### Complete Workflow Example

```bash
# 1. Login to get token
TOKEN=$(curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@example.com","password":"admin123"}' \
  | jq -r '.token')

# 2. Create a record
curl -X POST http://localhost:4000/ui/actions/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actionId": "createRecord",
    "params": {
      "collection": "tasks",
      "data": {
        "title": "Implement feature X",
        "description": "Add new feature",
        "status": "pending",
        "priority": "high"
      }
    }
  }'

# 3. Query records
curl -X POST http://localhost:4000/ui/actions/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actionId": "executeQuery",
    "params": {
      "collection": "tasks",
      "filter": {
        "status": "pending"
      },
      "limit": 10
    }
  }'

# 4. Update record
curl -X POST http://localhost:4000/ui/actions/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actionId": "updateRecord",
    "params": {
      "collection": "tasks",
      "id": "task-id-from-step-2",
      "data": {
        "status": "completed"
      }
    }
  }'

# 5. Get audit logs
curl -X GET "http://localhost:4000/ui/actions/audit?limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

## Best Practices

1. **Use Specific Actions:** Create custom action handlers for complex business logic instead of exposing raw database operations.

2. **Validate Everything:** Always validate parameters using Zod schemas to ensure data integrity.

3. **Check Permissions:** Define specific permissions for each action to control access.

4. **Audit Everything:** All actions are automatically audited, use this for compliance and debugging.

5. **Handle Errors:** Provide clear, user-friendly error messages without exposing sensitive information.

6. **Test Thoroughly:** Test with different roles and scenarios to ensure proper permission checking.

7. **Monitor Performance:** Use the execution time metadata to identify slow actions.

## Future Enhancements

The following action handlers are planned for future releases:

- **sendEmail** - Send email notifications
- **generateReport** - Generate and download reports
- **uploadFile** - Handle file uploads
- **processWorkflow** - Execute multi-step workflows
- **executeScript** - Run custom scripts
- **callWebhook** - Trigger external webhooks

## Troubleshooting

### Common Issues

**Issue:** "Action not found"  
**Solution:** Check that the action ID is correct and the action handler is registered.

**Issue:** "Permission denied"  
**Solution:** Verify the user has the required role/permission for the action.

**Issue:** "Validation error"  
**Solution:** Check the parameters match the expected schema for the action.

**Issue:** "Rate limit exceeded"  
**Solution:** Wait 60 seconds before retrying or reduce request frequency.

## Support

For questions or issues with the Actions API:
1. Check this documentation
2. Review the audit logs for error details
3. Check the backend logs for detailed error traces
4. Contact the backend team

---

**Last Updated:** January 24, 2026  
**API Version:** 1.0.0
