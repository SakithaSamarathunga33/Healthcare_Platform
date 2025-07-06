import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 30, // Duration in minutes
    min: 15,
    max: 120
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'cancelled', 'completed', 'no-show', 'rescheduled', 'pending'],
    default: 'scheduled'
  },
  appointmentType: {
    type: String,
    enum: ['consultation', 'follow-up', 'checkup', 'emergency'],
    default: 'consultation'
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  symptoms: {
    type: String,
    required: true,
    maxlength: [1000, 'Symptoms description cannot be more than 1000 characters']
  },
  aiRecommendedSpecialty: {
    type: String,
    trim: true
  },
  aiAnalysis: {
    symptoms: String,
    recommendedSpecialty: String,
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    analysisDate: {
      type: Date,
      default: Date.now
    }
  },
  patientNotes: {
    type: String,
    maxlength: [500, 'Patient notes cannot be more than 500 characters']
  },
  doctorNotes: {
    type: String,
    maxlength: [1000, 'Doctor notes cannot be more than 1000 characters']
  },
  prescription: {
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    additionalInstructions: String
  },
  diagnosis: {
    primary: String,
    secondary: [String],
    icd10Code: String
  },
  vitals: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    bmi: Number,
    oxygenSaturation: Number
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  followUpNotes: String,
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  fee: {
    consultation: {
      type: Number,
      required: true,
      min: 0
    },
    additional: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'insurance', 'cash'],
      default: 'credit_card'
    },
    transactionId: String,
    paidAt: Date,
    refundedAt: Date,
    refundReason: String
  },
  rating: {
    patientRating: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      date: Date
    },
    doctorRating: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      date: Date
    }
  },
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin']
  },
  cancelledAt: Date,
  remindersSent: {
    type: Number,
    default: 0
  },
  lastReminderSent: Date,
  isEmergency: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for appointment end time
appointmentSchema.virtual('endDateTime').get(function() {
  const endTime = new Date(this.dateTime);
  endTime.setMinutes(endTime.getMinutes() + this.duration);
  return endTime;
});

// Virtual for formatted date
appointmentSchema.virtual('formattedDate').get(function() {
  return this.dateTime.toLocaleDateString();
});

// Virtual for formatted time
appointmentSchema.virtual('formattedTime').get(function() {
  return this.dateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
});

// Virtual for patient details
appointmentSchema.virtual('patientDetails', {
  ref: 'User',
  localField: 'patient',
  foreignField: '_id',
  justOne: true
});

// Virtual for doctor details
appointmentSchema.virtual('doctorDetails', {
  ref: 'User',
  localField: 'doctor',
  foreignField: '_id',
  justOne: true
});

// Indexes for better performance
appointmentSchema.index({ patient: 1, dateTime: 1 });
appointmentSchema.index({ doctor: 1, dateTime: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ dateTime: 1 });
appointmentSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate total fee
appointmentSchema.pre('save', function(next) {
  if (this.fee && this.fee.consultation !== undefined) {
    this.fee.total = this.fee.consultation + (this.fee.additional || 0);
  }
  next();
});

// Method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }

  const now = new Date();
  const hoursUntilAppointment = (this.dateTime - now) / (1000 * 60 * 60);

  // Allow cancellation if appointment is more than 24 hours away
  return hoursUntilAppointment > 24;
};

// Method to check if appointment can be rescheduled
appointmentSchema.methods.canBeRescheduled = function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }

  const now = new Date();
  const hoursUntilAppointment = (this.dateTime - now) / (1000 * 60 * 60);

  // Allow rescheduling if appointment is more than 48 hours away
  return hoursUntilAppointment > 48;
};

// Method to mark appointment as completed
appointmentSchema.methods.markCompleted = function() {
  this.status = 'completed';
  return this.save();
};

// Method to cancel appointment
appointmentSchema.methods.cancel = function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
  this.cancelledAt = new Date();
  return this.save();
};

// Method to add patient rating
appointmentSchema.methods.addPatientRating = function(score, comment) {
  this.rating.patientRating = {
    score,
    comment,
    date: new Date()
  };
  return this.save();
};

// Method to add doctor rating
appointmentSchema.methods.addDoctorRating = function(score, comment) {
  this.rating.doctorRating = {
    score,
    comment,
    date: new Date()
  };
  return this.save();
};

// Static method to find appointments for a specific date and doctor
appointmentSchema.statics.findByDateAndDoctor = function(doctorId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    doctor: doctorId,
    dateTime: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $ne: 'cancelled' }
  });
};

// Static method to find upcoming appointments
appointmentSchema.statics.findUpcoming = function(userId, userType) {
  const now = new Date();
  const query = {
    dateTime: { $gte: now },
    status: { $in: ['scheduled', 'confirmed'] }
  };

  if (userType === 'patient') {
    query.patient = userId;
  } else if (userType === 'doctor') {
    query.doctor = userId;
  }

  return this.find(query).sort({ dateTime: 1 });
};

export default mongoose.model('Appointment', appointmentSchema); 