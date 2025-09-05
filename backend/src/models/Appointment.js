/**
 * Appointment Model
 * Medical appointment scheduling and management
 */

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Patient Information
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
  
  // Appointment Details
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  
  duration: {
    type: Number,
    default: 30, // minutes
    min: [15, 'Duration must be at least 15 minutes'],
    max: [180, 'Duration cannot exceed 3 hours']
  },
  
  // Appointment Type and Status
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'routine', 'specialist'],
    default: 'consultation'
  },
  
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  
  // Medical Information
  reason: {
    type: String,
    required: [true, 'Appointment reason is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  
  symptoms: [{
    type: String,
    maxlength: [200, 'Symptom description cannot exceed 200 characters']
  }],
  
  // Notes and Documentation
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  diagnosis: {
    type: String,
    maxlength: [500, 'Diagnosis cannot exceed 500 characters']
  },
  
  prescription: {
    type: String,
    maxlength: [1000, 'Prescription cannot exceed 1000 characters']
  },
  
  // Follow-up Information
  followUpRequired: {
    type: Boolean,
    default: false
  },
  
  followUpDate: {
    type: Date
  },
  
  // Financial Information
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'waived'],
    default: 'pending'
  },
  
  // Reminders and Notifications
  reminderSent: {
    type: Boolean,
    default: false
  },
  
  reminderDate: {
    type: Date
  },
  
  // Created and Updated Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full appointment time
appointmentSchema.virtual('fullDateTime').get(function() {
  if (!this.appointmentDate || !this.appointmentTime) return null;
  
  const date = new Date(this.appointmentDate);
  const [hours, minutes] = this.appointmentTime.split(':');
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  return date;
});

// Virtual for end time
appointmentSchema.virtual('endTime').get(function() {
  if (!this.appointmentTime || !this.duration) return null;
  
  const [hours, minutes] = this.appointmentTime.split(':');
  const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
  const endMinutes = startMinutes + this.duration;
  
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
});

// Virtual for appointment status
appointmentSchema.virtual('isUpcoming').get(function() {
  if (!this.appointmentDate || !this.appointmentTime) return false;
  
  const now = new Date();
  const appointmentDateTime = this.fullDateTime;
  
  return appointmentDateTime > now && this.status === 'scheduled';
});

// Virtual for appointment status
appointmentSchema.virtual('isOverdue').get(function() {
  if (!this.appointmentDate || !this.appointmentTime) return false;
  
  const now = new Date();
  const appointmentDateTime = this.fullDateTime;
  
  return appointmentDateTime < now && this.status === 'scheduled';
});

// Indexes for better performance
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ createdBy: 1 });
appointmentSchema.index({ createdAt: -1 });

// Compound indexes
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });

// Pre-save middleware to set reminder date
appointmentSchema.pre('save', function(next) {
  if (this.isModified('appointmentDate') && this.appointmentDate) {
    // Set reminder for 24 hours before appointment
    const reminderDate = new Date(this.appointmentDate);
    reminderDate.setDate(reminderDate.getDate() - 1);
    this.reminderDate = reminderDate;
  }
  next();
});

// Static method to find appointments by date range
appointmentSchema.statics.findByDateRange = function(startDate, endDate, doctorId = null) {
  const query = {
    appointmentDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  if (doctorId) query.doctor = doctorId;
  
  return this.find(query)
    .populate('patient', 'name nationalId phone')
    .populate('doctor', 'firstName lastName email')
    .sort({ appointmentDate: 1, appointmentTime: 1 });
};

// Static method to find today's appointments
appointmentSchema.statics.findToday = function(doctorId = null) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  const query = {
    appointmentDate: { $gte: startOfDay, $lt: endOfDay }
  };
  
  if (doctorId) query.doctor = doctorId;
  
  return this.find(query)
    .populate('patient', 'name nationalId phone')
    .populate('doctor', 'firstName lastName email')
    .sort({ appointmentTime: 1 });
};

// Static method to find upcoming appointments
appointmentSchema.statics.findUpcoming = function(patientId = null, limit = 10) {
  const now = new Date();
  
  const query = {
    appointmentDate: { $gte: now },
    status: { $in: ['scheduled', 'confirmed'] }
  };
  
  if (patientId) query.patient = patientId;
  
  return this.find(query)
    .populate('patient', 'name nationalId phone')
    .populate('doctor', 'firstName lastName email')
    .sort({ appointmentDate: 1, appointmentTime: 1 })
    .limit(limit);
};

// Instance method to check for conflicts
appointmentSchema.methods.hasConflict = async function() {
  const startTime = this.fullDateTime;
  const endTime = new Date(startTime.getTime() + this.duration * 60000);
  
  const conflictingAppointment = await this.constructor.findOne({
    doctor: this.doctor,
    _id: { $ne: this._id },
    appointmentDate: this.appointmentDate,
    status: { $in: ['scheduled', 'confirmed'] },
    $or: [
      {
        appointmentTime: {
          $lt: this.endTime,
          $gte: this.appointmentTime
        }
      },
      {
        $expr: {
          $and: [
            { $lt: ['$appointmentTime', this.endTime] },
            { $gte: ['$appointmentTime', this.appointmentTime] }
          ]
        }
      }
    ]
  });
  
  return conflictingAppointment;
};

// Instance method to update status
appointmentSchema.methods.updateStatus = function(newStatus, updatedBy) {
  this.status = newStatus;
  this.updatedBy = updatedBy;
  return this.save();
};

module.exports = mongoose.model('Appointment', appointmentSchema);
