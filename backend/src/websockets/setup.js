/**
 * WebSocket Setup
 * Real-time communication for notifications, chat, and live updates
 */

const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;

const setupWebSockets = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:4200",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const cleanToken = token.replace('Bearer ', '');
      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
      
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      socket.userEmail = decoded.email;
      
      next();
    } catch (error) {
      logger.error('WebSocket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`WebSocket connected: User ${socket.userId} (${socket.userEmail})`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);
    
    // Join role-based rooms
    socket.join(`role:${socket.userRole}`);
    
    // Join admin room if user is manager
    if (socket.userRole === 'manager') {
      socket.join('admin');
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`WebSocket disconnected: User ${socket.userId}`);
    });

    // Handle join room
    socket.on('join-room', (room) => {
      socket.join(room);
      logger.info(`User ${socket.userId} joined room: ${room}`);
    });

    // Handle leave room
    socket.on('leave-room', (room) => {
      socket.leave(room);
      logger.info(`User ${socket.userId} left room: ${room}`);
    });

    // Handle private messages
    socket.on('private-message', (data) => {
      const { recipientId, message } = data;
      io.to(`user:${recipientId}`).emit('private-message', {
        senderId: socket.userId,
        senderName: socket.userEmail,
        message,
        timestamp: new Date()
      });
    });

    // Handle appointment notifications
    socket.on('appointment-update', (data) => {
      const { appointmentId, action, details } = data;
      io.to('admin').emit('appointment-update', {
        appointmentId,
        action,
        details,
        updatedBy: socket.userId,
        timestamp: new Date()
      });
    });

    // Handle patient updates
    socket.on('patient-update', (data) => {
      const { patientId, action, details } = data;
      io.to('admin').emit('patient-update', {
        patientId,
        action,
        details,
        updatedBy: socket.userId,
        timestamp: new Date()
      });
    });
  });

  logger.info('WebSocket server initialized successfully');
};

// Utility functions for sending notifications
const sendNotification = (userId, notification) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date()
    });
  }
};

const sendToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  }
};

const sendToAll = (event, data) => {
  if (io) {
    io.emit(event, {
      ...data,
      timestamp: new Date()
    });
  }
};

const sendToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, {
      ...data,
      timestamp: new Date()
    });
  }
};

module.exports = {
  setupWebSockets,
  sendNotification,
  sendToRole,
  sendToAll,
  sendToRoom
};
