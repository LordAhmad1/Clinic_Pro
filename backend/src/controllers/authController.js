/**
 * Authentication Controller
 * Enhanced authentication with JWT tokens and secure cookies
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const authConfig = require('../config/auth');

// Helper function to send success response
const sendSuccessResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Helper function to send error response
const sendErrorResponse = (res, message, statusCode = 400, type = 'Error') => {
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      type
    },
    timestamp: new Date().toISOString()
  });
};

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    authConfig.jwt.secret,
    {
      expiresIn: authConfig.jwt.expiresIn,
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
      algorithm: 'HS256'
    }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    authConfig.jwt.refreshSecret,
    {
      expiresIn: authConfig.jwt.refreshExpiresIn,
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
      algorithm: 'HS256'
    }
  );

  return { accessToken, refreshToken };
};

// Set secure cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
  // Set access token cookie
  res.cookie(authConfig.cookies.accessToken.name, accessToken, {
    httpOnly: authConfig.cookies.accessToken.httpOnly,
    secure: authConfig.cookies.accessToken.secure,
    sameSite: authConfig.cookies.accessToken.sameSite,
    maxAge: authConfig.cookies.accessToken.maxAge,
    path: authConfig.cookies.accessToken.path
  });

  // Set refresh token cookie
  res.cookie(authConfig.cookies.refreshToken.name, refreshToken, {
    httpOnly: authConfig.cookies.refreshToken.httpOnly,
    secure: authConfig.cookies.refreshToken.secure,
    sameSite: authConfig.cookies.refreshToken.sameSite,
    maxAge: authConfig.cookies.refreshToken.maxAge,
    path: authConfig.cookies.refreshToken.path
  });
};

// Clear auth cookies
const clearAuthCookies = (res) => {
  res.clearCookie(authConfig.cookies.accessToken.name, {
    path: authConfig.cookies.accessToken.path
  });
  res.clearCookie(authConfig.cookies.refreshToken.name, {
    path: authConfig.cookies.refreshToken.path
  });
  res.clearCookie(authConfig.cookies.session.name, {
    path: authConfig.cookies.session.path
  });
};

/**
 * @desc    User login
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return sendErrorResponse(res, 'Email and password are required', 400, 'ValidationError');
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      logger.security(`Failed login attempt: User not found - ${email}`);
      return sendErrorResponse(res, 'Invalid email or password', 401, 'AuthenticationError');
    }

    // Check if user is active
    if (!user.isActive) {
      logger.security(`Failed login attempt: Inactive account - ${email}`);
      return sendErrorResponse(res, 'Account is deactivated', 401, 'AccountDeactivatedError');
    }

    // Check if user is locked
    if (user.isLocked) {
      logger.security(`Failed login attempt: Locked account - ${email}`);
      return sendErrorResponse(res, 'Account is locked due to multiple failed login attempts', 401, 'AccountLockedError');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      
      // Lock account if too many failed attempts
      if (user.failedLoginAttempts >= authConfig.account.maxLoginAttempts) {
        user.isLocked = true;
        user.lockedUntil = new Date(Date.now() + authConfig.account.lockoutDuration);
        logger.security(`Account locked due to multiple failed login attempts - ${email}`);
      }
      
      await user.save();
      logger.security(`Failed login attempt: Invalid password - ${email}`);
      return sendErrorResponse(res, 'Invalid email or password', 401, 'AuthenticationError');
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    user.isLocked = false;
    user.lockedUntil = null;
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set session
    req.session.userId = user._id;
    req.session.role = user.role;

    // Set secure cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Log successful login
    logger.security(`Successful login: ${email} (ID: ${user._id})`);

    // Send response
    sendSuccessResponse(res, {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive
      },
      accessToken,
      refreshToken
    }, 'Login successful');

  } catch (error) {
    logger.error('Login error:', error);
    sendErrorResponse(res, 'Login failed', 500, 'ServerError');
  }
};

/**
 * @desc    User logout
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    // Clear session
    req.session.destroy((err) => {
      if (err) {
        logger.error('Session destruction error:', err);
      }
    });

    // Clear cookies
    clearAuthCookies(res);

    logger.security(`User logged out: ${req.user?.email || 'Unknown'}`);

    sendSuccessResponse(res, null, 'Logout successful');

  } catch (error) {
    logger.error('Logout error:', error);
    sendErrorResponse(res, 'Logout failed', 500, 'ServerError');
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh
 * @access  Public
 */
const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies[authConfig.cookies.refreshToken.name] || req.body.refreshToken;

    if (!refreshToken) {
      return sendErrorResponse(res, 'Refresh token required', 401, 'AuthenticationError');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, authConfig.jwt.refreshSecret, {
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
      algorithms: ['HS256']
    });

    // Check if user exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return sendErrorResponse(res, 'Invalid refresh token', 401, 'AuthenticationError');
    }

    // Generate new tokens
    const { accessToken, newRefreshToken } = generateTokens(user._id);

    // Set new cookies
    setAuthCookies(res, accessToken, newRefreshToken);

    logger.security(`Token refreshed: ${user.email}`);

    sendSuccessResponse(res, {
      accessToken,
      refreshToken: newRefreshToken
    }, 'Token refreshed successfully');

  } catch (error) {
    logger.error('Token refresh error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return sendErrorResponse(res, 'Refresh token expired', 401, 'TokenExpiredError');
    }
    
    if (error.name === 'JsonWebTokenError') {
      return sendErrorResponse(res, 'Invalid refresh token', 401, 'InvalidTokenError');
    }
    
    sendErrorResponse(res, 'Token refresh failed', 500, 'ServerError');
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    sendSuccessResponse(res, { user }, 'User retrieved successfully');

  } catch (error) {
    logger.error('Get current user error:', error);
    sendErrorResponse(res, 'Failed to get user information', 500, 'ServerError');
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendErrorResponse(res, 'Current password and new password are required', 400, 'ValidationError');
    }

    // Validate new password strength
    if (newPassword.length < authConfig.password.minLength) {
      return sendErrorResponse(res, `Password must be at least ${authConfig.password.minLength} characters long`, 400, 'ValidationError');
    }

    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return sendErrorResponse(res, 'Current password is incorrect', 400, 'ValidationError');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, authConfig.password.bcryptRounds);
    user.password = hashedPassword;
    await user.save();

    logger.security(`Password changed: ${user.email}`);

    sendSuccessResponse(res, null, 'Password changed successfully');

  } catch (error) {
    logger.error('Change password error:', error);
    sendErrorResponse(res, 'Failed to change password', 500, 'ServerError');
  }
};

/**
 * @desc    Verify token
 * @route   POST /api/v1/auth/verify
 * @access  Public
 */
const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return sendErrorResponse(res, 'Token is required', 400, 'ValidationError');
    }

    const decoded = jwt.verify(token, authConfig.jwt.secret, {
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
      algorithms: ['HS256']
    });

    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return sendErrorResponse(res, 'Invalid token', 401, 'AuthenticationError');
    }

    sendSuccessResponse(res, { user }, 'Token is valid');

  } catch (error) {
    logger.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return sendErrorResponse(res, 'Token expired', 401, 'TokenExpiredError');
    }
    
    if (error.name === 'JsonWebTokenError') {
      return sendErrorResponse(res, 'Invalid token', 401, 'InvalidTokenError');
    }
    
    sendErrorResponse(res, 'Token verification failed', 500, 'ServerError');
  }
};

module.exports = {
  login,
  logout,
  refreshToken,
  getCurrentUser,
  changePassword,
  verifyToken,
  generateTokens,
  setAuthCookies,
  clearAuthCookies
};
