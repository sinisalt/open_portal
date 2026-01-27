# Issue #050: Demo Data & Configuration Specification

**Date:** January 26, 2026  
**Purpose:** Define demo data structure and tenant configurations for the SPA redesign

## Demo Tenant Configurations

### Tenant 1: Acme Corporation (Default - Blue Theme)

**Domain:** `acme.openportal.local` (or `localhost:3000?tenant=tenant1`)

**Branding Configuration:**
```json
{
  "tenantId": "tenant1",
  "name": "Acme Corporation",
  "domain": "acme.openportal.local",
  "tagline": "Building Tomorrow's Solutions",
  "branding": {
    "version": "1.0",
    "colors": {
      "primary": {
        "50": "#eff6ff",
        "100": "#dbeafe",
        "200": "#bfdbfe",
        "300": "#93c5fd",
        "400": "#60a5fa",
        "500": "#3b82f6",
        "600": "#2563eb",
        "700": "#1d4ed8",
        "800": "#1e40af",
        "900": "#1e3a8a"
      },
      "secondary": {
        "500": "#7c3aed",
        "600": "#6d28d9"
      },
      "accent": {
        "500": "#06b6d4",
        "600": "#0891b2"
      },
      "success": "#10b981",
      "warning": "#f59e0b",
      "error": "#ef4444",
      "background": {
        "default": "#ffffff",
        "secondary": "#f8fafc",
        "tertiary": "#f1f5f9"
      },
      "text": {
        "primary": "#0f172a",
        "secondary": "#475569",
        "tertiary": "#94a3b8"
      }
    },
    "logos": {
      "primary": {
        "url": "/tenants/tenant1/logo.svg",
        "width": 180,
        "height": 50,
        "altText": "Acme Corporation"
      },
      "login": {
        "url": "/tenants/tenant1/logo-lg.svg",
        "width": 300,
        "height": 100,
        "altText": "Acme Corporation"
      },
      "favicon": "/tenants/tenant1/favicon.ico"
    },
    "fonts": {
      "heading": {
        "family": "Inter",
        "weights": [400, 500, 600, 700],
        "source": "google"
      },
      "body": {
        "family": "Inter",
        "weights": [400, 500],
        "source": "google"
      }
    },
    "spacing": {
      "scale": 1.0
    },
    "borderRadius": {
      "base": "0.5rem"
    }
  }
}
```

---

### Tenant 2: EcoTech Solutions (Green Theme)

**Domain:** `eco.openportal.local` (or `localhost:3000?tenant=tenant2`)

**Branding Configuration:**
```json
{
  "tenantId": "tenant2",
  "name": "EcoTech Solutions",
  "domain": "eco.openportal.local",
  "tagline": "Sustainable Technology for Tomorrow",
  "branding": {
    "version": "1.0",
    "colors": {
      "primary": {
        "50": "#f0fdf4",
        "100": "#dcfce7",
        "200": "#bbf7d0",
        "300": "#86efac",
        "400": "#4ade80",
        "500": "#22c55e",
        "600": "#16a34a",
        "700": "#15803d",
        "800": "#166534",
        "900": "#14532d"
      },
      "secondary": {
        "500": "#059669",
        "600": "#047857"
      },
      "accent": {
        "500": "#84cc16",
        "600": "#65a30d"
      },
      "success": "#10b981",
      "warning": "#f59e0b",
      "error": "#ef4444",
      "background": {
        "default": "#ffffff",
        "secondary": "#f0fdf4",
        "tertiary": "#dcfce7"
      },
      "text": {
        "primary": "#14532d",
        "secondary": "#166534",
        "tertiary": "#22c55e"
      }
    },
    "logos": {
      "primary": {
        "url": "/tenants/tenant2/logo.svg",
        "width": 180,
        "height": 50,
        "altText": "EcoTech Solutions"
      },
      "login": {
        "url": "/tenants/tenant2/logo-lg.svg",
        "width": 300,
        "height": 100,
        "altText": "EcoTech Solutions"
      },
      "favicon": "/tenants/tenant2/favicon.ico"
    },
    "fonts": {
      "heading": {
        "family": "Poppins",
        "weights": [400, 600, 700],
        "source": "google"
      },
      "body": {
        "family": "Open Sans",
        "weights": [400, 600],
        "source": "google"
      }
    },
    "spacing": {
      "scale": 1.1
    },
    "borderRadius": {
      "base": "0.75rem"
    }
  }
}
```

