import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialties: [{
    type: String,
    required: true,
    enum: [
      'General Practice',
      'Cardiology',
      'Dermatology',
      'Endocrinology',
      'Gastroenterology',
      'Hematology',
      'Infectious Disease',
      'Nephrology',
      'Neurology',
      'Oncology',
      'Orthopedics',
      'Pediatrics',
      'Psychiatry',
      'Pulmonology',
      'Radiology',
      'Rheumatology',
      'Urology',
      'Gynecology',
      'Ophthalmology',
      'ENT',
      'Emergency Medicine',
      'Anesthesiology',
      'Pathology',
      'Surgery',
      'Plastic Surgery',
      'Neurosurgery',
      'Orthopedic Surgery',
      'Cardiac Surgery'
    ]
  }],
  primarySpecialty: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  yearsOfExperience: {
    type: Number,
    required: true,
    min: 0
  },
  education: [{
    degree: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  }],
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date
  }],
  languages: [{
    type: String,
    default: ['English']
  }],
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot be more than 1000 characters']
  },
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    slots: [{
      startTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      endTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      isAvailable: {
        type: Boolean,
        default: true
      }
    }]
  }],
  hospital: {
    name: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    phone: String
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalPatients: {
    type: Number,
    default: 0
  },
  totalAppointments: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAcceptingPatients: {
    type: Boolean,
    default: true
  },
  verificationDocuments: [{
    type: String,
    documentType: {
      type: String,
      enum: ['license', 'degree', 'certification', 'other']
    },
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for user details
doctorSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

// Virtual for appointments
doctorSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'doctor'
});

// Virtual for reviews
doctorSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'doctor'
});

// Indexes
doctorSchema.index({ user: 1 });
doctorSchema.index({ specialties: 1 });
doctorSchema.index({ primarySpecialty: 1 });
doctorSchema.index({ isVerified: 1 });
doctorSchema.index({ isAcceptingPatients: 1 });
doctorSchema.index({ 'rating.average': -1 });

// Pre-save middleware to set primary specialty
doctorSchema.pre('save', function(next) {
  if (this.specialties && this.specialties.length > 0 && !this.primarySpecialty) {
    this.primarySpecialty = this.specialties[0];
  }
  next();
});

// Method to check if doctor is available on a specific date and time
doctorSchema.methods.isAvailableAt = function(date, time) {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const availability = this.availability.find(avail => avail.day === dayName);
  
  if (!availability) return false;
  
  return availability.slots.some(slot => {
    const startTime = slot.startTime;
    const endTime = slot.endTime;
    return time >= startTime && time < endTime && slot.isAvailable;
  });
};

// Method to get available slots for a specific day
doctorSchema.methods.getAvailableSlots = function(date) {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const availability = this.availability.find(avail => avail.day === dayName);
  
  if (!availability) return [];
  
  return availability.slots.filter(slot => slot.isAvailable);
};

// Method to update rating
doctorSchema.methods.updateRating = function(newRating) {
  this.rating.count += 1;
  this.rating.average = ((this.rating.average * (this.rating.count - 1)) + newRating) / this.rating.count;
  return this.save();
};

export default mongoose.model('Doctor', doctorSchema); 