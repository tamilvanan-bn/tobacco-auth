import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error(err.message, { stack: err.stack });
  
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}
