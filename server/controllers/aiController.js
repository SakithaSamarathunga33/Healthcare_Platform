import { validationResult } from 'express-validator';
import mlAiService from '../services/mlAiService.js';
import AILog from '../models/AILog.js';

// Use ML AI service instance
const aiService = mlAiService;

// @desc    Analyze symptoms and get specialty recommendation
// @route   POST /api/ai/analyze-symptoms
// @access  Private/Patient
export const analyzeSymptoms = async (req, res, next) => {
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

    const { symptoms } = req.body;
    const patientId = req.user.id;

    // Prepare request metadata
    const requestMetadata = {
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      sessionId: req.sessionID || 'no-session'
    };

    // Analyze symptoms using AI service
    const result = await aiService.analyzeSymptoms(symptoms, patientId, requestMetadata);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.analysis,
        metadata: result.metadata,
        message: 'Symptoms analyzed successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        fallback: result.fallback,
        message: 'AI analysis failed, fallback recommendation provided'
      });
    }
  } catch (error) {
    console.error('Analyze symptoms error:', error);
    next(error);
  }
};

// @desc    Get AI analysis history for patient
// @route   GET /api/ai/history
// @access  Private/Patient
export const getAnalysisHistory = async (req, res, next) => {
  try {
    const patientId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get analysis history
    const history = await AILog.find({ patientId: patientId })
      .select('symptoms analysis requestMetadata timestamp status')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await AILog.countDocuments({ patientId: patientId });

    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get analysis history error:', error);
    next(error);
  }
};

// @desc    Get specific AI analysis by ID
// @route   GET /api/ai/analysis/:id
// @access  Private
export const getAnalysisById = async (req, res, next) => {
  try {
    const analysisId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build query based on user role
    let query = { _id: analysisId };
    
    // Patients can only see their own analyses
    if (userRole === 'patient') {
      query.patientId = userId;
    }
    // Doctors can see analyses if they have follow-up appointments
    else if (userRole === 'doctor') {
      // This would need to be expanded to check if doctor has appointments with the patient
    }
    // Admins can see all analyses

    const analysis = await AILog.findOne(query)
      .populate('patientId', 'firstName lastName email');

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Get analysis by ID error:', error);
    next(error);
  }
};

// @desc    Add feedback to AI analysis
// @route   POST /api/ai/analysis/:id/feedback
// @access  Private
export const addFeedback = async (req, res, next) => {
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

    const analysisId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { wasHelpful, wasAccurate, rating, comment, actualSpecialty } = req.body;

    const analysis = await AILog.findById(analysisId);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    // Check permissions
    if (userRole === 'patient' && analysis.patientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to provide feedback on this analysis'
      });
    }

    // Add appropriate feedback based on user role
    if (userRole === 'patient') {
      await analysis.addPatientFeedback(wasHelpful, rating, comment);
    } else if (userRole === 'doctor') {
      await analysis.addDoctorFeedback(wasAccurate, actualSpecialty, rating, comment, userId);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid user role for feedback'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback added successfully'
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    next(error);
  }
};

// @desc    Get AI analytics (Admin only)
// @route   GET /api/ai/analytics
// @access  Private/Admin
export const getAIAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 30 days if no dates provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const analytics = await aiService.getAnalytics(start, end);

    res.status(200).json({
      success: true,
      data: analytics,
      period: {
        startDate: start,
        endDate: end
      }
    });
  } catch (error) {
    console.error('Get AI analytics error:', error);
    next(error);
  }
};

// @desc    Get model performance metrics (Admin only)
// @route   GET /api/ai/metrics
// @access  Private/Admin
export const getModelMetrics = async (req, res, next) => {
  try {
    const { model, startDate, endDate } = req.query;
    
    // Default model and dates
    const modelName = model || process.env.OPENROUTER_MODEL || 'anthropic/claude-instant-v1';
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const metrics = await aiService.getModelMetrics(modelName, start, end);

    res.status(200).json({
      success: true,
      data: metrics[0] || {
        totalPredictions: 0,
        avgAccuracy: 0,
        avgConfidence: 0,
        avgResponseTime: 0,
        totalCost: 0,
        appointmentConversionRate: 0
      },
      model: modelName,
      period: {
        startDate: start,
        endDate: end
      }
    });
  } catch (error) {
    console.error('Get model metrics error:', error);
    next(error);
  }
};

