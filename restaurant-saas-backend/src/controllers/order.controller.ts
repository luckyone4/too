/**
 * Order Controller
 * Handles order management HTTP requests
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';
import { normalizeLanguage } from '../utils/i18n';
import * as orderService from '../services/order.service';
import { Language, OrderStatus } from '../types';

/**
 * Create new order
 * POST /api/orders
 */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const lang = normalizeLanguage(req.query.lang as string) as Language;
  const order = await orderService.createOrder(req.body, lang);
  sendCreated(res, order);
});

/**
 * Get order by ID
 * GET /api/orders/:id
 */
export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await orderService.getOrderById(id);
  sendSuccess(res, order);
});

/**
 * List orders
 * GET /api/orders
 * Query params: restaurantId, status, page, limit
 */
export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId, status, page = '1', limit = '20' } = req.query;

  if (!restaurantId || typeof restaurantId !== 'string') {
    sendSuccess(res, []);
    return;
  }

  const filters: { status?: OrderStatus; limit?: number } = {};
  if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
    filters.status = status as OrderStatus;
  }

  const result = await orderService.getRecentOrders(
    restaurantId,
    parseInt(page as string, 10),
    parseInt(limit as string, 10)
  );

  sendSuccess(res, result.orders, 200, {
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
    total: result.total,
    totalPages: Math.ceil(result.total / parseInt(limit as string, 10)),
  });
});

/**
 * Update order status
 * PATCH /api/orders/:id/status
 */
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await orderService.updateOrderStatus(id, status as OrderStatus);
  sendSuccess(res, order);
});

/**
 * Add items to order
 * POST /api/orders/:id/items
 */
export const addOrderItems = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const lang = normalizeLanguage(req.query.lang as string) as Language;
  const { items } = req.body;

  const order = await orderService.addOrderItems(id, items, lang);
  sendSuccess(res, order);
});

/**
 * Cancel order
 * POST /api/orders/:id/cancel
 */
export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await orderService.cancelOrder(id, reason);
  sendSuccess(res, order);
});

/**
 * Get orders for table
 * GET /api/tables/:tableId/orders
 */
export const getTableOrders = asyncHandler(async (req: Request, res: Response) => {
  const { tableId } = req.params;
  const orders = await orderService.getTableOrders(tableId);
  sendSuccess(res, orders);
});

/**
 * Get order statistics
 * GET /api/restaurants/:restaurantId/orders/stats
 */
export const getOrderStats = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const stats = await orderService.getOrderStats(restaurantId);
  sendSuccess(res, stats);
});