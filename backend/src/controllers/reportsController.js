/**
 * Reports Controller
 * Handles reporting and analytics operations
 */

const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');
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
  logger.error('Reports Controller Error:', error);
  res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || 'Internal server error',
      statusCode
    }
  });
};

/**
 * @desc    Get appointment reports
 * @route   GET /api/v1/reports/appointments
 * @access  Private
 */
const getAppointmentReports = async (req, res) => {
  try {
    const { startDate, endDate, doctorId, status } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (doctorId) query.doctor = doctorId;
    if (status) query.status = status;
    
    const appointments = await Appointment.find(query)
      .populate('patient', 'name nationalId')
      .populate('doctor', 'firstName lastName')
      .sort({ appointmentDate: 1 });
    
    // Group by status
    const statusStats = appointments.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {});
    
    // Group by doctor
    const doctorStats = appointments.reduce((acc, appointment) => {
      const doctorName = `${appointment.doctor.firstName} ${appointment.doctor.lastName}`;
      acc[doctorName] = (acc[doctorName] || 0) + 1;
      return acc;
    }, {});
    
    // Group by date
    const dateStats = appointments.reduce((acc, appointment) => {
      const date = appointment.appointmentDate.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    const report = {
      totalAppointments: appointments.length,
      statusStats,
      doctorStats,
      dateStats,
      appointments
    };
    
    sendSuccessResponse(res, { report }, 'Appointment report generated successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Get billing reports
 * @route   GET /api/v1/reports/billing
 * @access  Private
 */
const getBillingReports = async (req, res) => {
  try {
    const { startDate, endDate, status, paymentMethod } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    
    const billing = await Billing.find(query)
      .populate('patient', 'name nationalId')
      .populate('appointment', 'appointmentDate appointmentTime')
      .sort({ createdAt: -1 });
    
    // Calculate totals
    const totalRevenue = billing.reduce((sum, bill) => sum + bill.total, 0);
    const paidRevenue = billing
      .filter(bill => bill.status === 'paid')
      .reduce((sum, bill) => sum + bill.total, 0);
    const pendingRevenue = billing
      .filter(bill => bill.status === 'pending')
      .reduce((sum, bill) => sum + bill.total, 0);
    
    // Group by status
    const statusStats = billing.reduce((acc, bill) => {
      acc[bill.status] = (acc[bill.status] || 0) + 1;
      return acc;
    }, {});
    
    // Group by payment method
    const paymentMethodStats = billing.reduce((acc, bill) => {
      acc[bill.paymentMethod] = (acc[bill.paymentMethod] || 0) + 1;
      return acc;
    }, {});
    
    // Group by date
    const dateStats = billing.reduce((acc, bill) => {
      const date = bill.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + bill.total;
      return acc;
    }, {});
    
    const report = {
      totalBills: billing.length,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      statusStats,
      paymentMethodStats,
      dateStats,
      billing
    };
    
    sendSuccessResponse(res, { report }, 'Billing report generated successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Get patient reports
 * @route   GET /api/v1/reports/patients
 * @access  Private
 */
const getPatientReports = async (req, res) => {
  try {
    const { startDate, endDate, gender, bloodType, status } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (gender) query.gender = gender;
    if (bloodType) query.bloodType = bloodType;
    if (status) query.status = status;
    
    const patients = await Patient.find(query).sort({ createdAt: -1 });
    
    // Group by gender
    const genderStats = patients.reduce((acc, patient) => {
      acc[patient.gender] = (acc[patient.gender] || 0) + 1;
      return acc;
    }, {});
    
    // Group by blood type
    const bloodTypeStats = patients.reduce((acc, patient) => {
      acc[patient.bloodType] = (acc[patient.bloodType] || 0) + 1;
      return acc;
    }, {});
    
    // Group by age
    const ageStats = patients.reduce((acc, patient) => {
      const age = Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));
      const ageGroup = age < 18 ? '0-17' : age < 30 ? '18-29' : age < 50 ? '30-49' : age < 65 ? '50-64' : '65+';
      acc[ageGroup] = (acc[ageGroup] || 0) + 1;
      return acc;
    }, {});
    
    // Group by date
    const dateStats = patients.reduce((acc, patient) => {
      const date = patient.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    const report = {
      totalPatients: patients.length,
      genderStats,
      bloodTypeStats,
      ageStats,
      dateStats,
      patients
    };
    
    sendSuccessResponse(res, { report }, 'Patient report generated successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Get doctor performance reports
 * @route   GET /api/v1/reports/doctors
 * @access  Private
 */
const getDoctorReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateQuery = {};
    if (startDate && endDate) {
      dateQuery.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Get all doctors
    const doctors = await User.find({ role: 'doctor' })
      .select('firstName lastName email specialization')
      .sort({ firstName: 1 });
    
    // Get appointments for each doctor
    const doctorStats = await Promise.all(
      doctors.map(async (doctor) => {
        const appointments = await Appointment.find({
          doctor: doctor._id,
          ...dateQuery
        });
        
        const completedAppointments = appointments.filter(apt => apt.status === 'completed');
        const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled');
        
        // Get billing for this doctor's appointments
        const appointmentIds = appointments.map(apt => apt._id);
        const billing = await Billing.find({
          appointment: { $in: appointmentIds }
        });
        
        const totalRevenue = billing.reduce((sum, bill) => sum + bill.total, 0);
        const paidRevenue = billing
          .filter(bill => bill.status === 'paid')
          .reduce((sum, bill) => sum + bill.total, 0);
        
        return {
          doctor: {
            id: doctor._id,
            name: `${doctor.firstName} ${doctor.lastName}`,
            email: doctor.email,
            specialization: doctor.specialization
          },
          totalAppointments: appointments.length,
          completedAppointments: completedAppointments.length,
          cancelledAppointments: cancelledAppointments.length,
          completionRate: appointments.length > 0 ? (completedAppointments.length / appointments.length) * 100 : 0,
          totalRevenue,
          paidRevenue
        };
      })
    );
    
    const report = {
      totalDoctors: doctors.length,
      doctorStats
    };
    
    sendSuccessResponse(res, { report }, 'Doctor performance report generated successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * @desc    Get financial reports
 * @route   GET /api/v1/reports/financial
 * @access  Private
 */
const getFinancialReports = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;
    
    const dateQuery = {};
    if (startDate && endDate) {
      dateQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const billing = await Billing.find(dateQuery)
      .populate('patient', 'name')
      .populate('appointment', 'appointmentDate')
      .sort({ createdAt: 1 });
    
    // Group by time period
    const timeStats = billing.reduce((acc, bill) => {
      let timeKey;
      if (groupBy === 'day') {
        timeKey = bill.createdAt.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(bill.createdAt);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        timeKey = weekStart.toISOString().split('T')[0];
      } else {
        timeKey = `${bill.createdAt.getFullYear()}-${String(bill.createdAt.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!acc[timeKey]) {
        acc[timeKey] = {
          total: 0,
          paid: 0,
          pending: 0,
          count: 0
        };
      }
      
      acc[timeKey].total += bill.total;
      acc[timeKey].count += 1;
      
      if (bill.status === 'paid') {
        acc[timeKey].paid += bill.total;
      } else if (bill.status === 'pending') {
        acc[timeKey].pending += bill.total;
      }
      
      return acc;
    }, {});
    
    // Payment method breakdown
    const paymentMethodStats = billing.reduce((acc, bill) => {
      acc[bill.paymentMethod] = (acc[bill.paymentMethod] || 0) + bill.total;
      return acc;
    }, {});
    
    // Status breakdown
    const statusStats = billing.reduce((acc, bill) => {
      acc[bill.status] = (acc[bill.status] || 0) + bill.total;
      return acc;
    }, {});
    
    const totalRevenue = billing.reduce((sum, bill) => sum + bill.total, 0);
    const paidRevenue = billing
      .filter(bill => bill.status === 'paid')
      .reduce((sum, bill) => sum + bill.total, 0);
    const pendingRevenue = billing
      .filter(bill => bill.status === 'pending')
      .reduce((sum, bill) => sum + bill.total, 0);
    
    const report = {
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      timeStats,
      paymentMethodStats,
      statusStats,
      billing
    };
    
    sendSuccessResponse(res, { report }, 'Financial report generated successfully');
    
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

module.exports = {
  getAppointmentReports,
  getBillingReports,
  getPatientReports,
  getDoctorReports,
  getFinancialReports
};