---

### Tenant 3: Creative Studios (Purple/Pink Theme)

**Domain:** `creative.openportal.local` (or `localhost:3000?tenant=tenant3`)

**Branding Configuration:**
```json
{
  "tenantId": "tenant3",
  "name": "Creative Studios",
  "domain": "creative.openportal.local",
  "tagline": "Where Ideas Come to Life",
  "branding": {
    "version": "1.0",
    "colors": {
      "primary": {
        "50": "#faf5ff",
        "100": "#f3e8ff",
        "200": "#e9d5ff",
        "300": "#d8b4fe",
        "400": "#c084fc",
        "500": "#a855f7",
        "600": "#9333ea",
        "700": "#7e22ce",
        "800": "#6b21a8",
        "900": "#581c87"
      },
      "secondary": {
        "500": "#ec4899",
        "600": "#db2777"
      },
      "accent": {
        "500": "#f59e0b",
        "600": "#d97706"
      },
      "success": "#10b981",
      "warning": "#f59e0b",
      "error": "#ef4444",
      "background": {
        "default": "#ffffff",
        "secondary": "#faf5ff",
        "tertiary": "#f3e8ff"
      },
      "text": {
        "primary": "#581c87",
        "secondary": "#7e22ce",
        "tertiary": "#a855f7"
      }
    },
    "logos": {
      "primary": {
        "url": "/tenants/tenant3/logo.svg",
        "width": 180,
        "height": 50,
        "altText": "Creative Studios"
      },
      "login": {
        "url": "/tenants/tenant3/logo-lg.svg",
        "width": 300,
        "height": 100,
        "altText": "Creative Studios"
      },
      "favicon": "/tenants/tenant3/favicon.ico"
    },
    "fonts": {
      "heading": {
        "family": "Playfair Display",
        "weights": [400, 700],
        "source": "google"
      },
      "body": {
        "family": "Lato",
        "weights": [400, 700],
        "source": "google"
      }
    },
    "spacing": {
      "scale": 1.0
    },
    "borderRadius": {
      "base": "1rem"
    }
  }
}
```

---

## Demo Data Schemas

### Users Collection (100+ records)

**Schema:**
```typescript
interface DemoUser {
  id: string                          // UUID
  name: string                        // Full name
  firstName: string                   // First name
  lastName: string                    // Last name
  email: string                       // Email address
  avatar?: string                     // Avatar URL or data URI
  role: 'admin' | 'manager' | 'user' | 'viewer'
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  department?: string                 // Department name
  jobTitle?: string                   // Job title
  phone?: string                      // Phone number
  timezone?: string                   // IANA timezone
  language?: string                   // ISO language code
  lastLogin?: Date                    // Last login timestamp
  createdAt: Date                     // Account creation date
  updatedAt: Date                     // Last update date
  metadata?: {
    loginCount?: number
    failedLoginAttempts?: number
    emailVerified?: boolean
    phoneVerified?: boolean
  }
}
```

