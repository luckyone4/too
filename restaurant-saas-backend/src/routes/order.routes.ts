/**
 * Order Routes
 */

import { Router } from 'express';
import { orderController } from '../controllers';
import { authenticate, authorize, authorizeRestaurant } from '../middleware/auth';
import { validate, createOrderSchema, updateOrderStatusSchema } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

// ============================================================================
// ORDER ROUTES
// ============================================================================

// POST /api/orders - Create order
router.post(
  '/',
  validate(createOrderSchema),
  orderController.createOrder
);

// GET /api/orders - List orders (with restaurantId query param)
router.get(
  '/',
  authenticate,
  orderController.listOrders
);

// GET /api/orders/:id - Get order by ID
router.get(
  '/:id',
  authenticate,
  orderController.getOrder
);

// PATCH /api/orders/:id/status - Update order status
router.patch(
  '/:id/status',
  authenticate,
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

// POST /api/orders/:id/items - Add items to order
router.post(
  '/:id/items',
  authenticate,
  orderController.addOrderItems
);

// POST /api/orders/:id/cancel - Cancel order
router.post(
  '/:id/cancel',
  authenticate,
  orderController.cancelOrder
);

export default router;