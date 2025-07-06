import api from './api';

const doctorService = {
  getDoctors: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/doctors?${queryString}`);
    return response;
  },

  getDoctorById: async (doctorId) => {
    const response = await api.get(`/doctors/${doctorId}`);
    return response;
  },

  searchDoctors: async (searchParams) => {
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await api.get(`/doctors/search?${queryString}`);
    return response;
  },

  getDoctorDashboard: async () => {
    const response = await api.get('/doctor/dashboard/overview');
    return response;
  },

  getDoctorAppointments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/doctor/appointments?${queryString}`);
    return response;
  },

  getDoctorPatients: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/doctor/patients?${queryString}`);
    return response;
  },

  getPatientDetails: async (patientId) => {
    const response = await api.get(`/doctor/patients/${patientId}`);
    return response;
  },

  updateAvailability: async (availabilityData) => {
    const response = await api.put('/doctor/availability', availabilityData);
    return response;
  },

  getAvailabilitySettings: async () => {
    const response = await api.get('/doctor/availability');
    return response;
  },

  getDoctorProfile: async () => {
    const response = await api.get('/doctor/profile');
    return response;
  },

  updateDoctorProfile: async (profileData) => {
    const response = await api.put('/doctor/profile', profileData);
    return response;
  },

  getSpecializations: async () => {
    const response = await api.get('/doctors/specializations');
    return response;
  },

  updateAppointmentStatus: async (appointmentId, status, notes = '') => {
    const response = await api.put(`/doctor/appointments/${appointmentId}/status`, { status, notes });
    return response;
  }
};

export default doctorService; 