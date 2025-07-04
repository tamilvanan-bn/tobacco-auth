import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export function validateRequest(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: err.errors,
      });
    }
  };
}
