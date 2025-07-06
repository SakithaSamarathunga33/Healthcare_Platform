import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';

// Get appointments based on user role and filters
export const getAppointments = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, dateFrom, dateTo, doctorId, patientId } = req.query;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Build query based on user role
  let query = {};

  if (userRole === 'patient') {
    query.patient = userId;
  } else if (userRole === 'doctor') {
    query.doctor = userId;
  } else if (userRole === 'admin') {
    // Admin can see all appointments, apply filters if provided
    if (doctorId) query.doctor = doctorId;
    if (patientId) query.patient = patientId;
  }

  // Apply additional filters
  if (status) query.status = status;

  if (dateFrom || dateTo) {
    query.dateTime = {};
    if (dateFrom) query.dateTime.$gte = new Date(dateFrom);
    if (dateTo) query.dateTime.$lte = new Date(dateTo);
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const appointments = await Appointment.find(query)
    .populate('patient', 'firstName lastName email phone')
    .populate('doctor', 'firstName lastName email specialties')
    .sort({ dateTime: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Appointment.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      appointments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// Create new appointment
export const createAppointment = catchAsync(async (req, res) => {
  const {
    doctorId,
    dateTime,
    duration = 30,
    appointmentType = 'consultation',
    symptoms,
    urgency = 'medium',
    patientNotes
  } = req.body;

  const patientId = req.user.role === 'patient' ? req.user.id : req.body.patientId;

  // Validate required fields
  if (!doctorId || !dateTime || !symptoms) {
    return res.status(400).json({
      success: false,
      message: 'Doctor, date/time, and symptoms are required'
    });
  }

  // Check if doctor exists and is available
  console.log('Looking for doctor with ID:', doctorId);
  
  // First try to find by Doctor model ID
  let doctorProfile = await Doctor.findById(doctorId);
  let doctor = null;
  
  console.log('Doctor profile found:', doctorProfile ? 'Yes' : 'No');
  
  if (doctorProfile) {
    // If found in Doctor model, get the associated User
    doctor = await User.findById(doctorProfile.user);
    console.log('User found from doctor profile:', doctor ? 'Yes' : 'No');
  } else {
    // If not found in Doctor model, try to find in User model directly
    doctor = await User.findById(doctorId);
    console.log('User found directly:', doctor ? 'Yes' : 'No');
    if (doctor && doctor.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ user: doctorId });
      console.log('Doctor profile found from user:', doctorProfile ? 'Yes' : 'No');
    }
  }
  
  if (!doctor || doctor.role !== 'doctor') {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found'
    });
  }

  if (!doctorProfile || !doctorProfile.isAcceptingPatients) {
    return res.status(400).json({
      success: false,
      message: 'Doctor is not currently accepting patients'
    });
  }

  // Check for appointment conflicts
  const appointmentDate = new Date(dateTime);
  const endTime = new Date(appointmentDate.getTime() + duration * 60000);

  const conflictingAppointment = await Appointment.findOne({
    doctor: doctor._id, // Use the User ID for the doctor field
    dateTime: {
      $lt: endTime
    },
    $expr: {
      $gt: [
        { $add: ['$dateTime', { $multiply: ['$duration', 60000] }] },
        appointmentDate
      ]
    },
    status: { $in: ['scheduled', 'confirmed', 'pending'] }
  });

  if (conflictingAppointment) {
    return res.status(409).json({
      success: false,
      message: 'Doctor is not available at the requested time'
    });
  }

  // Create appointment
  const appointment = await Appointment.create({
    patient: patientId,
    doctor: doctor._id, // Use the User ID for the doctor field
    dateTime: appointmentDate,
    duration,
    appointmentType,
    symptoms,
    urgency,
    patientNotes,
    status: 'pending', // Set initial status as pending
    createdBy: req.user.id,
    fee: {
      consultation: doctorProfile.consultationFee || 100, // Use doctor's consultation fee
      total: doctorProfile.consultationFee || 100
    }
  });

  await appointment.populate([
    { path: 'patient', select: 'firstName lastName email phone' },
    { path: 'doctor', select: 'firstName lastName email specialties' }
  ]);

  res.status(201).json({
    success: true,
    data: { appointment }
  });
});

