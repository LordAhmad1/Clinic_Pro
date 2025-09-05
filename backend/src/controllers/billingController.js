/**
 * Billing Controller
 * Handles billing-related operations
 */

const Billing = require('../models/Billing');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
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
  logger.error('Billing Controller Error:', error);
  res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || 'Internal server error',
      statusCode
    }
  });
};

/**
 * @desc    Get all billing records
 * @route   GET /api/v1/billing
 * @access  Private
 */
const getAllBilling = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, patientId, dateFrom, dateTo } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (patientId) query.patient = patientId;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    const billing = await Billing.find(query)
      .populate('patient', 'name nationalId phone')
      .populate('appointment', 'appointmentDate appointmentTime')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Billing.countDocuments(query);
    
    sendSuccessResponse(res, {
      billing,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    }, 'Billing records retrieved successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Get billing by ID
 * @route   GET /api/v1/billing/:id
 * @access  Private
 */
const getBillingById = async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.id)
      .populate('patient', 'name nationalId phone email')
      .populate('appointment', 'appointmentDate appointmentTime reason')
      .populate('createdBy', 'firstName lastName');
    
    if (!billing) {
      return sendErrorResponse(res, { message: 'Billing record not found' }, 404);
    }
    
    sendSuccessResponse(res, { billing }, 'Billing record retrieved successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Create new billing record
 * @route   POST /api/v1/billing
 * @access  Private
 */
const createBilling = async (req, res) => {
  try {
    const billingData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const billing = new Billing(billingData);
    await billing.save();
    
    const populatedBilling = await Billing.findById(billing._id)
      .populate('patient', 'name nationalId phone')
      .populate('appointment', 'appointmentDate appointmentTime');
    
    sendSuccessResponse(res, { billing: populatedBilling }, 'Billing record created successfully', 201);
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Update billing record
 * @route   PUT /api/v1/billing/:id
 * @access  Private
 */
const updateBilling = async (req, res) => {
  try {
    const billing = await Billing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('patient', 'name nationalId phone')
     .populate('appointment', 'appointmentDate appointmentTime');
    
    if (!billing) {
      return sendErrorResponse(res, { message: 'Billing record not found' }, 404);
    }
    
    sendSuccessResponse(res, { billing }, 'Billing record updated successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Delete billing record
 * @route   DELETE /api/v1/billing/:id
 * @access  Private
 */
const deleteBilling = async (req, res) => {
  try {
    const billing = await Billing.findByIdAndDelete(req.params.id);
    
    if (!billing) {
      return sendErrorResponse(res, { message: 'Billing record not found' }, 404);
    }
    
    sendSuccessResponse(res, {}, 'Billing record deleted successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Get billing by patient
 * @route   GET /api/v1/billing/patient/:patientId
 * @access  Private
 */
const getBillingByPatient = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { patient: req.params.patientId };
    if (status) query.status = status;
    
    const billing = await Billing.find(query)
      .populate('appointment', 'appointmentDate appointmentTime reason')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Billing.countDocuments(query);
    
    sendSuccessResponse(res, {
      billing,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    }, 'Patient billing records retrieved successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Update payment status
 * @route   PATCH /api/v1/billing/:id/payment
 * @access  Private
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { status, paymentMethod, paymentDate } = req.body;
    
    const billing = await Billing.findByIdAndUpdate(
      req.params.id,
      {
        status,
        paymentMethod,
        paymentDate: paymentDate || new Date(),
        updatedBy: req.user.id
      },
      { new: true, runValidators: true }
    ).populate('patient', 'name nationalId phone');
    
    if (!billing) {
      return sendErrorResponse(res, { message: 'Billing record not found' }, 404);
    }
    
    sendSuccessResponse(res, { billing }, 'Payment status updated successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Generate invoice
 * @route   GET /api/v1/billing/:id/invoice
 * @access  Private
 */
const generateInvoice = async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.id)
      .populate('patient', 'name nationalId phone email address')
      .populate('appointment', 'appointmentDate appointmentTime reason')
      .populate('createdBy', 'firstName lastName');
    
    if (!billing) {
      return sendErrorResponse(res, { message: 'Billing record not found' }, 404);
    }
    
    // Generate invoice data
    const invoice = {
      invoiceNumber: billing.invoiceNumber,
      patient: billing.patient,
      appointment: billing.appointment,
      items: billing.items,
      subtotal: billing.subtotal,
      tax: billing.tax,
      discount: billing.discount,
      total: billing.total,
      status: billing.status,
      dueDate: billing.dueDate,
      createdAt: billing.createdAt
    };
    
    sendSuccessResponse(res, { invoice }, 'Invoice generated successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

module.exports = {
  getAllBilling,
  getBillingById,
  createBilling,
  updateBilling,
  deleteBilling,
  getBillingByPatient,
  updatePaymentStatus,
  generateInvoice
};
