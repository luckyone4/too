/**
 * Analytics Routes
 */

import { Router } from 'express';
import { analyticsController } from '../controllers';
import { authenticate, authorizeRestaurant } from '../middleware/auth';

const router = Router();

// ============================================================================
// ANALYTICS ROUTES
// ============================================================================

// GET /api/analytics/revenue - Get revenue analytics
router.get(
  '/revenue',
  authenticate,
  analyticsController.getRevenue
);

// GET /api/analytics/products - Get top products
router.get(
  '/products',
  authenticate,
  analyticsController.getTopProducts
);

// GET /api/analytics/tables - Get table performance
router.get(
  '/tables',
  authenticate,
  analyticsController.getTablePerformance
);

// GET /api/analytics/full - Get full analytics
router.get(
  '/full',
  authenticate,
  analyticsController.getFullAnalytics
);

// GET /api/analytics/sales-by-hour - Get sales by hour
router.get(
  '/sales-by-hour',
  authenticate,
  analyticsController.getSalesByHour
);

// GET /api/analytics/dashboard - Get dashboard summary
router.get(
  '/dashboard',
  authenticate,
  analyticsController.getDashboard
);

export default router;