import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

/**
 * Validation middleware factory
 */
export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      return res.status(400).json({
        error: 'Invalid request',
      });
    }
  };
}
