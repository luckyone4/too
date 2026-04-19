/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config, isProduction } from './config';
import routes from './routes';
import { errorHandler, notFoundHandler, requestLogger, corsMiddleware, securityHeaders } from './middleware';
import { initializeData, getDataStats } from './models';

// Create Express app
const app: Application = express();

// ============================================================================
// TRUST PROXY (for accurate IP in production)
// ============================================================================

app.set('trust proxy', 1);

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
}));

// ============================================================================
// BODY PARSING
// ============================================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// LOGGING
// ============================================================================

if (!isProduction) {
  app.use(requestLogger);
}

// ============================================================================
// REQUEST TIMING
// ============================================================================

app.use((req: Request, res: Response, next) => {
  req.startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - (req.startTime || Date.now());
    if (duration > 1000) {
      console.warn(`[SLOW] ${req.method} ${req.path} took ${duration}ms`);
    }
  });

  next();
});

// Extend Request type for startTime
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
    }
  }
}

// ============================================================================
// API ROUTES
// ============================================================================

app.use('/api', routes);

// ============================================================================
// ROOT ROUTE
// ============================================================================

app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      name: 'Restaurant QR Ordering SaaS API',
      version: '1.0.0',
      description: 'Multi-tenant QR-based restaurant ordering platform',
      endpoints: {
        api: '/api',
        health: '/api/health',
        public: '/restaurant/:restaurantId',
      },
      documentation: '/api/docs',
    },
  });
});

// ============================================================================
// API DOCUMENTATION
// ============================================================================

app.get('/api/docs', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      title: 'Restaurant QR Ordering API Documentation',
      version: '1.0.0',
      baseUrl: '/api',
      endpoints: {
        auth: {
          'POST /api/auth/register': 'Register new user',
          'POST /api/auth/login': 'Login user',
          'GET /api/auth/profile': 'Get current user profile',
        },
        restaurants: {
          'GET /api/restaurants': 'List all restaurants',
          'GET /api/restaurants/:id': 'Get restaurant details',
          'POST /api/restaurants': 'Create restaurant (admin)',
          'PATCH /api/restaurants/:id': 'Update restaurant (admin)',
          'DELETE /api/restaurants/:id': 'Delete restaurant (admin)',
        },
        tables: {
          'GET /api/restaurants/:id/tables': 'List restaurant tables',
          'POST /api/restaurants/:id/tables': 'Create table (admin)',
          'GET /api/tables/:tableId/session': 'Get or create session',
        },
        menu: {
          'GET /api/restaurants/:id/menu': 'Get restaurant menu',
          'GET /api/restaurants/:id/menu?lang=tr': 'Get menu in Turkish',
          'POST /api/restaurants/:id/items': 'Create menu item (admin)',
        },
        orders: {
          'POST /api/orders': 'Create order',
          'GET /api/orders': 'List orders',
          'GET /api/orders/:id': 'Get order details',
          'PATCH /api/orders/:id/status': 'Update order status',
        },
        payments: {
          'POST /api/orders/:id/pay': 'Simulate payment',
          'POST /api/orders/:id/pay-cash': 'Process cash payment',
        },
        analytics: {
          'GET /api/analytics/revenue': 'Get revenue analytics',
          'GET /api/analytics/products': 'Get top products',
          'GET /api/analytics/dashboard': 'Get dashboard summary',
        },
        public: {
          'GET /restaurant/:id/table/:tableId': 'QR scan endpoint',
          'GET /restaurant/:id/menu': 'Public menu endpoint',
        },
      },
      languages: ['en', 'tr', 'de', 'ru', 'fr', 'ar'],
      notes: 'Multi-language support via ?lang= query parameter. Arabic returns RTL flag.',
    },
  });
});

// ============================================================================
// DATA STATS (for debugging)
// ============================================================================

app.get('/api/stats', (req: Request, res: Response) => {
  const stats = getDataStats();
  res.json({
    success: true,
    data: {
      ...stats,
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
    },
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;