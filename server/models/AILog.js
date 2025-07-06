import mongoose from 'mongoose';

const aiLogSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symptoms: {
    type: String,
    required: true,
    maxlength: [1000, 'Symptoms cannot be more than 1000 characters']
  },
  analysis: {
    recommendedSpecialty: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    alternativeSpecialties: [{
      specialty: String,
      confidence: Number
    }],
    urgencyLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    reasoning: String,
    suggestedQuestions: [String],
    redFlags: [String]
  },
  requestMetadata: {
    requestId: {
      type: String,
      required: true,
      unique: true
    },
    userAgent: String,
    ipAddress: String,
    sessionId: String,
    responseTime: {
      type: Number, // in milliseconds
      required: true
    },
    model: {
      type: String,
      default: 'local-ml-model'
    },
    tokenUsage: {
      inputTokens: Number,
      outputTokens: Number,
      totalTokens: Number
    },
    apiCost: {
      type: Number,
      default: 0
    },
    error: {
      message: String,
      stack: String,
      name: String
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  feedback: {
    patientFeedback: {
      wasHelpful: Boolean,
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      timestamp: Date
    },
    doctorFeedback: {
      wasAccurate: Boolean,
      actualSpecialty: String,
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      timestamp: Date,
      doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  },
  followUp: {
    appointmentBooked: {
      type: Boolean,
      default: false
    },
    selectedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    selectedSpecialty: String,
    matchedRecommendation: {
      type: Boolean,
      default: false
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    }
  },
  validation: {
    isValidated: {
      type: Boolean,
      default: false
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    validatedAt: Date,
    validationNotes: String,
    correctSpecialty: String,
    accuracyScore: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'used', 'ignored', 'flagged', 'validated'],
    default: 'pending'
  },
  flags: [{
    type: {
      type: String,
      enum: ['inappropriate_content', 'medical_emergency', 'unclear_symptoms', 'system_error', 'low_confidence', 'other']
    },
    reason: String,
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    flaggedAt: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolutionNotes: String
  }],
  anonymizedData: {
    isAnonymized: {
      type: Boolean,
      default: false
    },
    anonymizedAt: Date,
    retentionExpiry: Date
  },
  analytics: {
    category: {
      type: String,
      enum: ['common', 'complex', 'emergency', 'routine', 'specialized']
    },
    tags: [String],
    patientDemographics: {
      ageRange: String,
      gender: String,
      location: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for patient details
aiLogSchema.virtual('patientDetails', {
  ref: 'User',
  localField: 'patient',
  foreignField: '_id',
  justOne: true
});

// Virtual for selected doctor details
aiLogSchema.virtual('selectedDoctorDetails', {
  ref: 'Doctor',
  localField: 'followUp.selectedDoctor',
  foreignField: '_id',
  justOne: true
});

// Virtual for appointment details
aiLogSchema.virtual('appointmentDetails', {
  ref: 'Appointment',
  localField: 'followUp.appointment',
  foreignField: '_id',
  justOne: true
});

// Indexes for analytics and querying
aiLogSchema.index({ patientId: 1, timestamp: -1 });
aiLogSchema.index({ 'analysis.recommendedSpecialty': 1 });
aiLogSchema.index({ 'analysis.confidence': -1 });
aiLogSchema.index({ 'analysis.urgencyLevel': 1 });
aiLogSchema.index({ status: 1 });
aiLogSchema.index({ timestamp: -1 });
aiLogSchema.index({ 'followUp.appointmentBooked': 1 });
aiLogSchema.index({ 'validation.isValidated': 1 });
aiLogSchema.index({ 'flags.type': 1 });

// Pre-save middleware to set analytics category
aiLogSchema.pre('save', function(next) {
  if (this.isNew && !this.analytics.category && this.analysis) {
    const confidence = this.analysis.confidence;
    const urgency = this.analysis.urgencyLevel;
    
    if (urgency === 'critical') {
      this.analytics.category = 'emergency';
    } else if (confidence < 0.5) {
      this.analytics.category = 'complex';
    } else if (urgency === 'low' && confidence > 0.8) {
      this.analytics.category = 'routine';
    } else if (confidence > 0.9) {
      this.analytics.category = 'common';
    } else {
      this.analytics.category = 'specialized';
    }
  }
  next();
});

// Method to add patient feedback
aiLogSchema.methods.addPatientFeedback = function(wasHelpful, rating, comment) {
  this.feedback.patientFeedback = {
    wasHelpful,
    rating,
    comment,
    timestamp: new Date()
  };
  return this.save();
};

// Method to add doctor feedback
aiLogSchema.methods.addDoctorFeedback = function(wasAccurate, actualSpecialty, rating, comment, doctorId) {
  this.feedback.doctorFeedback = {
    wasAccurate,
    actualSpecialty,
    rating,
    comment,
    timestamp: new Date(),
    doctor: doctorId
  };
  return this.save();
};

// Method to flag entry
aiLogSchema.methods.flag = function(type, reason, flaggedBy) {
  this.flags.push({
    type,
    reason,
    flaggedBy,
    flaggedAt: new Date(),
    resolved: false
  });
  this.status = 'flagged';
  return this.save();
};

// Method to resolve flag
aiLogSchema.methods.resolveFlag = function(flagId, resolvedBy, resolutionNotes) {
  const flag = this.flags.id(flagId);
  if (flag) {
    flag.resolved = true;
    flag.resolvedBy = resolvedBy;
    flag.resolvedAt = new Date();
    flag.resolutionNotes = resolutionNotes;
    
    // Check if all flags are resolved
    const unresolvedFlags = this.flags.filter(f => !f.resolved);
    if (unresolvedFlags.length === 0) {
      this.status = 'validated';
    }
  }
  return this.save();
};

// Method to validate prediction (using validatePrediction to avoid mongoose internal method conflict)
aiLogSchema.methods.validatePrediction = function(validatedBy, correctSpecialty, accuracyScore, notes) {
  this.validation = {
    isValidated: true,
    validatedBy,
    validatedAt: new Date(),
    validationNotes: notes,
    correctSpecialty,
    accuracyScore
  };
  this.status = 'validated';
  return this.save();
};

// Method to anonymize data
aiLogSchema.methods.anonymize = function() {
  this.anonymizedData = {
    isAnonymized: true,
    anonymizedAt: new Date(),
    retentionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
  };
  
  // Remove or hash sensitive data
  this.requestMetadata.ipAddress = 'anonymized';
  this.requestMetadata.sessionId = 'anonymized';
  
  return this.save();
};

// Static method to get analytics data
aiLogSchema.statics.getAnalytics = function(startDate, endDate) {
  const matchStage = {
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          specialty: '$analysis.recommendedSpecialty',
          month: { $month: '$timestamp' },
          year: { $year: '$timestamp' }
        },
        count: { $sum: 1 },
        avgConfidence: { $avg: '$analysis.confidence' },
        avgResponseTime: { $avg: '$requestMetadata.responseTime' },
        appointmentBookedCount: {
          $sum: { $cond: ['$followUp.appointmentBooked', 1, 0] }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, count: -1 }
    }
  ]);
};

// Static method to get model performance metrics
aiLogSchema.statics.getModelMetrics = function(modelName, startDate, endDate) {
  const matchStage = {
    'requestMetadata.model': modelName,
    timestamp: {
      $gte: startDate,
      $lte: endDate
    },
    'validation.isValidated': true
  };
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPredictions: { $sum: 1 },
        avgAccuracy: { $avg: '$validation.accuracyScore' },
        avgConfidence: { $avg: '$analysis.confidence' },
        avgResponseTime: { $avg: '$requestMetadata.responseTime' },
        totalCost: { $sum: '$requestMetadata.apiCost' },
        appointmentConversionRate: {
          $avg: { $cond: ['$followUp.appointmentBooked', 1, 0] }
        }
      }
    }
  ]);
};

export default mongoose.model('AILog', aiLogSchema); 