**Sample Data (5 examples):**
```json
[
  {
    "id": "usr_001",
    "name": "Alice Johnson",
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice.johnson@acme.com",
    "avatar": "https://i.pravatar.cc/150?img=1",
    "role": "admin",
    "status": "active",
    "department": "Engineering",
    "jobTitle": "Senior Software Engineer",
    "phone": "+1-555-0101",
    "timezone": "America/New_York",
    "language": "en-US",
    "lastLogin": "2026-01-26T15:30:00Z",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2026-01-26T15:30:00Z",
    "metadata": {
      "loginCount": 456,
      "failedLoginAttempts": 0,
      "emailVerified": true,
      "phoneVerified": true
    }
  },
  {
    "id": "usr_002",
    "name": "Bob Smith",
    "firstName": "Bob",
    "lastName": "Smith",
    "email": "bob.smith@acme.com",
    "avatar": "https://i.pravatar.cc/150?img=2",
    "role": "manager",
    "status": "active",
    "department": "Sales",
    "jobTitle": "Sales Manager",
    "phone": "+1-555-0102",
    "timezone": "America/Los_Angeles",
    "language": "en-US",
    "lastLogin": "2026-01-26T14:15:00Z",
    "createdAt": "2024-03-20T09:00:00Z",
    "updatedAt": "2026-01-26T14:15:00Z",
    "metadata": {
      "loginCount": 234,
      "failedLoginAttempts": 1,
      "emailVerified": true,
      "phoneVerified": false
    }
  }
]
```

**Distribution:**
- 10 admins (10%)
- 20 managers (20%)
- 60 users (60%)
- 10 viewers (10%)
- 85 active, 10 inactive, 5 pending

---

### Locations Collection (50+ records)

**Schema:**
```typescript
interface DemoLocation {
  id: string                          // UUID
  name: string                        // Location name
  description?: string                // Description
  type: 'office' | 'warehouse' | 'retail' | 'datacenter' | 'other'
  image?: string                      // Primary image URL
  address: {
    street: string
    city: string
    state?: string
    country: string
    postalCode: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  contact?: {
    phone?: string
    email?: string
    website?: string
  }
  tags: string[]                      // Searchable tags
  options: {
    hasParking: boolean
    hasWifi: boolean
    is24Hours: boolean
    isAccessible: boolean
    hasSecurityGuard: boolean
    hasMeetingRooms: boolean
  }
  capacity?: {
    employees?: number
    visitors?: number
    parkingSpaces?: number
  }
  manager?: {
    id: string
    name: string
    email: string
  }
  status: 'active' | 'inactive' | 'maintenance'
  openingHours?: {
    monday?: { open: string, close: string }
    tuesday?: { open: string, close: string }
    wednesday?: { open: string, close: string }
    thursday?: { open: string, close: string }
    friday?: { open: string, close: string }
    saturday?: { open: string, close: string }
    sunday?: { open: string, close: string }
  }
  createdAt: Date
  updatedAt: Date
}
```

**Sample Data (3 examples):**
```json
[
  {
    "id": "loc_001",
    "name": "Headquarters - New York",
    "description": "Main office building with state-of-the-art facilities",
    "type": "office",
    "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
    "address": {
      "street": "123 Broadway",
      "city": "New York",
      "state": "NY",
      "country": "United States",
      "postalCode": "10001",
      "coordinates": {
        "latitude": 40.7589,
        "longitude": -73.9851
      }
    },
    "contact": {
      "phone": "+1-555-1000",
      "email": "ny.hq@acme.com",
      "website": "https://acme.com/locations/ny"
    },
    "tags": ["headquarters", "office", "new-york", "main"],
    "options": {
      "hasParking": true,
      "hasWifi": true,
      "is24Hours": false,
      "isAccessible": true,
      "hasSecurityGuard": true,
      "hasMeetingRooms": true
    },
    "capacity": {
      "employees": 500,
      "visitors": 100,
      "parkingSpaces": 150
    },
    "manager": {
      "id": "usr_001",
      "name": "Alice Johnson",
      "email": "alice.johnson@acme.com"
    },
    "status": "active",
    "openingHours": {
      "monday": { "open": "08:00", "close": "18:00" },
      "tuesday": { "open": "08:00", "close": "18:00" },
      "wednesday": { "open": "08:00", "close": "18:00" },
      "thursday": { "open": "08:00", "close": "18:00" },
      "friday": { "open": "08:00", "close": "17:00" }
    },
    "createdAt": "2023-01-15T10:00:00Z",
    "updatedAt": "2026-01-20T14:30:00Z"
  }
]
```

