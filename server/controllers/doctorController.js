import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';

// Public doctor browsing (for patients to find doctors)
export const getPublicDoctors = catchAsync(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    specialty, 
    search, 
    isAcceptingPatients,
    sortBy = 'rating',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};
  
  // Show doctors who are accepting patients (both verified and unverified)
  query.isAcceptingPatients = true;
  
  if (specialty) {
    query.primarySpecialty = { $regex: specialty, $options: 'i' };
  }
  
  if (isAcceptingPatients === 'true') {
    query.isAcceptingPatients = true;
  }

  // Get doctors with their user information
  const doctors = await Doctor.find(query)
    .populate('user', 'firstName lastName email phone address')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  // Apply search filter if provided
  let filteredDoctors = doctors;
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filteredDoctors = doctors.filter(doctor => 
      doctor.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      doctor.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      doctor.primarySpecialty.toLowerCase().includes(search.toLowerCase()) ||
      doctor.bio?.toLowerCase().includes(search.toLowerCase())
    );
  }

  const total = await Doctor.countDocuments(query);

  res.status(200).json({
    success: true,
    data: filteredDoctors.map(doctor => ({
      _id: doctor._id,
      firstName: doctor.user.firstName,
      lastName: doctor.user.lastName,
      email: doctor.user.email,
      phone: doctor.user.phone,
      address: doctor.user.address,
      primarySpecialty: doctor.primarySpecialty,
      specialties: doctor.specialties,
      yearsOfExperience: doctor.yearsOfExperience,
      bio: doctor.bio,
      consultationFee: doctor.consultationFee,
      rating: doctor.rating,
      isVerified: doctor.isVerified,
      isAcceptingPatients: doctor.isAcceptingPatients,
      languages: doctor.languages
    })),
    pagination: { 
      page: parseInt(page), 
      limit: parseInt(limit), 
      total, 
      pages: Math.ceil(total / limit) 
    }
  });
});

// Get doctor by ID (public route for appointment booking)
export const getDoctorById = catchAsync(async (req, res, next) => {
  const { id: doctorId } = req.params;

  const doctor = await Doctor.findById(doctorId)
    .populate('user', 'firstName lastName email phone address')
    .populate('hospital', 'name address');

  if (!doctor) {
    return next(new AppError('Doctor not found', 404));
  }

  // Only return doctors who are accepting patients
  if (!doctor.isAcceptingPatients) {
    return next(new AppError('Doctor is not currently accepting patients', 400));
  }

  res.status(200).json({
    success: true,
    data: {
      _id: doctor._id,
      name: `${doctor.user.firstName} ${doctor.user.lastName}`,
      userDetails: {
        name: `${doctor.user.firstName} ${doctor.user.lastName}`,
        email: doctor.user.email,
        phone: doctor.user.phone,
        address: doctor.user.address
      },
      primarySpecialty: doctor.primarySpecialty,
      specialties: doctor.specialties,
      yearsOfExperience: doctor.yearsOfExperience,
      bio: doctor.bio,
      consultationFee: doctor.consultationFee,
      rating: doctor.rating,
      isVerified: doctor.isVerified,
      isAcceptingPatients: doctor.isAcceptingPatients,
      languages: doctor.languages,
      hospital: doctor.hospital,
      availability: doctor.availability
    }
  });
});

