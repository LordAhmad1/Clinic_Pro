/**
 * Patient Controller
 * Handles patient-related operations
 */

const Patient = require('../models/Patient');
const logger = require('../utils/logger');

// Helper function to send success response
const sendSuccessResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Helper function to send error response
const sendErrorResponse = (res, message, statusCode = 400, type = 'Error') => {
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      type
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * @desc    Get all patients with pagination and filtering
 * @route   GET /api/v1/patients
 * @access  Private
 */
const getAllPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const gender = req.query.gender;
    const bloodType = req.query.bloodType;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (gender) filter.gender = gender;
    if (bloodType) filter.bloodType = bloodType;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get patients with pagination
    const patients = await Patient.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Get total count for pagination
    const total = await Patient.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    logger.api(`Patients retrieved: ${patients.length} patients, page ${page}`);

    sendSuccessResponse(res, {
      patients,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      }
    }, 'Patients retrieved successfully');

  } catch (error) {
    logger.error('Get all patients error:', error);
    sendErrorResponse(res, 'Failed to retrieve patients', 500, 'ServerError');
  }
};

/**
 * @desc    Create a new patient
 * @route   POST /api/v1/patients
 * @access  Private
 */
const createPatient = async (req, res) => {
  try {
    const {
      name,
      nationalId,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      bloodType,
      height,
      weight,
      occupation,
      maritalStatus,
      insuranceProvider,
      insuranceNumber
    } = req.body;

    // Check if patient with national ID already exists
    const existingPatient = await Patient.findByNationalId(nationalId);
    if (existingPatient) {
      return sendErrorResponse(res, 'Patient with this national ID already exists', 400, 'DuplicatePatientError');
    }

    // Create new patient
    const patient = new Patient({
      name,
      nationalId,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      bloodType,
      height,
      weight,
      occupation,
      maritalStatus,
      insuranceProvider,
      insuranceNumber
    });

    await patient.save();

    logger.api(`New patient created: ${patient.name} (ID: ${patient._id})`);

    sendSuccessResponse(res, { patient }, 'Patient created successfully', 201);

  } catch (error) {
    logger.error('Create patient error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return sendErrorResponse(res, `${field} already exists`, 400, 'DuplicateFieldError');
    }
    
    sendErrorResponse(res, 'Failed to create patient', 500, 'ServerError');
  }
};

/**
 * @desc    Get patient by ID
 * @route   GET /api/v1/patients/:id
 * @access  Private
 */
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id)
      .populate('medications.prescribedBy', 'firstName lastName')
      .select('-__v');

    if (!patient) {
      return sendErrorResponse(res, 'Patient not found', 404, 'PatientNotFoundError');
    }

    logger.api(`Patient retrieved: ${patient.name} (ID: ${patient._id})`);

    sendSuccessResponse(res, { patient }, 'Patient retrieved successfully');

  } catch (error) {
    logger.error('Get patient by ID error:', error);
    sendErrorResponse(res, 'Failed to retrieve patient', 500, 'ServerError');
  }
};

/**
 * @desc    Update patient
 * @route   PUT /api/v1/patients/:id
 * @access  Private
 */
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const patient = await Patient.findById(id);
    if (!patient) {
      return sendErrorResponse(res, 'Patient not found', 404, 'PatientNotFoundError');
    }

    // Update patient fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        patient[key] = updateData[key];
      }
    });

    await patient.save();

    logger.api(`Patient updated: ${patient.name} (ID: ${patient._id})`);

    sendSuccessResponse(res, { patient }, 'Patient updated successfully');

  } catch (error) {
    logger.error('Update patient error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return sendErrorResponse(res, `${field} already exists`, 400, 'DuplicateFieldError');
    }
    
    sendErrorResponse(res, 'Failed to update patient', 500, 'ServerError');
  }
};

/**
 * @desc    Delete patient
 * @route   DELETE /api/v1/patients/:id
 * @access  Private
 */
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id);
    if (!patient) {
      return sendErrorResponse(res, 'Patient not found', 404, 'PatientNotFoundError');
    }

    // Soft delete - change status to inactive
    patient.status = 'inactive';
    await patient.save();

    logger.api(`Patient deleted: ${patient.name} (ID: ${patient._id})`);

    sendSuccessResponse(res, null, 'Patient deleted successfully');

  } catch (error) {
    logger.error('Delete patient error:', error);
    sendErrorResponse(res, 'Failed to delete patient', 500, 'ServerError');
  }
};

