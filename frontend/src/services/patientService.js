import api from './api';

const patientService = {
  getPatientDashboard: async () => {
    const response = await api.get('/patient/dashboard');
    return response;
  },

  getPatientAppointments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/patient/appointments?${queryString}`);
    return response;
  },

  getPatientHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/patient/history?${queryString}`);
    return response;
  },

  getProfile: async () => {
    const response = await api.get('/patient/profile');
    return response;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/patient/profile', profileData);
    return response;
  },

  getPatientProfile: async () => {
    const response = await api.get('/patient/profile');
    return response;
  },

  updatePatientProfile: async (profileData) => {
    const response = await api.put('/patient/profile', profileData);
    return response;
  },

  getMedicalRecords: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/patient/medical-records?${queryString}`);
    return response;
  },

  addMedicalRecord: async (recordData) => {
    const response = await api.post('/patient/medical-records', recordData);
    return response;
  },

  getPrescriptions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/patient/prescriptions?${queryString}`);
    return response;
  },

  getVitalSigns: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/patient/vital-signs?${queryString}`);
    return response;
  },

  addVitalSigns: async (vitalData) => {
    const response = await api.post('/patient/vital-signs', vitalData);
    return response;
  },

  getHealthMetrics: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/patient/health-metrics?${queryString}`);
    return response;
  }
};

export default patientService; 