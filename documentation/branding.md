# Branding & Multi-Tenant Theme System

## Overview

The OpenPortal platform supports **multi-tenant branding** to enable different organizations to have their own unique visual identity while sharing the same application infrastructure. This is critical for SaaS deployments where multiple tenants need distinct branding without separate codebases.

## Core Concepts

### Tenant Identification

Each tenant is identified by a unique `tenantId` which is:
- Determined during authentication/login
- Embedded in the session/JWT token
- Used to load tenant-specific configurations
- Passed to all API calls for context

### Branding Scope

The branding system controls:
- **Visual Identity**: Logos, colors, typography
- **Theme Configuration**: Color schemes, spacing, borders
- **Asset Management**: Images, icons, custom fonts
- **Layout Preferences**: Default layouts, component styles

### Fallback Strategy

The system implements a **graceful degradation** approach:
1. Try to load tenant-specific branding
2. If not found, fall back to default branding
3. Never break the UI due to missing branding assets

---

## Branding Components

### 1. Logo System

#### Logo Types
- **Primary Logo** (Main Site Header)
  - Location: Upper left corner of main navigation
  - Size: Recommended 180x50px (max 200x60px)
  - Format: SVG (preferred), PNG with transparency
  - Use: Main application header on all authenticated pages

- **Login Logo** (Authentication Pages)
  - Location: Center of login form, above inputs
  - Size: Recommended 300x100px (max 400x120px)
  - Format: SVG (preferred), PNG with transparency
  - Use: Login page, password reset, OAuth pages

- **Favicon**
  - Size: 16x16, 32x32, 48x48 (multi-size .ico or PNG)
  - Format: ICO or PNG
  - Use: Browser tab icon

- **Mobile Icon** (PWA)
  - Sizes: 192x192, 512x512
  - Format: PNG
  - Use: Progressive Web App home screen icon

#### Logo Configuration Structure
```json
{
  "logos": {
    "primary": {
      "url": "https://cdn.example.com/tenants/acme/logo-primary.svg",
      "altText": "Acme Corporation",
      "width": 180,
      "height": 50
    },
    "login": {
      "url": "https://cdn.example.com/tenants/acme/logo-login.svg",
      "altText": "Acme Corporation",
      "width": 300,
      "height": 100
    },
    "favicon": {
      "url": "https://cdn.example.com/tenants/acme/favicon.ico"
    },
    "mobileIcons": {
      "icon192": "https://cdn.example.com/tenants/acme/icon-192.png",
      "icon512": "https://cdn.example.com/tenants/acme/icon-512.png"
    }
  }
}
```

### 2. Color Schemes

#### Color Palette Structure
Tenant-specific color schemes define all UI colors:

```json
{
  "colors": {
    "primary": {
      "50": "#e3f2fd",
      "100": "#bbdefb",
      "200": "#90caf9",
      "300": "#64b5f6",
      "400": "#42a5f5",
      "500": "#2196f3",
      "600": "#1e88e5",
      "700": "#1976d2",
      "800": "#1565c0",
      "900": "#0d47a1"
    },
    "secondary": {
      "50": "#fce4ec",
      "100": "#f8bbd0",
      "500": "#e91e63",
      "900": "#880e4f"
    },
    "success": "#4caf50",
    "warning": "#ff9800",
    "error": "#f44336",
    "info": "#2196f3",
    "background": {
      "default": "#ffffff",
      "paper": "#f5f5f5",
      "dark": "#303030"
    },
    "text": {
      "primary": "#212121",
      "secondary": "#757575",
      "disabled": "#bdbdbd",
      "hint": "#9e9e9e"
    },
    "divider": "#e0e0e0"
  }
}
```

#### Semantic Color Mapping
- **Primary**: Main brand color (buttons, links, active states)
- **Secondary**: Accent color (highlights, secondary actions)
- **Success**: Positive actions, confirmations
- **Warning**: Caution indicators
- **Error**: Error messages, destructive actions
- **Info**: Informational messages
- **Background**: Page backgrounds, card surfaces
- **Text**: Typography colors for different contexts

