/**
 * Admin Security Middleware
 * Additional security measures for admin routes
 */

const logger = require('../utils/logger');
const rateLimit = require('express-rate-limit');

// IP-based rate limiting for admin routes
const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for admin routes
  message: {
    success: false,
    error: {
      message: 'Too many admin requests, please try again later',
      statusCode: 429,
      type: 'RateLimitError'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use IP + user ID for more granular rate limiting
    return req.user ? `${req.ip}-${req.user.id}` : req.ip;
  }
});

// Admin access time restriction (optional)
const adminTimeRestriction = (req, res, next) => {
  const now = new Date();
  const hour = now.getHours();
  
  // Optional: Restrict admin access to business hours (9 AM - 6 PM)
  // Uncomment the following lines if you want to enable time restrictions
  /*
  if (hour < 9 || hour >= 18) {
    logger.security(`Admin access attempt outside business hours by user ${req.user.id} at ${now.toISOString()}`);
    return res.status(403).json({
      success: false,
      error: {
        message: 'Admin access is restricted to business hours (9 AM - 6 PM)',
        statusCode: 403,
        type: 'TimeRestrictionError'
      }
    });
  }
  */
  
  next();
};

// Admin session validation
const validateAdminSession = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Admin session required',
        statusCode: 401,
        type: 'AuthenticationError'
      }
    });
  }

  // Log admin actions for audit trail
  logger.info(`Admin action: ${req.user.email} (${req.user.role}) - ${req.method} ${req.originalUrl}`, {
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  next();
};

// Check for suspicious admin activities
const detectSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /\.\./, // Directory traversal attempts
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection attempts
    /eval\(/i, // Code injection attempts
  ];

  const requestBody = JSON.stringify(req.body);
  const requestQuery = JSON.stringify(req.query);
  const requestParams = JSON.stringify(req.params);

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestBody) || pattern.test(requestQuery) || pattern.test(requestParams)) {
      logger.security(`Suspicious activity detected from admin user ${req.user.id}: ${pattern.source}`, {
        userId: req.user.id,
        userEmail: req.user.email,
        pattern: pattern.source,
        body: requestBody,
        query: requestQuery,
        params: requestParams,
        ip: req.ip
      });

      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid request detected',
          statusCode: 400,
          type: 'SecurityError'
        }
      });
    }
  }

  next();
};

// Admin account status check
const checkAdminAccountStatus = (req, res, next) => {
  if (!req.user.isActive) {
    logger.security(`Deactivated admin account access attempt: ${req.user.email}`);
    return res.status(401).json({
      success: false,
      error: {
        message: 'Admin account is deactivated',
        statusCode: 401,
        type: 'AccountDeactivatedError'
      }
    });
  }

  if (!req.user.isVerified) {
    logger.security(`Unverified admin account access attempt: ${req.user.email}`);
    return res.status(401).json({
      success: false,
      error: {
        message: 'Admin account is not verified',
        statusCode: 401,
        type: 'AccountNotVerifiedError'
      }
    });
  }

  next();
};

// Comprehensive admin security middleware
const adminSecurity = [
  adminRateLimit,
  validateAdminSession,
  checkAdminAccountStatus,
  adminTimeRestriction,
  detectSuspiciousActivity
];

module.exports = {
  adminRateLimit,
  validateAdminSession,
  checkAdminAccountStatus,
  adminTimeRestriction,
  detectSuspiciousActivity,
  adminSecurity
};
