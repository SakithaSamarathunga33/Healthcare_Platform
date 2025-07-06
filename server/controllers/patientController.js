import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import AILog from '../models/AILog.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';

// Get patient dashboard data
export const getPatientDashboard = catchAsync(async (req, res) => {
  const patientId = req.user.id;
  
  const todayAppointments = await Appointment.find({
    patient: patientId,
    dateTime: { 
      $gte: new Date(new Date().setHours(0,0,0,0)),
      $lt: new Date(new Date().setHours(23,59,59,999))
    }
  }).populate('doctor', 'firstName lastName specialty');

  const upcomingAppointments = await Appointment.find({
    patient: patientId,
    dateTime: { $gte: new Date() },
    status: { $ne: 'cancelled' }
  })
    .populate('doctor', 'firstName lastName specialty')
    .sort({ dateTime: 1 })
    .limit(5);

  const recentAnalyses = await AILog.find({ patientId: patientId })
    .select('symptoms analysis timestamp status')
    .sort({ timestamp: -1 })
    .limit(3)
    .catch(() => []);

  const appointmentStats = await Appointment.aggregate([
    { $match: { patient: patientId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const stats = {
    todayAppointments: todayAppointments.length,
    upcomingAppointments: upcomingAppointments.length,
    totalAppointments: appointmentStats.reduce((sum, stat) => sum + stat.count, 0),
    completedAppointments: appointmentStats.find(s => s._id === 'completed')?.count || 0,
    recentAnalyses: recentAnalyses.length
  };

  res.status(200).json({
    success: true,
    data: { stats, todayAppointments, upcomingAppointments, recentAnalyses }
  });
});

// Get patient appointments
export const getPatientAppointments = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = { patient: req.user.id };
  
  if (status) filter.status = status;

  const appointments = await Appointment.find(filter)
    .populate('doctor', 'firstName lastName specialty')
    .sort({ dateTime: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Appointment.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      appointments,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    }
  });
});

// Get patient medical history
export const getPatientHistory = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const appointments = await Appointment.find({
    patient: req.user.id,
    status: 'completed'
  })
    .populate('doctor', 'firstName lastName specialty')
    .sort({ dateTime: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Appointment.countDocuments({
    patient: req.user.id,
    status: 'completed'
  });

  res.status(200).json({
    success: true,
    data: {
      appointments,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    }
  });
});

// Get patient profile
export const getPatientProfile = catchAsync(async (req, res, next) => {
  const patient = await User.findById(req.user.id).select('-password');

  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { patient }
  });
});

// Update patient profile
export const updatePatientProfile = catchAsync(async (req, res) => {
  const allowedFields = [
    'firstName', 'lastName', 'phone', 'dateOfBirth', 'gender',
    'address', 'emergencyContact', 'medicalHistory', 'allergies',
    'currentMedications', 'bloodType', 'height', 'weight'
  ];

  const updateData = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  });

  const patient = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: { patient }
  });
});

// Get patient medical records
export const getMedicalRecords = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const records = await Appointment.find({
    patient: req.user.id,
    status: 'completed'
  })
    .populate('doctor', 'firstName lastName specialty')
    .sort({ dateTime: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Appointment.countDocuments({
    patient: req.user.id,
    status: 'completed'
  });

  res.status(200).json({
    success: true,
    data: {
      records,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    }
  });
});

// Add medical record
export const addMedicalRecord = catchAsync(async (req, res) => {
  const { title, description, date, type } = req.body;

  // For now, we'll store this as part of the user's medical history
  const patient = await User.findById(req.user.id);

  if (!patient.medicalHistory) {
    patient.medicalHistory = [];
  }

  patient.medicalHistory.push({
    title,
    description,
    date: date || new Date(),
    type: type || 'general',
    addedAt: new Date()
  });

  await patient.save();

  res.status(201).json({
    success: true,
    message: 'Medical record added successfully',
    data: { medicalHistory: patient.medicalHistory }
  });
});

