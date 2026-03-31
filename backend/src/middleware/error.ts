import { Request, Response, NextFunction } from 'express';
import { AppError, handleError } from '../utils/errors.js';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  const error = handleError(err);
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
