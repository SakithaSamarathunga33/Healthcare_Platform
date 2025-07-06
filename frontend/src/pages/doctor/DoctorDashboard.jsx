import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  BellIcon,
  DocumentTextIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import doctorService from '../../services/doctorService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    todayAppointments: [],
    upcomingAppointments: [],
    stats: {},
    loading: true
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await doctorService.getDoctorDashboard();
      console.log('Raw dashboard response:', response.data);
      
      const { stats, todayAppointments, upcomingAppointments } = response.data;
      
      setDashboardData({
        todayAppointments: todayAppointments.map(apt => ({
          id: apt._id,
          time: new Date(apt.dateTime).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          }),
          patient: `${apt.patient?.firstName || ''} ${apt.patient?.lastName || ''}`.trim(),
          type: apt.type || 'Consultation',
          status: apt.status || 'pending',
          duration: apt.duration || '30 min',
          symptoms: apt.symptoms || apt.notes || 'No symptoms recorded',
          isNew: apt.status === 'pending'
        })),
        upcomingAppointments: upcomingAppointments.map(apt => ({
          id: apt._id,
          time: new Date(apt.dateTime).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          }),
          patient: `${apt.patient?.firstName || ''} ${apt.patient?.lastName || ''}`.trim(),
          type: apt.type || 'Consultation',
          status: apt.status || 'pending',
          duration: apt.duration || '30 min',
          symptoms: apt.symptoms || apt.notes || 'No symptoms recorded',
          isNew: apt.status === 'pending'
        })),
        stats: {
          totalPatients: stats.totalPatients || 0,
          appointmentsToday: stats.todayAppointments || 0,
          pendingRequests: stats.upcomingAppointments || 0,
          completedToday: stats.completedAppointments || 0,
          avgRating: stats.rating?.average || 0,
          weeklyRevenue: (stats.completedAppointments || 0) * 100 // Mock calculation
        },
        loading: false
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      // Mock API call for now - this would need to be implemented
      console.log(`${action} request ${requestId}`);
      // Refresh data after action
      await fetchDashboardData();
    } catch (error) {
      console.error('Error handling request:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPatientStatusColor = (status) => {
    switch (status) {
      case 'stable':
        return 'text-green-600';
      case 'improving':
        return 'text-blue-600';
      case 'needs_followup':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Good morning, Dr. {user?.firstName || user?.lastName || 'Doctor'}!
          </h1>
          <p className="text-gray-600 mt-2">
            You have {dashboardData.stats.appointmentsToday} appointments today and {dashboardData.stats.pendingRequests} upcoming appointments.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link 
            to="/doctor/appointments" 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Appointments</h3>
                <p className="text-blue-100">Manage your schedule</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/doctor/availability" 
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Availability</h3>
                <p className="text-green-100">Set your schedule</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/doctor/profile" 
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex items-center">
              <CogIcon className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Profile</h3>
                <p className="text-purple-100">Update your info</p>
              </div>
            </div>
          </Link>
          
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <BellIcon className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Notifications</h3>
                <p className="text-orange-100">{dashboardData.stats.pendingRequests} upcoming</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.stats.totalPatients}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.stats.appointmentsToday}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.stats.pendingRequests}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-indigo-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.stats.completedToday}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.stats.avgRating.toFixed(1)} ⭐
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-emerald-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Weekly Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${dashboardData.stats.weeklyRevenue}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Appointments */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <CalendarIcon className="h-6 w-6 mr-2 text-blue-600" />
                  Today's Schedule
                </h2>
                <Link 
                  to="/doctor/appointments" 
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {dashboardData.todayAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No appointments today
                </p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900">{appointment.time}</span>
                          {appointment.isNew && (
                            <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900">{appointment.patient}</h4>
                      <p className="text-sm text-gray-600">{appointment.type} • {appointment.duration}</p>
                      <p className="text-sm text-gray-600 mt-1">{appointment.symptoms}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <BellIcon className="h-6 w-6 mr-2 text-orange-600" />
                Upcoming Appointments
              </h2>
            </div>
            <div className="p-6">
              {dashboardData.upcomingAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No upcoming appointments
                </p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900">{appointment.time}</span>
                          {appointment.isNew && (
                            <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900">{appointment.patient}</h4>
                      <p className="text-sm text-gray-600">{appointment.type} • {appointment.duration}</p>
                      <p className="text-sm text-gray-600 mt-1">{appointment.symptoms}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 