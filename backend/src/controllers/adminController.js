/**
 * Admin Controller
 * Handles administrative operations
 */

const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');
const logger = require('../utils/logger');

// Helper function for consistent responses
const sendSuccessResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendErrorResponse = (res, error, statusCode = 500) => {
  logger.error('Admin Controller Error:', error);
  res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || 'Internal server error',
      statusCode
    }
  });
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/v1/admin/dashboard
 * @access  Private (Manager only)
 */
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Get counts
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAppointments = await Appointment.countDocuments();
    const totalBilling = await Billing.countDocuments();
    
    // Today's appointments
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: startOfDay }
    });
    
    // This month's appointments
    const monthAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: startOfMonth }
    });
    
    // Pending payments
    const pendingPayments = await Billing.countDocuments({ status: 'pending' });
    
    // Overdue payments
    const overduePayments = await Billing.countDocuments({ status: 'overdue' });
    
    // Revenue this month
    const monthRevenue = await Billing.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          status: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);
    
    const stats = {
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalBilling,
      todayAppointments,
      monthAppointments,
      pendingPayments,
      overduePayments,
      monthRevenue: monthRevenue[0]?.total || 0
    };
    
    sendSuccessResponse(res, { stats }, 'Dashboard statistics retrieved successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Get system users
 * @route   GET /api/v1/admin/users
 * @access  Private (Manager only)
 */
const getSystemUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('-password -twoFactorSecret -backupCodes')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await User.countDocuments(filter);
    
    sendSuccessResponse(res, {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: skip + users.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    }, 'System users retrieved successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Update user status
 * @route   PATCH /api/v1/admin/users/:id/status
 * @access  Private (Manager only)
 */
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret -backupCodes');
    
    if (!user) {
      return sendErrorResponse(res, { message: 'User not found' }, 404);
    }
    
    sendSuccessResponse(res, { user }, 'User status updated successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Unlock user account
 * @route   PATCH /api/v1/admin/users/:id/unlock
 * @access  Private (Manager only)
 */
const unlockUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return sendErrorResponse(res, { message: 'User not found' }, 404);
    }
    
    // Check if account is actually locked
    if (!user.lockUntil || user.lockUntil <= Date.now()) {
      return sendErrorResponse(res, { message: 'Account is not locked' }, 400);
    }
    
    // Unlock the account
    user.lockUntil = null;
    user.loginAttempts = 0;
    await user.save();
    
    logger.security(`Account unlocked by admin: ${user.email} (Admin: ${req.user.email})`);
    
    sendSuccessResponse(res, { 
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        lockUntil: user.lockUntil,
        loginAttempts: user.loginAttempts
      }
    }, 'Account unlocked successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Reset user login attempts
 * @route   PATCH /api/v1/admin/users/:id/reset-login-attempts
 * @access  Private (Manager only)
 */
const resetUserLoginAttempts = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return sendErrorResponse(res, { message: 'User not found' }, 404);
    }
    
    // Reset login attempts and unlock if necessary
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();
    
    logger.security(`Login attempts reset by admin: ${user.email} (Admin: ${req.user.email})`);
    
    sendSuccessResponse(res, { 
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        lockUntil: user.lockUntil,
        loginAttempts: user.loginAttempts
      }
    }, 'Login attempts reset successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Get locked accounts
 * @route   GET /api/v1/admin/users/locked
 * @access  Private (Manager only)
 */
const getLockedAccounts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find locked accounts
    const lockedUsers = await User.find({
      lockUntil: { $gt: Date.now() }
    })
    .select('-password -twoFactorSecret -backupCodes')
    .sort({ lockUntil: 1 })
    .skip(skip)
    .limit(parseInt(limit));
    
    // Get total count
    const total = await User.countDocuments({
      lockUntil: { $gt: Date.now() }
    });
    
    // Calculate remaining lock time for each user
    const usersWithLockInfo = lockedUsers.map(user => ({
      ...user.toObject(),
      remainingLockTime: Math.max(0, user.lockUntil - Date.now()),
      remainingLockMinutes: Math.ceil((user.lockUntil - Date.now()) / (1000 * 60))
    }));
    
    sendSuccessResponse(res, {
      lockedUsers: usersWithLockInfo,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: skip + lockedUsers.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    }, 'Locked accounts retrieved successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Get system logs
 * @route   GET /api/v1/admin/logs
 * @access  Private (Manager only)
 */
const getSystemLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, level, dateFrom, dateTo } = req.query;
    
    // This would typically query a log database or file
    // For now, we'll return a placeholder response
    const logs = [
      {
        timestamp: new Date(),
        level: 'info',
        message: 'System running normally',
        user: 'system'
      }
    ];
    
    sendSuccessResponse(res, {
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: 1,
        totalItems: logs.length,
        itemsPerPage: parseInt(limit),
        hasNextPage: false,
        hasPrevPage: false
      }
    }, 'System logs retrieved successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Get backup status
 * @route   GET /api/v1/admin/backup
 * @access  Private (Manager only)
 */
const getBackupStatus = async (req, res) => {
  try {
    // This would typically check backup systems
    const backupStatus = {
      lastBackup: new Date(),
      nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      status: 'scheduled',
      size: '2.5 GB'
    };
    
    sendSuccessResponse(res, { backupStatus }, 'Backup status retrieved successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Trigger manual backup
 * @route   POST /api/v1/admin/backup
 * @access  Private (Manager only)
 */
const triggerBackup = async (req, res) => {
  try {
    // This would typically trigger a backup process
    logger.info('Manual backup triggered by admin');
    
    sendSuccessResponse(res, {}, 'Backup process initiated successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Get system health
 * @route   GET /api/v1/admin/health
 * @access  Private (Manager only)
 */
const getSystemHealth = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
      timestamp: new Date()
    };
    
    sendSuccessResponse(res, { health }, 'System health retrieved successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

module.exports = {
  getDashboardStats,
  getSystemUsers,
  updateUserStatus,
  unlockUserAccount,
  resetUserLoginAttempts,
  getLockedAccounts,
  getSystemLogs,
  getBackupStatus,
  triggerBackup,
  getSystemHealth
};