**Distribution:**
- 20 offices (40%)
- 10 warehouses (20%)
- 15 retail locations (30%)
- 5 datacenters (10%)
- 45 active, 3 inactive, 2 maintenance

---

### Transactions Collection (1000+ records)

**Schema:**
```typescript
interface DemoTransaction {
  id: string                          // UUID
  userId: string                      // User who created transaction
  amount: number                      // Transaction amount
  currency: 'USD' | 'EUR' | 'GBP'
  type: 'sale' | 'refund' | 'subscription' | 'fee'
  status: 'completed' | 'pending' | 'failed' | 'cancelled'
  description?: string                // Transaction description
  category?: string                   // Category
  locationId?: string                 // Related location
  metadata?: {
    invoiceNumber?: string
    paymentMethod?: 'card' | 'bank' | 'paypal' | 'crypto'
    customerName?: string
    customerEmail?: string
  }
  timestamp: Date                     // Transaction timestamp
  processedAt?: Date                  // Processing timestamp
}
```

**Sample Data:**
```json
{
  "id": "txn_001",
  "userId": "usr_045",
  "amount": 1299.99,
  "currency": "USD",
  "type": "sale",
  "status": "completed",
  "description": "Annual subscription - Enterprise Plan",
  "category": "Subscriptions",
  "locationId": "loc_001",
  "metadata": {
    "invoiceNumber": "INV-2026-0001",
    "paymentMethod": "card",
    "customerName": "Tech Corp Inc.",
    "customerEmail": "billing@techcorp.com"
  },
  "timestamp": "2026-01-26T10:15:00Z",
  "processedAt": "2026-01-26T10:15:05Z"
}
```

**Distribution:**
- 800 sales (80%)
- 100 refunds (10%)
- 80 subscriptions (8%)
- 20 fees (2%)
- 950 completed, 30 pending, 15 failed, 5 cancelled

---

### Analytics Data (Dashboard)

**KPI Metrics:**
```typescript
interface KPIMetric {
  id: string
  label: string
  value: number | string
  previousValue?: number | string
  trend?: number                      // Percentage change
  trendDirection?: 'up' | 'down' | 'neutral'
  format?: 'number' | 'currency' | 'percentage'
  icon?: string
}
```

**Sample KPIs:**
```json
[
  {
    "id": "total-users",
    "label": "Total Users",
    "value": 1234,
    "previousValue": 1100,
    "trend": 12.2,
    "trendDirection": "up",
    "format": "number",
    "icon": "Users"
  },
  {
    "id": "active-sessions",
    "label": "Active Sessions",
    "value": 456,
    "previousValue": 434,
    "trend": 5.1,
    "trendDirection": "up",
    "format": "number",
    "icon": "Activity"
  },
  {
    "id": "total-revenue",
    "label": "Monthly Revenue",
    "value": 123456,
    "previousValue": 104578,
    "trend": 18.0,
    "trendDirection": "up",
    "format": "currency",
    "icon": "DollarSign"
  }
]
```

**Chart Data - User Growth:**
```json
{
  "id": "user-growth",
  "title": "User Growth (Last 6 Months)",
  "type": "line",
  "data": [
    { "month": "August", "users": 890, "active": 756 },
    { "month": "September", "users": 945, "active": 803 },
    { "month": "October", "users": 1023, "active": 869 },
    { "month": "November", "users": 1089, "active": 926 },
    { "month": "December", "users": 1156, "active": 983 },
    { "month": "January", "users": 1234, "active": 1049 }
  ]
}
```