// @desc    Get all AI logs (Admin only)
// @route   GET /api/ai/logs
// @access  Private/Admin
export const getAILogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query filters
    const filters = {};
    
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    if (req.query.urgency) {
      filters['analysis.urgencyLevel'] = req.query.urgency;
    }
    
    if (req.query.specialty) {
      filters['analysis.recommendedSpecialty'] = req.query.specialty;
    }
    
    if (req.query.flagged === 'true') {
      filters['flags.0'] = { $exists: true };
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filters.timestamp = {};
      if (req.query.startDate) {
        filters.timestamp.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filters.timestamp.$lte = new Date(req.query.endDate);
      }
    }

    // Get logs
    const logs = await AILog.find(filters)
      .populate('patientId', 'firstName lastName email phone dateOfBirth')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);



    // Get total count
    const total = await AILog.countDocuments(filters);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: req.query
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Flag AI analysis (Admin/Doctor only)
// @route   POST /api/ai/analysis/:id/flag
// @access  Private/Admin/Doctor
export const flagAnalysis = async (req, res, next) => {
  try {
    const analysisId = req.params.id;
    const { type, reason } = req.body;
    const flaggedBy = req.user.id;

    const analysis = await AILog.findById(analysisId);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    await analysis.flag(type, reason, flaggedBy);

    res.status(200).json({
      success: true,
      message: 'Analysis flagged successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve flagged analysis (Admin only)
// @route   POST /api/ai/analysis/:id/resolve/:flagId
// @access  Private/Admin
export const resolveFlaggedAnalysis = async (req, res, next) => {
  try {
    const { id: analysisId, flagId } = req.params;
    const { resolutionNotes } = req.body;
    const resolvedBy = req.user.id;

    const analysis = await AILog.findById(analysisId);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    await analysis.resolveFlag(flagId, resolvedBy, resolutionNotes);

    res.status(200).json({
      success: true,
      message: 'Flag resolved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate AI prediction (Admin only)
// @route   POST /api/ai/analysis/:id/validate
// @access  Private/Admin
export const validatePrediction = async (req, res, next) => {
  try {
    const analysisId = req.params.id;
    const { correctSpecialty, accuracyScore, notes } = req.body;
    const validatedBy = req.user.id;

    const analysis = await AILog.findById(analysisId);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    await analysis.validate(validatedBy, correctSpecialty, accuracyScore, notes);

    res.status(200).json({
      success: true,
      message: 'Prediction validated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete AI log (Admin only)
// @route   DELETE /api/ai/logs/:id
// @access  Private/Admin
export const deleteAILog = async (req, res, next) => {
  try {
    const logId = req.params.id;

    const log = await AILog.findById(logId);
    
    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'AI log not found'
      });
    }

    await AILog.findByIdAndDelete(logId);

    res.status(200).json({
      success: true,
      message: 'AI log deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available medical specialties
// @route   GET /api/ai/specialties
// @access  Public
export const getSpecialties = async (req, res, next) => {
  try {
    const specialties = [
      'General Practice',
      'Cardiology',
      'Dermatology', 
      'Endocrinology',
      'Gastroenterology',
      'Hematology',
      'Infectious Disease',
      'Nephrology',
      'Neurology',
      'Oncology',
      'Orthopedics',
      'Pediatrics',
      'Psychiatry',
      'Pulmonology',
      'Radiology',
      'Rheumatology',
      'Urology',
      'Gynecology',
      'Ophthalmology',
      'ENT',
      'Emergency Medicine',
      'Anesthesiology',
      'Pathology',
      'Surgery',
      'Plastic Surgery',
      'Neurosurgery',
      'Orthopedic Surgery',
      'Cardiac Surgery'
    ].sort();

    res.status(200).json({
      success: true,
      data: specialties
    });
  } catch (error) {
    next(error);
  }
}; 