### 3. Typography System

#### Font Configuration
Support for Google Fonts and custom font hosting:

```json
{
  "typography": {
    "fontFamily": {
      "primary": "'Roboto', sans-serif",
      "secondary": "'Open Sans', sans-serif",
      "monospace": "'Roboto Mono', monospace"
    },
    "googleFonts": [
      {
        "name": "Roboto",
        "weights": [300, 400, 500, 700],
        "styles": ["normal", "italic"]
      },
      {
        "name": "Open Sans",
        "weights": [400, 600],
        "styles": ["normal"]
      }
    ],
    "customFonts": [
      {
        "name": "CustomBrand",
        "formats": ["woff2", "woff"],
        "baseUrl": "https://cdn.example.com/tenants/acme/fonts/"
      }
    ],
    "sizes": {
      "h1": "2.5rem",
      "h2": "2rem",
      "h3": "1.75rem",
      "h4": "1.5rem",
      "h5": "1.25rem",
      "h6": "1rem",
      "body1": "1rem",
      "body2": "0.875rem",
      "caption": "0.75rem"
    },
    "weights": {
      "light": 300,
      "regular": 400,
      "medium": 500,
      "bold": 700
    },
    "lineHeights": {
      "tight": 1.2,
      "normal": 1.5,
      "relaxed": 1.75
    }
  }
}
```

#### Typography Usage
- **Primary Font**: Body text, UI elements, general content
- **Secondary Font**: Headings, titles, emphasis
- **Monospace Font**: Code blocks, technical data, IDs

### 4. Advanced Theme Configuration

#### Spacing & Layout
```json
{
  "spacing": {
    "unit": 8,
    "scale": [0, 4, 8, 16, 24, 32, 48, 64, 96]
  },
  "borderRadius": {
    "small": "4px",
    "medium": "8px",
    "large": "16px",
    "pill": "9999px"
  },
  "shadows": {
    "small": "0 1px 3px rgba(0,0,0,0.12)",
    "medium": "0 4px 6px rgba(0,0,0,0.16)",
    "large": "0 10px 20px rgba(0,0,0,0.19)"
  }
}
```

#### Component-Specific Styling
```json
{
  "components": {
    "button": {
      "borderRadius": "8px",
      "paddingX": 24,
      "paddingY": 12,
      "fontSize": "1rem",
      "fontWeight": 500
    },
    "card": {
      "borderRadius": "12px",
      "padding": 24,
      "shadow": "medium"
    },
    "input": {
      "borderRadius": "4px",
      "height": 40,
      "fontSize": "0.875rem"
    }
  }
}
```

---

## Technical Architecture

### Branding Loading Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Authentication                                       │
│    → POST /auth/login                                        │
│    → Receives JWT with tenantId                              │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Bootstrap Application                                     │
│    → GET /ui/bootstrap                                       │
│    → Returns user, tenant, permissions, menu                 │
│    → Includes branding configuration reference               │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Load Branding Configuration                               │
│    → GET /ui/branding?tenantId={id}                          │
│    → Returns complete branding configuration                 │
│    → Frontend applies theme to application                   │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Cache Branding Configuration                              │
│    → Store in localStorage/IndexedDB                         │
│    → Use ETag/version for cache invalidation                 │
│    → Fallback to default if tenant branding unavailable      │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Integration

#### Theme Provider Structure
```javascript
// React Theme Provider wraps entire application
<ThemeProvider theme={tenantTheme}>
  <BrandingProvider branding={brandingConfig}>
    <App />
  </BrandingProvider>
</ThemeProvider>
```

#### Logo Component Usage
```javascript
// Primary Logo in Header
<Logo 
  type="primary" 
  fallbackSrc="/assets/default-logo.svg"
  alt={tenant.name}
/>

// Login Logo
<Logo 
  type="login" 
  fallbackSrc="/assets/default-logo-large.svg"
  alt="Login to Portal"
/>
```

