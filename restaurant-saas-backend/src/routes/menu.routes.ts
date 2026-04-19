/**
 * Menu Routes
 */

import { Router } from 'express';
import { menuController } from '../controllers';
import { authenticate, authorize, authorizeRestaurant } from '../middleware/auth';
import {
  validate,
  createCategorySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
} from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

// ============================================================================
// MENU ROUTES (with language support)
// ============================================================================

// GET /api/restaurants/:restaurantId/menu - Get restaurant menu
router.get(
  '/:restaurantId/menu',
  menuController.getMenu
);

// ============================================================================
// CATEGORY ROUTES
// ============================================================================

// GET /api/restaurants/:restaurantId/categories/:categoryId - Get category
router.get(
  '/:restaurantId/categories/:categoryId',
  authenticate,
  authorizeRestaurant('restaurantId'),
  menuController.getCategory
);

// POST /api/restaurants/:restaurantId/categories - Create category
router.post(
  '/:restaurantId/categories',
  authenticate,
  authorizeRestaurant('restaurantId'),
  authorize(UserRole.ADMIN),
  validate(createCategorySchema),
  menuController.createCategory
);

// PATCH /api/restaurants/:restaurantId/categories/:categoryId - Update category
router.patch(
  '/:restaurantId/categories/:categoryId',
  authenticate,
  authorizeRestaurant('restaurantId'),
  authorize(UserRole.ADMIN),
  menuController.updateCategory
);

// DELETE /api/restaurants/:restaurantId/categories/:categoryId - Delete category
router.delete(
  '/:restaurantId/categories/:categoryId',
  authenticate,
  authorizeRestaurant('restaurantId'),
  authorize(UserRole.ADMIN),
  menuController.deleteCategory
);

// ============================================================================
// MENU ITEM ROUTES
// ============================================================================

// GET /api/restaurants/:restaurantId/items/:itemId - Get menu item
router.get(
  '/:restaurantId/items/:itemId',
  authenticate,
  authorizeRestaurant('restaurantId'),
  menuController.getMenuItem
);

// POST /api/restaurants/:restaurantId/items - Create menu item
router.post(
  '/:restaurantId/items',
  authenticate,
  authorizeRestaurant('restaurantId'),
  authorize(UserRole.ADMIN),
  validate(createMenuItemSchema),
  menuController.createMenuItem
);

// PATCH /api/restaurants/:restaurantId/items/:itemId - Update menu item
router.patch(
  '/:restaurantId/items/:itemId',
  authenticate,
  authorizeRestaurant('restaurantId'),
  authorize(UserRole.ADMIN),
  validate(updateMenuItemSchema),
  menuController.updateMenuItem
);

// DELETE /api/restaurants/:restaurantId/items/:itemId - Delete menu item
router.delete(
  '/:restaurantId/items/:itemId',
  authenticate,
  authorizeRestaurant('restaurantId'),
  authorize(UserRole.ADMIN),
  menuController.deleteMenuItem
);

// PATCH /api/restaurants/:restaurantId/items/:itemId/availability - Toggle availability
router.patch(
  '/:restaurantId/items/:itemId/availability',
  authenticate,
  authorizeRestaurant('restaurantId'),
  authorize(UserRole.ADMIN),
  menuController.toggleAvailability
);

// GET /api/restaurants/:restaurantId/menu/search - Search menu items
router.get(
  '/:restaurantId/menu/search',
  authenticate,
  authorizeRestaurant('restaurantId'),
  menuController.searchItems
);

export default router;