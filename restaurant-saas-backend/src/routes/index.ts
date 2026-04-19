/**
 * API Routes Index
 * Combines all route modules
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
import restaurantRoutes from './restaurant.routes';
import menuRoutes from './menu.routes';
import sessionRoutes from './session.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';
import analyticsRoutes from './analytics.routes';
import publicRoutes from './public.routes';

const router = Router();

// ============================================================================
// API ROUTES
// ============================================================================

// Auth routes
router.use('/auth', authRoutes);

// Restaurant routes (includes tables)
router.use('/restaurants', restaurantRoutes);

// Menu routes (under restaurant context)
router.use('/restaurants', menuRoutes);

// Session/Cart routes
router.use('/tables', sessionRoutes);

// Order routes
router.use('/orders', orderRoutes);

// Payment routes
router.use('/payments', paymentRoutes);
router.use('/orders', paymentRoutes); // For /orders/:orderId/pay

// Analytics routes
router.use('/analytics', analyticsRoutes);

// Public QR routes (no auth)
router.use('/restaurant', publicRoutes);

// ============================================================================
// HEALTH CHECK
// ============================================================================

router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

export default router;