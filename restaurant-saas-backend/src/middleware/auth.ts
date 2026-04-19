/**
 * Authentication middleware
 * Simulates JWT-based authentication
 * In production, this would validate real JWT tokens
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { userRepository } from '../models';
import { UserRole, JWTPayload, AuthUser } from '../types';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Generate JWT token for user
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Authentication middleware
 * Validates JWT token and attaches user to request
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: {
        code: ERROR_CODES.AUTH_TOKEN_INVALID,
        message: 'Authentication token is required',
      },
    });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: {
        code: ERROR_CODES.AUTH_TOKEN_EXPIRED,
        message: 'Authentication token is invalid or expired',
      },
    });
    return;
  }

  // Attach user to request
  req.user = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    restaurantId: payload.restaurantId,
  };

  next();
}

/**
 * Optional authentication - doesn't fail if no token
 */
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        restaurantId: payload.restaurantId,
      };
    }
  }

  next();
}

/**
 * Authorization middleware - check if user has required role
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTH_UNAUTHORIZED,
          message: 'Authentication required',
        },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTH_UNAUTHORIZED,
          message: 'You do not have permission to perform this action',
        },
      });
      return;
    }

    next();
  };
}

/**
 * Check if user belongs to specific restaurant or is super admin
 */
export function authorizeRestaurant(restaurantIdParam: string = 'restaurantId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTH_UNAUTHORIZED,
          message: 'Authentication required',
        },
      });
      return;
    }

    // Super admin can access all restaurants
    if (req.user.role === UserRole.ADMIN && req.user.restaurantId === null) {
      next();
      return;
    }

    const restaurantId = req.params[restaurantIdParam];

    // Staff can only access their own restaurant
    if (req.user.restaurantId !== restaurantId) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTH_UNAUTHORIZED,
          message: 'You do not have permission to access this restaurant',
        },
      });
      return;
    }

    next();
  };
}