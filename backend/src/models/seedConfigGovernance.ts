import type { ConfigValidationRule } from './database.js';
import { db } from './database.js';

/**
 * Seed default configuration validation rules
 */
export async function seedConfigGovernance(): Promise<void> {
  console.log('Seeding configuration governance rules...');

  // Page configuration validation rules
  const pageSchemaRule: ConfigValidationRule = {
    id: 'rule-001',
    name: 'Page Configuration Schema',
    description: 'Validates that page configurations have required fields',
    configType: 'page',
    ruleType: 'schema',
    rule: {
      required: ['layout', 'widgets'],
      properties: {
        layout: { type: 'object' },
        widgets: { type: 'array' },
      },
    },
    severity: 'error',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const pageNamingRule: ConfigValidationRule = {
    id: 'rule-002',
    name: 'Page ID Naming Convention',
    description: 'Ensures page IDs follow kebab-case naming convention',
    configType: 'page',
    ruleType: 'lint',
    rule: {
      check: 'naming-convention',
      field: 'pageId',
      pattern: '^[a-z0-9]+(-[a-z0-9]+)*$',
    },
    severity: 'warning',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Route configuration validation rules
  const routeSchemaRule: ConfigValidationRule = {
    id: 'rule-003',
    name: 'Route Configuration Schema',
    description: 'Validates that route configurations have required fields',
    configType: 'route',
    ruleType: 'schema',
    rule: {
      required: ['pattern', 'pageId'],
      properties: {
        pattern: { type: 'string' },
        pageId: { type: 'string' },
      },
    },
    severity: 'error',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Branding configuration validation rules
  const brandingSchemaRule: ConfigValidationRule = {
    id: 'rule-004',
    name: 'Branding Configuration Schema',
    description: 'Validates that branding configurations have required fields',
    configType: 'branding',
    ruleType: 'schema',
    rule: {
      required: ['colors'],
      properties: {
        colors: { type: 'object' },
      },
    },
    severity: 'error',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Menu configuration validation rules
  const menuSchemaRule: ConfigValidationRule = {
    id: 'rule-005',
    name: 'Menu Configuration Schema',
    description: 'Validates that menu configurations have required fields',
    configType: 'menu',
    ruleType: 'schema',
    rule: {
      required: ['items'],
      properties: {
        items: { type: 'array' },
      },
    },
    severity: 'error',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // General configuration rules
  const noEmptyConfigRule: ConfigValidationRule = {
    id: 'rule-006',
    name: 'No Empty Configurations',
    description: 'Ensures configurations are not empty objects',
    configType: 'all',
    ruleType: 'custom',
    rule: {
      validator: 'notEmpty',
    },
    severity: 'error',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Create all rules
  db.createConfigValidationRule(pageSchemaRule);
  db.createConfigValidationRule(pageNamingRule);
  db.createConfigValidationRule(routeSchemaRule);
  db.createConfigValidationRule(brandingSchemaRule);
  db.createConfigValidationRule(menuSchemaRule);
  db.createConfigValidationRule(noEmptyConfigRule);

  console.log('✅ Created 6 default validation rules');
}
