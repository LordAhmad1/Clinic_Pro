/**
 * Authentication Configuration
 * JWT and Cookie settings for secure authentication
 */

const crypto = require('crypto');

const authConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m', // Short-lived access token
    refreshSecret: process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // Long-lived refresh token
    issuer: process.env.JWT_ISSUER || 'medical-clinic-api',
    audience: process.env.JWT_AUDIENCE || 'medical-clinic-client'
  },

  // Cookie Configuration
  cookies: {
    accessToken: {
      name: 'access_token',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    },
    refreshToken: {
      name: 'refresh_token',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth/refresh'
    },
    session: {
      name: 'session_id',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    }
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  // Rate Limiting for Authentication
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
    message: {
      success: false,
      error: {
        message: 'Too many authentication attempts, please try again later',
        statusCode: 429,
        type: 'RateLimitError'
      }
    }
  },

  // Password Security
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  },

  // Account Security
  account: {
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
    requireTwoFactor: process.env.REQUIRE_TWO_FACTOR === 'true',
    sessionTimeout: 60 * 60 * 1000 // 1 hour
  },

  // CORS Configuration for Authentication
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }
};

module.exports = authConfig;
