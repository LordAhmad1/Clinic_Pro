/**
 * Prescription Controller
 * Handle prescription CRUD operations and QR code management
 */

const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Create a new prescription
 */
const createPrescription = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      doctorName,
      date,
      diagnosis,
      instructions,
      medications,
      qrSettings,
      language,
      notes
    } = req.body;

    // Validate required fields
    if (!patientId || !doctorId || !doctorName || !diagnosis || !medications || medications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID, doctor ID, doctor name, diagnosis, and at least one medication are required'
      });
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Create prescription
    const prescription = new Prescription({
      patient: patientId,
      doctor: doctorId,
      doctorName,
      date: date || new Date(),
      diagnosis,
      instructions,
      medications,
      qrSettings: qrSettings || {
        maxMedications: 6,
        maxScanCount: 2,
        qrCodeWidth: 300,
        qrCodeMargin: 2
      },
      language: language || 'en',
      notes
    });

    await prescription.save();

    // Populate patient and doctor info
    await prescription.populate('patient doctor');

    logger.info(`Prescription created: ${prescription._id} for patient: ${patientId}`);

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: prescription
    });

  } catch (error) {
    logger.error('Error creating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get all prescriptions for a patient
 */
const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, limit = 50, page = 1 } = req.query;

    // Validate patient ID
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Build query
    const query = { patient: patientId };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get prescriptions
    const prescriptions = await Prescription.find(query)
      .populate('patient doctor')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const total = await Prescription.countDocuments(query);

    logger.info(`Retrieved ${prescriptions.length} prescriptions for patient: ${patientId}`);

    res.status(200).json({
      success: true,
      message: 'Prescriptions retrieved successfully',
      data: prescriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Error getting patient prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get a specific prescription
 */
const getPrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id)
      .populate('patient doctor');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Prescription retrieved successfully',
      data: prescription
    });

  } catch (error) {
    logger.error('Error getting prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Update a prescription
 */
const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Update prescription
    Object.assign(prescription, updateData);
    await prescription.save();

    // Populate patient and doctor info
    await prescription.populate('patient doctor');

    logger.info(`Prescription updated: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Prescription updated successfully',
      data: prescription
    });

  } catch (error) {
    logger.error('Error updating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Delete a prescription
 */
const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    await Prescription.findByIdAndDelete(id);

    logger.info(`Prescription deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Increment prescription scan count
 */
const incrementScanCount = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check if scan limit reached
    if (prescription.isScanLimitReached) {
      return res.status(400).json({
        success: false,
        message: 'Scan limit reached for this prescription'
      });
    }

    await prescription.incrementScanCount();

    logger.info(`Prescription scan count incremented: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Scan count incremented successfully',
      data: {
        scanCount: prescription.scanCount,
        maxScanCount: prescription.qrSettings.maxScanCount,
        scansRemaining: prescription.scansRemaining
      }
    });

  } catch (error) {
    logger.error('Error incrementing scan count:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Increment medication scan count
 */
const incrementMedicationScanCount = async (req, res) => {
  try {
    const { id, medicationId } = req.params;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    const medication = prescription.medications.id(medicationId);
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    // Check if scan limit reached
    if (medication.scanCount >= prescription.qrSettings.maxScanCount) {
      return res.status(400).json({
        success: false,
        message: 'Scan limit reached for this medication'
      });
    }

    await prescription.incrementMedicationScanCount(medicationId);

    logger.info(`Medication scan count incremented: ${medicationId} in prescription: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Medication scan count incremented successfully',
      data: {
        medicationId,
        scanCount: medication.scanCount,
        maxScanCount: prescription.qrSettings.maxScanCount,
        scansRemaining: prescription.qrSettings.maxScanCount - medication.scanCount
      }
    });

  } catch (error) {
    logger.error('Error incrementing medication scan count:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get prescriptions by date range
 */
const getPrescriptionsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, doctorId, status } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    // Build query
    const query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (doctorId) {
      query.doctor = doctorId;
    }

    if (status) {
      query.status = status;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient doctor')
      .sort({ date: -1 });

    logger.info(`Retrieved ${prescriptions.length} prescriptions for date range: ${startDate} to ${endDate}`);

    res.status(200).json({
      success: true,
      message: 'Prescriptions retrieved successfully',
      data: prescriptions
    });

  } catch (error) {
    logger.error('Error getting prescriptions by date range:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get prescription statistics
 */
const getPrescriptionStats = async (req, res) => {
  try {
    const { startDate, endDate, doctorId } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Build doctor filter
    const doctorFilter = doctorId ? { doctor: doctorId } : {};

    // Combine filters
    const filter = { ...dateFilter, ...doctorFilter };

    // Get statistics
    const stats = await Prescription.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalPrescriptions: { $sum: 1 },
          totalMedications: { $sum: { $size: '$medications' } },
          totalScans: { $sum: '$scanCount' },
          averageMedicationsPerPrescription: { $avg: { $size: '$medications' } },
          averageScansPerPrescription: { $avg: '$scanCount' }
        }
      }
    ]);

    // Get status distribution
    const statusStats = await Prescription.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top prescribed medications
    const topMedications = await Prescription.aggregate([
      { $match: filter },
      { $unwind: '$medications' },
      {
        $group: {
          _id: '$medications.name',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const result = {
      summary: stats[0] || {
        totalPrescriptions: 0,
        totalMedications: 0,
        totalScans: 0,
        averageMedicationsPerPrescription: 0,
        averageScansPerPrescription: 0
      },
      statusDistribution: statusStats,
      topMedications
    };

    res.status(200).json({
      success: true,
      message: 'Prescription statistics retrieved successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error getting prescription statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createPrescription,
  getPatientPrescriptions,
  getPrescription,
  updatePrescription,
  deletePrescription,
  incrementScanCount,
  incrementMedicationScanCount,
  getPrescriptionsByDateRange,
  getPrescriptionStats
};
