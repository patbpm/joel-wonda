/**
 * Authentication Routes
 * Handles JWT token generation and authentication endpoints
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const router = express.Router();

// Rate limiting for auth endpoints - more restrictive
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  skipSuccessfulRequests: true,
});

/**
 * POST /api/auth/token
 * Generate a JWT token for API access
 * 
 * No authentication required - this is the entry point
 * In a real application, this would validate user credentials
 */
router.post('/token', authLimiter, (req, res) => {
  try {
    
    // For this demo, we'll generate a token for any request
    const payload = {
      userId: 'demo-user-' + Date.now(),
      username: 'demo-user',
      role: 'user',
    };

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h',
      issuer: 'itunes-search-api',
      audience: 'itunes-search-client',
    });

    logger.info('JWT token generated', {
      userId: payload.userId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      success: true,
      message: 'Token generated successfully',
      token,
      tokenType: 'Bearer',
      expiresIn: '24h',
      user: {
        id: payload.userId,
        username: payload.username,
        role: payload.role,
      },
    });

  } catch (error) {
    logger.error('Token generation failed', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Token Generation Failed',
      message: 'Unable to generate authentication token',
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh an existing JWT token
 * 
 * Requires valid JWT token
 * Returns a new token with extended expiration
 */
router.post('/refresh', authLimiter, (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'No Token Provided',
      message: 'Please provide a token to refresh',
    });
  }

  try {
    // Verify the current token (allow expired tokens for refresh)
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true,
    });

    // Check if token is too old to refresh (e.g., more than 7 days old)
    const tokenAge = Math.floor(Date.now() / 1000) - decoded.iat;
    const maxRefreshAge = 7 * 24 * 60 * 60; // 7 days

    if (tokenAge > maxRefreshAge) {
      logger.warn('Token too old for refresh', {
        userId: decoded.userId,
        tokenAge,
        ip: req.ip,
      });

      return res.status(401).json({
        error: 'Token Too Old',
        message: 'Token is too old to refresh. Please request a new token.',
      });
    }

    // Generate new token
    const newPayload = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };

    const newToken = jwt.sign(newPayload, process.env.JWT_SECRET, {
      expiresIn: '24h',
      issuer: 'itunes-search-api',
      audience: 'itunes-search-client',
    });

    logger.info('JWT token refreshed', {
      userId: decoded.userId,
      ip: req.ip,
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken,
      tokenType: 'Bearer',
      expiresIn: '24h',
      user: {
        id: newPayload.userId,
        username: newPayload.username,
        role: newPayload.role,
      },
    });

  } catch (error) {
    logger.error('Token refresh failed', {
      error: error.message,
      ip: req.ip,
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'The provided token is invalid',
      });
    }

    res.status(500).json({
      error: 'Token Refresh Failed',
      message: 'Unable to refresh authentication token',
    });
  }
});

/**
 * GET /api/auth/verify
 * Verify if a JWT token is valid
 * 
 * Requires valid JWT token
 * Returns token information if valid
 */
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'No Token Provided',
      message: 'Please provide a token to verify',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      valid: true,
      message: 'Token is valid',
      user: {
        id: decoded.userId,
        username: decoded.username,
        role: decoded.role,
      },
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
      issuedAt: new Date(decoded.iat * 1000).toISOString(),
    });

  } catch (error) {
    logger.warn('Token verification failed', {
      error: error.message,
      ip: req.ip,
    });

    const errorResponse = {
      valid: false,
      error: error.name,
      message: error.message,
    };

    // Return 200 status for verification endpoint even if token is invalid
    // The 'valid: false' field indicates the result
    res.json(errorResponse);
  }
});

module.exports = router;