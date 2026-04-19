// ============================================
// Restaurant QR Ordering SaaS - Entry Point
// ============================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const restaurantRoutes = require('./src/routes/restaurant.routes');
const menuRoutes = require('./src/routes/menu.routes');
const orderRoutes = require('./src/routes/order.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const sessionRoutes = require('./src/routes/session.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');
const publicRoutes = require('./src/routes/public.routes');

// Import middleware
const { errorHandler } = require('./src/middleware/errorHandler');
const { requestLogger } = require('./src/middleware/logging');

// Import data store
const { initializeData } = require('./src/models/store');

// Configuration
const PORT = process.env.PORT || 3000;
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

// Data stats endpoint
app.get('/api/stats', (req, res) => {
  const store = require('./src/models/store');
  res.json({
    success: true,
    data: {
      users: store.users.size,
      restaurants: store.restaurants.size,
      tables: store.tables.size,
      categories: store.categories.size,
      menuItems: store.menuItems.size,
      orders: store.orders.size,
      payments: store.payments.size,
      sessions: store.sessions.size
    }
  });
});

// Supported languages endpoint
app.get('/api/languages', (req, res) => {
  const { SUPPORTED_LANGUAGES, RTL_LANGUAGES } = require('./src/config/constants');
  res.json({
    success: true,
    data: {
      languages: SUPPORTED_LANGUAGES,
      rtlLanguages: RTL_LANGUAGES
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/public', publicRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
});

// Error handler
app.use(errorHandler);

// Initialize data and start server
function startServer() {
  // Initialize in-memory data store with seed data
  initializeData();

  const server = app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                                                            ║');
    console.log('║   Restaurant QR Ordering SaaS Platform                      ║');
    console.log('║   Backend API Server                                       ║');
    console.log('║                                                            ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║   Server running on port ' + PORT + '                            ║');
    console.log('║   Environment: ' + (process.env.NODE_ENV || 'development').padEnd(35) + '  ║');
    console.log('║   CORS: ' + (CORS_ORIGINS[0] || 'http://localhost:3000').substring(0, 40).padEnd(40) + '  ║');
    console.log('║                                                            ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║   API Documentation: http://localhost:' + PORT + '/api/docs             ║');
    console.log('║   Health Check: http://localhost:' + PORT + '/api/health              ║');
    console.log('║   Data Stats: http://localhost:' + PORT + '/api/stats                ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║   Supported Languages: EN, TR, DE, RU, FR, AR             ║');
    console.log('║   Payment: Simulated (mock)                               ║');
    console.log('║   Database: In-memory (mock)                               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log('\n' + signal + ' received. Shutting down gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
}

// Export for testing
module.exports = app;

// Start server if this is the main module
if (require.main === module) {
  startServer();
}
