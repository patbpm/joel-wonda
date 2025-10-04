/**
 * JWT Authentication Middleware
 * Handles JWT token verification for protected routes
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Middleware to verify JWT tokens
 * Extracts token from Authorization header and verifies it
 * Adds decoded user information to req.user
 */
const authenticateToken = (req, res, next) => {
  // Get the authorization header
  const authHeader = req.headers['authorization'];
  
  // Extract token from "Bearer TOKEN" format
  const token = authHeader && authHeader.split(' ')[1];

  // Check if token exists
  if (!token) {
    logger.warn('Access attempt without token', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
    });

    return res.status(401).json({
      error: 'Access Denied',
      message: 'No token provided. Please include a valid JWT token in the Authorization header.',
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user information to request object
    req.user = decoded;
    
    logger.info('Token verified successfully', {
      userId: decoded.userId,
      ip: req.ip,
    });

    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    logger.error('Token verification failed', {
      error: error.message,
      token: token.substring(0, 20) + '...', // Log partial token for debugging
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Your session has expired. Please request a new token.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'The provided token is invalid or malformed.',
      });
    }

    // Generic token error
    return res.status(401).json({
      error: 'Authentication Failed',
      message: 'Token verification failed.',
    });
  }
};

/**
 * Optional authentication middleware
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No token provided, continue without authentication
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    logger.info('Optional auth - token verified', { userId: decoded.userId });
  } catch (error) {
    // Invalid token, but continue anyway
    logger.warn('Optional auth - invalid token provided', { error: error.message });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
};