/**
 * Doctor Controller
 * Handles doctor-related operations
 */

const User = require('../models/User');
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
  logger.error('Doctor Controller Error:', error);
  res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || 'Internal server error',
      statusCode
    }
  });
};

/**
 * @desc    Get all doctors
 * @route   GET /api/v1/doctors
 * @access  Private
 */
const getAllDoctors = async (req, res) => {
  try {
    const { page = 1, limit = 10, specialization, isActive } = req.query;
    
    const query = { role: 'doctor' };
    if (specialization) query.specialization = specialization;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const doctors = await User.find(query)
      .select('-password -twoFactorSecret -backupCodes')
      .populate('specialization', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    sendSuccessResponse(res, {
      doctors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    }, 'Doctors retrieved successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Get doctor by ID
 * @route   GET /api/v1/doctors/:id
 * @access  Private
 */
const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' })
      .select('-password -twoFactorSecret -backupCodes')
      .populate('specialization', 'name');
    
    if (!doctor) {
      return sendErrorResponse(res, { message: 'Doctor not found' }, 404);
    }
    
    sendSuccessResponse(res, { doctor }, 'Doctor retrieved successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Create new doctor
 * @route   POST /api/v1/doctors
 * @access  Private (Manager only)
 */
const createDoctor = async (req, res) => {
  try {
    const doctorData = {
      ...req.body,
      role: 'doctor'
    };
    
    const doctor = new User(doctorData);
    await doctor.save();
    
    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;
    delete doctorResponse.twoFactorSecret;
    delete doctorResponse.backupCodes;
    
    sendSuccessResponse(res, { doctor: doctorResponse }, 'Doctor created successfully', 201);
    
  } catch (error) {
    if (error.code === 11000) {
      return sendErrorResponse(res, { message: 'Doctor with this email or license number already exists' }, 400);
    }
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Update doctor
 * @route   PUT /api/v1/doctors/:id
 * @access  Private (Manager only)
 */
const updateDoctor = async (req, res) => {
  try {
    const doctor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'doctor' },
      req.body,
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret -backupCodes');
    
    if (!doctor) {
      return sendErrorResponse(res, { message: 'Doctor not found' }, 404);
    }
    
    sendSuccessResponse(res, { doctor }, 'Doctor updated successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Delete doctor
 * @route   DELETE /api/v1/doctors/:id
 * @access  Private (Manager only)
 */
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await User.findOneAndDelete({ _id: req.params.id, role: 'doctor' });
    
    if (!doctor) {
      return sendErrorResponse(res, { message: 'Doctor not found' }, 404);
    }
    
    sendSuccessResponse(res, {}, 'Doctor deleted successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Search doctors
 * @route   GET /api/v1/doctors/search
 * @access  Private
 */
const searchDoctors = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return sendErrorResponse(res, { message: 'Search query is required' }, 400);
    }
    
    const doctors = await User.find({
      role: 'doctor',
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { licenseNumber: { $regex: q, $options: 'i' } }
      ]
    })
    .select('-password -twoFactorSecret -backupCodes')
    .populate('specialization', 'name')
    .limit(20);
    
    sendSuccessResponse(res, { doctors }, 'Doctors search completed');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  searchDoctors
};
