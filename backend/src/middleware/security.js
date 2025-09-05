/**
 * Comprehensive Security Middleware
 * Combines all security features into one middleware
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const securityConfig = require('../config/security');
const { validateApiKey } = require('./apiKey');
const logger = require('../utils/logger');

// Enhanced rate limiting
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        message: message || 'Too many requests, please try again later',
        statusCode: 429,
        type: 'RateLimitError'
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.security(`Rate limit exceeded: ${req.ip} - ${req.method} ${req.path}`);
      res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests, please try again later',
          statusCode: 429,
          type: 'RateLimitError',
          retryAfter: Math.ceil(windowMs / 1000)
        }
      });
    }
  });
};

// Security middleware setup
const setupSecurity = (app) => {
  // 1. Helmet Security Headers
  app.use(helmet(securityConfig.helmet));

  // 2. Global Rate Limiting
  app.use('/api/', createRateLimit(
    securityConfig.rateLimit.windowMs,
    securityConfig.rateLimit.max,
    securityConfig.rateLimit.message.error.message
  ));

  // 3. Stricter rate limiting for authentication endpoints
  app.use('/api/v1/auth/', createRateLimit(
    securityConfig.rateLimit.authWindowMs,
    securityConfig.rateLimit.authMax,
    'Too many authentication attempts, please try again later'
  ));

  // 4. API Key validation for all API routes
  app.use('/api/', validateApiKey);

  // 5. Request logging for security monitoring
  app.use((req, res, next) => {
    // Log suspicious requests
    if (req.path.includes('..') || req.path.includes('admin') || req.path.includes('config')) {
      logger.security(`Suspicious request: ${req.method} ${req.path} from ${req.ip}`);
    }

    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Remove server information
    res.removeHeader('X-Powered-By');
    
    next();
  });

  // 6. Input validation and sanitization
  app.use((req, res, next) => {
    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = req.query[key].replace(/[<>]/g, '');
        }
      });
    }

    // Sanitize body parameters
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].replace(/[<>]/g, '');
        }
      });
    }

    next();
  });

  // 7. Error handling for security
  app.use((error, req, res, next) => {
    logger.error(`Security error: ${error.message}`, {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Don't expose internal errors in production
    if (securityConfig.environment.isProduction) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          statusCode: 500,
          type: 'InternalServerError'
        }
      });
    }

    next(error);
  });
};

// Security monitoring
const securityMonitor = {
  trackLoginAttempt: (email, success, ip) => {
    logger.security(`Login attempt: ${email} - ${success ? 'SUCCESS' : 'FAILED'} from ${ip}`);
  },

  trackApiUsage: (endpoint, method, ip, apiKey) => {
    logger.info(`API usage: ${method} ${endpoint} from ${ip} ${apiKey ? '(with API key)' : '(no API key)'}`);
  },

  trackSuspiciousActivity: (activity, details) => {
    logger.security(`Suspicious activity detected: ${activity}`, details);
  }
};

module.exports = {
  setupSecurity,
  securityMonitor,
  createRateLimit
};
