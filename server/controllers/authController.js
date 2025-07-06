import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      role, 
      phone, 
      dateOfBirth, 
      gender, 
      address,
      // Doctor-specific fields
      specialties,
      primarySpecialty,
      licenseNumber,
      yearsOfExperience,
      bio,
      consultationFee,
      isAcceptingPatients
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      dateOfBirth,
      gender,
      address
    });

    // If user is a doctor, create doctor profile
    if (role === 'doctor') {
      const doctorData = {
        user: user._id,
        specialties: specialties || [primarySpecialty],
        primarySpecialty: primarySpecialty,
        licenseNumber: licenseNumber,
        yearsOfExperience: yearsOfExperience,
        bio: bio,
        consultationFee: consultationFee,
        isAcceptingPatients: isAcceptingPatients !== undefined ? isAcceptingPatients : true,
        languages: ['English'], // Default language
        // Add default availability for weekdays
        availability: [
          {
            day: 'Monday',
            slots: [
              { startTime: '09:00', endTime: '09:30', isAvailable: true },
              { startTime: '09:30', endTime: '10:00', isAvailable: true },
              { startTime: '10:00', endTime: '10:30', isAvailable: true },
              { startTime: '10:30', endTime: '11:00', isAvailable: true },
              { startTime: '11:00', endTime: '11:30', isAvailable: true },
              { startTime: '11:30', endTime: '12:00', isAvailable: true },
              { startTime: '14:00', endTime: '14:30', isAvailable: true },
              { startTime: '14:30', endTime: '15:00', isAvailable: true },
              { startTime: '15:00', endTime: '15:30', isAvailable: true },
              { startTime: '15:30', endTime: '16:00', isAvailable: true },
              { startTime: '16:00', endTime: '16:30', isAvailable: true },
              { startTime: '16:30', endTime: '17:00', isAvailable: true }
            ]
          },
          {
            day: 'Tuesday',
            slots: [
              { startTime: '09:00', endTime: '09:30', isAvailable: true },
              { startTime: '09:30', endTime: '10:00', isAvailable: true },
              { startTime: '10:00', endTime: '10:30', isAvailable: true },
              { startTime: '10:30', endTime: '11:00', isAvailable: true },
              { startTime: '11:00', endTime: '11:30', isAvailable: true },
              { startTime: '11:30', endTime: '12:00', isAvailable: true },
              { startTime: '14:00', endTime: '14:30', isAvailable: true },
              { startTime: '14:30', endTime: '15:00', isAvailable: true },
              { startTime: '15:00', endTime: '15:30', isAvailable: true },
              { startTime: '15:30', endTime: '16:00', isAvailable: true },
              { startTime: '16:00', endTime: '16:30', isAvailable: true },
              { startTime: '16:30', endTime: '17:00', isAvailable: true }
            ]
          },
          {
            day: 'Wednesday',
            slots: [
              { startTime: '09:00', endTime: '09:30', isAvailable: true },
              { startTime: '09:30', endTime: '10:00', isAvailable: true },
              { startTime: '10:00', endTime: '10:30', isAvailable: true },
              { startTime: '10:30', endTime: '11:00', isAvailable: true },
              { startTime: '11:00', endTime: '11:30', isAvailable: true },
              { startTime: '11:30', endTime: '12:00', isAvailable: true },
              { startTime: '14:00', endTime: '14:30', isAvailable: true },
              { startTime: '14:30', endTime: '15:00', isAvailable: true },
              { startTime: '15:00', endTime: '15:30', isAvailable: true },
              { startTime: '15:30', endTime: '16:00', isAvailable: true },
              { startTime: '16:00', endTime: '16:30', isAvailable: true },
              { startTime: '16:30', endTime: '17:00', isAvailable: true }
            ]
          },
          {
            day: 'Thursday',
            slots: [
              { startTime: '09:00', endTime: '09:30', isAvailable: true },
              { startTime: '09:30', endTime: '10:00', isAvailable: true },
              { startTime: '10:00', endTime: '10:30', isAvailable: true },
              { startTime: '10:30', endTime: '11:00', isAvailable: true },
              { startTime: '11:00', endTime: '11:30', isAvailable: true },
              { startTime: '11:30', endTime: '12:00', isAvailable: true },
              { startTime: '14:00', endTime: '14:30', isAvailable: true },
              { startTime: '14:30', endTime: '15:00', isAvailable: true },
              { startTime: '15:00', endTime: '15:30', isAvailable: true },
              { startTime: '15:30', endTime: '16:00', isAvailable: true },
              { startTime: '16:00', endTime: '16:30', isAvailable: true },
              { startTime: '16:30', endTime: '17:00', isAvailable: true }
            ]
          },
          {
            day: 'Friday',
            slots: [
              { startTime: '09:00', endTime: '09:30', isAvailable: true },
              { startTime: '09:30', endTime: '10:00', isAvailable: true },
              { startTime: '10:00', endTime: '10:30', isAvailable: true },
              { startTime: '10:30', endTime: '11:00', isAvailable: true },
              { startTime: '11:00', endTime: '11:30', isAvailable: true },
              { startTime: '11:30', endTime: '12:00', isAvailable: true },
              { startTime: '14:00', endTime: '14:30', isAvailable: true },
              { startTime: '14:30', endTime: '15:00', isAvailable: true },
              { startTime: '15:00', endTime: '15:30', isAvailable: true },
              { startTime: '15:30', endTime: '16:00', isAvailable: true },
              { startTime: '16:00', endTime: '16:30', isAvailable: true },
              { startTime: '16:30', endTime: '17:00', isAvailable: true }
            ]
          }
        ]
      };

      await Doctor.create(doctorData);
    }

    // Generate JWT token
    const token = user.getSignedJwtToken();

    // Update last login
    await user.updateLastLogin();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      token,
      user: userResponse,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = user.getSignedJwtToken();

    // Update last login
    await user.updateLastLogin();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // If user is a doctor, get additional doctor details
    let doctorDetails = null;
    if (user.role === 'doctor') {
      doctorDetails = await Doctor.findOne({ user: user._id })
        .populate('user', 'firstName lastName email phone avatar');
    }

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        doctorDetails
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { firstName, lastName, phone, dateOfBirth, gender, address, avatar } = req.body;

    // Fields to update
    const fieldsToUpdate = {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      address,
      avatar
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] === undefined) {
        delete fieldsToUpdate[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    // Since we're using JWT, we can't invalidate the token on the server side
    // The frontend should remove the token from localStorage
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ];
    }

    // Get users
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count
    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/auth/users/:id
