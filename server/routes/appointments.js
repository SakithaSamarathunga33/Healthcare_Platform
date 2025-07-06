import express from 'express';
import { protect, isPatient, isDoctor, authorize } from '../middleware/auth.js';
import {
  getAppointments,
  createAppointment,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  getAvailableTimeSlots,
  confirmAppointment,
  rescheduleAppointment,
  getAppointmentHistory,
  addAppointmentReminder,
  getAppointmentStats
} from '../controllers/appointmentController.js';
import {
  validateAppointmentCreation,
  validateAppointmentUpdate,
  validateTimeSlotRequest,
  validateAppointmentReschedule,
  validateObjectId,
  validatePagination
} from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get appointments (filtered by user role)
router.get('/', validatePagination, getAppointments);

// Create new appointment (patients only)
router.post('/', isPatient, validateAppointmentCreation, createAppointment);

// Get available time slots for a doctor
router.get('/available-slots', validateTimeSlotRequest, getAvailableTimeSlots);

// Get appointment statistics (admin and doctors)
router.get('/stats', authorize('admin', 'doctor'), getAppointmentStats);

// Get appointment history
router.get('/history', validatePagination, getAppointmentHistory);

// Get appointment by ID
router.get('/:id', validateObjectId('id'), getAppointmentById);

// Update appointment (doctors and admins)
router.put('/:id', validateObjectId('id'), authorize('doctor', 'admin'), validateAppointmentUpdate, updateAppointment);

// Reschedule appointment
router.put('/:id/reschedule', validateObjectId('id'), validateAppointmentReschedule, rescheduleAppointment);

// Confirm appointment (doctors only)
router.put('/:id/confirm', validateObjectId('id'), isDoctor, confirmAppointment);

// Add appointment reminder
router.post('/:id/reminder', validateObjectId('id'), addAppointmentReminder);

// Cancel appointment
router.delete('/:id', validateObjectId('id'), cancelAppointment);

export default router; 