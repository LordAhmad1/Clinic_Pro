/**
 * Global Error Handler Middleware
 * Professional error handling with detailed logging and appropriate responses
 */

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  logger.error('❌ Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      statusCode: 404,
      type: 'CastError'
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}`;
    error = {
      message,
      statusCode: 400,
      type: 'DuplicateKeyError'
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400,
      type: 'ValidationError'
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      message,
      statusCode: 401,
      type: 'JWTError'
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      message,
      statusCode: 401,
      type: 'TokenExpiredError'
    };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = {
      message,
      statusCode: 400,
      type: 'FileSizeError'
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = {
      message,
      statusCode: 400,
      type: 'FileFieldError'
    };
  }

  // Rate limit errors
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = {
      message,
      statusCode: 429,
      type: 'RateLimitError'
    };
  }

  // Default error
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || err.message || 'Server Error';

  // Security: Don't expose internal errors in production
  const responseMessage = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : message;

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: responseMessage,
      type: error.type || 'ServerError',
      statusCode,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: error
      })
    },
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  });
};

module.exports = errorHandler;
