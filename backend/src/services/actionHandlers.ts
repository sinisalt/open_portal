import { z } from 'zod';
import type {
  ActionContext,
  ActionHandler,
  ActionResult,
  ValidationResult,
} from './actionTypes.js';

/**
 * In-memory data store for testing
 * In production, this would be replaced with actual database operations
 */
const dataStore: Map<string, Map<string, Record<string, unknown>>> = new Map();

/**
 * Get or create a collection in the data store
 */
function getCollection(tenantId: string, collection: string): Map<string, Record<string, unknown>> {
  const tenantKey = `${tenantId}:${collection}`;
  let coll = dataStore.get(tenantKey);
  if (!coll) {
    coll = new Map();
    dataStore.set(tenantKey, coll);
  }
  return coll;
}

/**
 * createRecord Handler
 * Creates a new record in the specified collection
 */
const createRecordSchema = z.object({
  collection: z.string().min(1, 'Collection name is required'),
  data: z.record(z.unknown()),
});

export const createRecordHandler: ActionHandler = {
  id: 'createRecord',
  permissions: ['records.create'],
  validate: (params: unknown): ValidationResult => {
    const result = createRecordSchema.safeParse(params);
    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'VALIDATION_ERROR',
        })),
      };
    }
    return { valid: true };
  },
  execute: async (params: unknown, context: ActionContext): Promise<ActionResult> => {
    const { collection, data } = params as z.infer<typeof createRecordSchema>;

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const record = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tenantId: context.tenant.id,
      createdBy: context.user.id,
    };

    const coll = getCollection(context.tenant.id, collection);
    coll.set(id, record);

    return {
      success: true,
      data: record,
      metadata: {
        affectedRecords: 1,
      },
    };
  },
};

/**
 * updateRecord Handler
 * Updates an existing record in the specified collection
 */
const updateRecordSchema = z.object({
  collection: z.string().min(1, 'Collection name is required'),
  id: z.string().min(1, 'Record ID is required'),
  data: z.record(z.unknown()),
});

export const updateRecordHandler: ActionHandler = {
  id: 'updateRecord',
  permissions: ['records.update'],
  validate: (params: unknown): ValidationResult => {
    const result = updateRecordSchema.safeParse(params);
    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'VALIDATION_ERROR',
        })),
      };
    }
    return { valid: true };
  },
  execute: async (params: unknown, context: ActionContext): Promise<ActionResult> => {
    const { collection, id, data } = params as z.infer<typeof updateRecordSchema>;

    const coll = getCollection(context.tenant.id, collection);
    const existingRecord = coll.get(id);

    if (!existingRecord) {
      return {
        success: false,
        errors: [
          {
            message: `Record with id "${id}" not found`,
            code: 'NOT_FOUND',
          },
        ],
      };
    }

    const updatedRecord = {
      ...existingRecord,
      ...data,
      id, // Preserve ID
      tenantId: context.tenant.id, // Preserve tenant
      createdAt: existingRecord.createdAt, // Preserve creation time
      updatedAt: new Date().toISOString(),
      updatedBy: context.user.id,
    };

    coll.set(id, updatedRecord);

    return {
      success: true,
      data: updatedRecord,
      metadata: {
        affectedRecords: 1,
      },
    };
  },
};

/**
 * deleteRecord Handler
 * Deletes a record from the specified collection
 */
const deleteRecordSchema = z.object({
  collection: z.string().min(1, 'Collection name is required'),
  id: z.string().min(1, 'Record ID is required'),
});

export const deleteRecordHandler: ActionHandler = {
  id: 'deleteRecord',
  permissions: ['records.delete'],
  validate: (params: unknown): ValidationResult => {
    const result = deleteRecordSchema.safeParse(params);
    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'VALIDATION_ERROR',
        })),
      };
    }
    return { valid: true };
  },
  execute: async (params: unknown, context: ActionContext): Promise<ActionResult> => {
    const { collection, id } = params as z.infer<typeof deleteRecordSchema>;

    const coll = getCollection(context.tenant.id, collection);
    const existingRecord = coll.get(id);

    if (!existingRecord) {
      return {
        success: false,
        errors: [
          {
            message: `Record with id "${id}" not found`,
            code: 'NOT_FOUND',
          },
        ],
      };
    }

    coll.delete(id);

    return {
      success: true,
      data: { id },
      metadata: {
        affectedRecords: 1,
      },
    };
  },
};

/**
 * bulkUpdate Handler
 * Updates multiple records in the specified collection
 */
const bulkUpdateSchema = z.object({
  collection: z.string().min(1, 'Collection name is required'),
  ids: z.array(z.string()).min(1, 'At least one ID is required'),
  data: z.record(z.unknown()),
});

