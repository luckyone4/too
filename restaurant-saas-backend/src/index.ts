/**
 * Application Entry Point
 * Starts the Express server with in-memory data initialization
 */

import app from './app';
import { config } from './config';
import { initializeData } from './models';

// ============================================================================
// INITIALIZE DATA STORE
// ============================================================================

// Initialize seed data (mock database)
initializeData();

// ============================================================================
// START SERVER
// ============================================================================

const server = app.listen(config.port, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║   🍔 Restaurant QR Ordering SaaS Platform                  ║');
  console.log('║   Backend API Server                                       ║');
  console.log('║                                                            ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║   🚀 Server running on port ${config.port}                        ║`);
  console.log(`║   📦 Environment: ${config.nodeEnv.padEnd(28)}              ║`);
  console.log(`║   🌐 CORS: ${config.corsOrigins[0].substring(0, 32).padEnd(32)}     ║`);
  console.log('║                                                            ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║   📖 API Documentation: http://localhost:' + config.port + '/api/docs       ║');
  console.log('║   🔧 Health Check: http://localhost:' + config.port + '/api/health        ║');
  console.log('║   📊 Data Stats: http://localhost:' + config.port + '/api/stats          ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║   🌐 Supported Languages: EN, TR, DE, RU, FR, AR           ║');
  console.log('║   💳 Payment: Simulated (mock)                             ║');
  console.log('║   🗄️  Database: In-memory (mock)                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

const shutdown = (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default server;