/**
 * Doctor Routes
 * CRUD operations for doctor management
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Import controllers and middleware
const doctorController = require('../../controllers/doctorController');
const { authenticateToken, requireManager } = require('../../middleware/auth');
const { validateRequest } = require('../../middleware/validation');

// Validation schemas
const createDoctorValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('specialization')
    .notEmpty()
    .withMessage('Specialization is required'),
  body('licenseNumber')
    .notEmpty()
    .withMessage('License number is required'),
  body('experience')
    .isInt({ min: 0 })
    .withMessage('Experience must be a positive number'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please enter a valid date of birth'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other')
];

// Routes

/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: Get all doctors with pagination and filtering
 *     description: Retrieve a list of doctors with optional filtering and pagination
 *     tags: [Doctors]
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
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Filter by specialization
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Doctors retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/',
  authenticateToken,
  doctorController.getAllDoctors
);

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     description: Retrieve a specific doctor by their ID
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor retrieved successfully
 *       404:
 *         description: Doctor not found
 */
router.get('/:id',
  authenticateToken,
  doctorController.getDoctorById
);

/**
 * @swagger
 * /doctors:
 *   post:
 *     summary: Create a new doctor
 *     description: Create a new doctor account
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, phone, password, specialization, licenseNumber, experience, dateOfBirth, gender]
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               password:
 *                 type: string
 *                 example: Password123!
 *               specialization:
 *                 type: string
 *                 example: Cardiology
 *               licenseNumber:
 *                 type: string
 *                 example: MD123456
 *               experience:
 *                 type: number
 *                 example: 10
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: 1980-01-01
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: male
 *     responses:
 *       201:
 *         description: Doctor created successfully
 *       400:
 *         description: Validation error
 */
router.post('/',
  authenticateToken,
  requireManager,
  createDoctorValidation,
  validateRequest,
  doctorController.createDoctor
);

/**
 * @swagger
 * /doctors/{id}:
 *   put:
 *     summary: Update doctor
 *     description: Update an existing doctor's information
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               specialization:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               experience:
 *                 type: number
 *     responses:
 *       200:
 *         description: Doctor updated successfully
 *       404:
 *         description: Doctor not found
 */
router.put('/:id',
  authenticateToken,
  requireManager,
  doctorController.updateDoctor
);

/**
 * @swagger
 * /doctors/{id}:
 *   delete:
 *     summary: Delete doctor
 *     description: Delete a doctor account
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor deleted successfully
 *       404:
 *         description: Doctor not found
 */
router.delete('/:id',
  authenticateToken,
  requireManager,
  doctorController.deleteDoctor
);

/**
 * @swagger
 * /doctors/search:
 *   get:
 *     summary: Search doctors
 *     description: Search doctors by name, email, or license number
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search completed successfully
 *       400:
 *         description: Search query is required
 */
router.get('/search',
  authenticateToken,
  doctorController.searchDoctors
);

module.exports = router;
