# Complete User Journey Scenarios

## Overview

This document provides end-to-end user journey scenarios that demonstrate the complete OpenPortal platform capabilities, from login to complex workflows with real-time updates.

---

## Journey 1: First-Time User Login to Dashboard

### Scenario
John is a new employee at Acme Corp who has just been granted access to the company portal.

### Steps

**1. User Opens Application**
```
URL: https://app.acme.example.com
Status: Not authenticated
Action: Redirects to /login
```

**2. Login Page Loads**
- Static login page renders (no API call needed)
- Shows email/password form
- Shows "Sign in with Google" and "Sign in with Microsoft" buttons

**3. User Enters Credentials**
```javascript
{
  email: "john.doe@acme.com",
  password: "SecurePassword123!"
}
```

**4. Frontend Calls Login API**
```http
POST /api/v1/auth/login
Authorization: None
Content-Type: application/json

{
  "email": "john.doe@acme.com",
  "password": "SecurePassword123!"
}
```

**5. Backend Response (Success)**
```json
{
  "success": true,
  "accessToken": "eyJhbG...",
  "refreshToken": "rt_abc...",
  "expiresIn": 3600,
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john.doe@acme.com"
  }
}
```

**6. Frontend Stores Tokens**
```javascript
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('refreshToken', response.refreshToken);
localStorage.setItem('tokenExpiry', Date.now() + 3600000);
```

**7. Frontend Calls Bootstrap API**
```http
GET /api/v1/ui/bootstrap
Authorization: Bearer eyJhbG...
```

**8. Backend Returns Initial Configuration**
```json
{
  "user": { /* full user details */ },
  "tenant": { /* tenant info */ },
  "permissions": ["dashboard.view", "profile.view", ...],
  "menu": [
    {"id": "dashboard", "label": "Dashboard", "route": "/dashboard"},
    {"id": "listings", "label": "Listings", "route": "/listings"}
  ],
  "defaultRoute": "/dashboard",
  "featureFlags": { "newDashboard": true }
}
```

**9. Frontend Navigates to Default Route**
```
Navigate to: /dashboard
Browser history: [/login, /dashboard]
```

**10. Frontend Resolves Dashboard Route**
```http
GET /api/v1/ui/routes/resolve?path=/dashboard
Authorization: Bearer eyJhbG...
```

Response:
```json
{
  "pageId": "dashboard-page",
  "routeParams": {},
  "accessAllowed": true
}
```

**11. Frontend Loads Dashboard Configuration**
```http
GET /api/v1/ui/pages/dashboard-page
Authorization: Bearer eyJhbG...
If-None-Match: "" (no cache yet)
```

Response:
```json
{
  "pageId": "dashboard-page",
  "title": "Dashboard",
  "widgets": [
    {
      "id": "welcome-card",
      "type": "Card",
      "props": {
        "title": "Welcome, {{user.firstName}}!"
      },
      "children": [...]
    },
    {
      "id": "kpi-row",
      "type": "Row",
      "children": [
        {
          "id": "revenue-kpi",
          "type": "KPI",
          "datasourceId": "revenue-data",
          "props": {
            "label": "Total Revenue",
            "format": "currency"
          }
        }
      ]
    },
    {
      "id": "recent-listings",
      "type": "Table",
      "datasourceId": "listings-data",
      "props": {
        "columns": [...]
      }
    }
  ],
  "datasources": [
    {
      "id": "revenue-data",
      "kind": "http",
      "fetchPolicy": {"mode": "onMount"},
      "http": {
        "method": "GET",
        "url": "/api/kpi/revenue"
      }
    },
    {
      "id": "listings-data",
      "kind": "http",
      "fetchPolicy": {"mode": "onMount"},
      "http": {
        "method": "GET",
        "url": "/api/listings/recent"
      }
    }
  ]
}
```