**Chart Data - Revenue by Product:**
```json
{
  "id": "revenue-by-product",
  "title": "Revenue by Product Category",
  "type": "bar",
  "data": [
    { "category": "Subscriptions", "revenue": 45600 },
    { "category": "Services", "revenue": 38200 },
    { "category": "Products", "revenue": 28400 },
    { "category": "Consulting", "revenue": 11256 }
  ]
}
```

---

## Team Data (About/Team Pages)

**Schema:**
```typescript
interface TeamMember {
  id: string
  name: string
  role: string
  department: string
  bio: string
  avatar: string
  email?: string
  social?: {
    linkedin?: string
    twitter?: string
    github?: string
  }
  joinedDate: Date
  featured?: boolean
}
```

**Sample Data (6 team members):**
```json
[
  {
    "id": "team_001",
    "name": "Sarah Williams",
    "role": "CEO & Founder",
    "department": "Executive",
    "bio": "Visionary leader with 15+ years in enterprise software. Founded Acme to revolutionize business automation.",
    "avatar": "https://i.pravatar.cc/300?img=10",
    "email": "sarah.williams@acme.com",
    "social": {
      "linkedin": "https://linkedin.com/in/sarahwilliams",
      "twitter": "https://twitter.com/sarahw"
    },
    "joinedDate": "2020-01-01T00:00:00Z",
    "featured": true
  },
  {
    "id": "team_002",
    "name": "Michael Chen",
    "role": "CTO",
    "department": "Engineering",
    "bio": "Technology expert specializing in scalable cloud architectures and AI integration.",
    "avatar": "https://i.pravatar.cc/300?img=12",
    "email": "michael.chen@acme.com",
    "social": {
      "linkedin": "https://linkedin.com/in/michaelchen",
      "github": "https://github.com/mchen"
    },
    "joinedDate": "2020-03-15T00:00:00Z",
    "featured": true
  }
]
```

---

## Pricing Packages (Homepage)

**Schema:**
```typescript
interface PricingPackage {
  id: string
  name: string
  tagline?: string
  price: number | string
  currency?: string
  period?: string
  description: string
  features: Array<{
    text: string
    included: boolean
    tooltip?: string
  }>
  ctaText: string
  ctaAction: ActionConfig
  featured?: boolean
  badge?: string
  popular?: boolean
}
```

**Sample Data (4 packages):**
```json
[
  {
    "id": "pkg_starter",
    "name": "Starter",
    "tagline": "Perfect for individuals",
    "price": 29,
    "currency": "USD",
    "period": "month",
    "description": "Essential features to get started with OpenPortal",
    "features": [
      { "text": "Up to 10 users", "included": true },
      { "text": "5 GB storage", "included": true },
      { "text": "Basic widgets", "included": true },
      { "text": "Email support", "included": true },
      { "text": "Custom branding", "included": false },
      { "text": "Advanced analytics", "included": false },
      { "text": "API access", "included": false },
      { "text": "Priority support", "included": false }
    ],
    "ctaText": "Start Free Trial",
    "ctaAction": { "type": "navigate", "path": "/signup?plan=starter" },
    "featured": false,
    "popular": false
  },
  {
    "id": "pkg_business",
    "name": "Business",
    "tagline": "Most popular choice",
    "price": 99,
    "currency": "USD",
    "period": "month",
    "description": "Advanced features for growing teams",
    "features": [
      { "text": "Up to 50 users", "included": true },
      { "text": "50 GB storage", "included": true },
      { "text": "All widgets", "included": true },
      { "text": "Priority email support", "included": true },
      { "text": "Custom branding", "included": true },
      { "text": "Advanced analytics", "included": true },
      { "text": "API access", "included": false },
      { "text": "24/7 phone support", "included": false }
    ],
    "ctaText": "Get Started",
    "ctaAction": { "type": "navigate", "path": "/signup?plan=business" },
    "featured": true,
    "badge": "Most Popular",
    "popular": true
  },
  {
    "id": "pkg_enterprise",
    "name": "Enterprise",
    "tagline": "For large organizations",
    "price": 299,
    "currency": "USD",
    "period": "month",
    "description": "Complete solution with dedicated support",
    "features": [
      { "text": "Unlimited users", "included": true },
      { "text": "Unlimited storage", "included": true },
      { "text": "All widgets + custom", "included": true },
      { "text": "24/7 priority support", "included": true },
      { "text": "Full custom branding", "included": true },
      { "text": "Advanced analytics + AI", "included": true },
      { "text": "Full API access", "included": true },
      { "text": "Dedicated account manager", "included": true }
    ],
    "ctaText": "Contact Sales",
    "ctaAction": { "type": "navigate", "path": "/contact?plan=enterprise" },
    "featured": false,
    "popular": false
  },
  {
    "id": "pkg_custom",
    "name": "Custom",
    "tagline": "Tailored to your needs",
    "price": "Contact Us",
    "description": "Fully customized solution with bespoke features",
    "features": [
      { "text": "Custom user limit", "included": true },
      { "text": "Custom storage", "included": true },
      { "text": "Custom widgets", "included": true },
      { "text": "White-label solution", "included": true },
      { "text": "On-premise deployment", "included": true },
      { "text": "Custom integrations", "included": true },
      { "text": "SLA guarantee", "included": true },
      { "text": "Training & onboarding", "included": true }
    ],
    "ctaText": "Talk to Expert",
    "ctaAction": { "type": "navigate", "path": "/contact?plan=custom" },
    "featured": false,
    "popular": false
  }
]
```

