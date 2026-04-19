/**
 * Request logging middleware
 * Logs all incoming requests and responses
 */

import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { config, isProduction } from '../config';

// Custom token for response body size
morgan.token('body-size', (req: Request) => {
  return req.body ? JSON.stringify(req.body).length : 0;
});

// Custom format for development
const devFormat = ':method :url :status :response-time ms - :res[content-length] :body-size';

// Custom format for production
const prodFormat = ':method :url :status :response-time ms';

// Create middleware
export const requestLogger = morgan(
  isProduction ? prodFormat : devFormat,
  {
    skip: (req: Request) => {
      // Skip health check logs
      return req.path === '/health' || req.path === '/api/health';
    },
  }
);

/**
 * Log request details (for debugging)
 */
export function logRequest(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Log after response is sent
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';

    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      userId: req.user?.id,
    };

    if (logLevel === 'error') {
      console.error(`[REQUEST] ${JSON.stringify(logData)}`);
    } else {
      console.log(`[REQUEST] ${JSON.stringify(logData)}`);
    }
  });

  next();
}

/**
 * CORS middleware
 */
export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', config.corsOrigins.join(','));
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}

/**
 * Security headers middleware
 */
export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');

  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Custom header
  res.setHeader('X-API-Version', '1.0');

  next();
}