**12. Frontend Caches Configuration**
```javascript
// Store in IndexedDB
await configCache.set('dashboard-page', pageConfig, etag);
```

**13. Frontend Fetches Data Sources**

**Request 1: Revenue KPI**
```http
GET /api/kpi/revenue
Authorization: Bearer eyJhbG...
```

Response:
```json
{
  "value": 125000,
  "change": "+5.2%",
  "trend": "up"
}
```

**Request 2: Recent Listings**
```http
GET /api/listings/recent
Authorization: Bearer eyJhbG...
```

Response:
```json
{
  "items": [
    {
      "id": "list1",
      "title": "Modern Apartment",
      "price": 2500,
      "status": "active"
    }
  ]
}
```

**14. Frontend Renders Dashboard**
- Welcome card with "Welcome, John!"
- KPI showing $125,000 revenue with +5.2% badge
- Table with recent listings

**Total Time:** ~2-3 seconds
**API Calls:** 5 (login, bootstrap, route resolve, page config, 2 data sources)
**User Experience:** Seamless transition from login to personalized dashboard

---

## Journey 2: Editing Profile and Managing API Keys

### Scenario
John wants to update his job title and create a new API key for a third-party integration.

### Steps

**1. User Clicks Avatar in Header**
- Dropdown menu appears with options:
  - View Profile
  - Preferences
  - Logout

**2. User Clicks "View Profile"**
```
Navigate to: /profile
Browser history: [/login, /dashboard, /profile]
```

**3. Frontend Checks Cache for Profile Page**
```javascript
const cached = await configCache.get('user-profile-page', cachedETag);
if (cached && !isStale) {
  // Use cached config
  renderPage(cached);
} else {
  // Fetch new config
}
```

**4. Frontend Loads Profile Configuration**
```http
GET /api/v1/ui/pages/user-profile-page
If-None-Match: "profile-v1.2.3"
```

Response: `304 Not Modified` (config unchanged)
→ Uses cached configuration

**5. Frontend Fetches Profile Data**
```http
GET /api/users/user123
Authorization: Bearer eyJhbG...
```

Response:
```json
{
  "id": "user123",
  "name": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@acme.com",
  "jobTitle": "Software Engineer",
  "department": "Engineering",
  "phone": "+1 (555) 123-4567",
  "createdAt": "2023-01-15T10:00:00Z"
}
```

**6. Profile Page Renders**
- Left sidebar with menu:
  - Profile Information (selected)
  - API Keys
  - Audit History
  - Documents
  - Preferences
- Main content: Profile details with "Edit" button

**7. User Clicks "Edit" Button**
```
Navigate to: /profile/edit
Browser history: [/login, /dashboard, /profile, /profile/edit]
```

**8. Edit Form Loads**
- Same sidebar (cached)
- Form pre-filled with current values
- Job Title field shows "Software Engineer"

**9. User Changes Job Title**
```
From: "Software Engineer"
To: "Senior Software Engineer"
```

**10. User Clicks "Save"**

**11. Frontend Validates (Client-side)**
```javascript
// All fields pass validation
const formData = {
  firstName: "John",
  lastName: "Doe",
  jobTitle: "Senior Software Engineer", // Changed
  department: "Engineering",
  phone: "+1 (555) 123-4567"
};
```

**12. Frontend Calls Save Action**
```http
POST /api/v1/ui/actions/execute
Authorization: Bearer eyJhbG...

{
  "actionId": "update-user-profile",
  "context": {
    "formValues": {
      "firstName": "John",
      "lastName": "Doe",
      "jobTitle": "Senior Software Engineer",
      "department": "Engineering",
      "phone": "+1 (555) 123-4567"
    },
    "routeParams": {"userId": "user123"}
  }
}
```

