# Services Directory

This directory contains **API service layers** that handle communication with backend services.

## Purpose

Services provide:
- **API Communication**: HTTP requests to backend endpoints
- **Data Fetching**: Retrieve configurations, data, and resources
- **Error Handling**: Consistent error handling and retry logic
- **Caching**: Smart caching of configurations and static data
- **Request/Response Transformation**: Format data for frontend consumption

## Service Types

### Configuration Services
Load and cache page and widget configurations from backend:
- `configService.js` - Fetch page configurations
- `bootstrapService.js` - Initial app bootstrap data
- `schemaService.js` - JSON schema validation

### Data Services
Fetch application data:
- `dataService.js` - Generic data fetching
- `userService.js` - User data and profile
- `contentService.js` - CMS content

### Authentication Services
Handle user authentication and authorization:
- `authService.js` - Login, logout, token management
- `oauthService.js` - OAuth provider integration

### Utility Services
- `cacheService.js` - Client-side caching layer
- `apiClient.js` - Base HTTP client with interceptors

## Service Pattern

Services follow a consistent pattern:

```javascript
// Example: configService.js
import apiClient from './apiClient';

class ConfigService {
  constructor() {
    this.cache = new Map();
  }

  async getPageConfig(pageId) {
    if (this.cache.has(pageId)) {
      return this.cache.get(pageId);
    }

    const config = await apiClient.get(`/api/pages/${pageId}`);
    this.cache.set(pageId, config);
    return config;
  }

  clearCache() {
    this.cache.clear();
  }
}

export default new ConfigService();
```

## API Client

All services use a shared API client with:
- Base URL configuration
- Request/response interceptors
- Error handling
- Token management
- Retry logic

## Error Handling

Services should:
1. Catch and transform API errors
2. Provide meaningful error messages
3. Support error recovery
4. Log errors for debugging

```javascript
try {
  const data = await apiClient.get('/api/data');
  return { success: true, data };
} catch (error) {
  console.error('Failed to fetch data:', error);
  return { success: false, error: error.message };
}
```

## Caching Strategy

- **Static Configurations**: Cache indefinitely, invalidate on app reload
- **Dynamic Data**: Cache with TTL, refresh on demand
- **User Data**: Cache per session, clear on logout

## File Structure

```
services/
├── api/
│   ├── apiClient.js
│   └── interceptors.js
├── config/
│   ├── configService.js
│   ├── bootstrapService.js
│   └── schemaService.js
├── data/
│   ├── dataService.js
│   ├── userService.js
│   └── contentService.js
├── auth/
│   ├── authService.js
│   └── oauthService.js
├── cache/
│   └── cacheService.js
└── README.md
```

## Testing

Service tests should:
- Mock API responses
- Test error handling
- Verify caching behavior
- Test retry logic

## Environment Configuration

Services use environment variables for configuration:
- `REACT_APP_API_URL` - Backend API base URL
- `REACT_APP_AUTH_URL` - Authentication service URL
- `REACT_APP_CACHE_TTL` - Cache time-to-live

## Best Practices

1. **Single Responsibility**: Each service handles one domain
2. **Dependency Injection**: Accept dependencies in constructor
3. **Error Handling**: Always handle and transform errors
4. **Caching**: Cache static data, minimize API calls
5. **Testing**: Mock external dependencies
6. **Documentation**: Document all public methods
