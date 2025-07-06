import axios from 'axios';
import dotenv from 'dotenv';
import AILog from '../models/AILog.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure environment variables are loaded
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MLAIService {
  constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';
    this.mlServiceProcess = null;
    this.isMLServiceRunning = false;
    this.model = 'local-ml-ensemble';
    
    // Start the ML service on initialization
    this.startMLService();
  }

  /**
   * Start the Python ML service
   */
  async startMLService() {
    try {
      // Check if service is already running
      if (await this.checkMLServiceHealth()) {
        console.log('[OK] ML service is already running');
        this.isMLServiceRunning = true;
        return;
      }

      console.log('[INFO] Starting ML prediction service...');
      
      const mlPath = path.join(__dirname, '..', 'ml');
      const pythonScript = path.join(mlPath, 'simple_flask_service.py');
      
      // Start the Python service
      this.mlServiceProcess = spawn('python', [pythonScript], {
        cwd: mlPath,
        stdio: 'pipe',
        env: {
          ...process.env,
          ML_SERVICE_PORT: '5001',
          ML_SERVICE_HOST: '127.0.0.1'
        }
      });

      // Handle service output
      this.mlServiceProcess.stdout.on('data', (data) => {
        console.log(`ML Service: ${data}`);
      });

      this.mlServiceProcess.stderr.on('data', (data) => {
        console.error(`ML Service Error: ${data}`);
      });

      this.mlServiceProcess.on('close', (code) => {
        console.log(`ML Service process exited with code ${code}`);
        this.isMLServiceRunning = false;
      });

      // Wait for service to start
      await this.waitForMLService();
      
    } catch (error) {
      console.error('[ERROR] Failed to start ML service:', error);
      throw error;
    }
  }

  /**
   * Wait for ML service to be ready
   */
  async waitForMLService(maxRetries = 30) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        if (await this.checkMLServiceHealth()) {
          console.log('[OK] ML service is ready');
          this.isMLServiceRunning = true;
          return true;
        }
      } catch (error) {
        // Service not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('ML service failed to start within timeout');
  }

  /**
   * Check if ML service is healthy
   */
  async checkMLServiceHealth() {
    try {
      const response = await axios.get(`${this.mlServiceUrl}/health`, {
        timeout: 5000
      });
      
      return response.data.status === 'healthy' && response.data.model_loaded;
    } catch (error) {
      return false;
    }
  }

  /**
   * Stop the ML service
   */
  stopMLService() {
    if (this.mlServiceProcess) {
      this.mlServiceProcess.kill();
      this.mlServiceProcess = null;
      this.isMLServiceRunning = false;
      console.log('[INFO] ML service stopped');
    }
  }

  /**
   * Analyze symptoms and recommend medical specialty
   * @param {string} symptoms - Patient's symptom description
   * @param {string} patientId - Patient's ID
   * @param {Object} requestMetadata - Request metadata (IP, user agent, etc.)
   * @returns {Object} Analysis result with specialty recommendation
   */
  async analyzeSymptoms(symptoms, patientId, requestMetadata = {}) {
    try {
      const startTime = Date.now();
      const requestId = this.generateRequestId();

      // Ensure ML service is running
      if (!this.isMLServiceRunning) {
        await this.startMLService();
      }

      // Make prediction request to ML service
      const response = await this.makePredictionRequest(symptoms);
      
      const responseTime = Date.now() - startTime;

      // Parse the ML response
      const analysis = this.parseMLResponse(response.data);

      // Create log entry (non-blocking - don't let database issues fail the AI response)
      let logId = null;
      try {
        const logData = await this.createLogEntry({
          patientId,
          symptoms,
          analysis,
          requestId,
          requestMetadata,
          responseTime,
          tokenUsage: { input_tokens: symptoms.length, output_tokens: 0 },
          apiCost: 0 // Free local ML
        });
        logId = logData._id;
      } catch (logError) {
        console.error('[WARNING] Database logging failed (but ML analysis succeeded):', logError.message);
        // Don't fail the whole request because of logging issues
      }

      const successResponse = {
        success: true,
        requestId,
        analysis: {
          recommendedSpecialty: analysis.recommendedSpecialty,
          confidence: analysis.confidence,
          alternativeSpecialties: analysis.alternativeSpecialties,
          urgencyLevel: analysis.urgencyLevel,
          reasoning: analysis.reasoning,
          suggestedQuestions: analysis.suggestedQuestions,
          redFlags: analysis.redFlags
        },
        metadata: {
          responseTime,
          model: this.model,
          logId,
          mlService: 'local-python-sklearn'
        }
      };

      return successResponse;
    } catch (error) {
      console.error('ML Analysis Error:', error);
      
      // Log the error
      await this.logError(patientId, symptoms, error, requestMetadata);
      
      return {
        success: false,
        error: 'Failed to analyze symptoms',
        fallback: this.getFallbackRecommendation(symptoms)
      };
    }
  }

  /**
   * Make prediction request to ML service
   * @param {string} symptoms - Patient symptoms
   * @returns {Object} ML service response
   */
  async makePredictionRequest(symptoms) {
    try {
      const response = await axios.post(`${this.mlServiceUrl}/predict`, {
        symptoms: symptoms
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      return response;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('ML service is not running. Please start the prediction service.');
      }
      throw error;
    }
  }

  /**
   * Parse ML service response
   * @param {Object} responseData - Response from ML service
   * @returns {Object} Parsed analysis
   */
  parseMLResponse(responseData) {
    try {
      if (!responseData.success) {
        throw new Error(responseData.error || 'ML service returned error');
      }

      const prediction = responseData.prediction;
      
      // Validate and return the prediction
      return {
        recommendedSpecialty: prediction.recommendedSpecialty || 'General Practice',
        confidence: Math.min(Math.max(prediction.confidence || 0.5, 0), 1),
        alternativeSpecialties: (prediction.alternativeSpecialties || []).slice(0, 3),
        urgencyLevel: ['low', 'medium', 'high', 'critical'].includes(prediction.urgencyLevel) 
          ? prediction.urgencyLevel : 'medium',
        reasoning: prediction.reasoning || 'ML analysis completed with local model',
        suggestedQuestions: (prediction.suggestedQuestions || []).slice(0, 5),
        redFlags: (prediction.redFlags || []).slice(0, 5)
      };
    } catch (error) {
      console.error('Error parsing ML response:', error);
      return this.createFallbackAnalysis(responseData);
    }
  }

  /**
   * Create fallback analysis when ML fails
   * @param {Object} responseData - Original response data
   * @returns {Object} Fallback analysis
   */
  createFallbackAnalysis(responseData) {
    return {
      recommendedSpecialty: 'General Practice',
      confidence: 0.6,
      alternativeSpecialties: [],
      urgencyLevel: 'medium',
      reasoning: 'ML analysis was unable to complete. This is a fallback recommendation. Please consult with a general practitioner.',
      suggestedQuestions: [
        'How long have you been experiencing these symptoms?',
        'Are there any other symptoms you\'ve noticed?',
        'Have you taken any medications for this condition?',
        'Do you have any chronic medical conditions?'
      ],
      redFlags: [
        'High fever that doesn\'t respond to medication',
        'Severe difficulty breathing',
        'Chest pain or pressure',
        'Confusion or disorientation'
      ]
    };
  }

  /**
   * Create log entry in database
   * @param {Object} logData - Log data to store
   * @returns {Object} Created log entry
   */
  async createLogEntry(logData) {
    try {
      const aiLog = new AILog({
        patientId: logData.patientId,
        symptoms: logData.symptoms,
        analysis: {
          recommendedSpecialty: logData.analysis.recommendedSpecialty,
          confidence: logData.analysis.confidence,
          alternativeSpecialties: logData.analysis.alternativeSpecialties,
          urgencyLevel: logData.analysis.urgencyLevel,
          reasoning: logData.analysis.reasoning,
          suggestedQuestions: logData.analysis.suggestedQuestions,
          redFlags: logData.analysis.redFlags
        },
        requestMetadata: {
          requestId: logData.requestId,
          userAgent: logData.requestMetadata.userAgent,
          ipAddress: logData.requestMetadata.ipAddress,
          sessionId: logData.requestMetadata.sessionId,
          responseTime: logData.responseTime,
          model: this.model,
          tokenUsage: logData.tokenUsage,
          apiCost: logData.apiCost
        },
        status: 'completed',
        timestamp: new Date()
      });

      await aiLog.save();
      return aiLog;
    } catch (error) {
      console.error('Error creating log entry:', error);
      throw error;
    }
  }

  /**
   * Log error to database
   * @param {string} patientId - Patient ID
   * @param {string} symptoms - Symptoms that caused error
   * @param {Error} error - Error object
   * @param {Object} requestMetadata - Request metadata
   */
  async logError(patientId, symptoms, error, requestMetadata) {
    try {
      const aiLog = new AILog({
        patientId,
        symptoms,
        analysis: {
          recommendedSpecialty: 'General Practice',
          confidence: 0.5,
          alternativeSpecialties: [],
          urgencyLevel: 'medium',
          reasoning: 'ML analysis failed',
          suggestedQuestions: [],
          redFlags: []
        },
        requestMetadata: {
          requestId: this.generateRequestId(),
          userAgent: requestMetadata?.userAgent || 'Unknown',
          ipAddress: requestMetadata?.ipAddress || 'Unknown',
          sessionId: requestMetadata?.sessionId || 'Unknown',
          responseTime: 0,
          model: this.model,
          tokenUsage: {},
          apiCost: 0,
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name
          }
        },
        status: 'failed',
        timestamp: new Date()
      });

      await aiLog.save();
    } catch (logError) {
      console.error('Error logging error:', logError);
    }
  }

  /**
   * Get fallback recommendation when ML fails
   * @param {string} symptoms - Patient symptoms
   * @returns {Object} Fallback recommendation
   */
  getFallbackRecommendation(symptoms) {
    return {
      specialty: 'General Practice',
      reason: 'ML analysis unavailable. Please consult with a general practitioner who can properly evaluate your symptoms.'
    };
  }

  /**
   * Generate unique request ID
   * @returns {string} Request ID
   */
  generateRequestId() {
    return `ml_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get ML service info
   * @returns {Object} Service information
   */
  async getMLServiceInfo() {
    try {
      const response = await axios.get(`${this.mlServiceUrl}/model/info`);
      return response.data;
    } catch (error) {
      console.error('Error getting ML service info:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Retrain the ML model
   * @returns {Object} Retrain result
   */
  async retrainModel() {
    try {
      const response = await axios.post(`${this.mlServiceUrl}/model/retrain`);
      return response.data;
    } catch (error) {
      console.error('Error retraining model:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get analytics for ML predictions
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Object} Analytics data
   */
  async getAnalytics(startDate, endDate) {
    try {
      const aggregation = await AILog.aggregate([
        {
          $match: {
            timestamp: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: {
              specialty: '$analysis.recommendedSpecialty',
              status: '$status'
            },
            count: { $sum: 1 },
            avgConfidence: { $avg: '$analysis.confidence' },
            avgResponseTime: { $avg: '$requestMetadata.responseTime' }
          }
        }
      ]);

      return {
        success: true,
        data: aggregation,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopMLService();
  }
}

// Create singleton instance
const mlAiService = new MLAIService();

// Cleanup on process exit
process.on('SIGINT', () => {
  console.log('Cleaning up ML service...');
  mlAiService.cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Cleaning up ML service...');
  mlAiService.cleanup();
  process.exit(0);
});

export default mlAiService; 