**13. Backend Validates and Updates**
```json
{
  "success": true,
  "result": {
    "id": "user123",
    "jobTitle": "Senior Software Engineer",
    "updatedAt": "2024-01-17T14:30:00Z"
  },
  "messages": [
    {
      "type": "success",
      "text": "Profile updated successfully"
    }
  ],
  "patches": [
    {
      "op": "set",
      "path": "user.jobTitle",
      "value": "Senior Software Engineer"
    }
  ]
}
```

**14. Backend Invalidates Cache**
```javascript
// Redis cache invalidation
await redis.del(`user-profile:${userId}`);
await redis.del(`user-session:${userId}`);
```

**15. Frontend Shows Success Toast**
```
Toast: "Profile updated successfully" (green checkmark)
```

**16. Frontend Navigates Back**
```
Navigate to: /profile
Browser history: [/login, /dashboard, /profile, /profile/edit, /profile]
```

**17. Profile Refreshes with New Data**
- Job Title now shows "Senior Software Engineer"

**18. User Clicks "API Keys" in Sidebar**
```
Navigate to: /profile/api-keys
Browser history: [..., /profile, /profile/api-keys]
```

**19. API Keys Page Loads**
- Same sidebar (already cached)
- Fetches API keys list

```http
GET /api/users/user123/api-keys
Authorization: Bearer eyJhbG...
```

Response:
```json
{
  "items": [
    {
      "id": "key_abc123",
      "name": "Production API Key",
      "key": "sk_live_abc123xyz789********",
      "createdAt": "2023-06-15T10:00:00Z",
      "lastUsed": "2024-01-17T10:30:00Z",
      "status": "active"
    }
  ],
  "meta": {
    "total": 1,
    "active": 1
  }
}
```

**20. User Clicks "Create New Key"**
- Modal opens with form
- User enters name: "Integration API Key"
- User selects permissions: Read, Write

**21. User Submits Create Key Form**
```http
POST /api/v1/ui/actions/execute
Authorization: Bearer eyJhbG...

{
  "actionId": "create-api-key",
  "context": {
    "formValues": {
      "name": "Integration API Key",
      "permissions": ["read", "write"]
    }
  }
}
```

**22. Backend Creates Key**
```json
{
  "success": true,
  "result": {
    "id": "key_new789",
    "name": "Integration API Key",
    "key": "sk_live_new789abc456def123ghi",
    "createdAt": "2024-01-17T14:35:00Z",
    "permissions": ["read", "write"],
    "status": "active"
  },
  "messages": [
    {
      "type": "success",
      "text": "API key created successfully"
    },
    {
      "type": "warning",
      "text": "Make sure to copy your key now. You won't be able to see it again."
    }
  ],
  "modal": {
    "action": "update",
    "props": {
      "showKey": true,
      "key": "sk_live_new789abc456def123ghi"
    }
  }
}
```

**23. Modal Updates to Show Full Key**
- Display full API key with copy button
- Warning message shown
- User copies key to clipboard

**24. Modal Closes**
- Table refreshes automatically
- New key appears in list (masked)

**25. User Clicks Browser Back Button**
```
Current: /profile/api-keys
Navigate to: /profile
Browser history pointer moves back
```

Profile page loads from cache, data refreshes

**Summary:**
- Configuration cached: No repeated config fetches
- Data always fresh: Profile data fetched on each view
- Smooth navigation: Browser back/forward works correctly
- Optimistic updates: UI updates immediately, server confirms
- Cache invalidation: Backend clears stale cache after updates

---

## Journey 3: Real-Time Dashboard Updates

### Scenario
John is viewing the dashboard when new data arrives via WebSocket.

### Steps

**1. User on Dashboard**
- Dashboard fully loaded and rendered
- Shows current revenue: $125,000

**2. Frontend Establishes WebSocket Connection**
```javascript
// On dashboard mount
const ws = new WebSocket('wss://api.example.com/v1/ui/ws?token=' + accessToken);

ws.onopen = () => {
  // Subscribe to dashboard updates
  ws.send(JSON.stringify({
    action: 'subscribe',
    topic: 'tenant:tenant456:dashboard'
  }));
};
```