export const bulkUpdateHandler: ActionHandler = {
  id: 'bulkUpdate',
  permissions: ['records.bulkUpdate'],
  validate: (params: unknown): ValidationResult => {
    const result = bulkUpdateSchema.safeParse(params);
    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'VALIDATION_ERROR',
        })),
      };
    }
    return { valid: true };
  },
  execute: async (params: unknown, context: ActionContext): Promise<ActionResult> => {
    const { collection, ids, data } = params as z.infer<typeof bulkUpdateSchema>;

    const coll = getCollection(context.tenant.id, collection);
    const updatedRecords: Record<string, unknown>[] = [];
    const notFoundIds: string[] = [];

    for (const id of ids) {
      const existingRecord = coll.get(id);
      if (!existingRecord) {
        notFoundIds.push(id);
        continue;
      }

      const updatedRecord = {
        ...existingRecord,
        ...data,
        id, // Preserve ID
        tenantId: context.tenant.id, // Preserve tenant
        createdAt: existingRecord.createdAt, // Preserve creation time
        updatedAt: new Date().toISOString(),
        updatedBy: context.user.id,
      };

      coll.set(id, updatedRecord);
      updatedRecords.push(updatedRecord);
    }

    if (notFoundIds.length === ids.length) {
      return {
        success: false,
        errors: [
          {
            message: `No records found with provided IDs`,
            code: 'NOT_FOUND',
          },
        ],
      };
    }

    return {
      success: true,
      data: {
        updated: updatedRecords,
        notFound: notFoundIds,
      },
      metadata: {
        affectedRecords: updatedRecords.length,
      },
    };
  },
};

/**
 * bulkDelete Handler
 * Deletes multiple records from the specified collection
 */
const bulkDeleteSchema = z.object({
  collection: z.string().min(1, 'Collection name is required'),
  ids: z.array(z.string()).min(1, 'At least one ID is required'),
});

export const bulkDeleteHandler: ActionHandler = {
  id: 'bulkDelete',
  permissions: ['records.bulkDelete'],
  validate: (params: unknown): ValidationResult => {
    const result = bulkDeleteSchema.safeParse(params);
    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'VALIDATION_ERROR',
        })),
      };
    }
    return { valid: true };
  },
  execute: async (params: unknown, context: ActionContext): Promise<ActionResult> => {
    const { collection, ids } = params as z.infer<typeof bulkDeleteSchema>;

    const coll = getCollection(context.tenant.id, collection);
    const deletedIds: string[] = [];
    const notFoundIds: string[] = [];

    for (const id of ids) {
      const existingRecord = coll.get(id);
      if (!existingRecord) {
        notFoundIds.push(id);
        continue;
      }

      coll.delete(id);
      deletedIds.push(id);
    }

    if (deletedIds.length === 0) {
      return {
        success: false,
        errors: [
          {
            message: `No records found with provided IDs`,
            code: 'NOT_FOUND',
          },
        ],
      };
    }

    return {
      success: true,
      data: {
        deleted: deletedIds,
        notFound: notFoundIds,
      },
      metadata: {
        affectedRecords: deletedIds.length,
      },
    };
  },
};

/**
 * executeQuery Handler
 * Executes a query against the specified collection
 */
const executeQuerySchema = z.object({
  collection: z.string().min(1, 'Collection name is required'),
  filter: z.record(z.unknown()).optional(),
  sort: z
    .object({
      field: z.string(),
      order: z.enum(['asc', 'desc']).optional(),
    })
    .optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
});

export const executeQueryHandler: ActionHandler = {
  id: 'executeQuery',
  permissions: ['records.query'],
  validate: (params: unknown): ValidationResult => {
    const result = executeQuerySchema.safeParse(params);
    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'VALIDATION_ERROR',
        })),
      };
    }
    return { valid: true };
  },
  execute: async (params: unknown, context: ActionContext): Promise<ActionResult> => {
    const {
      collection,
      filter = {},
      sort,
      limit = 100,
      offset = 0,
    } = params as z.infer<typeof executeQuerySchema>;

    const coll = getCollection(context.tenant.id, collection);
    let records = Array.from(coll.values());

    // Apply filter (simple key-value matching)
    if (Object.keys(filter).length > 0) {
      records = records.filter((record) => {
        for (const [key, value] of Object.entries(filter)) {
          if (record[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }

    // Apply sort
    if (sort) {
      records.sort((a, b) => {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        const order = sort.order === 'desc' ? -1 : 1;

        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    }

    const total = records.length;

    // Apply pagination
    records = records.slice(offset, offset + limit);

    return {
      success: true,
      data: {
        records,
        total,
        limit,
        offset,
      },
      metadata: {
        affectedRecords: records.length,
      },
    };
  },
};

/**
 * Export all core handlers
 */
export const coreActionHandlers = [
  createRecordHandler,
  updateRecordHandler,
  deleteRecordHandler,
  bulkUpdateHandler,
  bulkDeleteHandler,
  executeQueryHandler,
];