#### Theme Hook Usage
```javascript
// Access theme in components
const theme = useTheme();
const { colors, typography, spacing } = theme;

// Example usage
<Button
  style={{
    backgroundColor: colors.primary[500],
    fontFamily: typography.fontFamily.primary,
    padding: `${spacing.scale[2]}px ${spacing.scale[4]}px`
  }}
>
  Click Me
</Button>
```

### Backend Implementation

#### Branding Configuration Storage

**Database Schema:**
```sql
CREATE TABLE tenant_branding (
  tenant_id VARCHAR(255) PRIMARY KEY,
  config JSONB NOT NULL,
  version VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_tenant_branding_version ON tenant_branding(version);
```

**Config Version Management:**
- Each branding configuration has a semantic version (e.g., "1.2.0")
- Frontend caches based on version/ETag
- Version increment triggers cache invalidation
- Supports rollback to previous versions

#### API Endpoint: GET /ui/branding

**Request:**
```
GET /ui/branding?tenantId=acme-corp
```

**Response:**
```json
{
  "tenantId": "acme-corp",
  "version": "1.2.0",
  "lastUpdated": "2026-01-15T10:30:00Z",
  "branding": {
    "logos": { /* logo configuration */ },
    "colors": { /* color configuration */ },
    "typography": { /* typography configuration */ },
    "spacing": { /* spacing configuration */ },
    "components": { /* component overrides */ }
  },
  "cacheControl": "public, max-age=3600",
  "etag": "W/\"1.2.0-acme-corp\""
}
```

**Fallback Response (No Tenant Branding):**
```json
{
  "tenantId": "default",
  "version": "1.0.0",
  "isDefault": true,
  "branding": { /* default branding */ }
}
```

#### Bootstrap API Enhancement

Update the `/ui/bootstrap` endpoint to include branding reference:

```json
{
  "user": { /* ... */ },
  "tenant": {
    "id": "tenant456",
    "name": "Acme Corp",
    "domain": "acme.example.com",
    "brandingVersion": "1.2.0"
  },
  "branding": {
    "version": "1.2.0",
    "url": "/ui/branding?tenantId=tenant456"
  },
  /* ... rest of bootstrap response */
}
```

---

## Implementation Considerations

### Performance Optimization

1. **Asset Delivery**
   - Host static assets (logos, fonts) on CDN
   - Use proper cache headers (1 year for versioned assets)
   - Implement lazy loading for non-critical assets
   - Compress images (WebP with PNG fallback)

2. **Configuration Caching**
   - Cache branding config in browser storage
   - Use ETag for conditional requests
   - Implement stale-while-revalidate strategy
   - Preload branding during authentication

3. **Font Loading**
   - Use `font-display: swap` for Google Fonts
   - Preload critical custom fonts
   - Implement FOUT (Flash of Unstyled Text) mitigation
   - Subset fonts to reduce payload size

### Browser Support

- **Modern Browsers**: Full CSS custom properties support
- **Legacy Browsers**: Fallback to pre-compiled CSS
- **Progressive Enhancement**: Core functionality without custom branding

### Security Considerations

1. **Asset Validation**
   - Validate logo URLs before rendering
   - Sanitize custom CSS properties
   - Implement CSP headers for asset sources
   - Prevent XSS through style injection