---

## Data Generation Strategy

### Backend Implementation

**File:** `backend/src/data/generators/index.ts`

```typescript
export function generateDemoUsers(count: number): DemoUser[]
export function generateDemoLocations(count: number): DemoLocation[]
export function generateDemoTransactions(count: number, users: DemoUser[]): DemoTransaction[]
export function generateAnalyticsData(months: number): AnalyticsData
export function generateTeamMembers(): TeamMember[]
export function generatePricingPackages(): PricingPackage[]
```

**Libraries:**
- `@faker-js/faker` - Generate realistic fake data
- `date-fns` - Date manipulation
- `uuid` - Generate UUIDs

### Data Persistence

**Options:**
1. **In-Memory (Dev):** Store in backend memory, reset on restart
2. **JSON Files (Demo):** Store in `backend/data/demo/` directory
3. **Database (Production):** PostgreSQL with seed scripts

**Recommendation:** JSON files for demo, with option to seed database

---

## Menu Configurations

### Public Routes Menu

**File:** `backend/src/config/menus/public.json`

```json
{
  "context": "public",
  "topMenu": [
    {
      "id": "home",
      "label": "Home",
      "path": "/",
      "icon": "Home"
    },
    {
      "id": "about",
      "label": "About",
      "path": "/about",
      "icon": "Info"
    },
    {
      "id": "team",
      "label": "Team",
      "path": "/team",
      "icon": "Users"
    }
  ],
  "sideMenu": [],
  "footerMenu": [
    {
      "id": "privacy",
      "label": "Privacy Policy",
      "path": "/privacy"
    },
    {
      "id": "terms",
      "label": "Terms of Service",
      "path": "/terms"
    },
    {
      "id": "contact",
      "label": "Contact Us",
      "path": "/contact"
    }
  ],
  "showLoginButton": true,
  "loginButtonText": "Sign In",
  "loginPath": "/login"
}
```

### Dashboard Routes Menu

**File:** `backend/src/config/menus/dashboard.json`