// @access  Private/Admin
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // If user is a doctor, get additional doctor details
    let doctorDetails = null;
    if (user.role === 'doctor') {
      doctorDetails = await Doctor.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        doctorDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (Admin only)
// @route   PUT /api/auth/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (Admin only)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
export const updateUserProfile = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Handle different update logic based on user role
    if (user.role === 'doctor') {
      return await updateDoctorProfile(req, res, next);
    } else {
      // For patients and admins, update only User model
      const { firstName, lastName, phone, dateOfBirth, gender, address, role } = req.body;

      // Fields to update
      const fieldsToUpdate = {
        firstName,
        lastName,
        phone,
        dateOfBirth,
        gender,
        address,
        role
      };

      // Remove undefined fields
      Object.keys(fieldsToUpdate).forEach(key => {
        if (fieldsToUpdate[key] === undefined) {
          delete fieldsToUpdate[key];
        }
      });

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        fieldsToUpdate,
        {
          new: true,
          runValidators: true
        }
      ).select('-password');

      res.status(200).json({
        success: true,
        user: updatedUser,
        message: 'User profile updated successfully'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile (Admin only)
// @route   PUT /api/auth/users/:id (when user is doctor)
// @access  Private/Admin
const updateDoctorProfile = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      address,
      specialties,
      primarySpecialty,
      licenseNumber,
      yearsOfExperience,
      education,
      certifications,
      languages,
      bio,
      consultationFee,
      hospital,
      isVerified,
      isAcceptingPatients
    } = req.body;

    // Update User model fields
    const userFields = {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      address
    };

    // Remove undefined fields from user update
    Object.keys(userFields).forEach(key => {
      if (userFields[key] === undefined) {
        delete userFields[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      userFields,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update Doctor model fields
    const doctorFields = {
      user: req.params.id, // Ensure user field is set for new Doctor
      specialties,
      primarySpecialty,
      licenseNumber,
      yearsOfExperience,
      education,
      certifications,
      languages,
      bio,
      consultationFee,
      hospital,
      isVerified,
      isAcceptingPatients
    };

    // Remove undefined fields from doctor update
    Object.keys(doctorFields).forEach(key => {
      if (doctorFields[key] === undefined) {
        delete doctorFields[key];
      }
    });

    let updatedDoctor = await Doctor.findOneAndUpdate(
      { user: req.params.id },
      doctorFields,
      {
        new: true,
        runValidators: true
      }
    ).populate('user', '-password');

    // If no doctor profile exists, create one
    if (!updatedDoctor) {
      console.log('Creating new doctor profile for user:', req.params.id);
      updatedDoctor = await Doctor.create(doctorFields);
      updatedDoctor = await Doctor.findById(updatedDoctor._id).populate('user', '-password');
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
      doctor: updatedDoctor,
      message: 'Doctor profile updated successfully'
    });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    next(error);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // If user is a doctor, also delete doctor record
    if (user.role === 'doctor') {
      await Doctor.findOneAndDelete({ user: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    next(error);
  }
};

// @desc    Verify JWT token
// @route   GET /api/auth/verify
// @access  Public
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      user
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      valid: false,
      error: 'Invalid token'
    });
  }
};