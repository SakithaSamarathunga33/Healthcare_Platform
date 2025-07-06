import { body, param, query } from 'express-validator';

// User registration validation
export const validateRegistration = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\.\-']+$/)
    .withMessage('First name can only contain letters, spaces, periods, hyphens, and apostrophes'),

  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\.\-']+$/)
    .withMessage('Last name can only contain letters, spaces, periods, hyphens, and apostrophes'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('phone')
    .optional()
    .custom((value) => {
      if (!value) return true; // Allow empty phone
      // Trim whitespace and validate
      const cleanPhone = value.trim();
      // Allow international format with + and various separators
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/;
      if (!phoneRegex.test(cleanPhone)) {
        throw new Error('Please provide a valid phone number');
      }
      // Check length without spaces and separators
      const digitsOnly = cleanPhone.replace(/[\s\-\(\)\+]/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        throw new Error('Phone number must contain 7-15 digits');
      }
      return true;
    }),

  body('dateOfBirth')
    .optional()
    .isDate()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13 || age > 120) {
        throw new Error('Age must be between 13 and 120 years');
      }
      return true;
    }),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),

  body('address.street')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),

  body('address.city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),

  body('address.state')
    .optional()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),

  body('address.zipCode')
    .optional()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Please provide a valid ZIP code'),

  body('address.country')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Country cannot exceed 50 characters'),

  // Doctor-specific fields (optional for all users)
  body('specialties')
    .optional()
    .isArray()
    .withMessage('Specialties must be an array')
    .custom((specialties) => {
      if (!specialties || specialties.length === 0) return true;
      const validSpecialties = [
        'General Practice', 'Cardiology', 'Dermatology', 'Endocrinology',
        'Gastroenterology', 'Hematology', 'Infectious Disease', 'Nephrology',
        'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry',
        'Pulmonology', 'Radiology', 'Rheumatology', 'Urology', 'Gynecology',
        'Ophthalmology', 'ENT', 'Emergency Medicine', 'Anesthesiology',
        'Pathology', 'Surgery', 'Plastic Surgery', 'Neurosurgery',
        'Orthopedic Surgery', 'Cardiac Surgery'
      ];
      
      const invalidSpecialties = specialties.filter(s => !validSpecialties.includes(s));
      if (invalidSpecialties.length > 0) {
        throw new Error(`Invalid specialties: ${invalidSpecialties.join(', ')}`);
      }
      return true;
    }),

  body('primarySpecialty')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Primary specialty must be between 2 and 100 characters'),

  body('licenseNumber')
    .optional()
    .isLength({ min: 5, max: 20 })
    .withMessage('License number must be between 5 and 20 characters'),

  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),

  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters'),

  body('consultationFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number'),

  body('isAcceptingPatients')
    .optional()
    .isBoolean()
    .withMessage('isAcceptingPatients must be a boolean'),

  // Conditional validation for doctor role
  body('role')
    .custom((role, { req }) => {
      if (role === 'doctor') {
        // Check required doctor fields
        if (!req.body.primarySpecialty) {
          throw new Error('Primary specialty is required for doctors');
        }
        if (!req.body.licenseNumber) {
          throw new Error('License number is required for doctors');
        }
        if (!req.body.yearsOfExperience) {
          throw new Error('Years of experience is required for doctors');
        }
        if (!req.body.consultationFee) {
          throw new Error('Consultation fee is required for doctors');
        }
      }
      return true;
    })
];

// User login validation
export const validateLogin = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Update profile validation
export const validateUpdateProfile = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\.\-']+$/)
    .withMessage('First name can only contain letters, spaces, periods, hyphens, and apostrophes'),

  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\.\-']+$/)
    .withMessage('Last name can only contain letters, spaces, periods, hyphens, and apostrophes'),

  body('phone')
    .optional()
    .custom((value) => {
      if (!value) return true; // Allow empty phone
      // Allow various phone formats
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
      if (!phoneRegex.test(value)) {
        throw new Error('Please provide a valid phone number');
      }
      return true;
    }),

  body('dateOfBirth')
    .optional()
    .isDate()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13 || age > 120) {
        throw new Error('Age must be between 13 and 120 years');
      }
      return true;
    }),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),

  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),

  body('address.street')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),

  body('address.city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),

  body('address.state')
    .optional()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),

  body('address.zipCode')
    .optional()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Please provide a valid ZIP code'),

  body('address.country')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Country cannot exceed 50 characters')
];

