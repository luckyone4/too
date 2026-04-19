/**
 * Session Routes (for authenticated session management)
 */

import { Router } from 'express';
import { sessionController, orderController } from '../controllers';
import { authenticate } from '../middleware/auth';
import { validate, createSessionSchema, updateSessionSchema, createOrderSchema } from '../middleware/validation';

const router = Router();

// ============================================================================
// SESSION ROUTES
// ============================================================================

// GET /api/tables/:tableId/session - Get or create session
router.get(
  '/:tableId/session',
  sessionController.getOrCreateSession
);

// PATCH /api/tables/:tableId/session - Update session
router.patch(
  '/:tableId/session',
  validate(updateSessionSchema),
  sessionController.updateSession
);

// DELETE /api/tables/:tableId/session - End session
router.delete(
  '/:tableId/session',
  sessionController.endSession
);

// ============================================================================
// CART ROUTES
// ============================================================================

// GET /api/tables/:tableId/cart - Get cart
router.get(
  '/:tableId/cart',
  sessionController.getCart
);

// POST /api/tables/:tableId/cart - Add to cart
router.post(
  '/:tableId/cart',
  sessionController.addToCart
);

// PATCH /api/tables/:tableId/cart/:menuItemId - Update cart item
router.patch(
  '/:tableId/cart/:menuItemId',
  sessionController.updateCartItem
);

// DELETE /api/tables/:tableId/cart/:menuItemId - Remove from cart
router.delete(
  '/:tableId/cart/:menuItemId',
  sessionController.removeFromCart
);

// DELETE /api/tables/:tableId/cart - Clear cart
router.delete(
  '/:tableId/cart',
  sessionController.clearCart
);

// ============================================================================
// TABLE ORDERS
// ============================================================================

// GET /api/tables/:tableId/orders - Get orders for table
router.get(
  '/:tableId/orders',
  orderController.getTableOrders
);

export default router;