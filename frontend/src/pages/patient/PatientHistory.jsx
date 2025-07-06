import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import aiService from '../../services/aiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  DocumentTextIcon,
  SparklesIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const PatientHistory = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [aiAnalyses, setAiAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const tab = searchParams.get('tab') || 'appointments';
    setActiveTab(tab);
    fetchData(tab);
  }, [searchParams]);

  const fetchData = async (tab) => {
    setLoading(true);
    setError(null);
    
    try {
      if (tab === 'appointments') {
        const response = await appointmentService.getPatientAppointments();
        setAppointments(response.data.appointments || []);
      } else if (tab === 'ai-analyses') {
        const response = await aiService.getAnalysisHistory();
        setAiAnalyses(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchData(tab);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'missed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getAnalysisStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800',
      'processing': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Medical History</h1>
          <p className="text-gray-600 mt-2">
            View your past appointments and AI symptom analyses
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => handleTabChange('appointments')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'appointments'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CalendarIcon className="h-5 w-5 inline-block mr-2" />
                Appointments ({appointments.length})
              </button>
              <button
                onClick={() => handleTabChange('ai-analyses')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'ai-analyses'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <SparklesIcon className="h-5 w-5 inline-block mr-2" />
                AI Analyses ({aiAnalyses.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'appointments' ? (
              <div className="space-y-6">
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
                    <p className="mt-1 text-sm text-gray-500">You haven't had any appointments yet.</p>
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <div key={appointment._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Specialty:</span> {appointment.doctor?.specialty || 'General Practice'}
                      </div>

                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Date:</span> {formatDate(appointment.dateTime)}
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Time:</span> {formatTime(appointment.dateTime)}
                          </div>
                          
                          {appointment.notes && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Notes:</span> {appointment.notes}
                          </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {aiAnalyses.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No AI analyses found</h3>
                    <p className="mt-1 text-sm text-gray-500">You haven't performed any symptom analyses yet.</p>
                  </div>
                ) : (
                  aiAnalyses.map((analysis) => (
                    <div key={analysis._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">Symptom Analysis</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAnalysisStatusColor(analysis.status)}`}>
                              {analysis.status}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Date:</span> {formatDate(analysis.timestamp)}
                      </div>

                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Time:</span> {formatTime(analysis.timestamp)}
                          </div>
                          
                          {analysis.symptoms && (
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Symptoms:</span> {analysis.symptoms}
                        </div>
                          )}
                          

                          
                          {analysis.analysis?.recommendedSpecialty && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Recommended Specialty:</span> {analysis.analysis.recommendedSpecialty}
                        </div>
                          )}
                          
                          {analysis.analysis?.alternativeSpecialties && analysis.analysis.alternativeSpecialties.length > 0 && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Alternative Specialties:</span> {analysis.analysis.alternativeSpecialties.map(s => s.specialty).join(', ')}
                      </div>
                          )}

                          {analysis.analysis?.urgencyLevel && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Urgency Level:</span> {analysis.analysis.urgencyLevel}
                            </div>
                          )}
                          
                          {analysis.analysis?.reasoning && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Reasoning:</span> {analysis.analysis.reasoning}
                            </div>
                          )}
                          
                          {analysis.analysis?.confidence && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Confidence:</span> {Math.round(analysis.analysis.confidence * 100)}%
                          </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHistory; 