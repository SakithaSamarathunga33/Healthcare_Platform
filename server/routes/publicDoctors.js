import express from 'express';
import {
  getPublicDoctors,
  getDoctorById
} from '../controllers/doctorController.js';
import {
  validatePagination,
  validateObjectId
} from '../middleware/validation.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', validatePagination, getPublicDoctors);
router.get('/:id', validateObjectId('id'), getDoctorById);

export default router; 