// Get appointment by ID
export const getAppointmentById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const appointment = await Appointment.findById(id)
    .populate('patient', 'firstName lastName email phone dateOfBirth')
    .populate('doctor', 'firstName lastName email specialties')
    .populate('createdBy', 'firstName lastName');

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Check authorization
  if (userRole !== 'admin' &&
      appointment.patient._id.toString() !== userId &&
      appointment.doctor._id.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this appointment'
    });
  }

  res.status(200).json({
    success: true,
    data: { appointment }
  });
});

// Update appointment
export const updateAppointment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;
  const updates = req.body;

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Check authorization
  if (userRole !== 'admin' &&
      appointment.patient.toString() !== userId &&
      appointment.doctor.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this appointment'
    });
  }

  // Restrict what can be updated based on role
  const allowedUpdates = {};
  if (userRole === 'patient') {
    const { patientNotes, symptoms } = updates;
    if (patientNotes !== undefined) allowedUpdates.patientNotes = patientNotes;
    if (symptoms !== undefined) allowedUpdates.symptoms = symptoms;
  } else if (userRole === 'doctor') {
    const { doctorNotes, diagnosis, prescription, vitals, status } = updates;
    if (doctorNotes !== undefined) allowedUpdates.doctorNotes = doctorNotes;
    if (diagnosis !== undefined) allowedUpdates.diagnosis = diagnosis;
    if (prescription !== undefined) allowedUpdates.prescription = prescription;
    if (vitals !== undefined) allowedUpdates.vitals = vitals;
    if (status !== undefined && ['confirmed', 'completed'].includes(status)) {
      allowedUpdates.status = status;
    }
  } else if (userRole === 'admin') {
    Object.assign(allowedUpdates, updates);
  }

  const updatedAppointment = await Appointment.findByIdAndUpdate(
    id,
    allowedUpdates,
    { new: true, runValidators: true }
  ).populate([
    { path: 'patient', select: 'firstName lastName email phone' },
    { path: 'doctor', select: 'firstName lastName email specialties' }
  ]);

  res.status(200).json({
    success: true,
    data: { appointment: updatedAppointment }
  });
});

// Cancel appointment
export const cancelAppointment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Check authorization
  if (userRole !== 'admin' &&
      appointment.patient.toString() !== userId &&
      appointment.doctor.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this appointment'
    });
  }

  // Check if appointment can be cancelled
  if (!appointment.canBeCancelled()) {
    return res.status(400).json({
      success: false,
      message: 'Appointment cannot be cancelled (less than 24 hours remaining or already completed/cancelled)'
    });
  }

  const cancelledBy = userRole === 'admin' ? 'admin' :
                     appointment.patient.toString() === userId ? 'patient' : 'doctor';

  await appointment.cancel(reason, cancelledBy);

  res.status(200).json({
    success: true,
    message: 'Appointment cancelled successfully',
    data: { appointment }
  });
});

// Get available time slots for a doctor on a specific date
export const getAvailableTimeSlots = catchAsync(async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({
      success: false,
      message: 'Doctor ID and date are required'
    });
  }

  // Check if doctor exists
  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== 'doctor') {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found'
    });
  }

  // Get existing appointments for the doctor on the specified date
  const existingAppointments = await Appointment.findByDateAndDoctor(doctorId, date);

  // Generate available time slots (9 AM to 5 PM, 30-minute slots)
  const availableSlots = [];
  const startHour = 9;
  const endHour = 17;
  const slotDuration = 30; // minutes

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const slotTime = new Date(date);
      slotTime.setHours(hour, minute, 0, 0);

      // Check if this slot conflicts with existing appointments
      const hasConflict = existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.dateTime);
        const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60000);
        const slotEnd = new Date(slotTime.getTime() + slotDuration * 60000);

        return (slotTime < appointmentEnd && slotEnd > appointmentStart);
      });

      if (!hasConflict && slotTime > new Date()) {
        availableSlots.push({
          time: slotTime.toISOString(),
          formattedTime: slotTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })
        });
      }
    }
  }

  res.status(200).json({
    success: true,
    data: {
      date,
      doctorId,
      availableSlots
    }
  });
});

