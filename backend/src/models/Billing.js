/**
 * Billing Model
 * Medical billing and invoicing management
 */

const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  // Invoice Information
  invoiceNumber: {
    type: String,
    required: true
  },
  
  // Patient Information
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required']
  },
  
  // Appointment Information
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  
  // Billing Items
  items: [{
    description: {
      type: String,
      required: [true, 'Item description is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    total: {
      type: Number,
      required: [true, 'Item total is required'],
      min: [0, 'Item total cannot be negative']
    }
  }],
  
  // Financial Information
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  
  total: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total cannot be negative']
  },
  
  // Payment Information
  status: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'overdue', 'cancelled'],
    default: 'pending'
  },
  
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'insurance', 'other'],
    default: 'cash'
  },
  
  paymentDate: {
    type: Date
  },
  
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  
  // Insurance Information
  insuranceProvider: {
    type: String,
    maxlength: [100, 'Insurance provider name cannot exceed 100 characters']
  },
  
  insurancePolicyNumber: {
    type: String,
    maxlength: [50, 'Policy number cannot exceed 50 characters']
  },
  
  insuranceCoverage: {
    type: Number,
    min: [0, 'Insurance coverage cannot be negative'],
    max: [100, 'Insurance coverage cannot exceed 100%']
  },
  
  // Notes and Comments
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
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

// Virtual for amount paid
billingSchema.virtual('amountPaid').get(function() {
  if (this.status === 'paid') {
    return this.total;
  } else if (this.status === 'partial') {
    // This would need to be calculated based on payment history
    return 0;
  }
  return 0;
});

// Virtual for outstanding amount
billingSchema.virtual('outstandingAmount').get(function() {
  return this.total - this.amountPaid;
});

// Virtual for days overdue
billingSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'overdue' && this.dueDate) {
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    const diffTime = today - dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
  return 0;
});

// Virtual for is overdue
billingSchema.virtual('isOverdue').get(function() {
  if (this.status === 'pending' && this.dueDate) {
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    return today > dueDate;
  }
  return false;
});

// Indexes for better performance
billingSchema.index({ patient: 1 });
billingSchema.index({ appointment: 1 });
billingSchema.index({ status: 1 });
billingSchema.index({ dueDate: 1 });
billingSchema.index({ createdBy: 1 });
billingSchema.index({ createdAt: -1 });
billingSchema.index({ invoiceNumber: 1 }, { unique: true });

// Compound indexes
billingSchema.index({ patient: 1, status: 1 });
billingSchema.index({ status: 1, dueDate: 1 });
billingSchema.index({ createdBy: 1, createdAt: -1 });

// Pre-save middleware to generate invoice number
billingSchema.pre('save', async function(next) {
  if (this.isNew && !this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Get count of invoices for this month
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), 1),
        $lt: new Date(year, date.getMonth() + 1, 1)
      }
    });
    
    this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  
  // Calculate totals if items are modified
  if (this.isModified('items')) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
    this.total = this.subtotal + this.tax - this.discount;
  }
  
  next();
});

// Pre-save middleware to update status based on due date
billingSchema.pre('save', function(next) {
  if (this.isModified('dueDate') || this.isModified('status')) {
    if (this.status === 'pending' && this.dueDate) {
      const today = new Date();
      const dueDate = new Date(this.dueDate);
      if (today > dueDate) {
        this.status = 'overdue';
      }
    }
  }
  next();
});

// Static method to find overdue bills
billingSchema.statics.findOverdue = function() {
  const today = new Date();
  return this.find({
    status: 'pending',
    dueDate: { $lt: today }
  }).populate('patient', 'name nationalId phone');
};

// Static method to find bills by date range
billingSchema.statics.findByDateRange = function(startDate, endDate, status = null) {
  const query = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  if (status) query.status = status;
  
  return this.find(query)
    .populate('patient', 'name nationalId phone')
    .populate('appointment', 'appointmentDate appointmentTime')
    .sort({ createdAt: -1 });
};

// Static method to get billing statistics
billingSchema.statics.getStatistics = async function(startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' },
        averageAmount: { $avg: '$total' }
      }
    }
  ]);
  
  return stats;
};

// Instance method to mark as paid
billingSchema.methods.markAsPaid = function(paymentMethod, paymentDate = new Date()) {
  this.status = 'paid';
  this.paymentMethod = paymentMethod;
  this.paymentDate = paymentDate;
  return this.save();
};

// Instance method to apply discount
billingSchema.methods.applyDiscount = function(discountAmount) {
  if (discountAmount > this.subtotal) {
    throw new Error('Discount cannot exceed subtotal');
  }
  
  this.discount = discountAmount;
  this.total = this.subtotal + this.tax - this.discount;
  return this.save();
};

module.exports = mongoose.model('Billing', billingSchema);