**3. Backend Confirms Subscription**
```json
{
  "type": "subscribed",
  "topic": "tenant:tenant456:dashboard",
  "timestamp": "2024-01-17T14:40:00Z"
}
```

**4. New Sale Occurs in Backend System**
- Sale amount: $5,000
- Revenue KPI should update

**5. Backend Publishes Update via WebSocket**
```json
{
  "type": "update",
  "topic": "tenant:tenant456:dashboard",
  "data": {
    "datasourceId": "revenue-data",
    "value": 130000,
    "change": "+6.1%",
    "trend": "up"
  },
  "timestamp": "2024-01-17T14:40:30Z"
}
```

**6. Frontend Receives Update**
```javascript
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  
  if (update.type === 'update') {
    // Update datasource in state
    updateDatasource(update.data.datasourceId, update.data);
  }
};
```

**7. KPI Widget Re-renders**
- Revenue: $125,000 → $130,000 (animated)
- Change: +5.2% → +6.1%
- Badge color updates
- Confetti animation plays (optional)

**8. User Experience**
- Sees live update without refresh
- Smooth animation
- No page flicker
- No user action required

---

## Journey 4: Deep Link with Authentication

### Scenario
User receives email: "View your new document" with link to specific document page.

### Steps

**1. User Clicks Email Link**
```
URL: https://app.acme.example.com/profile/documents/doc789
Status: Not authenticated (cleared cookies)
```

**2. Frontend Detects No Auth**
```javascript
if (!isAuthenticated()) {
  const returnTo = window.location.pathname;
  navigate(`/login?redirect=${encodeURIComponent(returnTo)}`);
}
```

**3. User Redirected to Login**
```
URL: /login?redirect=%2Fprofile%2Fdocuments%2Fdoc789
```

**4. Login Page Shows Return Hint**
```
"You need to sign in to access this page.
After login, you'll be redirected to your requested page."
```

**5. User Logs In**
- Enters credentials
- Successful authentication

**6. Frontend Gets Bootstrap Data**
```http
GET /api/v1/ui/bootstrap
```

**7. Frontend Checks Redirect Parameter**
```javascript
const params = new URLSearchParams(window.location.search);
const redirect = params.get('redirect');

if (redirect) {
  navigate(redirect); // Go to /profile/documents/doc789
} else {
  navigate(defaultRoute); // Go to /dashboard
}
```

**8. Frontend Navigates to Original Target**
```
Navigate to: /profile/documents/doc789
Browser history: [/login?redirect=..., /profile/documents/doc789]
```

**9. Route Resolution**
```http
GET /api/v1/ui/routes/resolve?path=/profile/documents/doc789
```

Response:
```json
{
  "pageId": "document-detail-page",
  "routeParams": {
    "documentId": "doc789"
  },
  "accessAllowed": true,
  "breadcrumbs": [
    {"label": "Home", "route": "/dashboard"},
    {"label": "Profile", "route": "/profile"},
    {"label": "Documents", "route": "/profile/documents"},
    {"label": "Document #789", "route": "/profile/documents/doc789"}
  ]
}
```

**10. Page Loads with Document**
- Profile sidebar shown
- Document content displayed
- User sees the specific document they clicked in email

**Summary:**
- Deep links work even when not authenticated
- Return path preserved through login flow
- Seamless experience after authentication

---

## Journey 5: Error Handling and Recovery

### Scenario
Network error during profile save, then recovery.

### Steps

**1. User Editing Profile**
- Changes phone number
- Clicks "Save"

**2. Network Request Fails**
```http
POST /api/v1/ui/actions/execute
→ Network error (timeout)
```

**3. Frontend Catches Error**
```javascript
try {
  await executeAction(actionId, context);
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    showToast({
      type: 'error',
      message: 'Network error. Please check your connection and try again.',
      duration: 5000
    });
  }
}
```

