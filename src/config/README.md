# Config Directory

This directory contains **runtime configuration** for the application.

## Purpose

The config directory provides:

- **Environment Configuration**: Environment-specific settings
- **Feature Flags**: Toggle features on/off
- **Constants**: Application-wide constants
- **Default Settings**: Default widget and app configurations

## Configuration Files

### `constants.js`

Application-wide constants:

```javascript
export const APP_NAME = 'OpenPortal';
export const VERSION = '0.1.0';
export const API_TIMEOUT = 30000;
export const MAX_RETRY_ATTEMPTS = 3;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  NOT_FOUND: '/404',
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
};

export const EVENT_TYPES = {
  CLICK: 'onClick',
  CHANGE: 'onChange',
  SUBMIT: 'onSubmit',
  LOAD: 'onLoad',
};
```

### `defaults.js`

Default configurations for widgets and components:

```javascript
export const DEFAULT_WIDGET_CONFIG = {
  visible: true,
  enabled: true,
  validation: {
    required: false,
  },
};

export const DEFAULT_TABLE_CONFIG = {
  pageSize: 10,
  sortable: true,
  filterable: true,
  pagination: true,
};

export const DEFAULT_FORM_CONFIG = {
  validateOnBlur: true,
  validateOnChange: false,
  submitOnEnter: true,
};
```

### `environment.js`

Environment-specific configuration:

```javascript
const ENV = process.env.REACT_APP_ENV || 'development';

const config = {
  development: {
    apiUrl: 'http://localhost:8080/api',
    authUrl: 'http://localhost:8080/auth',
    logLevel: 'debug',
    enableMocks: true,
  },
  staging: {
    apiUrl: 'https://staging-api.openportal.com/api',
    authUrl: 'https://staging-api.openportal.com/auth',
    logLevel: 'info',
    enableMocks: false,
  },
  production: {
    apiUrl: 'https://api.openportal.com/api',
    authUrl: 'https://api.openportal.com/auth',
    logLevel: 'error',
    enableMocks: false,
  },
};

export default config[ENV];
```

### `featureFlags.js`

Feature toggle configuration:

```javascript
export const FEATURES = {
  DARK_MODE: true,
  ADVANCED_SEARCH: false,
  EXPORT_CSV: true,
  REAL_TIME_UPDATES: false,
  BETA_WIDGETS: false,
};

export function isFeatureEnabled(feature) {
  return FEATURES[feature] === true;
}
```

### `theme.js`

Theme configuration (colors, spacing, typography):

```javascript
export const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
  },
  breakpoints: {
    mobile: '576px',
    tablet: '768px',
    desktop: '992px',
    wide: '1200px',
  },
};
```

## Configuration Guidelines

1. **Immutability**: Export as constants, don't mutate at runtime
2. **Environment Variables**: Use `process.env.REACT_APP_*` for environment-specific values
3. **Documentation**: Document the purpose of each configuration
4. **Validation**: Validate required environment variables on app startup
5. **Type Safety**: Use TypeScript or JSDoc for type checking

## Environment Variables

Required environment variables (defined in `.env` files):

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_AUTH_URL=http://localhost:8080/auth

# Environment
REACT_APP_ENV=development

# Feature Flags
REACT_APP_ENABLE_MOCKS=true
REACT_APP_LOG_LEVEL=debug

# External Services (optional)
REACT_APP_ANALYTICS_ID=
REACT_APP_SENTRY_DSN=
```

## Usage Examples

```javascript
// Import configuration
import environment from '@/config/environment';
import { ROUTES } from '@/config/constants';
import { FEATURES, isFeatureEnabled } from '@/config/featureFlags';
import { theme } from '@/config/theme';

// Use in components
function ApiService() {
  const baseUrl = environment.apiUrl;
  // ...
}

function Navigation() {
  return <Link to={ROUTES.DASHBOARD}>Dashboard</Link>;
}

function FeatureComponent() {
  if (!isFeatureEnabled('BETA_WIDGETS')) {
    return null;
  }
  return <BetaWidget />;
}
```

## File Structure

```
config/
├── constants.js           # Application constants
├── defaults.js           # Default configurations
├── environment.js        # Environment-specific config
├── featureFlags.js       # Feature toggles
├── theme.js             # Theme configuration
├── validation.js        # Validation rules
├── routes.js            # Route definitions
└── README.md
```

## Best Practices

1. **Don't Commit Secrets**: Use environment variables for sensitive data
2. **Use Constants**: Avoid magic strings and numbers
3. **Centralize Configuration**: Single source of truth
4. **Environment-Specific**: Use different configs for dev/staging/prod
5. **Validation**: Validate config values on app startup
6. **Documentation**: Document all configuration options

## Configuration Validation

```javascript
// validateConfig.js
export function validateConfig() {
  const required = ['REACT_APP_API_URL', 'REACT_APP_AUTH_URL'];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Call in index.js
import { validateConfig } from './config/validateConfig';
validateConfig();
```

## Dynamic Configuration

For configuration that changes at runtime, consider using:

- React Context for theme/preferences
- Redux/state management for feature flags
- API calls for remote configuration