/**
 * @desc    Search patients
 * @route   GET /api/v1/patients/search
 * @access  Private
 */
const searchPatients = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!q) {
      return sendErrorResponse(res, 'Search query is required', 400, 'ValidationError');
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Search patients
    const patients = await Patient.search(q)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Get total count for pagination
    const total = await Patient.search(q).countDocuments();

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    logger.api(`Patient search: "${q}" returned ${patients.length} results`);

    sendSuccessResponse(res, {
      patients,
      searchQuery: q,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      }
    }, 'Search completed successfully');

  } catch (error) {
    logger.error('Search patients error:', error);
    sendErrorResponse(res, 'Failed to search patients', 500, 'ServerError');
  }
};

/**
 * @desc    Upload patient photo
 * @route   POST /api/v1/patients/:id/photo
 * @access  Private
 */
const uploadPatientPhoto = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id);
    if (!patient) {
      return sendErrorResponse(res, 'Patient not found', 404, 'PatientNotFoundError');
    }

    // TODO: Implement file upload logic with Multer and Cloudinary
    // For now, just return success
    logger.api(`Photo upload requested for patient: ${patient.name} (ID: ${patient._id})`);

    sendSuccessResponse(res, null, 'Photo upload endpoint ready for implementation');

  } catch (error) {
    logger.error('Upload patient photo error:', error);
    sendErrorResponse(res, 'Failed to upload photo', 500, 'ServerError');
  }
};

/**
 * @desc    Add medical condition to patient
 * @route   POST /api/v1/patients/:id/medical-condition
 * @access  Private
 */
const addMedicalCondition = async (req, res) => {
  try {
    const { id } = req.params;
    const { condition, diagnosedDate, status, notes } = req.body;

    const patient = await Patient.findById(id);
    if (!patient) {
      return sendErrorResponse(res, 'Patient not found', 404, 'PatientNotFoundError');
    }

    // Add medical condition
    await patient.addMedicalCondition({
      condition,
      diagnosedDate: diagnosedDate || new Date(),
      status: status || 'active',
      notes
    });

    logger.api(`Medical condition added to patient: ${patient.name} (ID: ${patient._id})`);

    sendSuccessResponse(res, { patient }, 'Medical condition added successfully');

  } catch (error) {
    logger.error('Add medical condition error:', error);
    sendErrorResponse(res, 'Failed to add medical condition', 500, 'ServerError');
  }
};

/**
 * @desc    Add medication to patient
 * @route   POST /api/v1/patients/:id/medication
 * @access  Private
 */
const addMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dosage, frequency, startDate, endDate, notes } = req.body;

    const patient = await Patient.findById(id);
    if (!patient) {
      return sendErrorResponse(res, 'Patient not found', 404, 'PatientNotFoundError');
    }

    // Add medication
    await patient.addMedication({
      name,
      dosage,
      frequency,
      startDate: startDate || new Date(),
      endDate,
      prescribedBy: req.user.id,
      notes
    });

    logger.api(`Medication added to patient: ${patient.name} (ID: ${patient._id})`);

    sendSuccessResponse(res, { patient }, 'Medication added successfully');

  } catch (error) {
    logger.error('Add medication error:', error);
    sendErrorResponse(res, 'Failed to add medication', 500, 'ServerError');
  }
};

/**
 * @desc    Add allergy to patient
 * @route   POST /api/v1/patients/:id/allergy
 * @access  Private
 */
const addAllergy = async (req, res) => {
  try {
    const { id } = req.params;
    const { allergen, severity, notes } = req.body;

    const patient = await Patient.findById(id);
    if (!patient) {
      return sendErrorResponse(res, 'Patient not found', 404, 'PatientNotFoundError');
    }

    // Add allergy
    await patient.addAllergy({
      allergen,
      severity,
      notes
    });

    logger.api(`Allergy added to patient: ${patient.name} (ID: ${patient._id})`);

    sendSuccessResponse(res, { patient }, 'Allergy added successfully');

  } catch (error) {
    logger.error('Add allergy error:', error);
    sendErrorResponse(res, 'Failed to add allergy', 500, 'ServerError');
  }
};

module.exports = {
  getAllPatients,
  createPatient,
  getPatientById,
  updatePatient,
  deletePatient,
  searchPatients,
  uploadPatientPhoto,
  addMedicalCondition,
  addMedication,
  addAllergy
};