2. **Access Control**
   - Tenant isolation (tenant A cannot access tenant B's branding)
   - Admin-only branding configuration updates
   - Audit logging for branding changes
   - Version control for configuration history

### Accessibility

1. **Logo Requirements**
   - Provide meaningful alt text
   - Ensure sufficient color contrast
   - Support high contrast mode
   - Provide text alternative for logo

2. **Color Contrast**
   - Validate WCAG AA compliance (4.5:1 for normal text)
   - Validate WCAG AAA compliance (7:1 for enhanced)
   - Test with color blindness simulators
   - Provide contrast warnings in admin tools

3. **Typography**
   - Minimum 12px font size for body text
   - Adequate line height (1.5 minimum)
   - Readable font families
   - Support for font scaling (200%)

---

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Define branding configuration JSON schema
- [ ] Create database schema for tenant branding
- [ ] Implement GET /ui/branding API endpoint
- [ ] Create default branding configuration
- [ ] Update bootstrap API to include branding reference

### Phase 2: Frontend Integration (Week 2-3)
- [ ] Create ThemeProvider component
- [ ] Implement BrandingContext and hooks
- [ ] Build Logo component with fallback support
- [ ] Create dynamic CSS custom properties system
- [ ] Implement Google Fonts loader
- [ ] Add custom font loader support

### Phase 3: Core Components (Week 3-4)
- [ ] Update Header component to use tenant logo
- [ ] Update Login page to use tenant logo
- [ ] Apply color scheme to all UI components
- [ ] Apply typography system to text elements
- [ ] Implement favicon dynamic injection
- [ ] Add PWA manifest generation per tenant

### Phase 4: Caching & Performance (Week 4-5)
- [ ] Implement branding configuration caching
- [ ] Add ETag support for conditional requests
- [ ] Implement CDN integration for assets
- [ ] Add preload hints for critical assets
- [ ] Optimize font loading strategy
- [ ] Implement stale-while-revalidate

### Phase 5: Advanced Features (Week 5-6)
- [ ] Support for component-level style overrides
- [ ] Dark mode support per tenant
- [ ] Custom CSS injection (sandboxed)
- [ ] Branding preview tool
- [ ] A/B testing for branding variants

### Phase 6: Admin Tools (Week 6-7)
- [ ] Branding configuration UI (backend admin)
- [ ] Logo upload and management
- [ ] Color picker with accessibility validation
- [ ] Font selector (Google Fonts + custom)
- [ ] Live preview functionality
- [ ] Version management and rollback

### Phase 7: Testing & Documentation (Week 7-8)
- [ ] Unit tests for branding system
- [ ] Integration tests for theme switching
- [ ] Accessibility compliance testing
- [ ] Performance benchmarking
- [ ] Complete developer documentation
- [ ] Create tenant onboarding guide

---

## Example: Complete Tenant Branding Configuration

```json
{
  "tenantId": "acme-corp-2024",
  "version": "2.1.0",
  "lastUpdated": "2026-01-15T10:30:00Z",
  "branding": {
    "logos": {
      "primary": {
        "url": "https://cdn.example.com/tenants/acme/logo-primary.svg",
        "altText": "Acme Corporation",
        "width": 180,
        "height": 50,
        "link": "/dashboard"
      },
      "login": {
        "url": "https://cdn.example.com/tenants/acme/logo-login.svg",
        "altText": "Acme Corporation - Business Portal",
        "width": 300,
        "height": 100
      },
      "favicon": {
        "url": "https://cdn.example.com/tenants/acme/favicon.ico"
      },
      "mobileIcons": {
        "icon192": "https://cdn.example.com/tenants/acme/icon-192.png",
        "icon512": "https://cdn.example.com/tenants/acme/icon-512.png",
        "appleTouchIcon": "https://cdn.example.com/tenants/acme/apple-touch-icon.png"
      }
    },
    "colors": {
      "primary": {
        "50": "#e8eaf6",
        "100": "#c5cae9",
        "200": "#9fa8da",
        "300": "#7986cb",
        "400": "#5c6bc0",
        "500": "#3f51b5",
        "600": "#3949ab",
        "700": "#303f9f",
        "800": "#283593",
        "900": "#1a237e"
      },
      "secondary": {
        "50": "#fff3e0",
        "100": "#ffe0b2",
        "200": "#ffcc80",
        "300": "#ffb74d",
        "400": "#ffa726",
        "500": "#ff9800",
        "600": "#fb8c00",
        "700": "#f57c00",
        "800": "#ef6c00",
        "900": "#e65100"
      },
      "success": "#66bb6a",
      "warning": "#ffa726",
      "error": "#f44336",
      "info": "#29b6f6",
      "background": {
        "default": "#fafafa",
        "paper": "#ffffff",
        "dark": "#212121"
      },
      "text": {
        "primary": "#212121",
        "secondary": "#757575",
        "disabled": "#bdbdbd",
        "hint": "#9e9e9e"
      },
      "divider": "#e0e0e0"
    },
    "typography": {
      "fontFamily": {
        "primary": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        "secondary": "'Poppins', sans-serif",
        "monospace": "'Fira Code', 'Courier New', monospace"
      },
      "googleFonts": [
        {
          "name": "Inter",
          "weights": [300, 400, 500, 600, 700],
          "styles": ["normal", "italic"]
        },
        {
          "name": "Poppins",
          "weights": [400, 600, 700],
          "styles": ["normal"]
        },
        {
          "name": "Fira Code",
          "weights": [400, 500],
          "styles": ["normal"]
        }
      ],
      "sizes": {
        "h1": "2.5rem",
        "h2": "2rem",
        "h3": "1.75rem",
        "h4": "1.5rem",
        "h5": "1.25rem",
        "h6": "1.125rem",
        "body1": "1rem",
        "body2": "0.875rem",
        "caption": "0.75rem",
        "overline": "0.625rem"
      },
      "weights": {
        "light": 300,
        "regular": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700
      },
      "lineHeights": {
        "tight": 1.2,
        "normal": 1.5,
        "relaxed": 1.75,
        "loose": 2
      }
    },
    "spacing": {
      "unit": 8,
      "scale": [0, 4, 8, 12, 16, 24, 32, 40, 48, 64, 96, 128]
    },
    "borderRadius": {
      "none": "0",
      "small": "4px",
      "medium": "8px",
      "large": "12px",
      "xlarge": "16px",
      "pill": "9999px",
      "circle": "50%"
    },
    "shadows": {
      "none": "none",
      "small": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "medium": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      "large": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      "xlarge": "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      "inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)"
    },
    "components": {
      "button": {
        "borderRadius": "8px",
        "paddingX": 24,
        "paddingY": 12,
        "fontSize": "1rem",
        "fontWeight": 600,
        "textTransform": "none"
      },
      "card": {
        "borderRadius": "12px",
        "padding": 24,
        "shadow": "medium",
        "borderWidth": "1px"
      },
      "input": {
        "borderRadius": "6px",
        "height": 40,
        "fontSize": "0.875rem",
        "borderWidth": "1px"
      },
      "table": {
        "headerBackground": "#f5f5f5",
        "rowHoverBackground": "#fafafa",
        "borderColor": "#e0e0e0"
      },
      "modal": {
        "borderRadius": "16px",
        "shadow": "xlarge",
        "padding": 32
      }
    },
    "customCSS": {
      "enabled": false,
      "url": null
    },
    "darkMode": {
      "enabled": true,
      "colors": {
        "primary": {
          "500": "#5c6bc0"
        },
        "background": {
          "default": "#121212",
          "paper": "#1e1e1e"
        },
        "text": {
          "primary": "#ffffff",
          "secondary": "#b0b0b0"
        }
      }
    }
  },
  "metadata": {
    "createdBy": "admin@acme.com",
    "createdAt": "2025-12-01T09:00:00Z",
    "updatedBy": "admin@acme.com",
    "updatedAt": "2026-01-15T10:30:00Z",
    "changeLog": [
      {
        "version": "2.1.0",
        "date": "2026-01-15T10:30:00Z",
        "changes": "Updated primary color palette and added dark mode support"
      },
      {
        "version": "2.0.0",
        "date": "2025-12-15T14:00:00Z",
        "changes": "Complete redesign with new logo and color scheme"
      }
    ]
  }
}
```

---

## Testing Strategy

### Unit Tests
- Branding configuration validation
- Theme provider rendering
- Logo component with fallbacks
- Color contrast calculations
- Font loading mechanisms

### Integration Tests
- Tenant-specific theme loading
- Cache invalidation on version change
- Fallback to default branding
- Logo switching between pages
- Multi-tenant isolation

### Visual Regression Tests
- Screenshot comparison for each tenant
- Component rendering with different themes
- Dark mode switching
- Responsive logo scaling

### Accessibility Tests
- Color contrast validation (WCAG AA/AAA)
- Screen reader compatibility
- Keyboard navigation
- High contrast mode support
- Font scaling (up to 200%)

### Performance Tests
- Theme loading time (<100ms)
- Asset loading optimization
- Cache effectiveness
- CDN performance
- Font loading impact on FCP/LCP

---

## Migration Strategy

### From Default to Custom Branding

1. **Create Tenant Configuration**
   - Define tenant in database
   - Upload logo assets to CDN
   - Configure color palette
   - Select fonts

2. **Test in Staging**
   - Preview branding configuration
   - Validate accessibility
   - Check performance impact
   - Verify fallback behavior

3. **Deploy to Production**
   - Publish branding configuration
   - Monitor for issues
   - Gather user feedback
   - Iterate as needed

### Multi-Tenant Onboarding

1. **Tenant Setup Wizard**
   - Upload primary logo
   - Upload login logo
   - Pick primary color
   - Select fonts (Google Fonts)
   - Preview configuration

2. **Automated Validation**
   - Logo size validation
   - Color contrast checking
   - Font availability verification
   - Asset URL validation

3. **Activation**
   - Review and approve
   - Set branding version
   - Enable for tenant
   - Monitor adoption

---

## Best Practices

### Logo Guidelines
- ✅ Use SVG format for scalability
- ✅ Provide PNG fallback for older browsers
- ✅ Ensure transparent backgrounds
- ✅ Test on light and dark backgrounds
- ✅ Include meaningful alt text
- ❌ Don't use raster formats at small sizes
- ❌ Don't embed text in logos (accessibility)
- ❌ Don't use overly complex designs

### Color Selection
- ✅ Choose colors with good contrast
- ✅ Test with color blindness simulators
- ✅ Provide 50-900 shade scale for primary/secondary
- ✅ Define semantic colors (success, error, etc.)
- ✅ Support both light and dark modes
- ❌ Don't use extremely bright colors
- ❌ Don't rely solely on color to convey information
- ❌ Don't use low contrast combinations

### Typography
- ✅ Limit to 2-3 font families maximum
- ✅ Use web-safe fallback fonts
- ✅ Ensure fonts are licensed for web use
- ✅ Include multiple font weights
- ✅ Test readability at various sizes
- ❌ Don't use decorative fonts for body text
- ❌ Don't mix too many font styles
- ❌ Don't use fonts without proper licensing

---

## Troubleshooting

### Logo Not Displaying
- Verify URL is accessible (CORS headers)
- Check fallback logo is configured
- Validate image format is supported
- Ensure tenant ID is correct
- Check browser console for errors

### Colors Not Applying
- Verify theme configuration is loaded
- Check CSS custom properties are supported
- Validate color format (hex, rgb, rgba)
- Ensure theme provider wraps application
- Clear browser cache and reload

### Fonts Not Loading
- Verify Google Fonts URL is correct
- Check CSP headers allow font sources
- Validate font names match exactly
- Ensure font weights are available
- Test with network throttling disabled

---

## Future Enhancements

### Planned Features
- [ ] Visual branding configuration UI (no-code)
- [ ] Real-time branding preview
- [ ] A/B testing for branding variants
- [ ] Automated accessibility scoring
- [ ] Brand guidelines generator
- [ ] Multi-language support for logos
- [ ] Seasonal/event-based branding
- [ ] White-label partner management
- [ ] Branding analytics and insights

### Advanced Customization
- [ ] Custom CSS injection (sandboxed)
- [ ] Component-level style overrides
- [ ] Animation customization
- [ ] Layout pattern selection
- [ ] Custom widget themes
- [ ] Branded email templates
- [ ] Branded PDF exports

---

**Document Version:** 1.0  
**Last Updated:** January 19, 2026  
**Status:** Planning Phase  
**Review Cycle:** Quarterly
