/**
 * Prescription Routes
 * API endpoints for prescription management
 */

const express = require('express');
const router = express.Router();
const prescriptionController = require('../../controllers/prescriptionController');
const { authenticateToken, requireDoctor, requireSecretary } = require('../../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Medication:
 *       type: object
 *       required:
 *         - name
 *         - dosage
 *       properties:
 *         name:
 *           type: string
 *           description: Medication name
 *         dosage:
 *           type: string
 *           description: Medication dosage
 *         frequency:
 *           type: string
 *           description: How often to take
 *         duration:
 *           type: string
 *           description: How long to take
 *         instructions:
 *           type: string
 *           description: Special instructions
 *         scanCount:
 *           type: number
 *           description: Number of times QR code was scanned
 *         lastScanned:
 *           type: string
 *           format: date-time
 *           description: Last scan timestamp
 *     Prescription:
 *       type: object
 *       required:
 *         - patientId
 *         - doctorId
 *         - doctorName
 *         - diagnosis
 *         - medications
 *       properties:
 *         patientId:
 *           type: string
 *           description: Patient ID
 *         doctorId:
 *           type: string
 *           description: Doctor ID
 *         doctorName:
 *           type: string
 *           description: Doctor name
 *         date:
 *           type: string
 *           format: date
 *           description: Prescription date
 *         diagnosis:
 *           type: string
 *           description: Medical diagnosis
 *         instructions:
 *           type: string
 *           description: General instructions
 *         medications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Medication'
 *         qrSettings:
 *           type: object
 *           properties:
 *             maxMedications:
 *               type: number
 *               default: 6
 *             maxScanCount:
 *               type: number
 *               default: 2
 *             qrCodeWidth:
 *               type: number
 *               default: 300
 *             qrCodeMargin:
 *               type: number
 *               default: 2
 *         language:
 *           type: string
 *           enum: [en, ar]
 *           default: en
 *         notes:
 *           type: string
 *           description: Additional notes
 */

/**
 * @swagger
 * /api/v1/prescriptions:
 *   post:
 *     summary: Create a new prescription
 *     description: Create a new prescription with medications and QR settings
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Prescription'
 *     responses:
 *       201:
 *         description: Prescription created successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Patient or doctor not found
 */
router.post('/',
  authenticateToken,
  requireDoctor,
  prescriptionController.createPrescription
);

/**
 * @swagger
 * /api/v1/prescriptions/patient/{patientId}:
 *   get:
 *     summary: Get prescriptions for a patient
 *     description: Retrieve all prescriptions for a specific patient
 *     tags: [Prescriptions]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, cancelled, expired]
 *         description: Filter by prescription status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of prescriptions to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Prescriptions retrieved successfully
 *       404:
 *         description: Patient not found
 */
router.get('/patient/:patientId',
  authenticateToken,
  prescriptionController.getPatientPrescriptions
);

/**
 * @swagger
 * /api/v1/prescriptions/{id}:
 *   get:
 *     summary: Get a specific prescription
 *     description: Retrieve a specific prescription by ID
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Prescription retrieved successfully
 *       404:
 *         description: Prescription not found
 */
router.get('/:id',
  authenticateToken,
  prescriptionController.getPrescription
);

/**
 * @swagger
 * /api/v1/prescriptions/{id}:
 *   put:
 *     summary: Update a prescription
 *     description: Update an existing prescription
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Prescription'
 *     responses:
 *       200:
 *         description: Prescription updated successfully
 *       404:
 *         description: Prescription not found
 */
router.put('/:id',
  authenticateToken,
  requireDoctor,
  prescriptionController.updatePrescription
);

/**
 * @swagger
 * /api/v1/prescriptions/{id}:
 *   delete:
 *     summary: Delete a prescription
 *     description: Delete a prescription
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Prescription deleted successfully
 *       404:
 *         description: Prescription not found
 */
router.delete('/:id',
  authenticateToken,
  requireDoctor,
  prescriptionController.deletePrescription
);

/**
 * @swagger
 * /api/v1/prescriptions/{id}/scan:
 *   post:
 *     summary: Increment prescription scan count
 *     description: Increment the scan count when QR code is scanned
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Scan count incremented successfully
 *       400:
 *         description: Scan limit reached
 *       404:
 *         description: Prescription not found
 */
router.post('/:id/scan',
  authenticateToken,
  prescriptionController.incrementScanCount
);

/**
 * @swagger
 * /api/v1/prescriptions/{id}/medications/{medicationId}/scan:
 *   post:
 *     summary: Increment medication scan count
 *     description: Increment the scan count for a specific medication
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription ID
 *       - in: path
 *         name: medicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Medication ID
 *     responses:
 *       200:
 *         description: Medication scan count incremented successfully
 *       400:
 *         description: Scan limit reached
 *       404:
 *         description: Prescription or medication not found
 */
router.post('/:id/medications/:medicationId/scan',
  authenticateToken,
  prescriptionController.incrementMedicationScanCount
);

/**
 * @swagger
 * /api/v1/prescriptions/date-range:
 *   get:
 *     summary: Get prescriptions by date range
 *     description: Retrieve prescriptions within a specific date range
 *     tags: [Prescriptions]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, cancelled, expired]
 *         description: Filter by prescription status
 *     responses:
 *       200:
 *         description: Prescriptions retrieved successfully
 *       400:
 *         description: Start date and end date are required
 */
router.get('/date-range',
  authenticateToken,
  prescriptionController.getPrescriptionsByDateRange
);

/**
 * @swagger
 * /api/v1/prescriptions/stats:
 *   get:
 *     summary: Get prescription statistics
 *     description: Retrieve prescription statistics and analytics
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics (YYYY-MM-DD)
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: Filter by doctor ID
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats',
  authenticateToken,
  requireSecretary,
  prescriptionController.getPrescriptionStats
);

module.exports = router;