// Confirm appointment
export const confirmAppointment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Only doctors and admins can confirm appointments
  if (userRole !== 'admin' &&
      (userRole !== 'doctor' || appointment.doctor.toString() !== userId)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to confirm this appointment'
    });
  }

  if (appointment.status !== 'scheduled') {
    return res.status(400).json({
      success: false,
      message: 'Only scheduled appointments can be confirmed'
    });
  }

  appointment.status = 'confirmed';
  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Appointment confirmed successfully',
    data: { appointment }
  });
});

// Reschedule appointment
export const rescheduleAppointment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { newDateTime, reason } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (!newDateTime) {
    return res.status(400).json({
      success: false,
      message: 'New date and time are required'
    });
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Check authorization
  if (userRole !== 'admin' &&
      appointment.patient.toString() !== userId &&
      appointment.doctor.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to reschedule this appointment'
    });
  }

  // Check if appointment can be rescheduled
  if (!appointment.canBeRescheduled()) {
    return res.status(400).json({
      success: false,
      message: 'Appointment cannot be rescheduled (less than 48 hours remaining or already completed/cancelled)'
    });
  }

  // Check for conflicts at new time
  const newAppointmentDate = new Date(newDateTime);
  const endTime = new Date(newAppointmentDate.getTime() + appointment.duration * 60000);

  const conflictingAppointment = await Appointment.findOne({
    _id: { $ne: id },
    doctor: appointment.doctor,
    dateTime: {
      $lt: endTime
    },
    $expr: {
      $gt: [
        { $add: ['$dateTime', { $multiply: ['$duration', 60000] }] },
        newAppointmentDate
      ]
    },
    status: { $in: ['scheduled', 'confirmed'] }
  });

  if (conflictingAppointment) {
    return res.status(409).json({
      success: false,
      message: 'Doctor is not available at the requested new time'
    });
  }

  // Update appointment
  appointment.dateTime = newAppointmentDate;
  appointment.status = 'rescheduled';
  if (reason) {
    appointment.patientNotes = (appointment.patientNotes || '') + `\nRescheduled: ${reason}`;
  }

  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Appointment rescheduled successfully',
    data: { appointment }
  });
});

// Get appointment history
export const getAppointmentHistory = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user.id;
  const userRole = req.user.role;

  let query = {};

  if (userRole === 'patient') {
    query.patient = userId;
  } else if (userRole === 'doctor') {
    query.doctor = userId;
  } else if (userRole === 'admin') {
    // Admin can see all history
  } else {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view appointment history'
    });
  }

  // Only show completed or cancelled appointments
  query.status = { $in: ['completed', 'cancelled'] };

  const skip = (page - 1) * limit;
  const appointments = await Appointment.find(query)
    .populate('patient', 'firstName lastName email')
    .populate('doctor', 'firstName lastName email specialties')
    .sort({ dateTime: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Appointment.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      appointments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// Add appointment reminder
export const addAppointmentReminder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Check authorization
  if (userRole !== 'admin' &&
      appointment.patient.toString() !== userId &&
      appointment.doctor.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to add reminder for this appointment'
    });
  }

  // Update reminder count
  appointment.remindersSent = (appointment.remindersSent || 0) + 1;
  appointment.lastReminderSent = new Date();
  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Reminder added successfully',
    data: {
      remindersSent: appointment.remindersSent,
      lastReminderSent: appointment.lastReminderSent
    }
  });
});

// Get appointment statistics
export const getAppointmentStats = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole !== 'admin' && userRole !== 'doctor') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view appointment statistics'
    });
  }

  let matchQuery = {};
  if (userRole === 'doctor') {
    matchQuery.doctor = userId;
  }

  const stats = await Appointment.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalAppointments: { $sum: 1 },
        scheduledAppointments: {
          $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
        },
        confirmedAppointments: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        completedAppointments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledAppointments: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        totalRevenue: { $sum: '$fee.total' },
        averageRating: { $avg: '$rating.patientRating.score' }
      }
    }
  ]);

  const monthlyStats = await Appointment.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          year: { $year: '$dateTime' },
          month: { $month: '$dateTime' }
        },
        count: { $sum: 1 },
        revenue: { $sum: '$fee.total' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: stats[0] || {
        totalAppointments: 0,
        scheduledAppointments: 0,
        confirmedAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        totalRevenue: 0,
        averageRating: 0
      },
      monthlyStats
    }
  });
});
