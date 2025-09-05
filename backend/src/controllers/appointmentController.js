/**
 * Appointment Controller
 * Handles appointment-related operations
 */

const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
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
  logger.error('Appointment Controller Error:', error);
  res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || 'Internal server error',
      statusCode
    }
  });
};

/**
 * @desc    Get all appointments
 * @route   GET /api/v1/appointments
 * @access  Private
 */
const getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, doctorId, patientId, date } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (doctorId) query.doctor = doctorId;
    if (patientId) query.patient = patientId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.appointmentDate = { $gte: startDate, $lt: endDate };
    }
    
    const appointments = await Appointment.find(query)
      .populate('patient', 'name nationalId phone')
      .populate('doctor', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appointmentDate: 1 });
    
    const total = await Appointment.countDocuments(query);
    
    sendSuccessResponse(res, {
      appointments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    }, 'Appointments retrieved successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Get appointment by ID
 * @route   GET /api/v1/appointments/:id
 * @access  Private
 */
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name nationalId phone email')
      .populate('doctor', 'firstName lastName email specialization');
    
    if (!appointment) {
      return sendErrorResponse(res, { message: 'Appointment not found' }, 404);
    }
    
    sendSuccessResponse(res, { appointment }, 'Appointment retrieved successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Create new appointment
 * @route   POST /api/v1/appointments
 * @access  Private
 */
const createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name nationalId phone')
      .populate('doctor', 'firstName lastName email');
    
    sendSuccessResponse(res, { appointment: populatedAppointment }, 'Appointment created successfully', 201);
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Update appointment
 * @route   PUT /api/v1/appointments/:id
 * @access  Private
 */
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('patient', 'name nationalId phone')
     .populate('doctor', 'firstName lastName email');
    
    if (!appointment) {
      return sendErrorResponse(res, { message: 'Appointment not found' }, 404);
    }
    
    sendSuccessResponse(res, { appointment }, 'Appointment updated successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Delete appointment
 * @route   DELETE /api/v1/appointments/:id
 * @access  Private
 */
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    
    if (!appointment) {
      return sendErrorResponse(res, { message: 'Appointment not found' }, 404);
    }
    
    sendSuccessResponse(res, {}, 'Appointment deleted successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Get appointments by date range
 * @route   GET /api/v1/appointments/date-range
 * @access  Private
 */
const getAppointmentsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, doctorId } = req.query;
    
    if (!startDate || !endDate) {
      return sendErrorResponse(res, { message: 'Start date and end date are required' }, 400);
    }
    
    const query = {
      appointmentDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    if (doctorId) query.doctor = doctorId;
    
    const appointments = await Appointment.find(query)
      .populate('patient', 'name nationalId phone')
      .populate('doctor', 'firstName lastName email')
      .sort({ appointmentDate: 1 });
    
    sendSuccessResponse(res, { appointments }, 'Appointments retrieved successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Get today's appointments
 * @route   GET /api/v1/appointments/today
 * @access  Private
 */
const getTodayAppointments = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const appointments = await Appointment.find({
      appointmentDate: { $gte: startOfDay, $lt: endOfDay }
    })
    .populate('patient', 'name nationalId phone')
    .populate('doctor', 'firstName lastName email')
    .sort({ appointmentDate: 1 });
    
    sendSuccessResponse(res, { appointments }, 'Today\'s appointments retrieved successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByDateRange,
  getTodayAppointments
};
