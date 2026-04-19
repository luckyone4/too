/**
 * Restaurant Routes
 */

import { Router } from 'express';
import { restaurantController } from '../controllers';
import { authenticate, authorize, authorizeRestaurant } from '../middleware/auth';
import {
  validate,
  createRestaurantSchema,
  updateRestaurantSchema,
  createTableSchema,
  updateTableSchema,
} from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

// ============================================================================
// RESTAURANT ROUTES
// ============================================================================

// GET /api/restaurants - List all restaurants
router.get('/', restaurantController.getAllRestaurants);

// GET /api/restaurants/:id - Get restaurant by ID
router.get('/:id', restaurantController.getRestaurantById);

// POST /api/restaurants - Create restaurant (admin only)
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(createRestaurantSchema),
  restaurantController.createRestaurant
);

// PATCH /api/restaurants/:id - Update restaurant (admin only)
router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateRestaurantSchema),
  restaurantController.updateRestaurant
);

// DELETE /api/restaurants/:id - Delete restaurant (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  restaurantController.deleteRestaurant
);

// ============================================================================
// TABLE ROUTES
// ============================================================================

// GET /api/restaurants/:restaurantId/tables - List tables
router.get(
  '/:restaurantId/tables',
  authenticate,
  authorizeRestaurant('restaurantId'),
  restaurantController.getTables
);

// POST /api/restaurants/:restaurantId/tables - Create table
router.post(
  '/:restaurantId/tables',
  authenticate,
  authorizeRestaurant('restaurantId'),
  authorize(UserRole.ADMIN),
  validate(createTableSchema),
  restaurantController.createTable
);

// GET /api/restaurants/:restaurantId/tables/:tableId - Get table
router.get(
  '/:restaurantId/tables/:tableId',
  authenticate,
  authorizeRestaurant('restaurantId'),
  restaurantController.getTableById
);

// PATCH /api/restaurants/:restaurantId/tables/:tableId - Update table
router.patch(
  '/:restaurantId/tables/:tableId',
  authenticate,
  authorizeRestaurant('restaurantId'),
  authorize(UserRole.ADMIN),
  validate(updateTableSchema),
  restaurantController.updateTable
);

// DELETE /api/restaurants/:restaurantId/tables/:tableId - Delete table
router.delete(
  '/:restaurantId/tables/:tableId',
  authenticate,
  authorizeRestaurant('restaurantId'),
  authorize(UserRole.ADMIN),
  restaurantController.deleteTable
);

export default router;