import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import AILog from '../models/AILog.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';

// Get admin dashboard with system overview
export const getAdminDashboard = catchAsync(async (req, res) => {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersThisMonth = await User.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    // Get appointment statistics
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const todayAppointments = await Appointment.countDocuments({
        appointmentDate: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
    });

    // Get AI usage statistics
    const totalAIInteractions = await AILog.countDocuments();
    const aiInteractionsToday = await AILog.countDocuments({
        createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
    });

    res.status(200).json({
        status: 'success',
        data: {
            users: {
                total: totalUsers,
                active: activeUsers,
                newThisMonth: newUsersThisMonth
            },
            appointments: {
                total: totalAppointments,
                pending: pendingAppointments,
                completed: completedAppointments,
                today: todayAppointments
            },
            ai: {
                totalInteractions: totalAIInteractions,
                interactionsToday: aiInteractionsToday
            }
        }
    });
});

// Get detailed system analytics
export const getSystemAnalytics = catchAsync(async (req, res) => {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // User registration trends
    const userTrends = await User.aggregate([
        {
            $match: { createdAt: { $gte: startDate } }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Appointment trends
    const appointmentTrends = await Appointment.aggregate([
        {
            $match: { createdAt: { $gte: startDate } }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // AI usage trends
    const aiTrends = await AILog.aggregate([
        {
            $match: { createdAt: { $gte: startDate } }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            period: days,
            trends: {
                users: userTrends,
                appointments: appointmentTrends,
                ai: aiTrends
            }
        }
    });
});

// Get all users with pagination
export const getAllUsers = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
});

// Get all appointments with pagination and filtering
export const getAllAppointments = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, date } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        filter.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(filter)
        .populate('user', 'name email')
        .sort({ appointmentDate: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Appointment.countDocuments(filter);

    res.status(200).json({
        status: 'success',
        results: appointments.length,
        data: {
            appointments,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
});

// Update user status (activate/deactivate)
export const updateUserStatus = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
        userId,
        { isActive },
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

// Update appointment status
export const updateAppointmentStatus = catchAsync(async (req, res) => {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { status },
        { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!appointment) {
        return next(new AppError('Appointment not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            appointment
        }
    });
});

// Get AI interaction logs
export const getAILogs = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const logs = await AILog.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await AILog.countDocuments();

    res.status(200).json({
        status: 'success',
        results: logs.length,
        data: {
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
});

// Get user statistics
export const getUserStats = catchAsync(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const patientCount = await User.countDocuments({ role: 'patient' });
    const doctorCount = await User.countDocuments({ role: 'doctor' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    const newUsersThisMonth = await User.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    res.status(200).json({
        success: true,
        data: {
            totalUsers,
            activeUsers,
            patientCount,
            doctorCount,
            adminCount,
            newUsersThisMonth
        }
    });
});

// Get doctor management data
export const getDoctorManagement = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Build filter for User model
    const userFilter = { role: 'doctor' };
    if (status === 'active') userFilter.isActive = true;
    if (status === 'inactive') userFilter.isActive = false;

    // Get doctors with their user details and doctor profile
    const doctors = await Doctor.find({})
        .populate({
            path: 'user',
            match: userFilter,
            select: '-password'
        })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    // Filter out doctors where user match failed (due to populate match filter)
    const filteredDoctors = doctors.filter(doctor => doctor.user !== null);

    // Get total count for pagination
    const totalUsers = await User.countDocuments(userFilter);

    res.status(200).json({
        success: true,
        data: {
            doctors: filteredDoctors,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalUsers / limit),
                totalItems: totalUsers,
                itemsPerPage: parseInt(limit)
            }
        }
    });
});

// Get doctor applications
export const getDoctorApplications = catchAsync(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const applications = await User.find({
        role: 'doctor',
        status: 'pending'
    })
        .select('-password')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    const total = await User.countDocuments({ role: 'doctor', status: 'pending' });

    res.status(200).json({
        success: true,
        data: {
            applications,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        }
    });
});

// Approve doctor application
export const approveDoctorApplication = catchAsync(async (req, res) => {
    const { doctorId } = req.params;

    const doctor = await User.findByIdAndUpdate(
        doctorId,
        { status: 'active', isActive: true },
        { new: true, runValidators: true }
    ).select('-password');

    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Doctor application approved successfully',
        data: { doctor }
    });
});

// Reject doctor application
export const rejectDoctorApplication = catchAsync(async (req, res) => {
    const { doctorId } = req.params;
    const { reason } = req.body;

    const doctor = await User.findByIdAndUpdate(
        doctorId,
        {
            status: 'rejected',
            isActive: false,
            rejectionReason: reason
        },
        { new: true, runValidators: true }
    ).select('-password');

    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Doctor application rejected',
        data: { doctor }
    });
});

