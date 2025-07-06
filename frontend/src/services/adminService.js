import api from './api';

const adminService = {
  getAdminDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response;
  },

  getSystemUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/auth/users?${queryString}`);
    return response;
  },

  updateUserStatus: async (userId, statusData) => {
    const response = await api.put(`/auth/users/${userId}/status`, statusData);
    return response;
  },

  updateUserProfile: async (userId, profileData) => {
    console.log('Making request to:', `/auth/users/${userId}`);
    const response = await api.put(`/auth/users/${userId}`, profileData);
    return response;
  },

  getDoctorManagement: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/doctors?${queryString}`);
    return response;
  },

  getDoctorApplications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/doctors/applications?${queryString}`);
    return response;
  },

  handleDoctorApplication: async (applicationId, action) => {
    const response = await api.post(`/admin/doctors/applications/${applicationId}/${action}`);
    return response;
  },

  updateDoctorStatus: async (doctorId, status) => {
    const endpoint = status === 'active' ? 'activate' : 'suspend';
    const response = await api.put(`/admin/doctors/${doctorId}/${endpoint}`);
    return response;
  },

  updateDoctorProfile: async (doctorId, profileData) => {
    const response = await api.put(`/admin/doctors/${doctorId}/profile`, profileData);
    return response;
  },

  getAppointmentMonitoring: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/appointments?${queryString}`);
    return response;
  },

  getAppointmentStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/appointments/stats?${queryString}`);
    return response;
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    const response = await api.put(`/admin/appointments/${appointmentId}/status`, { status });
    return response;
  },

  getAISystemLogs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/ai/logs?${queryString}`);
    return response;
  },

  deleteAILog: async (logId) => {
    const response = await api.delete(`/ai/logs/${logId}`);
    return response;
  },

  getDoctorProfile: async (userId) => {
    const response = await api.get(`/auth/users/${userId}`);
    return response;
  },

  createUser: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/auth/users/${userId}`);
    return response;
  },

  getUserStats: async () => {
    const response = await api.get('/admin/users/stats');
    return response;
  }
};

export default adminService;
