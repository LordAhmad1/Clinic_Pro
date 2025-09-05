/**
 * Database Configuration
 * MongoDB connection with professional error handling and monitoring
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? process.env.MONGODB_URI_PROD 
      : process.env.MONGODB_URI;

    if (!mongoURI) {
      console.log('⚠️ MongoDB URI not found in environment variables');
      console.log('💡 Using default local MongoDB URI: mongodb://localhost:27017/medical_clinic');
      console.log('💡 Create a .env file with MONGODB_URI=your_mongodb_connection_string');
      return null; // Don't throw error, just return null
    }

    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      autoIndex: process.env.NODE_ENV !== 'production', // Build indexes in development
      family: 4, // Use IPv4, skip trying IPv6
    };

    const conn = await mongoose.connect(mongoURI, options);

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Database connection event listeners
    mongoose.connection.on('connected', () => {
      logger.info('🎯 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });

    // Monitor database performance
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }

    return conn;

  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    throw error; // Re-throw instead of exiting process
  }
};

// Database health check
const checkDBHealth = async () => {
  try {
    const status = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      status: states[status] || 'unknown',
      readyState: status,
      isConnected: status === 1
    };
  } catch (error) {
    logger.error('❌ Database health check failed:', error);
    return {
      status: 'error',
      readyState: -1,
      isConnected: false,
      error: error.message
    };
  }
};

// Database statistics
const getDBStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize
    };
  } catch (error) {
    logger.error('❌ Failed to get database stats:', error);
    return null;
  }
};

module.exports = {
  connectDB,
  checkDBHealth,
  getDBStats
};
