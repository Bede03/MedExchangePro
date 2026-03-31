import { Request, Response, NextFunction } from 'express';
import { getClientIp, getUserAgent } from '../utils/helpers.js';

export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const ip = getClientIp(req);
  const userAgent = getUserAgent(req);

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ${ip}`
    );
  });

  next();
};
