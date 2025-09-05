/**
 * Billing Routes
 * CRUD operations for billing management
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Import controllers and middleware
const billingController = require('../../controllers/billingController');
const { authenticateToken, requireSecretary } = require('../../middleware/auth');
const { validateRequest } = require('../../middleware/validation');

// Validation schemas
const createBillingValidation = [
  body('patient')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  body('appointment')
    .optional()
    .isMongoId()
    .withMessage('Valid appointment ID is required'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one billing item is required'),
  body('items.*.description')
    .notEmpty()
    .withMessage('Item description is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required')
];

// Routes

/**
 * @swagger
 * /billing:
 *   get:
 *     summary: Get all billing records with pagination and filtering
 *     description: Retrieve a list of billing records with optional filtering and pagination
 *     tags: [Billing]
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
 *           enum: [pending, paid, partial, overdue, cancelled]
 *         description: Filter by payment status
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter by patient ID
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
 *         description: Billing records retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/',
  authenticateToken,
  requireSecretary,
  billingController.getAllBilling
);

/**
 * @swagger
 * /billing/{id}:
 *   get:
 *     summary: Get billing record by ID
 *     description: Retrieve a specific billing record by its ID
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Billing record ID
 *     responses:
 *       200:
 *         description: Billing record retrieved successfully
 *       404:
 *         description: Billing record not found
 */
router.get('/:id',
  authenticateToken,
  requireSecretary,
  billingController.getBillingById
);

/**
 * @swagger
 * /billing:
 *   post:
 *     summary: Create a new billing record
 *     description: Create a new billing record for a patient
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patient, items, dueDate]
 *             properties:
 *               patient:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               appointment:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439012
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                       example: Consultation fee
 *                     quantity:
 *                       type: number
 *                       example: 1
 *                     unitPrice:
 *                       type: number
 *                       example: 100.00
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-02-15
 *               notes:
 *                 type: string
 *                 example: Standard consultation fee
 *     responses:
 *       201:
 *         description: Billing record created successfully
 *       400:
 *         description: Validation error
 */
router.post('/',
  authenticateToken,
  requireSecretary,
  createBillingValidation,
  validateRequest,
  billingController.createBilling
);

/**
 * @swagger
 * /billing/{id}:
 *   put:
 *     summary: Update billing record
 *     description: Update an existing billing record
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Billing record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *               dueDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Billing record updated successfully
 *       404:
 *         description: Billing record not found
 */
router.put('/:id',
  authenticateToken,
  requireSecretary,
  billingController.updateBilling
);

/**
 * @swagger
 * /billing/{id}:
 *   delete:
 *     summary: Delete billing record
 *     description: Delete a billing record
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Billing record ID
 *     responses:
 *       200:
 *         description: Billing record deleted successfully
 *       404:
 *         description: Billing record not found
 */
router.delete('/:id',
  authenticateToken,
  requireSecretary,
  billingController.deleteBilling
);

/**
 * @swagger
 * /billing/patient/{patientId}:
 *   get:
 *     summary: Get billing records by patient
 *     description: Retrieve all billing records for a specific patient
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
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
 *           enum: [pending, paid, partial, overdue, cancelled]
 *         description: Filter by payment status
 *     responses:
 *       200:
 *         description: Patient billing records retrieved successfully
 */
router.get('/patient/:patientId',
  authenticateToken,
  requireSecretary,
  billingController.getBillingByPatient
);

/**
 * @swagger
 * /billing/{id}/payment:
 *   patch:
 *     summary: Update payment status
 *     description: Update the payment status of a billing record
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Billing record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, paid, partial, overdue, cancelled]
 *                 example: paid
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, credit_card, debit_card, bank_transfer, insurance, other]
 *                 example: credit_card
 *               paymentDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-15T10:30:00Z
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *       404:
 *         description: Billing record not found
 */
router.patch('/:id/payment',
  authenticateToken,
  requireSecretary,
  billingController.updatePaymentStatus
);

/**
 * @swagger
 * /billing/{id}/invoice:
 *   get:
 *     summary: Generate invoice
 *     description: Generate an invoice for a billing record
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Billing record ID
 *     responses:
 *       200:
 *         description: Invoice generated successfully
 *       404:
 *         description: Billing record not found
 */
router.get('/:id/invoice',
  authenticateToken,
  requireSecretary,
  billingController.generateInvoice
);

module.exports = router;
