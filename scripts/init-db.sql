-- OpenPortal Database Initialization Script
-- This script is executed when the PostgreSQL container is first created

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create application schema
CREATE SCHEMA IF NOT EXISTS openportal;

-- Set default search path
ALTER DATABASE openportal SET search_path TO openportal, public;

-- Placeholder tables (to be implemented by backend team)
-- These are examples of what the schema might look like

-- Tenants table (for multi-tenancy)
CREATE TABLE IF NOT EXISTS openportal.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- UI Configurations table (stores page configurations)
CREATE TABLE IF NOT EXISTS openportal.ui_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES openportal.tenants(id),
    page_id VARCHAR(255) NOT NULL,
    version INTEGER DEFAULT 1,
    config JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, page_id, version)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ui_config_tenant ON openportal.ui_configurations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ui_config_page ON openportal.ui_configurations(page_id);
CREATE INDEX IF NOT EXISTS idx_ui_config_jsonb ON openportal.ui_configurations USING gin(config);

-- Seed data for development
INSERT INTO openportal.tenants (id, name, subdomain) 
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Demo Tenant', 'demo')
ON CONFLICT (subdomain) DO NOTHING;

-- Sample UI configuration for testing
INSERT INTO openportal.ui_configurations (tenant_id, page_id, config)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'dashboard',
    '{
        "pageId": "dashboard",
        "title": "Dashboard",
        "widgets": [
            {
                "id": "welcome-section",
                "type": "Section",
                "props": {
                    "title": "Welcome to OpenPortal"
                }
            }
        ]
    }'::jsonb
)
ON CONFLICT (tenant_id, page_id, version) DO NOTHING;

-- Grant permissions (adjust as needed)
GRANT ALL ON SCHEMA openportal TO openportal;
GRANT ALL ON ALL TABLES IN SCHEMA openportal TO openportal;
GRANT ALL ON ALL SEQUENCES IN SCHEMA openportal TO openportal;
