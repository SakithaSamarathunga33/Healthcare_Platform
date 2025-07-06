import express from 'express';
import { protect, isPatient } from '../middleware/auth.js';
import {
  getPatientDashboard,
  getPatientAppointments,
  getPatientHistory,
  getPatientProfile,
  updatePatientProfile,
  getMedicalRecords,
  addMedicalRecord,
  getPrescriptions,
  getTestResults,
  getVitalSigns,
  addVitalSigns,
  getEmergencyContacts,
  updateEmergencyContacts,
  getInsuranceInfo,
  updateInsuranceInfo,
  getHealthMetrics,
  logHealthMetric
} from '../controllers/patientController.js';
import {
  validateUpdateProfile,
  validateMedicalRecord,
  validateVitalSigns,
  validateHealthMetric,
  validateEmergencyContacts,
  validateInsuranceInfo,
  validatePagination
} from '../middleware/validation.js';

const router = express.Router();

// All routes are protected and require patient role
router.use(protect);
router.use(isPatient);

// Dashboard and overview
router.get('/dashboard', getPatientDashboard);

// Appointments
router.get('/appointments', validatePagination, getPatientAppointments);

// Medical history
router.get('/history', validatePagination, getPatientHistory);

// Profile management
router.get('/profile', getPatientProfile);
router.put('/profile', validateUpdateProfile, updatePatientProfile);

// Medical records
router.get('/medical-records', validatePagination, getMedicalRecords);
router.post('/medical-records', validateMedicalRecord, addMedicalRecord);

// Prescriptions
router.get('/prescriptions', validatePagination, getPrescriptions);

// Test results
router.get('/test-results', validatePagination, getTestResults);

// Vital signs
router.get('/vital-signs', validatePagination, getVitalSigns);
router.post('/vital-signs', validateVitalSigns, addVitalSigns);

// Emergency contacts
router.get('/emergency-contacts', getEmergencyContacts);
router.put('/emergency-contacts', validateEmergencyContacts, updateEmergencyContacts);

// Insurance information
router.get('/insurance', getInsuranceInfo);
router.put('/insurance', validateInsuranceInfo, updateInsuranceInfo);

// Health metrics
router.get('/health-metrics', validatePagination, getHealthMetrics);
router.post('/health-metrics', validateHealthMetric, logHealthMetric);

export default router; 