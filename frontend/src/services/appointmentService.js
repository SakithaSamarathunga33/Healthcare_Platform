import api from './api';

const appointmentService = {
  // Get all appointments (with filtering)
  getAppointments: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/appointments?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new appointment
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId) => {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update appointment
  updateAppointment: async (appointmentId, updateData) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId, reason = '') => {
    try {
      const response = await api.delete(`/appointments/${appointmentId}`, { 
        data: { reason } 
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Patient specific endpoints
  getPatientAppointments: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/patient/appointments?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  bookAppointment: async (doctorId, appointmentData) => {
    try {
      const response = await api.post('/appointments', {
        doctorId,
        ...appointmentData
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Doctor specific endpoints
  getDoctorAppointments: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/doctor/appointments?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateAppointmentStatus: async (appointmentId, status, notes = '') => {
    try {
      const response = await api.put(`/appointments/${appointmentId}`, {
        status,
        notes
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  addAppointmentNotes: async (appointmentId, notes) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}`, {
        notes
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Doctor availability
  getDoctorAvailability: async (doctorId, date) => {
    try {
      const response = await api.get(`/doctor/availability?doctorId=${doctorId}&date=${date}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateDoctorAvailability: async (availabilityData) => {
    try {
      const response = await api.put('/doctor/availability', availabilityData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin monitoring endpoints
  getAppointmentStats: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/appointments/stats?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getAppointmentAnalytics: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/appointments/analytics?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Utility functions
  formatAppointmentTime: (date, time) => {
    const appointmentDate = new Date(`${date}T${time}`);
    return appointmentDate.toISOString();
  },

  getAppointmentStatus: (appointment) => {
    const now = new Date();
    const appointmentTime = new Date(appointment.dateTime);
    
    if (appointment.status === 'cancelled') return 'cancelled';
    if (appointment.status === 'completed') return 'completed';
    if (appointmentTime < now && appointment.status !== 'completed') {
      return 'missed';
    }
    if (appointmentTime > now) return 'scheduled';
    return 'in-progress';
  },

  getTimeSlots: (startTime = '09:00', endTime = '17:00', duration = 30) => {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    while (start < end) {
      slots.push(start.toTimeString().slice(0, 5));
      start.setMinutes(start.getMinutes() + duration);
    }
    
    return slots;
  }
};

export default appointmentService; 