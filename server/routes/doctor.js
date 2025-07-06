import express from 'express';
import { protect, isDoctor } from '../middleware/auth.js';
import {
  getDoctorDashboard,
  getDoctorAppointments,
  getDoctorPatients,
  getPatientDetails,
  updateAppointmentStatus,
  addAppointmentNotes,
  getDoctorProfile,
  updateDoctorProfile,
  getAvailabilitySettings,
  updateAvailability,
  getDoctorSchedule,
  updateDoctorSchedule,
  getDoctorVerificationStatus,
  updateVerificationDocuments,
  getDoctorSpecialties,
  updateDoctorSpecialties,
  toggleAcceptingPatients
} from '../controllers/doctorController.js';
import {
  validateUpdateProfile,
  validateAppointmentStatus,
  validateAppointmentNotes,
  validateAvailability,
  validateSchedule,
  validatePagination,
  validateObjectId
} from '../middleware/validation.js';

const router = express.Router();

// All routes are protected and require doctor role
router.use(protect);
router.use(isDoctor);

// Dashboard and overview
router.get('/dashboard/overview', getDoctorDashboard);

// Appointments (must come before /:id routes)
router.get('/appointments', validatePagination, getDoctorAppointments);
router.put('/appointments/:id/status', validateObjectId('id'), validateAppointmentStatus, updateAppointmentStatus);
router.put('/appointments/:id/notes', validateObjectId('id'), validateAppointmentNotes, addAppointmentNotes);

// Patients
router.get('/patients', validatePagination, getDoctorPatients);
router.get('/patients/:id', validateObjectId('id'), getPatientDetails);

// Profile management
router.get('/profile', getDoctorProfile);
router.put('/profile', validateUpdateProfile, updateDoctorProfile);

// Availability and scheduling
router.get('/availability', getAvailabilitySettings);
router.put('/availability', validateAvailability, updateAvailability);
router.get('/schedule', getDoctorSchedule);
router.put('/schedule', validateSchedule, updateDoctorSchedule);

// Verification and documents
router.get('/verification', getDoctorVerificationStatus);
router.put('/verification/documents', updateVerificationDocuments);

// Specialties and education
router.get('/specialties', getDoctorSpecialties);
router.put('/specialties', updateDoctorSpecialties);

// Status management
router.put('/toggle-accepting-patients', toggleAcceptingPatients);



export default router;
