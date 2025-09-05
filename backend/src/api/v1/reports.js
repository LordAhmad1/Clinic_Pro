/**
 * Reports Routes
 * Reporting and analytics operations
 */

const express = require('express');
const router = express.Router();

// Import controllers and middleware
const reportsController = require('../../controllers/reportsController');
const { authenticateToken, requireManager } = require('../../middleware/auth');

// Routes

/**
 * @swagger
 * /reports/appointments:
 *   get:
 *     summary: Get appointment reports
 *     description: Generate comprehensive appointment reports with filtering options
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report period (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report period (YYYY-MM-DD)
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: Filter by specific doctor
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, confirmed, in-progress, completed, cancelled, no-show]
 *         description: Filter by appointment status
 *     responses:
 *       200:
 *         description: Appointment report generated successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/appointments',
  authenticateToken,
  requireManager,
  reportsController.getAppointmentReports
);

/**
 * @swagger
 * /reports/billing:
 *   get:
 *     summary: Get billing reports
 *     description: Generate comprehensive billing and revenue reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report period (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report period (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, partial, overdue, cancelled]
 *         description: Filter by payment status
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [cash, credit_card, debit_card, bank_transfer, insurance, other]
 *         description: Filter by payment method
 *     responses:
 *       200:
 *         description: Billing report generated successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/billing',
  authenticateToken,
  requireManager,
  reportsController.getBillingReports
);

/**
 * @swagger
 * /reports/patients:
 *   get:
 *     summary: Get patient reports
 *     description: Generate patient demographic and registration reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report period (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report period (YYYY-MM-DD)
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female, other]
 *         description: Filter by gender
 *       - in: query
 *         name: bloodType
 *         schema:
 *           type: string
 *           enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *         description: Filter by blood type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, deceased]
 *         description: Filter by patient status
 *     responses:
 *       200:
 *         description: Patient report generated successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/patients',
  authenticateToken,
  requireManager,
  reportsController.getPatientReports
);

/**
 * @swagger
 * /reports/doctors:
 *   get:
 *     summary: Get doctor performance reports
 *     description: Generate doctor performance and productivity reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report period (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report period (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Doctor performance report generated successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/doctors',
  authenticateToken,
  requireManager,
  reportsController.getDoctorReports
);

/**
 * @swagger
 * /reports/financial:
 *   get:
 *     summary: Get financial reports
 *     description: Generate comprehensive financial and revenue reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report period (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report period (YYYY-MM-DD)
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: month
 *         description: Group results by time period
 *     responses:
 *       200:
 *         description: Financial report generated successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/financial',
  authenticateToken,
  requireManager,
  reportsController.getFinancialReports
);

module.exports = router;
