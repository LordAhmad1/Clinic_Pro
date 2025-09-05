/**
 * Appointment Routes
 * CRUD operations for appointment management
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Import controllers and middleware
const appointmentController = require('../../controllers/appointmentController');
const { authenticateToken, requireSecretary } = require('../../middleware/auth');
const { validateRequest } = require('../../middleware/validation');

// Validation schemas
const createAppointmentValidation = [
  body('patient')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  body('doctor')
    .isMongoId()
    .withMessage('Valid doctor ID is required'),
  body('appointmentDate')
    .isISO8601()
    .withMessage('Valid appointment date is required'),
  body('appointmentTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid appointment time is required (HH:MM)'),
  body('reason')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters'),
  body('type')
    .optional()
    .isIn(['consultation', 'follow-up', 'emergency', 'routine', 'specialist'])
    .withMessage('Invalid appointment type'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage('Duration must be between 15 and 180 minutes')
];

// Routes

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments with pagination and filtering
 *     description: Retrieve a list of appointments with optional filtering and pagination
 *     tags: [Appointments]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, confirmed, in-progress, completed, cancelled, no-show]
 *         description: Filter by appointment status
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: Filter by doctor ID
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter by patient ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by appointment date
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/',
  authenticateToken,
  appointmentController.getAllAppointments
);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     description: Retrieve a specific appointment by its ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment retrieved successfully
 *       404:
 *         description: Appointment not found
 */
router.get('/:id',
  authenticateToken,
  appointmentController.getAppointmentById
);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     description: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patient, doctor, appointmentDate, appointmentTime, reason]
 *             properties:
 *               patient:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               doctor:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439012
 *               appointmentDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-15
 *               appointmentTime:
 *                 type: string
 *                 example: 14:30
 *               reason:
 *                 type: string
 *                 example: Regular checkup
 *               type:
 *                 type: string
 *                 enum: [consultation, follow-up, emergency, routine, specialist]
 *                 example: consultation
 *               duration:
 *                 type: number
 *                 example: 30
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [headache, fever]
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Validation error
 */
router.post('/',
  authenticateToken,
  requireSecretary,
  createAppointmentValidation,
  validateRequest,
  appointmentController.createAppointment
);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Update appointment
 *     description: Update an existing appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentDate:
 *                 type: string
 *                 format: date
 *               appointmentTime:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [scheduled, confirmed, in-progress, completed, cancelled, no-show]
 *               reason:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *               prescription:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       404:
 *         description: Appointment not found
 */
router.put('/:id',
  authenticateToken,
  requireSecretary,
  appointmentController.updateAppointment
);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Delete appointment
 *     description: Delete an appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       404:
 *         description: Appointment not found
 */
router.delete('/:id',
  authenticateToken,
  requireSecretary,
  appointmentController.deleteAppointment
);

/**
 * @swagger
 * /appointments/date-range:
 *   get:
 *     summary: Get appointments by date range
 *     description: Retrieve appointments within a specific date range
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: Filter by doctor ID
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *       400:
 *         description: Start date and end date are required
 */
router.get('/date-range',
  authenticateToken,
  appointmentController.getAppointmentsByDateRange
);

/**
 * @swagger
 * /appointments/today:
 *   get:
 *     summary: Get today's appointments
 *     description: Retrieve all appointments scheduled for today
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's appointments retrieved successfully
 */
router.get('/today',
  authenticateToken,
  appointmentController.getTodayAppointments
);

module.exports = router;
