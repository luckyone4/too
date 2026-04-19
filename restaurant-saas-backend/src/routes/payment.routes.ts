/**
 * Payment Routes
 */

import { Router } from 'express';
import { paymentController } from '../controllers';
import { authenticate, authorizeRestaurant } from '../middleware/auth';
import { validate, createPaymentSchema, simulatePaymentSchema } from '../middleware/validation';

const router = Router();

// ============================================================================
// PAYMENT ROUTES
// ============================================================================

// POST /api/payments - Create payment
router.post(
  '/',
  authenticate,
  validate(createPaymentSchema),
  paymentController.createPayment
);

// GET /api/payments/:id - Get payment by ID
router.get(
  '/:id',
  authenticate,
  paymentController.getPayment
);

// POST /api/payments/:id/refund - Refund payment
router.post(
  '/:id/refund',
  authenticate,
  paymentController.refundPayment
);

// ============================================================================
// ORDER PAYMENT ROUTES (convenience endpoints)
// ============================================================================

// POST /api/orders/:orderId/pay - Simulate payment
router.post(
  '/orders/:orderId/pay',
  validate(simulatePaymentSchema),
  paymentController.simulatePayment
);

// POST /api/orders/:orderId/pay-cash - Process cash payment
router.post(
  '/orders/:orderId/pay-cash',
  paymentController.payCash
);

export default router;