**4. Error Toast Appears**
```
Toast: "Network error. Please check your connection and try again."
(Red with error icon, 5 seconds)
```

**5. Form Remains Editable**
- User changes are NOT lost
- Form still shows modified values
- Save button enabled

**6. User Fixes Network (Reconnects WiFi)**

**7. User Clicks "Save" Again**

**8. Request Succeeds This Time**
```json
{
  "success": true,
  "result": {...},
  "messages": [{"type": "success", "text": "Profile updated successfully"}]
}
```

**9. Success Toast Appears**
```
Toast: "Profile updated successfully" (Green with checkmark)
```

**10. Form Auto-navigates Back**
```
Navigate to: /profile
```

**Summary:**
- Graceful error handling
- User data not lost
- Clear error messages
- Easy retry mechanism

---

## Journey 6: Multi-Tab Coordination

### Scenario
User has dashboard open in two browser tabs.

### Steps

**1. Tab 1: Dashboard Page**
- Revenue: $130,000

**2. User Opens Tab 2**
```
Open new tab: /dashboard
```

**3. Tab 2 Loads**
- Checks cache for dashboard config (HIT)
- Fetches fresh data
- Shows same revenue: $130,000

**4. New Sale in Backend**
- Revenue → $135,000

**5. WebSocket Update Sent**
```json
{
  "type": "update",
  "topic": "tenant:tenant456:dashboard",
  "data": {
    "datasourceId": "revenue-data",
    "value": 135000
  }
}
```

**6. Both Tabs Receive Update**
- Tab 1: WebSocket connected → Updates immediately
- Tab 2: WebSocket connected → Updates immediately

**7. Both Tabs Show $135,000**
- Synchronized in real-time
- No manual refresh needed

**8. User Logs Out in Tab 1**
```http
POST /api/v1/auth/logout
```

**9. Tab 1 Clears Storage**
```javascript
localStorage.clear();
sessionStorage.clear();
navigate('/login');
```

**10. Tab 2 Detects Logout**
```javascript
// Listen to storage events
window.addEventListener('storage', (e) => {
  if (e.key === 'accessToken' && e.newValue === null) {
    // Token was removed → user logged out
    navigate('/login');
  }
});
```

**11. Tab 2 Auto-redirects to Login**
- Prevents security issue
- Both tabs now on login page

**Summary:**
- Efficient caching across tabs
- Real-time sync with WebSocket
- Coordinated logout for security

---

## Performance Characteristics

### Page Load Times (Target)
- **Login Page:** < 0.5s (static)
- **First Dashboard Load:** < 2s (with bootstrap)
- **Subsequent Page Load:** < 0.5s (cached config)
- **Data Refresh:** < 0.3s (API call only)

### Caching Efficiency
- **Config Cache Hit Rate:** 95%+
- **Data Cache TTL:** 5-60 seconds (per datasource)
- **Redis Cache Hit Rate:** 90%+

### Real-Time Performance
- **WebSocket Latency:** < 100ms
- **UI Update Latency:** < 50ms after message
- **Connection Recovery:** < 3s

---

## Accessibility Features

### Keyboard Navigation
- Tab through all interactive elements
- Enter to activate buttons
- Arrow keys for menu navigation
- Escape to close modals

### Screen Reader Support
- ARIA labels on all widgets
- Semantic HTML structure
- Form validation announced
- Loading states announced

### Visual Accessibility
- WCAG 2.1 AA contrast ratios
- Focus indicators on all interactive elements
- Resizable text (up to 200%)
- No flashing content

---

**Version:** 1.0
**Last Updated:** January 18, 2026
**Related Documents:**
- [Authentication Scenarios](./authentication-scenarios.md)
- [User Profile Scenarios](./user-profile-scenarios.md)
- [Architecture](./architecture.md)
- [API Specification](./api-specification.md)
