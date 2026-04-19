/**
 * Payment Controller
 * Handles payment processing HTTP requests
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendCreated } from '../utils/response';
import * as paymentService from '../services/payment.service';
import * as orderService from '../services/order.service';
import { PaymentMethod } from '../types';

/**
 * Create payment
 * POST /api/payments
 */
export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, method, amount } = req.body;

  const payment = await paymentService.createPayment({
    orderId,
    method,
    amount,
  });

  sendCreated(res, payment);
});

/**
 * Get payment by ID
 * GET /api/payments/:id
 */
export const getPayment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payment = await paymentService.getPaymentById(id);
  sendSuccess(res, payment);
});

/**
 * Simulate payment for order
 * POST /api/orders/:orderId/pay
 */
export const simulatePayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { method, amount, cardLast4, cardBrand } = req.body;

  const result = await paymentService.simulatePayment(orderId, {
    method,
    amount,
    cardLast4,
    cardBrand,
  });

  sendSuccess(res, result);
});

/**
 * Process cash payment
 * POST /api/orders/:orderId/pay-cash
 */
export const payCash = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const result = await paymentService.processCashPayment(orderId);

  // Also update order status
  if (result.success) {
    await orderService.updateOrderStatus(orderId, 'completed');
  }

  sendSuccess(res, result);
});

/**
 * Refund payment
 * POST /api/payments/:id/refund
 */
export const refundPayment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await paymentService.refundPayment(id);

  sendSuccess(res, result);
});

/**
 * Get restaurant payments
 * GET /api/restaurants/:restaurantId/payments
 */
export const getRestaurantPayments = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const payments = await paymentService.getRestaurantPayments(restaurantId);
  sendSuccess(res, payments);
});