import express from 'express';
import { protect, isAdmin } from '../middleware/auth.js';
import {
  getAdminDashboard,
  getSystemAnalytics,
  getUserStats,
  getDoctorManagement,
  getDoctorApplications,
  approveDoctorApplication,
  rejectDoctorApplication,
  suspendDoctor,
  activateDoctor,
  updateDoctorProfile,
  getAppointmentMonitoring,
  getAppointmentStats,
  getAppointmentTrends,
  getSystemHealth,
  getSystemLogs,
  getSystemAlerts,
  markAlertAsRead,
  dismissAlert,
  generateUserReport,
  generateAppointmentReport,
  generateAIReport,
  createSystemBackup,
  getBackupHistory,
  getSystemSettings,
  updateSystemSettings
} from '../controllers/adminController.js';
import {
  validateDoctorApplication,
  validateDoctorStatus,
  validateReportRequest,
  validateSystemSettings,
  validatePagination,
  validateDateRange,
  validateObjectId
} from '../middleware/validation.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(isAdmin);

// Dashboard and overview
router.get('/dashboard', getAdminDashboard);

// System analytics
router.get('/analytics', validateDateRange, getSystemAnalytics);

// User management
router.get('/users/stats', getUserStats);

// Doctor management
router.get('/doctors', validatePagination, getDoctorManagement);
router.get('/doctors/applications', validatePagination, getDoctorApplications);
router.post('/doctors/applications/:id/approve', validateObjectId('id'), validateDoctorApplication, approveDoctorApplication);
router.post('/doctors/applications/:id/reject', validateObjectId('id'), rejectDoctorApplication);
router.put('/doctors/:id/suspend', validateObjectId('id'), validateDoctorStatus, suspendDoctor);
router.put('/doctors/:id/activate', validateObjectId('id'), activateDoctor);
router.put('/doctors/:id/profile', validateObjectId('id'), updateDoctorProfile);

// Appointment monitoring
router.get('/appointments', validatePagination, getAppointmentMonitoring);
router.get('/appointments/stats', validateDateRange, getAppointmentStats);
router.get('/appointments/trends', validateDateRange, getAppointmentTrends);

// System health and monitoring
router.get('/health', getSystemHealth);
router.get('/logs', validatePagination, getSystemLogs);

// Alerts and notifications
router.get('/alerts', getSystemAlerts);
router.put('/alerts/:id/read', validateObjectId('id'), markAlertAsRead);
router.delete('/alerts/:id', validateObjectId('id'), dismissAlert);

// Reports and exports
router.get('/reports/users', validateReportRequest, generateUserReport);
router.get('/reports/appointments', validateReportRequest, generateAppointmentReport);
router.get('/reports/ai', validateReportRequest, generateAIReport);

// Backup and maintenance
router.post('/backup', createSystemBackup);
router.get('/backup/history', getBackupHistory);

// System settings
router.get('/settings', getSystemSettings);
router.put('/settings', validateSystemSettings, updateSystemSettings);

export default router; 