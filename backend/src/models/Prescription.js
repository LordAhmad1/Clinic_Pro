/**
 * Prescription Model
 * Complete prescription information with medications and QR tracking
 */

const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true,
    maxlength: [100, 'Medication name cannot exceed 100 characters']
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true,
    maxlength: [50, 'Dosage cannot exceed 50 characters']
  },
  frequency: {
    type: String,
    trim: true,
    maxlength: [100, 'Frequency cannot exceed 100 characters']
  },
  duration: {
    type: String,
    trim: true,
    maxlength: [100, 'Duration cannot exceed 100 characters']
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Instructions cannot exceed 500 characters']
  },
  qrCode: {
    type: String,
    default: null
  },
  scanCount: {
    type: Number,
    default: 0,
    min: [0, 'Scan count cannot be negative']
  },
  lastScanned: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const prescriptionSchema = new mongoose.Schema({
  // Patient Reference
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required']
  },

  // Doctor Information
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor is required']
  },
  doctorName: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true,
    maxlength: [100, 'Doctor name cannot exceed 100 characters']
  },

  // Prescription Details
  date: {
    type: Date,
    required: [true, 'Prescription date is required'],
    default: Date.now
  },
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    trim: true,
    maxlength: [500, 'Diagnosis cannot exceed 500 characters']
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Instructions cannot exceed 1000 characters']
  },

  // Medications
  medications: [medicationSchema],

  // QR Code Settings
  qrSettings: {
    maxMedications: {
      type: Number,
      default: 6,
      min: [1, 'Max medications must be at least 1'],
      max: [20, 'Max medications cannot exceed 20']
    },
    maxScanCount: {
      type: Number,
      default: 2,
      min: [1, 'Max scan count must be at least 1'],
      max: [100, 'Max scan count cannot exceed 100']
    },
    qrCodeWidth: {
      type: Number,
      default: 300,
      min: [100, 'QR code width must be at least 100'],
      max: [1000, 'QR code width cannot exceed 1000']
    },
    qrCodeMargin: {
      type: Number,
      default: 2,
      min: [0, 'QR code margin cannot be negative'],
      max: [10, 'QR code margin cannot exceed 10']
    }
  },

  // Scan Tracking
  scanCount: {
    type: Number,
    default: 0,
    min: [0, 'Scan count cannot be negative']
  },
  lastScanned: {
    type: Date,
    default: null
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active'
  },

  // Language
  language: {
    type: String,
    enum: ['en', 'ar'],
    default: 'en'
  },

  // Notes
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total medications
prescriptionSchema.virtual('medicationCount').get(function() {
  return this.medications.length;
});

// Virtual for is scan limit reached
prescriptionSchema.virtual('isScanLimitReached').get(function() {
  return this.scanCount >= this.qrSettings.maxScanCount;
});

// Virtual for scans remaining
prescriptionSchema.virtual('scansRemaining').get(function() {
  return Math.max(0, this.qrSettings.maxScanCount - this.scanCount);
});

// Indexes for better performance
prescriptionSchema.index({ patient: 1 });
prescriptionSchema.index({ doctor: 1 });
prescriptionSchema.index({ date: -1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ createdAt: -1 });

// Compound indexes
prescriptionSchema.index({ patient: 1, date: -1 });
prescriptionSchema.index({ doctor: 1, date: -1 });
prescriptionSchema.index({ status: 1, date: -1 });

// Pre-save middleware
prescriptionSchema.pre('save', function(next) {
  // Update scan count if medications have been scanned
  if (this.medications.length > 0) {
    const totalScans = this.medications.reduce((sum, med) => sum + (med.scanCount || 0), 0);
    this.scanCount = totalScans;
  }
  next();
});

// Static method to find by patient
prescriptionSchema.statics.findByPatient = function(patientId) {
  return this.find({ patient: patientId }).populate('patient doctor').sort({ date: -1 });
};

// Static method to find active prescriptions
prescriptionSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).populate('patient doctor');
};

// Static method to find by date range
prescriptionSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('patient doctor');
};

// Instance method to increment scan count
prescriptionSchema.methods.incrementScanCount = function() {
  this.scanCount += 1;
  this.lastScanned = new Date();
  return this.save();
};

// Instance method to increment medication scan count
prescriptionSchema.methods.incrementMedicationScanCount = function(medicationId) {
  const medication = this.medications.id(medicationId);
  if (medication) {
    medication.scanCount += 1;
    medication.lastScanned = new Date();
    this.lastScanned = new Date();
    return this.save();
  }
  throw new Error('Medication not found');
};

// Instance method to add medication
prescriptionSchema.methods.addMedication = function(medication) {
  this.medications.push(medication);
  return this.save();
};

// Instance method to remove medication
prescriptionSchema.methods.removeMedication = function(medicationId) {
  this.medications = this.medications.filter(med => med._id.toString() !== medicationId);
  return this.save();
};

module.exports = mongoose.model('Prescription', prescriptionSchema);
