/**
 * Analytics Controller
 * Handles analytics and reporting HTTP requests
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';
import * as analyticsService from '../services/analytics.service';
import { TimeRange } from '../types';

/**
 * Get revenue analytics
 * GET /api/analytics/revenue
 * Query params: restaurantId, range (today|week|month|year)
 */
export const getRevenue = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId, range = 'today' } = req.query;

  if (!restaurantId || typeof restaurantId !== 'string') {
    sendSuccess(res, { total: 0, currency: 'USD', orders: 0, averageOrderValue: 0 });
    return;
  }

  const analytics = await analyticsService.getRevenueAnalytics(
    restaurantId,
    range as TimeRange
  );

  sendSuccess(res, analytics);
});

/**
 * Get top products
 * GET /api/analytics/products
 * Query params: restaurantId, range, limit
 */
export const getTopProducts = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId, range = 'today', limit = '10' } = req.query;

  if (!restaurantId || typeof restaurantId !== 'string') {
    sendSuccess(res, []);
    return;
  }

  const products = await analyticsService.getTopProductsAnalytics(
    restaurantId,
    range as TimeRange,
    parseInt(limit as string, 10)
  );

  sendSuccess(res, products);
});

/**
 * Get table performance
 * GET /api/analytics/tables
 * Query params: restaurantId, range
 */
export const getTablePerformance = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId, range = 'today' } = req.query;

  if (!restaurantId || typeof restaurantId !== 'string') {
    sendSuccess(res, []);
    return;
  }

  const tables = await analyticsService.getTableAnalytics(
    restaurantId,
    range as TimeRange
  );

  sendSuccess(res, tables);
});

/**
 * Get full analytics
 * GET /api/analytics/full
 * Query params: restaurantId, range
 */
export const getFullAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId, range = 'today' } = req.query;

  if (!restaurantId || typeof restaurantId !== 'string') {
    sendSuccess(res, { revenue: {}, topProducts: [], tablePerformance: [], timeRange: 'today' });
    return;
  }

  const analytics = await analyticsService.getFullAnalytics(
    restaurantId,
    range as TimeRange
  );

  sendSuccess(res, analytics);
});

/**
 * Get sales by hour
 * GET /api/analytics/sales-by-hour
 * Query params: restaurantId, date
 */
export const getSalesByHour = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId, date } = req.query;

  if (!restaurantId || typeof restaurantId !== 'string') {
    sendSuccess(res, []);
    return;
  }

  const salesData = await analyticsService.getSalesByHour(
    restaurantId,
    (date as string) || new Date().toISOString().split('T')[0]
  );

  sendSuccess(res, salesData);
});

/**
 * Get dashboard summary
 * GET /api/analytics/dashboard
 * Query params: restaurantId
 */
export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.query;

  if (!restaurantId || typeof restaurantId !== 'string') {
    sendSuccess(res, {
      todayRevenue: 0,
      todayOrders: 0,
      pendingOrders: 0,
      activeSessions: 0,
    });
    return;
  }

  const summary = await analyticsService.getDashboardSummary(restaurantId);

  sendSuccess(res, summary);
});