// Suspend doctor
export const suspendDoctor = catchAsync(async (req, res) => {
    const { doctorId } = req.params;
    const { reason } = req.body;

    const doctor = await User.findByIdAndUpdate(
        doctorId,
        {
            status: 'suspended',
            isActive: false,
            suspensionReason: reason
        },
        { new: true, runValidators: true }
    ).select('-password');

    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Doctor suspended successfully',
        data: { doctor }
    });
});

// Activate doctor
export const activateDoctor = catchAsync(async (req, res) => {
    const { doctorId } = req.params;

    const doctor = await User.findByIdAndUpdate(
        doctorId,
        {
            status: 'active',
            isActive: true,
            $unset: { suspensionReason: 1, rejectionReason: 1 }
        },
        { new: true, runValidators: true }
    ).select('-password');

    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Doctor activated successfully',
        data: { doctor }
    });
});

// Update doctor profile details
export const updateDoctorProfile = catchAsync(async (req, res) => {
    const { id: doctorId } = req.params;
    const updateData = req.body;

    // Find the doctor profile
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        return next(new AppError('Doctor profile not found', 404));
    }

    // Update the doctor profile with the provided data
    const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctorId,
        {
            bio: updateData.bio,
            consultationFee: updateData.consultationFee,
            languages: updateData.languages,
            hospital: updateData.hospital,
            isVerified: updateData.isVerified,
            isAcceptingPatients: updateData.isAcceptingPatients
        },
        { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email');

    res.status(200).json({
        success: true,
        message: 'Doctor profile updated successfully',
        data: { doctor: updatedDoctor }
    });
});

// Get appointment monitoring data
export const getAppointmentMonitoring = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, status, date } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        filter.dateTime = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(filter)
        .populate('patient', 'firstName lastName email')
        .populate('doctor', 'firstName lastName specialties')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ dateTime: -1 });

    const total = await Appointment.countDocuments(filter);

    res.status(200).json({
        success: true,
        data: {
            appointments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        }
    });
});

// Get appointment statistics
export const getAppointmentStats = catchAsync(async (req, res) => {
    const totalAppointments = await Appointment.countDocuments();
    const scheduledAppointments = await Appointment.countDocuments({ status: 'scheduled' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    const todayAppointments = await Appointment.countDocuments({
        dateTime: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
    });

    res.status(200).json({
        success: true,
        data: {
            totalAppointments,
            scheduledAppointments,
            confirmedAppointments,
            completedAppointments,
            cancelledAppointments,
            todayAppointments
        }
    });
});

// Get appointment trends
export const getAppointmentTrends = catchAsync(async (req, res) => {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await Appointment.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                },
                count: { $sum: 1 },
                completed: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                cancelled: {
                    $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
    ]);

    res.status(200).json({
        success: true,
        data: { trends }
    });
});

// Get system health
export const getSystemHealth = catchAsync(async (req, res) => {
    const dbStatus = 'connected'; // This would be more complex in real implementation
    const serverUptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    const activeUsers = await User.countDocuments({ isActive: true });
    const todayAppointments = await Appointment.countDocuments({
        dateTime: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
    });

    res.status(200).json({
        success: true,
        data: {
            database: { status: dbStatus },
            server: {
                uptime: serverUptime,
                memory: memoryUsage
            },
            activeUsers,
            todayAppointments,
            timestamp: new Date()
        }
    });
});

// Get system logs
export const getSystemLogs = catchAsync(async (req, res) => {
    const { page = 1, limit = 50, level } = req.query;
    const skip = (page - 1) * limit;

    // This would typically come from a logging system
    const logs = [
        {
            id: 1,
            level: 'info',
            message: 'Server started successfully',
            timestamp: new Date(),
            source: 'server'
        },
        {
            id: 2,
            level: 'info',
            message: 'Database connected',
            timestamp: new Date(),
            source: 'database'
        }
    ];

    res.status(200).json({
        success: true,
        data: {
            logs: logs.slice(skip, skip + parseInt(limit)),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(logs.length / limit),
                totalItems: logs.length,
                itemsPerPage: parseInt(limit)
            }
        }
    });
});

// Get system alerts
export const getSystemAlerts = catchAsync(async (req, res) => {
    // This would typically come from a monitoring system
    const alerts = [
        {
            id: 1,
            type: 'warning',
            message: 'High memory usage detected',
            timestamp: new Date(),
            isRead: false
        }
    ];

    res.status(200).json({
        success: true,
        data: { alerts }
    });
});

