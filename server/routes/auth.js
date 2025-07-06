import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserProfile,
  deleteUser,
  verifyToken
} from '../controllers/authController.js';
import {
  validateRegistration,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateAdminUpdateUserProfile,
  validateObjectId,
  validatePagination,
  validateSearch
} from '../middleware/validation.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.get('/verify', verifyToken);

// Protected routes
router.use(protect); // All routes after this middleware are protected

// User profile routes
router.get('/profile', getProfile);
router.put('/profile', validateUpdateProfile, updateProfile);
router.put('/change-password', validateChangePassword, changePassword);
router.post('/logout', logout);

// Admin only routes
router.use(isAdmin); // All routes after this middleware require admin role

// User management routes
router.get('/users', validatePagination, validateSearch, getUsers);
router.get('/users/:id', validateObjectId('id'), getUserById);
router.put('/users/:id', validateObjectId('id'), validateAdminUpdateUserProfile, updateUserProfile);
router.put('/users/:id/status', validateObjectId('id'), updateUserStatus);
router.delete('/users/:id', validateObjectId('id'), deleteUser);

// Debug route to test if the route is being hit (disabled)
// router.put('/users/:id/debug', (req, res) => {
//   console.log('Debug route hit with ID:', req.params.id);
//   res.json({ message: 'Debug route hit', id: req.params.id });
// });

export default router;