// Change password validation
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your new password')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New password and confirm password do not match');
      }
      return true;
    })
];

// Admin update user profile validation (includes doctor fields)
export const validateAdminUpdateUserProfile = [
  // Basic user fields
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\.\-']+$/)
    .withMessage('First name can only contain letters, spaces, periods, hyphens, and apostrophes'),

  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\.\-']+$/)
    .withMessage('Last name can only contain letters, spaces, periods, hyphens, and apostrophes'),

  body('phone')
    .optional()
    .custom((value) => {
      if (!value) return true; // Allow empty phone
      // Allow various phone formats
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
      if (!phoneRegex.test(value)) {
        throw new Error('Please provide a valid phone number');
      }
      return true;
    }),

  body('dateOfBirth')
    .optional()
    .custom((value) => {
      if (!value) return true;
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Please provide a valid date of birth');
      }
      return true;
    }),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),

  body('role')
    .optional()
    .isIn(['patient', 'doctor', 'admin'])
    .withMessage('Role must be either patient, doctor, or admin'),

  // Doctor-specific fields (optional for all users)
  body('specialties')
    .optional()
    .isArray()
    .withMessage('Specialties must be an array')
    .custom((specialties) => {
      if (!specialties || specialties.length === 0) return true;
      const validSpecialties = [
        'General Practice', 'Cardiology', 'Dermatology', 'Endocrinology',
        'Gastroenterology', 'Hematology', 'Infectious Disease', 'Nephrology',
        'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry',
        'Pulmonology', 'Radiology', 'Rheumatology', 'Urology', 'Gynecology',
        'Ophthalmology', 'ENT', 'Emergency Medicine', 'Anesthesiology',
        'Pathology', 'Surgery', 'Plastic Surgery', 'Neurosurgery',
        'Orthopedic Surgery', 'Cardiac Surgery'
      ];
      
      const invalidSpecialties = specialties.filter(s => !validSpecialties.includes(s));
      if (invalidSpecialties.length > 0) {
        throw new Error(`Invalid specialties: ${invalidSpecialties.join(', ')}`);
      }
      return true;
    }),

  body('primarySpecialty')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Primary specialty must be between 2 and 100 characters'),

  body('licenseNumber')
    .optional()
    .isLength({ min: 5, max: 20 })
    .withMessage('License number must be between 5 and 20 characters'),

  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),

  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters'),

  body('consultationFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number'),

  body('isAcceptingPatients')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null) return true;
      if (typeof value === 'boolean') return true;
      if (value === 'true' || value === 'false') return true;
      if (value === true || value === false) return true;
      throw new Error('isAcceptingPatients must be a boolean value');
    })
];