// Get doctor dashboard data
export const getDoctorDashboard = catchAsync(async (req, res, next) => {
  const doctorId = req.user.id;
  
  // Get doctor profile to access doctor-specific data
  const doctorProfile = await Doctor.findOne({ user: doctorId });
  
  if (!doctorProfile) {
    return next(new AppError('Doctor profile not found', 404));
  }
  
  const todayAppointments = await Appointment.find({
    doctor: doctorId,
    dateTime: { 
      $gte: new Date(new Date().setHours(0,0,0,0)),
      $lt: new Date(new Date().setHours(23,59,59,999))
    }
  })
    .populate('patient', 'firstName lastName')
    .sort({ dateTime: 1 });

  const upcomingAppointments = await Appointment.find({
    doctor: doctorId,
    dateTime: { $gte: new Date() },
    status: { $ne: 'cancelled' }
  })
    .populate('patient', 'firstName lastName')
    .sort({ dateTime: 1 })
    .limit(5);

  const appointmentStats = await Appointment.aggregate([
    { $match: { doctor: req.user.id } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const stats = {
    todayAppointments: todayAppointments.length,
    upcomingAppointments: upcomingAppointments.length,
    totalPatients: doctorProfile.totalPatients || 0,
    completedAppointments: appointmentStats.find(s => s._id === 'completed')?.count || 0,
    totalAppointments: doctorProfile.totalAppointments || 0,
    rating: doctorProfile.rating || { average: 0, count: 0 },
    isVerified: doctorProfile.isVerified,
    isAcceptingPatients: doctorProfile.isAcceptingPatients
  };

  res.status(200).json({
    success: true,
    data: { stats, todayAppointments, upcomingAppointments, doctorProfile }
  });
});

// Get doctor appointments
export const getDoctorAppointments = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = { doctor: req.user.id };
  
  if (status) filter.status = status;

  const appointments = await Appointment.find(filter)
    .populate('patient', 'firstName lastName email phone')
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

// Get doctor patients
export const getDoctorPatients = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const patientIds = await Appointment.distinct('patient', { doctor: req.user.id });
  
  const patients = await User.find({ _id: { $in: patientIds } })
    .select('firstName lastName email phone')
    .sort({ firstName: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = patientIds.length;

  res.status(200).json({
    success: true,
    data: {
      patients,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    }
  });
});

// Get patient details
export const getPatientDetails = catchAsync(async (req, res, next) => {
  const { id: patientId } = req.params;
  const doctorId = req.user.id;

  const hasAppointment = await Appointment.findOne({
    doctor: doctorId,
    patient: patientId
  });

  if (!hasAppointment) {
    return next(new AppError('You do not have permission to view this patient', 403));
  }

  const patient = await User.findById(patientId)
    .select('firstName lastName email phone dateOfBirth gender');

  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }

  const appointments = await Appointment.find({
    doctor: doctorId,
    patient: patientId
  }).sort({ dateTime: -1 });

  res.status(200).json({
    success: true,
    data: { patient, appointments }
  });
});

// Update appointment status
export const updateAppointmentStatus = catchAsync(async (req, res, next) => {
  const { id: appointmentId } = req.params;
  const { status } = req.body;

  const appointment = await Appointment.findOneAndUpdate(
    { _id: appointmentId, doctor: req.user.id },
    { status, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).populate('patient', 'firstName lastName');

  if (!appointment) {
    return next(new AppError('Appointment not found or unauthorized', 404));
  }

  res.status(200).json({
    success: true,
    data: { appointment }
  });
});

// Add appointment notes
export const addAppointmentNotes = catchAsync(async (req, res, next) => {
  const { id: appointmentId } = req.params;
  const { notes } = req.body;

  const appointment = await Appointment.findOneAndUpdate(
    { _id: appointmentId, doctor: req.user.id },
    { notes, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).populate('patient', 'firstName lastName');

  if (!appointment) {
    return next(new AppError('Appointment not found or unauthorized', 404));
  }

  res.status(200).json({
    success: true,
    data: { appointment }
  });
});

// Get doctor profile
export const getDoctorProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const doctorProfile = await Doctor.findOne({ user: req.user.id })
    .populate('user', '-password');

  if (!doctorProfile) {
    return next(new AppError('Doctor profile not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { 
      user,
      doctorProfile 
    }
  });
});

// Update doctor profile
export const updateDoctorProfile = catchAsync(async (req, res, next) => {
  // Fields that can be updated in User model
  const userAllowedFields = ['firstName', 'lastName', 'phone', 'avatar', 'address'];
  const userUpdateData = {};
  
  // Fields that can be updated in Doctor model
  const doctorAllowedFields = [
    'specialties', 'primarySpecialty', 'licenseNumber', 'yearsOfExperience',
    'education', 'certifications', 'languages', 'bio', 'consultationFee',
    'availability', 'hospital', 'isAcceptingPatients'
  ];
  const doctorUpdateData = {};
  
  // Separate fields for User and Doctor models
  Object.keys(req.body).forEach(key => {
    if (userAllowedFields.includes(key)) {
      userUpdateData[key] = req.body[key];
    }
    if (doctorAllowedFields.includes(key)) {
      doctorUpdateData[key] = req.body[key];
    }
  });

  // Update User model if there are user fields to update
  let updatedUser = null;
  if (Object.keys(userUpdateData).length > 0) {
    updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      userUpdateData,
      { new: true, runValidators: true }
    ).select('-password');
  }

  // Update Doctor model if there are doctor fields to update
  let updatedDoctorProfile = null;
  if (Object.keys(doctorUpdateData).length > 0) {
    updatedDoctorProfile = await Doctor.findOneAndUpdate(
      { user: req.user.id },
      doctorUpdateData,
      { new: true, runValidators: true }
    ).populate('user', '-password');

    if (!updatedDoctorProfile) {
      return next(new AppError('Doctor profile not found', 404));
    }
  }

  // Get the complete updated profile
  const user = updatedUser || await User.findById(req.user.id).select('-password');
  const doctorProfile = updatedDoctorProfile || await Doctor.findOne({ user: req.user.id })
    .populate('user', '-password');

  res.status(200).json({
    success: true,
    data: { 
      user,
      doctorProfile 
    }
  });
});

// Get availability settings
export const getAvailabilitySettings = catchAsync(async (req, res, next) => {
  const doctorProfile = await Doctor.findOne({ user: req.user.id }).select('availability');
  
  if (!doctorProfile) {
    return next(new AppError('Doctor profile not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: { availability: doctorProfile.availability || [] }
  });
});

// Update availability
export const updateAvailability = catchAsync(async (req, res, next) => {
  const doctorProfile = await Doctor.findOneAndUpdate(
    { user: req.user.id },
    { availability: req.body.availability },
    { new: true, runValidators: true }
  ).select('availability');

  if (!doctorProfile) {
    return next(new AppError('Doctor profile not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { availability: doctorProfile.availability }
  });
});

// Get doctor schedule
export const getDoctorSchedule = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const filter = { doctor: req.user.id };
  
  if (startDate || endDate) {
    filter.dateTime = {};
    if (startDate) filter.dateTime.$gte = new Date(startDate);
    if (endDate) filter.dateTime.$lte = new Date(endDate);
  }

  const schedule = await Appointment.find(filter)
    .populate('patient', 'firstName lastName')
    .sort({ dateTime: 1 });

  res.status(200).json({
    success: true,
    data: { schedule }
  });
});

// Update doctor schedule
export const updateDoctorSchedule = catchAsync(async (req, res) => {
  const doctor = await User.findByIdAndUpdate(
    req.user.id,
    { schedule: req.body.schedule },
    { new: true, runValidators: true }
  ).select('schedule');

  res.status(200).json({
    success: true,
    data: { schedule: doctor.schedule }
  });
});

// Get doctor verification status
export const getDoctorVerificationStatus = catchAsync(async (req, res, next) => {
  const doctorProfile = await Doctor.findOne({ user: req.user.id })
    .select('isVerified verificationDocuments');
  
  if (!doctorProfile) {
    return next(new AppError('Doctor profile not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: { 
      isVerified: doctorProfile.isVerified,
      verificationDocuments: doctorProfile.verificationDocuments || []
    }
  });
});

// Update doctor verification documents
export const updateVerificationDocuments = catchAsync(async (req, res, next) => {
  const { documents } = req.body;
  
  const doctorProfile = await Doctor.findOneAndUpdate(
    { user: req.user.id },
    { verificationDocuments: documents },
    { new: true, runValidators: true }
  ).select('verificationDocuments');

  if (!doctorProfile) {
    return next(new AppError('Doctor profile not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { verificationDocuments: doctorProfile.verificationDocuments }
  });
});

// Get doctor specialties and education
export const getDoctorSpecialties = catchAsync(async (req, res, next) => {
  const doctorProfile = await Doctor.findOne({ user: req.user.id })
    .select('specialties primarySpecialty education certifications');
  
  if (!doctorProfile) {
    return next(new AppError('Doctor profile not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: {
      specialties: doctorProfile.specialties || [],
      primarySpecialty: doctorProfile.primarySpecialty,
      education: doctorProfile.education || [],
      certifications: doctorProfile.certifications || []
    }
  });
});

// Update doctor specialties and education
export const updateDoctorSpecialties = catchAsync(async (req, res, next) => {
  const allowedFields = ['specialties', 'primarySpecialty', 'education', 'certifications'];
  const updateData = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  });

  const doctorProfile = await Doctor.findOneAndUpdate(
    { user: req.user.id },
    updateData,
    { new: true, runValidators: true }
  ).select('specialties primarySpecialty education certifications');

  if (!doctorProfile) {
    return next(new AppError('Doctor profile not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      specialties: doctorProfile.specialties,
      primarySpecialty: doctorProfile.primarySpecialty,
      education: doctorProfile.education,
      certifications: doctorProfile.certifications
    }
  });
});

// Toggle accepting patients status
export const toggleAcceptingPatients = catchAsync(async (req, res, next) => {
  const doctorProfile = await Doctor.findOne({ user: req.user.id });
  
  if (!doctorProfile) {
    return next(new AppError('Doctor profile not found', 404));
  }

  doctorProfile.isAcceptingPatients = !doctorProfile.isAcceptingPatients;
  await doctorProfile.save();

  res.status(200).json({
    success: true,
    data: { isAcceptingPatients: doctorProfile.isAcceptingPatients }
  });
});
