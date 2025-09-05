/**
 * Security Configuration
 * Comprehensive API security settings
 */

const crypto = require('crypto');

const securityConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    algorithm: 'HS256'
  },

  // Password Security
  password: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50, // 50 requests per window
    authWindowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5, // 5 auth attempts per window
    message: {
      success: false,
      error: {
        message: 'Too many requests, please try again later',
        statusCode: 429,
        type: 'RateLimitError'
      }
    }
  },

  // CORS Configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:4200'],
    credentials: true,
    methods: process.env.ALLOWED_METHODS ? process.env.ALLOWED_METHODS.split(',') : ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: process.env.ALLOWED_HEADERS ? process.env.ALLOWED_HEADERS.split(',') : ['Content-Type', 'Authorization', 'X-API-Key'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400 // 24 hours
  },

  // Helmet Security Headers
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        connectSrc: ["'self'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  },

  // File Upload Security
  fileUpload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024, // 2MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES ? process.env.ALLOWED_FILE_TYPES.split(',') : ['image/jpeg', 'image/png', 'application/pdf'],
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    generateUniqueNames: true
  },

  // API Key Authentication
  apiKey: {
    enabled: process.env.ENABLE_API_KEY_AUTH === 'true',
    header: process.env.API_KEY_HEADER || 'X-API-Key',
    value: process.env.API_KEY_VALUE || crypto.randomBytes(32).toString('hex')
  },

  // Session Security
  session: {
    secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  // Account Security
  account: {
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordHistory: 5, // Remember last 5 passwords
    sessionTimeout: 60 * 60 * 1000, // 1 hour
    requireMFA: process.env.ENABLE_TWO_FACTOR_AUTH === 'true'
  },

  // Logging Security
  logging: {
    level: process.env.LOG_LEVEL || 'warn',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log',
    logSensitiveData: false,
    logAuthAttempts: true,
    logSecurityEvents: true
  },

  // Environment-specific settings
  environment: {
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    debug: process.env.DEBUG === 'true'
  }
};

module.exports = securityConfig;
