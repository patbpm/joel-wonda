/**
 * Application - Backend Server
 * Main server file that initializes and starts the Express application
 * 
 * Features:
 * - Express.js server setup
 * - Environment configuration
 * - Graceful shutdown handling
 * - Error handling and logging
 */

const app = require('./app');
const logger = require('./utils/logger');

// Get port from environment or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`🚀 iTunes Search API Server running on port ${PORT}`);
  logger.info(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('📴 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('📴 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('✅ Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = server;