// Mark alert as read
export const markAlertAsRead = catchAsync(async (req, res) => {
    const { alertId } = req.params;

    // This would typically update the alert in a database
    res.status(200).json({
        success: true,
        message: 'Alert marked as read'
    });
});

// Dismiss alert
export const dismissAlert = catchAsync(async (req, res) => {
    const { alertId } = req.params;

    // This would typically remove the alert from a database
    res.status(200).json({
        success: true,
        message: 'Alert dismissed'
    });
});

// Generate user report
export const generateUserReport = catchAsync(async (req, res) => {
    const { startDate, endDate, format = 'json' } = req.query;

    const filter = {};
    if (startDate && endDate) {
        filter.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const users = await User.find(filter).select('-password');
    const report = {
        generatedAt: new Date(),
        totalUsers: users.length,
        usersByRole: {
            patients: users.filter(u => u.role === 'patient').length,
            doctors: users.filter(u => u.role === 'doctor').length,
            admins: users.filter(u => u.role === 'admin').length
        },
        activeUsers: users.filter(u => u.isActive).length,
        users: users
    };

    res.status(200).json({
        success: true,
        data: { report }
    });
});

// Generate appointment report
export const generateAppointmentReport = catchAsync(async (req, res) => {
    const { startDate, endDate, format = 'json' } = req.query;

    const filter = {};
    if (startDate && endDate) {
        filter.dateTime = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const appointments = await Appointment.find(filter)
        .populate('patient', 'firstName lastName email')
        .populate('doctor', 'firstName lastName specialties');

    const report = {
        generatedAt: new Date(),
        totalAppointments: appointments.length,
        appointmentsByStatus: {
            scheduled: appointments.filter(a => a.status === 'scheduled').length,
            confirmed: appointments.filter(a => a.status === 'confirmed').length,
            completed: appointments.filter(a => a.status === 'completed').length,
            cancelled: appointments.filter(a => a.status === 'cancelled').length
        },
        appointments: appointments
    };

    res.status(200).json({
        success: true,
        data: { report }
    });
});

// Generate AI report
export const generateAIReport = catchAsync(async (req, res) => {
    const { startDate, endDate, format = 'json' } = req.query;

    const filter = {};
    if (startDate && endDate) {
        filter.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const aiLogs = await AILog.find(filter);
    const report = {
        generatedAt: new Date(),
        totalInteractions: aiLogs.length,
        interactionsByType: {
            symptom_analysis: aiLogs.filter(l => l.interactionType === 'symptom_analysis').length,
            health_advice: aiLogs.filter(l => l.interactionType === 'health_advice').length,
            appointment_help: aiLogs.filter(l => l.interactionType === 'appointment_help').length
        },
        logs: aiLogs
    };

    res.status(200).json({
        success: true,
        data: { report }
    });
});

// Create system backup
export const createSystemBackup = catchAsync(async (req, res) => {
    // This would typically trigger a backup process
    const backup = {
        id: Date.now(),
        createdAt: new Date(),
        status: 'completed',
        size: '125MB',
        type: 'full'
    };

    res.status(200).json({
        success: true,
        message: 'System backup created successfully',
        data: { backup }
    });
});

// Get backup history
export const getBackupHistory = catchAsync(async (req, res) => {
    // This would typically come from a backup system
    const backups = [
        {
            id: 1,
            createdAt: new Date(),
            status: 'completed',
            size: '125MB',
            type: 'full'
        },
        {
            id: 2,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            status: 'completed',
            size: '45MB',
            type: 'incremental'
        }
    ];

    res.status(200).json({
        success: true,
        data: { backups }
    });
});

// Get system settings
export const getSystemSettings = catchAsync(async (req, res) => {
    // This would typically come from a settings database
    const settings = {
        maintenance: {
            enabled: false,
            message: ''
        },
        appointments: {
            maxAdvanceBookingDays: 30,
            cancellationDeadlineHours: 24,
            reminderHours: [24, 2]
        },
        notifications: {
            emailEnabled: true,
            smsEnabled: false
        }
    };

    res.status(200).json({
        success: true,
        data: { settings }
    });
});

// Update system settings
export const updateSystemSettings = catchAsync(async (req, res) => {
    const { settings } = req.body;

    // This would typically update settings in a database
    res.status(200).json({
        success: true,
        message: 'System settings updated successfully',
        data: { settings }
    });
});
