/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendCreated, sendUnauthorized } from '../utils/response';
import { normalizeLanguage } from '../utils/i18n';
import * as authService from '../services/auth.service';

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, role, restaurantId } = req.body;

  const result = await authService.registerUser({
    email,
    password,
    name,
    role,
    restaurantId,
  });

  sendCreated(res, result);
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.loginUser({ email, password });

  sendSuccess(res, result);
});

/**
 * Get current user profile
 * GET /api/auth/profile
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    sendUnauthorized(res, 'Authentication required');
    return;
  }

  const profile = await authService.getUserProfile(req.user.id);

  sendSuccess(res, profile);
});

/**
 * Get restaurant users
 * GET /api/auth/restaurant-users?restaurantId=xxx
 */
export const getRestaurantUsers = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.query;

  if (!restaurantId || typeof restaurantId !== 'string') {
    sendUnauthorized(res, 'Restaurant ID required');
    return;
  }

  const users = await authService.getRestaurantUsers(restaurantId);

  sendSuccess(res, users);
});