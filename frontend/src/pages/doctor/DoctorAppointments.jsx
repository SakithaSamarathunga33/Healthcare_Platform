import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  EyeIcon,
  PhoneIcon,
  VideoCameraIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import appointmentService from '../../services/appointmentService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
    status: '',
    type: '',
    search: ''
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [filters, currentDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.date) params.date = filters.date;
      if (filters.type) params.type = filters.type;
      
      const response = await appointmentService.getDoctorAppointments(params);
      console.log('Raw appointments response:', response.data);
      
      let filteredAppointments = response.data.appointments || [];
      
      // Apply search filter on frontend
      if (filters.search) {
        filteredAppointments = filteredAppointments.filter(apt => 
          `${apt.patient?.firstName || ''} ${apt.patient?.lastName || ''}`.toLowerCase().includes(filters.search.toLowerCase()) ||
          (apt.symptoms || '').toLowerCase().includes(filters.search.toLowerCase()) ||
          (apt.notes || '').toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      // Transform appointments to match expected format
      const transformedAppointments = filteredAppointments.map(apt => ({
        id: apt._id,
        patient: {
          name: `${apt.patient?.firstName || ''} ${apt.patient?.lastName || ''}`.trim(),
          age: apt.patient?.dateOfBirth ? new Date().getFullYear() - new Date(apt.patient.dateOfBirth).getFullYear() : 'N/A',
          phone: apt.patient?.phone || 'N/A',
          email: apt.patient?.email || 'N/A',
          avatar: null
        },
        date: new Date(apt.dateTime).toISOString().split('T')[0],
        time: new Date(apt.dateTime).toTimeString().slice(0, 5),
        duration: apt.duration || 30,
        type: apt.type || 'Consultation',
        status: apt.status || 'pending',
        reason: apt.symptoms || 'No reason provided',
        symptoms: apt.symptoms || 'No symptoms recorded',
        notes: apt.notes || 'No notes',
        priority: apt.priority || 'medium',
        isNew: apt.status === 'pending',
        insurance: 'N/A' // Not available in current data
      }));

      setAppointments(transformedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: newStatus }
            : apt
        )
      );
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Video Call':
        return <VideoCameraIcon className="h-5 w-5 text-blue-600" />;
      case 'Phone Call':
        return <PhoneIcon className="h-5 w-5 text-green-600" />;
      case 'In-Person':
        return <MapPinIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <CalendarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-400';
      case 'medium':
        return 'border-l-4 border-yellow-400';
      case 'low':
        return 'border-l-4 border-green-400';
      default:
        return 'border-l-4 border-gray-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeUntilAppointment = (date, time) => {
    const appointmentDateTime = new Date(`${date}T${time}:00`);
    const now = new Date();
    const diffMs = appointmentDateTime - now;
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 0) {
      return 'Past';
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      const diffDays = Math.ceil(diffHours / 24);
      return `${diffDays}d`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
              <p className="text-gray-600 mt-2">
                Manage your appointments and patient schedule
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/doctor/availability" 
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Manage Availability
              </Link>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
              </div>
              
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.date}
                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
              >
                <option value="">All Dates</option>
                <option value="2024-07-15">Today</option>
                <option value="2024-07-16">Tomorrow</option>
                <option value="2024-07-17">Day After</option>
              </select>
              
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="">All Types</option>
                <option value="In-Person">In-Person</option>
                <option value="Video Call">Video Call</option>
                <option value="Phone Call">Phone Call</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {!loading && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <CalendarIcon className="h-6 w-6 mr-2 text-indigo-600" />
              Appointments ({appointments.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {appointments.length === 0 ? (
              <div className="p-12 text-center">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No appointments found</p>
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your filters or check back later
                </p>
              </div>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment.id} className={`p-6 hover:bg-gray-50 transition-colors ${getPriorityColor(appointment.priority)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-lg">
                            {appointment.patient.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.patient.name}
                          </h3>
                          {appointment.isNew && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                              New Patient
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {formatDate(appointment.date)}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {formatTime(appointment.time)} ({appointment.duration}min)
                          </div>
                          <div className="flex items-center">
                            {getTypeIcon(appointment.type)}
                            <span className="ml-1">{appointment.type}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">
                              {getTimeUntilAppointment(appointment.date, appointment.time)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-900">{appointment.reason}</p>
                          <p className="text-sm text-gray-600 mt-1">{appointment.symptoms}</p>
                          {appointment.notes && (
                            <p className="text-sm text-gray-500 mt-1 italic">
                              Notes: {appointment.notes}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Phone: {appointment.patient.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit Appointment"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      
                      {appointment.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                            className="p-2 text-green-600 hover:text-green-700 transition-colors"
                            title="Confirm Appointment"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            className="p-2 text-red-600 hover:text-red-700 transition-colors"
                            title="Cancel Appointment"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                      
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
} 