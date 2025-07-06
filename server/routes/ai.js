import express from 'express';
import {
  analyzeSymptoms,
  getAnalysisHistory,
  getAnalysisById,
  addFeedback,
  getAIAnalytics,
  getModelMetrics,
  getAILogs,
  flagAnalysis,
  resolveFlaggedAnalysis,
  validatePrediction,
  getSpecialties,
  deleteAILog
} from '../controllers/aiController.js';
import {
  validateSymptomAnalysis,
  validateRating,
  validateObjectId,
  validatePagination,
  validateDateRange
} from '../middleware/validation.js';
import { protect, isPatient, isAdmin, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/specialties', getSpecialties);

// Protected routes
router.use(protect); // All routes after this middleware are protected

// Patient routes
router.post('/analyze-symptoms', isPatient, validateSymptomAnalysis, analyzeSymptoms);
router.get('/history', isPatient, validatePagination, getAnalysisHistory);

// General authenticated user routes
router.get('/analysis/:id', validateObjectId('id'), getAnalysisById);
router.post('/analysis/:id/feedback', validateObjectId('id'), validateRating, addFeedback);

// Doctor and Admin routes
router.post('/analysis/:id/flag', 
  authorize('doctor', 'admin'), 
  validateObjectId('id'), 
  flagAnalysis
);

// Admin only routes
router.use(isAdmin); // All routes after this middleware require admin role

// Analytics and monitoring routes
router.get('/analytics', validateDateRange, getAIAnalytics);
router.get('/metrics', validateDateRange, getModelMetrics);
router.get('/logs', validatePagination, validateDateRange, getAILogs);

// Admin management routes
router.post('/analysis/:id/resolve/:flagId', 
  validateObjectId('id'), 
  validateObjectId('flagId'), 
  resolveFlaggedAnalysis
);
router.post('/analysis/:id/validate', 
  validateObjectId('id'), 
  validatePrediction
);
router.delete('/logs/:id', 
  validateObjectId('id'), 
  deleteAILog
);

export default router; 