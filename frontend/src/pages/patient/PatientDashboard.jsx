/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  HeartIcon, 
  UserGroupIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from "../../context/AuthContext";
import patientService from '../../services/patientService';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    upcomingAppointments: [],
    recentAnalyses: [],
    healthMetrics: {},
    loading: true
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await patientService.getPatientDashboard();
      const { stats, todayAppointments, upcomingAppointments, recentAnalyses } = response.data;
      
      setDashboardData({
        upcomingAppointments: upcomingAppointments.map(apt => ({
          id: apt._id,
          doctor: `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`,
          specialty: apt.doctor.specialty,
          date: new Date(apt.dateTime).toISOString().split('T')[0],
          time: new Date(apt.dateTime).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          }),
          type: apt.type || 'Consultation',
          status: apt.status
        })),
        recentAnalyses: recentAnalyses.map(analysis => ({
          id: analysis._id,
          date: new Date(analysis.createdAt).toISOString().split('T')[0],
          symptoms: analysis.symptoms || [],
          recommendation: analysis.analysis?.recommendedSpecialty || 'General Practice',
          confidence: Math.round((analysis.analysis?.confidence || 0.5) * 100),
          status: analysis.status || 'completed'
        })),
        healthMetrics: {
          totalAppointments: stats.totalAppointments || 0,
          completedAppointments: stats.completedAppointments || 0,
          pendingAppointments: stats.upcomingAppointments || 0,
          aiAnalyses: stats.recentAnalyses || 0
        },
        loading: false
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData({
        upcomingAppointments: [],
        recentAnalyses: [],
        healthMetrics: {
          totalAppointments: 0,
          completedAppointments: 0,
          pendingAppointments: 0,
          aiAnalyses: 0
        },
        loading: false
      });
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
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAnalysisStatusColor = (status) => {
    switch (status) {
      case 'appointment_booked':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'Patient'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your health overview and recent activities.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link 
            to="/patient/symptoms" 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">AI Symptom Analysis</h3>
                <p className="text-indigo-100">Get instant health insights</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/patient/doctors" 
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Find Doctors</h3>
                <p className="text-green-100">Browse specialists</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/patient/history" 
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Medical History</h3>
                <p className="text-blue-100">View your records</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-indigo-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Appointments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.healthMetrics.totalAppointments}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.healthMetrics.completedAppointments}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.healthMetrics.pendingAppointments}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 text-purple-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">AI Analyses</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.healthMetrics.aiAnalyses}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <CalendarIcon className="h-6 w-6 mr-2 text-indigo-600" />
                  Upcoming Appointments
                </h2>
                <Link 
                  to="/patient/appointments" 
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
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
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{appointment.doctor}</h3>
                          <p className="text-sm text-gray-600">{appointment.specialty}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">{appointment.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent AI Analyses */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <SparklesIcon className="h-6 w-6 mr-2 text-purple-600" />
                  Recent AI Analyses
                </h2>
                <Link 
                  to="/patient/history" 
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {dashboardData.recentAnalyses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No recent analyses
                </p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentAnalyses.map((analysis) => (
                    <div key={analysis.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          {new Date(analysis.date).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAnalysisStatusColor(analysis.status)}`}>
                          {analysis.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-900">Symptoms:</p>
                        <p className="text-sm text-gray-600">{analysis.symptoms.join(', ')}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Recommended:</p>
                          <p className="text-sm text-indigo-600">{analysis.recommendation}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Confidence</p>
                          <p className="text-sm font-semibold text-gray-900">{analysis.confidence}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Health Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <HeartIcon className="h-6 w-6 mr-2 text-red-500" />
            Health Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Stay Hydrated</h4>
              <p className="text-sm text-gray-600">
                Drink at least 8 glasses of water daily to maintain optimal health.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Regular Exercise</h4>
              <p className="text-sm text-gray-600">
                Aim for 30 minutes of moderate exercise most days of the week.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Balanced Diet</h4>
              <p className="text-sm text-gray-600">
                Include fruits, vegetables, whole grains, and lean proteins in your meals.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Quality Sleep</h4>
              <p className="text-sm text-gray-600">
                Get 7-9 hours of sleep each night for optimal recovery and health.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}