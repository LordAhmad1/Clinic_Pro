/**
 * Authentication Middleware
 * JWT verification and role-based access control with enhanced security
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const authConfig = require('../config/auth');

// Enhanced token verification with multiple sources
const getTokenFromRequest = (req) => {
  // Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies (for httpOnly cookies)
  if (req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }

  // Check query parameter (for development/testing only)
  if (process.env.NODE_ENV === 'development' && req.query.token) {
    return req.query.token;
  }

  return null;
};

const authenticateToken = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access token required',
          statusCode: 401,
          type: 'AuthenticationError'
        }
      });
    }

    // Verify token with proper options
    const decoded = jwt.verify(token, authConfig.jwt.secret, {
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
      algorithms: ['HS256']
    });

    // Get user from database with additional security checks
    const user = await User.findById(decoded.userId)
      .select('-password')
      .populate('role', 'name permissions');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not found',
          statusCode: 401,
          type: 'AuthenticationError'
        }
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Account is deactivated',
          statusCode: 401,
          type: 'AccountDeactivatedError'
        }
      });
    }

    // Check if user is locked out
    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Account is locked due to multiple failed login attempts',
          statusCode: 401,
          type: 'AccountLockedError'
        }
      });
    }

    // Add user and token info to request object
    req.user = user;
    req.token = decoded;
    req.tokenExp = decoded.exp;

    // Log successful authentication
    logger.security(`User authenticated: ${user.email} (ID: ${user._id})`);

    next();

  } catch (error) {
    logger.security(`Authentication failed: ${error.message}`);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token expired',
          statusCode: 401,
          type: 'TokenExpiredError'
        }
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token',
          statusCode: 401,
          type: 'InvalidTokenError'
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        message: 'Authentication error',
        statusCode: 500,
        type: 'AuthenticationError'
      }
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          statusCode: 401,
          type: 'AuthenticationError'
        }
      });
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      logger.security(`Access denied: User ${req.user.email} attempted to access ${req.originalUrl}`);
      return res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions',
          statusCode: 403,
          type: 'AuthorizationError'
        }
      });
    }

    next();
  };
};

// Specific role middleware functions
const requireManager = authorize('manager');
const requireDoctor = authorize('doctor');
const requireSecretary = authorize('secretary');

// Permission-based authorization
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          statusCode: 401,
          type: 'AuthenticationError'
        }
      });
    }

    // Check if user has the required permission
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      logger.security(`Permission denied: User ${req.user.email} attempted to access ${permission}`);
      return res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions',
          statusCode: 403,
          type: 'AuthorizationError'
        }
      });
    }

    next();
  };
};

// Optional authentication (for public endpoints that can work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (token) {
      const decoded = jwt.verify(token, authConfig.jwt.secret, {
        issuer: authConfig.jwt.issuer,
        audience: authConfig.jwt.audience,
        algorithms: ['HS256']
      });

      const user = await User.findById(decoded.userId)
        .select('-password')
        .populate('role', 'name permissions');

      if (user && user.isActive && !user.isLocked) {
        req.user = user;
        req.token = decoded;
      }
    }
  } catch (error) {
    // Silently fail for optional authentication
    logger.debug(`Optional authentication failed: ${error.message}`);
  }

  next();
};

// Rate limiting for authentication endpoints
const authRateLimit = require('express-rate-limit')({
  windowMs: authConfig.rateLimit.windowMs,
  max: authConfig.rateLimit.max,
  message: authConfig.rateLimit.message,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  }
});

// Session validation middleware
const validateSession = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Valid session required',
        statusCode: 401,
        type: 'SessionError'
      }
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  authorize,
  requireManager,
  requireDoctor,
  requireSecretary,
  requirePermission,
  optionalAuth,
  authRateLimit,
  validateSession,
  getTokenFromRequest
};