```json
{
  "context": "dashboard",
  "topMenu": [
    {
      "id": "dashboard",
      "label": "Dashboard",
      "path": "/dashboard",
      "icon": "LayoutDashboard"
    },
    {
      "id": "users",
      "label": "Users",
      "path": "/users",
      "icon": "Users"
    },
    {
      "id": "locations",
      "label": "Locations",
      "path": "/locations",
      "icon": "MapPin"
    }
  ],
  "sideMenu": {
    "dashboard": [
      {
        "id": "overview",
        "label": "Overview",
        "path": "/dashboard",
        "icon": "Home"
      },
      {
        "id": "analytics",
        "label": "Analytics",
        "path": "/dashboard/analytics",
        "icon": "BarChart3"
      },
      {
        "id": "reports",
        "label": "Reports",
        "path": "/dashboard/reports",
        "icon": "FileText"
      }
    ],
    "users": [
      {
        "id": "all-users",
        "label": "All Users",
        "path": "/users",
        "icon": "Users"
      },
      {
        "id": "invitations",
        "label": "Invitations",
        "path": "/users/invitations",
        "icon": "Mail",
        "badge": { "text": "3", "variant": "primary" }
      },
      {
        "id": "requests",
        "label": "Requests",
        "path": "/users/requests",
        "icon": "UserPlus",
        "badge": { "text": "7", "variant": "warning" }
      },
      {
        "id": "settings",
        "label": "Settings",
        "path": "/users/settings",
        "icon": "Settings"
      }
    ],
    "locations": [
      {
        "id": "all-locations",
        "label": "All Locations",
        "path": "/locations",
        "icon": "MapPin"
      },
      {
        "id": "add-location",
        "label": "Add New",
        "path": "/locations/new",
        "icon": "Plus"
      },
      {
        "id": "map-view",
        "label": "Map View",
        "path": "/locations/map",
        "icon": "Map"
      },
      {
        "id": "import",
        "label": "Import",
        "path": "/locations/import",
        "icon": "Upload"
      }
    ]
  },
  "footerMenu": [],
  "showUserMenu": true,
  "userMenuItems": [
    {
      "id": "profile",
      "label": "Profile",
      "path": "/profile",
      "icon": "User"
    },
    {
      "id": "settings",
      "label": "Settings",
      "path": "/settings",
      "icon": "Settings"
    },
    {
      "id": "logout",
      "label": "Logout",
      "action": { "type": "logout" },
      "icon": "LogOut"
    }
  ]
}
```

---

## API Endpoints

### Demo Data Endpoints

```
# Users
GET    /api/demo/users                    # List users with pagination/filtering
GET    /api/demo/users/:id                # Get single user
POST   /api/demo/users                    # Create user
PUT    /api/demo/users/:id                # Update user
DELETE /api/demo/users/:id                # Delete user

# Locations
GET    /api/demo/locations                # List locations with pagination/filtering
GET    /api/demo/locations/:id            # Get single location
POST   /api/demo/locations                # Create location
PUT    /api/demo/locations/:id            # Update location
DELETE /api/demo/locations/:id            # Delete location

# Dashboard
GET    /api/demo/dashboard/kpis           # Get KPI metrics
GET    /api/demo/dashboard/charts/:id     # Get chart data
GET    /api/demo/dashboard/transactions   # Get recent transactions

# Menu Configurations
GET    /api/demo/menus/:context           # Get menu config for context

# Team & About
GET    /api/demo/team                     # Get team members
GET    /api/demo/pricing                  # Get pricing packages
```

---

## Summary

### Files to Create

**Backend:**
1. `backend/src/data/generators/userGenerator.ts`
2. `backend/src/data/generators/locationGenerator.ts`
3. `backend/src/data/generators/transactionGenerator.ts`
4. `backend/src/data/generators/analyticsGenerator.ts`
5. `backend/src/data/generators/index.ts`
6. `backend/src/config/tenants/tenant1.json`
7. `backend/src/config/tenants/tenant2.json`
8. `backend/src/config/tenants/tenant3.json`
9. `backend/src/config/menus/public.json`
10. `backend/src/config/menus/dashboard.json`
11. `backend/src/routes/demo.ts`

**Frontend:**
- Data schemas and types (TypeScript interfaces)
- Validation schemas (Zod)

**Total:** ~15-20 files

---

**Document Version:** 1.0  
**Last Updated:** January 26, 2026  
**Status:** Ready for Implementation