// Get patient prescriptions
export const getPrescriptions = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const prescriptions = await Appointment.find({
    patient: req.user.id,
    status: 'completed',
    prescription: { $exists: true, $ne: null }
  })
    .populate('doctor', 'firstName lastName specialty')
    .sort({ dateTime: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Appointment.countDocuments({
    patient: req.user.id,
    status: 'completed',
    prescription: { $exists: true, $ne: null }
  });

  res.status(200).json({
    success: true,
    data: {
      prescriptions,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    }
  });
});

// Get patient test results
export const getTestResults = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const testResults = await Appointment.find({
    patient: req.user.id,
    status: 'completed',
    testResults: { $exists: true, $ne: null }
  })
    .populate('doctor', 'firstName lastName specialty')
    .sort({ dateTime: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Appointment.countDocuments({
    patient: req.user.id,
    status: 'completed',
    testResults: { $exists: true, $ne: null }
  });

  res.status(200).json({
    success: true,
    data: {
      testResults,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    }
  });
});

// Get patient vital signs
export const getVitalSigns = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const vitalSigns = [];
  const total = 0;

  res.status(200).json({
    success: true,
    data: {
      vitalSigns,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    }
  });
});

// Update patient vital signs
export const addVitalSigns = catchAsync(async (req, res) => {
  const { bloodPressure, heartRate, temperature, weight, height } = req.body;

  const patient = await User.findByIdAndUpdate(
    req.user.id,
    {
      $set: {
        vitalSigns: {
          bloodPressure,
          heartRate,
          temperature,
          weight,
          height,
          recordedAt: new Date()
        }
      }
    },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: { patient }
  });
});

// Get patient emergency contacts
export const getEmergencyContacts = catchAsync(async (req, res) => {
  const patient = await User.findById(req.user.id).select('emergencyContact');
  
  res.status(200).json({
    success: true,
    data: { emergencyContact: patient.emergencyContact || {} }
  });
});

// Update patient emergency contacts
export const updateEmergencyContacts = catchAsync(async (req, res) => {
  const patient = await User.findByIdAndUpdate(
    req.user.id,
    { emergencyContact: req.body.emergencyContact },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: { patient }
  });
});

// Get patient insurance information
export const getInsuranceInfo = catchAsync(async (req, res) => {
  const patient = await User.findById(req.user.id).select('insurance');
  
  res.status(200).json({
    success: true,
    data: { insurance: patient.insurance || {} }
  });
});

// Update patient insurance information
export const updateInsuranceInfo = catchAsync(async (req, res) => {
  const patient = await User.findByIdAndUpdate(
    req.user.id,
    { insurance: req.body.insurance },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: { patient }
  });
});

// Get patient health metrics
export const getHealthMetrics = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = { patient: req.user.id, status: 'completed' };
  
  if (startDate || endDate) {
    filter.dateTime = {};
    if (startDate) filter.dateTime.$gte = new Date(startDate);
    if (endDate) filter.dateTime.$lte = new Date(endDate);
  }

  const appointments = await Appointment.find(filter)
    .populate('doctor', 'firstName lastName specialty')
    .sort({ dateTime: -1 });

  const metrics = {
    totalAppointments: appointments.length,
    appointmentsByMonth: [],
    commonSymptoms: [],
    treatmentHistory: appointments.map(apt => ({
      date: apt.dateTime,
      doctor: apt.doctor,
      symptoms: apt.symptoms || [],
      diagnosis: apt.diagnosis || 'N/A',
      treatment: apt.treatment || 'N/A'
    }))
  };

  res.status(200).json({
    success: true,
    data: { metrics }
  });
});

// Update patient health metrics
export const logHealthMetric = catchAsync(async (req, res) => {
  const { metrics } = req.body;

  const patient = await User.findByIdAndUpdate(
    req.user.id,
    { healthMetrics: metrics },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: { patient }
  });
});