// Doctor registration validation
export const validateDoctorRegistration = [
  body('specialties')
    .isArray({ min: 1 })
    .withMessage('At least one specialty is required')
    .custom((specialties) => {
      const validSpecialties = [
        'General Practice', 'Cardiology', 'Dermatology', 'Endocrinology',
        'Gastroenterology', 'Hematology', 'Infectious Disease', 'Nephrology',
        'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry',
        'Pulmonology', 'Radiology', 'Rheumatology', 'Urology', 'Gynecology',
        'Ophthalmology', 'ENT', 'Emergency Medicine', 'Anesthesiology',
        'Pathology', 'Surgery', 'Plastic Surgery', 'Neurosurgery',
        'Orthopedic Surgery', 'Cardiac Surgery'
      ];
      
      const invalidSpecialties = specialties.filter(s => !validSpecialties.includes(s));
      if (invalidSpecialties.length > 0) {
        throw new Error(`Invalid specialties: ${invalidSpecialties.join(', ')}`);
      }
      return true;
    }),

  body('licenseNumber')
    .notEmpty()
    .withMessage('License number is required')
    .isLength({ min: 5, max: 20 })
    .withMessage('License number must be between 5 and 20 characters'),

  body('yearsOfExperience')
    .notEmpty()
    .withMessage('Years of experience is required')
    .isInt({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),

  body('consultationFee')
    .notEmpty()
    .withMessage('Consultation fee is required')
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number'),

  body('education')
    .isArray({ min: 1 })
    .withMessage('At least one education record is required'),

  body('education.*.degree')
    .notEmpty()
    .withMessage('Degree is required for each education record'),

  body('education.*.institution')
    .notEmpty()
    .withMessage('Institution is required for each education record'),

  body('education.*.year')
    .notEmpty()
    .withMessage('Year is required for each education record')
    .isInt({ min: 1950, max: new Date().getFullYear() })
    .withMessage('Year must be between 1950 and current year'),

  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters'),

  body('languages')
    .optional()
    .isArray()
    .withMessage('Languages must be an array')
];

// Appointment validation
export const validateAppointment = [
  body('doctor')
    .notEmpty()
    .withMessage('Doctor is required')
    .isMongoId()
    .withMessage('Doctor must be a valid ID'),

  body('appointmentDate')
    .notEmpty()
    .withMessage('Appointment date is required')
    .isDate()
    .withMessage('Please provide a valid appointment date')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (appointmentDate < today) {
        throw new Error('Appointment date cannot be in the past');
      }
      
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 90); // 90 days in advance
      
      if (appointmentDate > maxDate) {
        throw new Error('Appointment date cannot be more than 90 days in advance');
      }
      
      return true;
    }),

  body('appointmentTime')
    .notEmpty()
    .withMessage('Appointment time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),

  body('symptoms')
    .notEmpty()
    .withMessage('Symptoms description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Symptoms description must be between 10 and 1000 characters'),

  body('appointmentType')
    .optional()
    .isIn(['consultation', 'follow-up', 'checkup', 'emergency'])
    .withMessage('Appointment type must be consultation, follow-up, checkup, or emergency'),

  body('duration')
    .optional()
    .isInt({ min: 15, max: 120 })
    .withMessage('Duration must be between 15 and 120 minutes'),

  body('patientNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Patient notes cannot exceed 500 characters')
];

// Symptom analysis validation
export const validateSymptomAnalysis = [
  body('symptoms')
    .notEmpty()
    .withMessage('Symptoms description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Symptoms description must be between 10 and 1000 characters')
    .custom((value) => {
      // Basic check for medical emergency keywords
      const emergencyKeywords = [
        'chest pain', 'difficulty breathing', 'severe headache', 'unconscious',
        'bleeding heavily', 'heart attack', 'stroke', 'seizure', 'overdose'
      ];
      
      const lowerSymptoms = value.toLowerCase();
      const hasEmergencyKeywords = emergencyKeywords.some(keyword => 
        lowerSymptoms.includes(keyword)
      );
      
      if (hasEmergencyKeywords) {
        throw new Error('For emergency symptoms, please call 911 or go to the nearest emergency room immediately');
      }
      
      return true;
    })
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'name', '-name', 'date', '-date'])
    .withMessage('Sort must be one of: createdAt, -createdAt, name, -name, date, -date')
];

