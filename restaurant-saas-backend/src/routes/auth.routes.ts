/**
 * Authentication Routes
 */

import { Router } from 'express';
import { authController } from '../controllers';
import { authenticate } from '../middleware/auth';
import { validate, registerSchema, loginSchema } from '../middleware/validation';

const router = Router();

// POST /api/auth/register - Register new user
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login - Login user
router.post('/login', validate(loginSchema), authController.login);

// GET /api/auth/profile - Get current user profile (authenticated)
router.get('/profile', authenticate, authController.getProfile);

// GET /api/auth/restaurant-users - Get users for restaurant (authenticated)
router.get('/restaurant-users', authenticate, authController.getRestaurantUsers);

export default router;