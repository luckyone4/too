/**
 * Public QR Routes
 * No authentication required - for customer-facing ordering
 */

import { Router } from 'express';
import { publicController } from '../controllers';

const router = Router();

// ============================================================================
// PUBLIC QR ROUTES
// ============================================================================

// GET /restaurant/:restaurantId - Get public restaurant info
router.get('/:restaurantId', publicController.getPublicRestaurant);

// GET /restaurant/:restaurantId/table/:tableId - Get table session (QR scan)
router.get('/:restaurantId/table/:tableId', publicController.getTableSession);

// GET /restaurant/:restaurantId/menu - Get public menu
router.get('/:restaurantId/menu', publicController.getPublicMenu);

// ============================================================================
// PUBLIC CART ROUTES
// ============================================================================

// GET /restaurant/:restaurantId/table/:tableId/cart - Get cart
router.get('/:restaurantId/table/:tableId/cart', publicController.getPublicCart);

// POST /restaurant/:restaurantId/table/:tableId/cart - Add to cart
router.post('/:restaurantId/table/:tableId/cart', publicController.addToPublicCart);

// PATCH /restaurant/:restaurantId/table/:tableId/cart/:menuItemId - Update cart item
router.patch('/:restaurantId/table/:tableId/cart/:menuItemId', publicController.updatePublicCartItem);

// DELETE /restaurant/:restaurantId/table/:tableId/cart/:menuItemId - Remove from cart
router.delete('/:restaurantId/table/:tableId/cart/:menuItemId', publicController.removeFromPublicCart);

export default router;