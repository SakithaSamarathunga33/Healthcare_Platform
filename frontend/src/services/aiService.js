import api from './api';

const aiService = {
  // Public endpoints
  getSpecialties: async () => {
    try {
      const response = await api.get('/ai/specialties');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Patient endpoints
  analyzeSymptoms: async (symptomData) => {
    try {
      const response = await api.post('/ai/analyze-symptoms', symptomData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getAnalysisHistory: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/ai/history?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // General authenticated user endpoints
  getAnalysisById: async (analysisId) => {
    try {
      const response = await api.get(`/ai/analysis/${analysisId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  addFeedback: async (analysisId, feedbackData) => {
    try {
      const response = await api.post(`/ai/analysis/${analysisId}/feedback`, feedbackData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Doctor and Admin endpoints
  flagAnalysis: async (analysisId, flagData) => {
    try {
      const response = await api.post(`/ai/analysis/${analysisId}/flag`, flagData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin only endpoints
  getAIAnalytics: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/ai/analytics?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getModelMetrics: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/ai/metrics?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getAILogs: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/ai/logs?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  resolveFlaggedAnalysis: async (analysisId, flagId, resolutionData) => {
    try {
      const response = await api.post(`/ai/analysis/${analysisId}/resolve/${flagId}`, resolutionData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  validatePrediction: async (analysisId, validationData) => {
    try {
      const response = await api.post(`/ai/analysis/${analysisId}/validate`, validationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Utility functions for symptom analysis
  formatSymptomData: (symptoms, additionalInfo = {}) => {
    return {
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
      severity: additionalInfo.severity || 'moderate',
      duration: additionalInfo.duration || 'recent',
      age: additionalInfo.age,
      gender: additionalInfo.gender,
      medicalHistory: additionalInfo.medicalHistory || [],
      currentMedications: additionalInfo.currentMedications || [],
      allergies: additionalInfo.allergies || []
    };
  },

  // Process AI response for display
  processAnalysisResponse: (response) => {
    if (!response.success || !response.analysis) {
      throw new Error('Invalid analysis response');
    }

    return {
      id: response.analysis._id,
      symptoms: response.analysis.symptoms,
      analysis: response.analysis.aiResponse,
      confidence: response.analysis.confidence,
      recommendations: response.analysis.recommendations || [],
      specialtyRecommendations: response.analysis.specialtyRecommendations || [],
      urgencyLevel: response.analysis.urgencyLevel || 'low',
      timestamp: response.analysis.createdAt,
      status: response.analysis.status || 'completed'
    };
  }
};

export default aiService; 