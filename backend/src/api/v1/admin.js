/**
 * Admin Routes
 * Administrative operations and system management
 */

const express = require('express');
const router = express.Router();

// Import controllers and middleware
const adminController = require('../../controllers/adminController');
const { authenticateToken, requireManager } = require('../../middleware/auth');
const { adminSecurity } = require('../../middleware/adminSecurity');

// Routes

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieve comprehensive dashboard statistics for administrators
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Dashboard statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalPatients:
 *                           type: number
 *                           example: 150
 *                         totalDoctors:
 *                           type: number
 *                           example: 12
 *                         totalAppointments:
 *                           type: number
 *                           example: 450
 *                         totalBilling:
 *                           type: number
 *                           example: 380
 *                         todayAppointments:
 *                           type: number
 *                           example: 15
 *                         monthAppointments:
 *                           type: number
 *                           example: 120
 *                         pendingPayments:
 *                           type: number
 *                           example: 25
 *                         overduePayments:
 *                           type: number
 *                           example: 8
 *                         monthRevenue:
 *                           type: number
 *                           example: 25000.00
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Manager access required
 */
router.get('/dashboard',
  authenticateToken,
  requireManager,
  ...adminSecurity,
  adminController.getDashboardStats
);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get system users
 *     description: Retrieve all system users with pagination and filtering
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [manager, doctor, secretary, nurse]
 *         description: Filter by user role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: System users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Manager access required
 */
router.get('/users',
  authenticateToken,
  requireManager,
  adminController.getSystemUsers
);

/**
 * @swagger
 * /admin/users/{id}/status:
 *   patch:
 *     summary: Update user status
 *     description: Activate or deactivate a system user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Manager access required
 */
router.patch('/users/:id/status',
  authenticateToken,
  requireManager,
  adminController.updateUserStatus
);

/**
 * @swagger
 * /admin/users/{id}/unlock:
 *   patch:
 *     summary: Unlock user account
 *     description: Manually unlock a locked user account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Account unlocked successfully
 *       400:
 *         description: Account is not locked
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Manager access required
 */
router.patch('/users/:id/unlock',
  authenticateToken,
  requireManager,
  ...adminSecurity,
  adminController.unlockUserAccount
);

/**
 * @swagger
 * /admin/users/{id}/reset-login-attempts:
 *   patch:
 *     summary: Reset user login attempts
 *     description: Reset login attempts and unlock account if locked
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Login attempts reset successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Manager access required
 */
router.patch('/users/:id/reset-login-attempts',
  authenticateToken,
  requireManager,
  ...adminSecurity,
  adminController.resetUserLoginAttempts
);

/**
 * @swagger
 * /admin/users/locked:
 *   get:
 *     summary: Get locked accounts
 *     description: Retrieve all currently locked user accounts
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Locked accounts retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Manager access required
 */
router.get('/users/locked',
  authenticateToken,
  requireManager,
  ...adminSecurity,
  adminController.getLockedAccounts
);

/**
 * @swagger
 * /admin/logs:
 *   get:
 *     summary: Get system logs
 *     description: Retrieve system logs for monitoring and debugging
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of items per page
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info, debug]
 *         description: Filter by log level
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *     responses:
 *       200:
 *         description: System logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Manager access required
 */
router.get('/logs',
  authenticateToken,
  requireManager,
  adminController.getSystemLogs
);

/**
 * @swagger
 * /admin/backup:
 *   get:
 *     summary: Get backup status
 *     description: Retrieve current backup status and schedule
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup status retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Manager access required
 */
router.get('/backup',
  authenticateToken,
  requireManager,
  adminController.getBackupStatus
);

/**
 * @swagger
 * /admin/backup:
 *   post:
 *     summary: Trigger manual backup
 *     description: Initiate a manual backup process
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup process initiated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Manager access required
 */
router.post('/backup',
  authenticateToken,
  requireManager,
  adminController.triggerBackup
);

/**
 * @swagger
 * /admin/health:
 *   get:
 *     summary: Get system health
 *     description: Retrieve system health information and status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: System health retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     health:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: healthy
 *                         uptime:
 *                           type: number
 *                           example: 86400
 *                         memory:
 *                           type: object
 *                           properties:
 *                             rss:
 *                               type: number
 *                               example: 52428800
 *                             heapTotal:
 *                               type: number
 *                               example: 20971520
 *                             heapUsed:
 *                               type: number
 *                               example: 10485760
 *                         database:
 *                           type: string
 *                           example: connected
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Manager access required
 */
router.get('/health',
  authenticateToken,
  requireManager,
  adminController.getSystemHealth
);

module.exports = router;
