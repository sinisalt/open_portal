# Azure MSAL Setup Guide

## Overview

OpenPortal supports dual authentication modes via a feature flag:
- **Custom OAuth** (default) - Existing custom authentication system
- **Azure MSAL** - Microsoft Azure Active Directory authentication

This guide explains how to configure and use Azure MSAL authentication.

## Prerequisites

- Azure Active Directory tenant
- Azure AD application registration
- Client ID and tenant ID from Azure portal

## Azure AD Application Setup

### 1. Register Application in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: OpenPortal (or your preferred name)
   - **Supported account types**: Choose based on your needs
     - Single tenant: Accounts in this organizational directory only
     - Multi-tenant: Accounts in any organizational directory
   - **Redirect URI**: 
     - Platform: Single-page application (SPA)
     - URI: `http://localhost:3000/auth/callback` (for development)

### 2. Configure Authentication

After registration:
1. Go to **Authentication** section
2. Under **Implicit grant and hybrid flows**, ensure nothing is checked (PKCE is used instead)
3. Under **Advanced settings**:
   - Allow public client flows: No
4. Click **Save**

### 3. Configure API Permissions

1. Go to **API permissions** section
2. Ensure these Microsoft Graph permissions are granted:
   - `User.Read` (default, should already be added)
   - `openid`
   - `profile`
   - `email`
3. Click **Grant admin consent** if required by your organization

### 4. Get Application IDs

Note these values from the **Overview** section:
- **Application (client) ID**: Your VITE_AZURE_CLIENT_ID
- **Directory (tenant) ID**: Your VITE_AZURE_TENANT_ID

## Environment Configuration

### Development Setup

Create or update `.env` file in project root:

```env
# Authentication Provider Selection
VITE_AUTH_PROVIDER=msal  # Use 'custom' for OAuth, 'msal' for Azure

# Azure MSAL Configuration
VITE_AZURE_CLIENT_ID=your-application-client-id
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
VITE_AZURE_REDIRECT_URI=http://localhost:3000/auth/callback
VITE_AZURE_TENANT_ID=your-tenant-id
```

### Production Setup

For production deployments:

```env
VITE_AUTH_PROVIDER=msal
VITE_AZURE_CLIENT_ID=prod-client-id
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/prod-tenant-id
VITE_AZURE_REDIRECT_URI=https://your-production-domain.com/auth/callback
VITE_AZURE_TENANT_ID=prod-tenant-id
```

**Important**: Update redirect URI in Azure portal to match production URL.

## Configuration Details

### MSAL Configuration File

Location: `src/config/msalConfig.ts`

```typescript
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: import.meta.env.VITE_AZURE_AUTHORITY || 'https://login.microsoftonline.com/common',
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin + '/auth/callback',
  },
  cache: {
    cacheLocation: 'localStorage',
  },
}
```

### Token Scopes

Default scopes requested:
- `User.Read` - Read user profile
- `openid` - OpenID Connect authentication
- `profile` - User profile claims
- `email` - User email claim

Additional scopes can be added in `msalConfig.ts` if needed for API access.

## Usage

### Switching Between Auth Providers

Change `VITE_AUTH_PROVIDER` environment variable:

```bash
# Use custom OAuth
VITE_AUTH_PROVIDER=custom npm run dev

# Use Azure MSAL
VITE_AUTH_PROVIDER=msal npm run dev
```

### Login Flow

1. User navigates to `/login`
2. If `VITE_AUTH_PROVIDER=msal`:
   - LoginPageMSAL component renders
   - User clicks "Sign in with Microsoft"
   - MSAL popup opens for Azure AD authentication
   - User authenticates with Microsoft credentials
   - Token acquired and stored by MSAL library
3. If `VITE_AUTH_PROVIDER=custom`:
   - Standard LoginPage component renders
   - Custom OAuth flow proceeds as before

### Logout Flow

1. User initiates logout
2. If using MSAL:
   - `useMsalAuth.logout()` called
   - MSAL handles Azure AD logout
   - Local tokens cleared
3. If using custom OAuth:
   - Existing logout flow proceeds

## API Integration

### HTTP Client Token Handling

The HTTP client (`src/services/httpClient.js`) automatically detects auth provider and acquires tokens:

```javascript
// For MSAL
if (authProvider === 'msal') {
  accessToken = await getMsalToken();
}

// For custom OAuth
else {
  accessToken = tokenManager.getAccessToken();
}
```

Tokens are automatically added to Authorization header:
```
Authorization: Bearer <token>
```

## Token Storage

### MSAL Token Storage

- **Managed by**: @azure/msal-browser library
- **Location**: localStorage (configurable)
- **Security**: 
  - Tokens encrypted at rest by browser
  - PKCE flow prevents token interception
  - No refresh tokens exposed to JavaScript

### Token Refresh

- **MSAL**: Automatic silent refresh via `acquireTokenSilent()`
- **Custom OAuth**: Manual refresh via refresh token

## Troubleshooting

### Common Issues

#### 1. "AADSTS50011: The reply URL does not match"

**Solution**: Ensure redirect URI in `.env` matches exactly what's registered in Azure portal.

#### 2. "User cancelled login flow"

**Solution**: User closed popup. Normal behavior, no action needed unless persistent.

#### 3. "AADSTS700016: Application not found in directory"

**Solution**: Check `VITE_AZURE_CLIENT_ID` matches application ID in Azure portal.

#### 4. "InteractionRequiredAuthError"

**Solution**: Silent token acquisition failed. MSAL will automatically show login popup.

### Debug Mode

Enable MSAL logging by updating `msalConfig.ts`:

```typescript
export const msalConfig: Configuration = {
  auth: { /* ... */ },
  cache: { /* ... */ },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        console.log(`[MSAL] ${message}`);
      },
      logLevel: LogLevel.Verbose,
    },
  },
}
```

## Security Considerations

### Best Practices

1. **Never commit secrets**: Keep `.env` out of version control
2. **Use HTTPS in production**: Azure requires HTTPS for production redirects
3. **Validate tokens**: Backend must validate Azure AD tokens
4. **Minimal scopes**: Only request necessary permissions
5. **Regular updates**: Keep @azure/msal-* packages updated

### Token Validation (Backend)

Backend APIs must validate Azure AD tokens:

```javascript
// Example: Verify JWT signature and claims
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys'
});

// Validate token
jwt.verify(token, getKey, {
  audience: process.env.AZURE_CLIENT_ID,
  issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
}, (err, decoded) => {
  // Handle validation
});
```

## Testing

### Test Accounts

Create test users in Azure AD for testing:
1. Go to Azure AD > Users
2. Create new user
3. Use credentials for testing

### Testing Checklist

- [ ] Login with valid Microsoft account
- [ ] Logout successfully
- [ ] Token acquired and sent with API requests
- [ ] Token refresh works silently
- [ ] Error handling for failed login
- [ ] Feature flag switching works (custom ↔ MSAL)

## Migration from Custom OAuth

If migrating existing users:

1. **Parallel Operation**: Both systems can run simultaneously
2. **User Communication**: Inform users about new login method
3. **Gradual Rollout**: Use feature flag for phased rollout
4. **Data Migration**: No user data migration needed (separate systems)
5. **Monitoring**: Track authentication metrics for both providers

## References

- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Azure AD App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [MSAL React Guide](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react)
- [OpenPortal Architecture](./architecture.md)

## Support

For issues or questions:
- Check [Troubleshooting](#troubleshooting) section above
- Review Azure AD application logs in Azure portal
- Check browser console for MSAL errors
- Contact OpenPortal support team