// MongoDB ObjectId validation
export const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} must be a valid MongoDB ObjectId`)
];

// Date range validation
export const validateDateRange = [
  query('startDate')
    .optional()
    .isDate()
    .withMessage('Start date must be a valid date'),

  query('endDate')
    .optional()
    .isDate()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (req.query.startDate && value) {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(value);
        
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    })
];

// Search validation
export const validateSearch = [
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .trim()
];

// Rating validation
export const validateRating = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

// Status validation
export const validateStatus = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no-show'])
    .withMessage('Status must be one of: pending, confirmed, cancelled, completed, no-show')
];

// Role validation
export const validateRole = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['patient', 'doctor', 'admin'])
    .withMessage('Role must be one of: patient, doctor, admin')
];

// Medical record validation
export const validateMedicalRecord = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),

  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),

  body('type')
    .optional()
    .isIn(['general', 'diagnosis', 'treatment', 'test_result', 'prescription'])
    .withMessage('Type must be one of: general, diagnosis, treatment, test_result, prescription'),

  body('date')
    .optional()
    .isDate()
    .withMessage('Date must be a valid date')
];

// Vital signs validation
export const validateVitalSigns = [
  body('bloodPressure.systolic')
    .optional()
    .isInt({ min: 70, max: 250 })
    .withMessage('Systolic blood pressure must be between 70 and 250'),

  body('bloodPressure.diastolic')
    .optional()
    .isInt({ min: 40, max: 150 })
    .withMessage('Diastolic blood pressure must be between 40 and 150'),

  body('heartRate')
    .optional()
    .isInt({ min: 30, max: 200 })
    .withMessage('Heart rate must be between 30 and 200'),

  body('temperature')
    .optional()
    .isFloat({ min: 95, max: 110 })
    .withMessage('Temperature must be between 95 and 110 degrees'),

  body('weight')
    .optional()
    .isFloat({ min: 1, max: 1000 })
    .withMessage('Weight must be between 1 and 1000'),

  body('height')
    .optional()
    .isFloat({ min: 1, max: 300 })
    .withMessage('Height must be between 1 and 300')
];

// Health metric validation
export const validateHealthMetric = [
  body('type')
    .notEmpty()
    .withMessage('Metric type is required')
    .isIn(['weight', 'blood_pressure', 'heart_rate', 'temperature', 'blood_sugar', 'steps'])
    .withMessage('Type must be one of: weight, blood_pressure, heart_rate, temperature, blood_sugar, steps'),

  body('value')
    .notEmpty()
    .withMessage('Value is required')
    .isNumeric()
    .withMessage('Value must be numeric'),

  body('unit')
    .notEmpty()
    .withMessage('Unit is required')
    .isLength({ min: 1, max: 20 })
    .withMessage('Unit must be between 1 and 20 characters'),

  body('date')
    .optional()
    .isDate()
    .withMessage('Date must be a valid date')
];

// Emergency contacts validation
export const validateEmergencyContacts = [
  body('emergencyContact.name')
    .notEmpty()
    .withMessage('Emergency contact name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('emergencyContact.relationship')
    .notEmpty()
    .withMessage('Relationship is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Relationship must be between 2 and 50 characters'),

  body('emergencyContact.phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('emergencyContact.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
];

// Insurance info validation
export const validateInsuranceInfo = [
  body('insurance.provider')
    .notEmpty()
    .withMessage('Insurance provider is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Provider name must be between 2 and 100 characters'),

  body('insurance.policyNumber')
    .notEmpty()
    .withMessage('Policy number is required')
    .isLength({ min: 5, max: 50 })
    .withMessage('Policy number must be between 5 and 50 characters'),

  body('insurance.groupNumber')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Group number cannot exceed 50 characters'),

  body('insurance.expiryDate')
    .optional()
    .isDate()
    .withMessage('Expiry date must be a valid date')
];

// Appointment status validation
export const validateAppointmentStatus = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['scheduled', 'confirmed', 'cancelled', 'completed', 'no-show', 'rescheduled'])
    .withMessage('Status must be one of: scheduled, confirmed, cancelled, completed, no-show, rescheduled')
];

// Appointment notes validation
export const validateAppointmentNotes = [
  body('notes')
    .notEmpty()
    .withMessage('Notes are required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Notes must be between 10 and 1000 characters'),

  body('diagnosis')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Diagnosis cannot exceed 500 characters'),

  body('treatment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Treatment cannot exceed 500 characters'),

  body('prescription')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Prescription cannot exceed 500 characters')
];

// Doctor availability validation
export const validateAvailability = [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isDate()
    .withMessage('Date must be a valid date'),

  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),

  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),

  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean')
];

// Doctor schedule validation
export const validateSchedule = [
  body('schedule')
    .isArray()
    .withMessage('Schedule must be an array'),

  body('schedule.*.day')
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Day must be a valid day of the week'),

  body('schedule.*.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),

  body('schedule.*.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),

  body('schedule.*.isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean')
];

// Doctor application validation
export const validateDoctorApplication = [
  body('specialties')
    .isArray({ min: 1 })
    .withMessage('At least one specialty is required'),

  body('licenseNumber')
    .notEmpty()
    .withMessage('License number is required')
    .isLength({ min: 5, max: 50 })
    .withMessage('License number must be between 5 and 50 characters'),

  body('experience')
    .notEmpty()
    .withMessage('Experience is required')
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be between 0 and 50 years'),

  body('education')
    .notEmpty()
    .withMessage('Education is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Education must be between 10 and 500 characters')
];

// Doctor status validation
export const validateDoctorStatus = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'active', 'suspended', 'rejected'])
    .withMessage('Status must be one of: pending, active, suspended, rejected'),

  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

// Report request validation
export const validateReportRequest = [
  body('type')
    .notEmpty()
    .withMessage('Report type is required')
    .isIn(['users', 'appointments', 'ai_interactions', 'system'])
    .withMessage('Type must be one of: users, appointments, ai_interactions, system'),

  body('format')
    .optional()
    .isIn(['json', 'csv', 'pdf'])
    .withMessage('Format must be one of: json, csv, pdf'),

  body('startDate')
    .optional()
    .isDate()
    .withMessage('Start date must be a valid date'),

  body('endDate')
    .optional()
    .isDate()
    .withMessage('End date must be a valid date')
];

// System settings validation
export const validateSystemSettings = [
  body('settings.maintenance.enabled')
    .optional()
    .isBoolean()
    .withMessage('Maintenance enabled must be a boolean'),

  body('settings.maintenance.message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Maintenance message cannot exceed 500 characters'),

  body('settings.appointments.maxAdvanceBookingDays')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Max advance booking days must be between 1 and 365'),

  body('settings.appointments.cancellationDeadlineHours')
    .optional()
    .isInt({ min: 1, max: 168 })
    .withMessage('Cancellation deadline hours must be between 1 and 168'),

  body('settings.notifications.emailEnabled')
    .optional()
    .isBoolean()
    .withMessage('Email enabled must be a boolean'),

  body('settings.notifications.smsEnabled')
    .optional()
    .isBoolean()
    .withMessage('SMS enabled must be a boolean')
];

// Appointment creation validation
export const validateAppointmentCreation = [
  body('doctor')
    .notEmpty()
    .withMessage('Doctor is required')
    .isMongoId()
    .withMessage('Doctor must be a valid ID'),

  body('dateTime')
    .notEmpty()
    .withMessage('Date and time is required')
    .isISO8601()
    .withMessage('Date and time must be a valid ISO 8601 date'),

  body('duration')
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage('Duration must be between 15 and 180 minutes'),

  body('reason')
    .notEmpty()
    .withMessage('Reason for appointment is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),

  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'emergency'])
    .withMessage('Urgency must be one of: low, medium, high, emergency'),

  body('symptoms')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Symptoms cannot exceed 1000 characters')
];

// Appointment update validation
export const validateAppointmentUpdate = [
  body('status')
    .optional()
    .isIn(['scheduled', 'confirmed', 'cancelled', 'completed', 'no-show', 'rescheduled'])
    .withMessage('Status must be one of: scheduled, confirmed, cancelled, completed, no-show, rescheduled'),

  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),

  body('diagnosis')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Diagnosis cannot exceed 500 characters'),

  body('treatment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Treatment cannot exceed 500 characters'),

  body('prescription')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Prescription cannot exceed 500 characters')
];

// Time slot request validation
export const validateTimeSlotRequest = [
  query('doctorId')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .isMongoId()
    .withMessage('Doctor ID must be a valid MongoDB ObjectId'),

  query('date')
    .notEmpty()
    .withMessage('Date is required')
    .isDate()
    .withMessage('Date must be a valid date'),

  query('duration')
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage('Duration must be between 15 and 180 minutes')
];

// Appointment reschedule validation
export const validateAppointmentReschedule = [
  body('newDateTime')
    .notEmpty()
    .withMessage('New date and time is required')
    .isISO8601()
    .withMessage('New date and time must be a valid ISO 8601 date'),

  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

// Export all validators
export default {
  validateRegistration,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateDoctorRegistration,
  validateAppointment,
  validateSymptomAnalysis,
  validatePagination,
  validateObjectId,
  validateDateRange,
  validateSearch,
  validateRating,
  validateStatus,
  validateRole
};