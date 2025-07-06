/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  UserIcon,
  BeakerIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import adminService from '../../services/adminService';

const AILogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchAILogs();
  }, []);

  const fetchAILogs = async () => {
    try {
      const response = await adminService.getAISystemLogs();
      console.log('AI Logs Response:', response);
      
      // Handle different response structures
      let logsData = [];
      if (response && response.success && Array.isArray(response.data)) {
        logsData = response.data;
      } else if (response && Array.isArray(response)) {
        logsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        logsData = response.data;
      }
      
      console.log('Processed logs data:', logsData);
      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching AI logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'high-confidence') return log.analysis?.confidence >= 0.8;
    if (filter === 'low-confidence') return log.analysis?.confidence < 0.5;
    if (filter === 'urgent') return log.analysis?.urgencyLevel === 'high' || log.analysis?.urgencyLevel === 'critical';
    return log.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'used':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'flagged':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'validated':
        return <ShieldCheckIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <BeakerIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getUrgencyColor = (urgencyLevel) => {
    switch (urgencyLevel) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const showLogDetails = (log) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  const handleDeleteLog = (log) => {
    setLogToDelete(log);
    setShowDeleteModal(true);
  };

  const confirmDeleteLog = async () => {
    if (!logToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await adminService.deleteAILog(logToDelete._id);
      if (response && response.success) {
        fetchAILogs(); // Refresh the logs
        setShowDeleteModal(false);
        setLogToDelete(null);
      } else {
        console.error('Failed to delete AI log');
      }
    } catch (error) {
      console.error('Error deleting AI log:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDeleteLog = () => {
    setShowDeleteModal(false);
    setLogToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI System Logs</h1>
        <p className="text-gray-600">Monitor AI analysis activities and performance</p>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          All Logs ({logs.length})
        </button>
        <button
          onClick={() => setFilter('high-confidence')}
          className={`px-4 py-2 rounded-lg ${filter === 'high-confidence' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          High Confidence
        </button>
        <button
          onClick={() => setFilter('low-confidence')}
          className={`px-4 py-2 rounded-lg ${filter === 'low-confidence' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Low Confidence
        </button>
        <button
          onClick={() => setFilter('urgent')}
          className={`px-4 py-2 rounded-lg ${filter === 'urgent' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Urgent Cases
        </button>
        <button
          onClick={() => setFilter('used')}
          className={`px-4 py-2 rounded-lg ${filter === 'used' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Used
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient & Symptoms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI Prediction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log, index) => (
                <motion.tr
                  key={log._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {log.patientId?.firstName || 'Unknown'} {log.patientId?.lastName || 'Patient'}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {log.symptoms ? log.symptoms.substring(0, 80) + '...' : 'No symptoms recorded'}
                        </div>
                        {log.patientId?.email && (
                          <div className="text-xs text-gray-400">
                            {log.patientId.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {log.analysis?.recommendedSpecialty || 'No recommendation'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {log.requestMetadata?.model || 'Unknown'} v{log.requestMetadata?.modelVersion || '1.0'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getConfidenceColor(log.analysis?.confidence)}`}>
                      {log.analysis?.confidence ? (log.analysis.confidence * 100).toFixed(1) + '%' : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(log.analysis?.urgencyLevel)}`}>
                      {log.analysis?.urgencyLevel || 'unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(log.status)}
                      <span className="ml-2 text-sm font-medium capitalize">
                        {log.status || 'unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp || log.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                    <button
                      onClick={() => showLogDetails(log)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                      <button
                        onClick={() => handleDeleteLog(log)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No AI logs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No AI system logs match the current filter.
          </p>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">AI Analysis Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Patient Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Patient Information</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p><strong>Name:</strong> {selectedLog.patientId?.firstName || 'Unknown'} {selectedLog.patientId?.lastName || 'Patient'}</p>
                    <p><strong>Email:</strong> {selectedLog.patientId?.email || 'Not available'}</p>
                    {selectedLog.patientId?.phone && (
                      <p><strong>Phone:</strong> {selectedLog.patientId.phone}</p>
                    )}
                    {selectedLog.patientId?.dateOfBirth && (
                      <p><strong>Date of Birth:</strong> {new Date(selectedLog.patientId.dateOfBirth).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>

                {/* Symptoms */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Symptoms & Details</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p><strong>Primary Symptoms:</strong></p>
                    <p className="mb-3">{selectedLog.symptoms}</p>
                    
                    {selectedLog.severity && (
                      <p><strong>Severity:</strong> {selectedLog.severity}</p>
                    )}
                    {selectedLog.duration && (
                      <p><strong>Duration:</strong> {selectedLog.duration}</p>
                    )}
                    {selectedLog.description && (
                      <div className="mt-3">
                        <p><strong>Additional Description:</strong></p>
                        <p className="text-sm text-gray-600">{selectedLog.description}</p>
                      </div>
                    )}
                    {selectedLog.additionalInfo && (
                      <div className="mt-3">
                        <p><strong>Additional Information:</strong></p>
                        <p className="text-sm text-gray-600">{selectedLog.additionalInfo}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Prediction */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">AI Prediction</h4>
                  <div className="bg-blue-50 p-3 rounded">
                    <p><strong>Recommended Specialty:</strong> {selectedLog.analysis?.recommendedSpecialty || 'N/A'}</p>
                    <p><strong>Confidence:</strong> {selectedLog.analysis?.confidence ? (selectedLog.analysis.confidence * 100).toFixed(1) + '%' : 'N/A'}</p>
                    <p><strong>Urgency Level:</strong> {selectedLog.analysis?.urgencyLevel || 'N/A'}</p>
                    {selectedLog.analysis?.reasoning && (
                      <p><strong>Reasoning:</strong> {selectedLog.analysis.reasoning}</p>
                    )}
                    {selectedLog.analysis?.redFlags && selectedLog.analysis.redFlags.length > 0 && (
                      <p><strong>Red Flags:</strong> {selectedLog.analysis.redFlags.join(', ')}</p>
                    )}
                  </div>
                </div>

                {/* Alternative Specialties */}
                {selectedLog.analysis?.alternativeSpecialties && selectedLog.analysis.alternativeSpecialties.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Alternative Specialties</h4>
                    <div className="bg-yellow-50 p-3 rounded">
                      {selectedLog.analysis.alternativeSpecialties.map((alt, index) => (
                        <p key={index}>
                          <strong>{alt.specialty}:</strong> {(alt.confidence * 100).toFixed(1)}%
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Doctors */}
                {selectedLog.recommendedDoctors && selectedLog.recommendedDoctors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recommended Doctors</h4>
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm text-gray-600 mb-2">
                        {selectedLog.recommendedDoctors.length} doctor(s) were recommended for {selectedLog.analysis?.recommendedSpecialty}
                      </p>
                      {selectedLog.recommendedDoctors.map((doctor, index) => (
                        <div key={index} className="border-l-4 border-green-400 pl-3 mb-2">
                          <p><strong>Dr. {doctor.firstName} {doctor.lastName}</strong></p>
                          <p className="text-sm text-gray-600">{doctor.primarySpecialty}</p>
                          <p className="text-sm text-gray-500">Consultation Fee: ${doctor.consultationFee}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Metadata</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p><strong>AI Model:</strong> {selectedLog.requestMetadata?.model || 'Unknown'} v{selectedLog.requestMetadata?.modelVersion || '1.0'}</p>
                    <p><strong>Status:</strong> {selectedLog.status}</p>
                    <p><strong>Response Time:</strong> {selectedLog.requestMetadata?.responseTime || 'N/A'}ms</p>
                    <p><strong>Created:</strong> {new Date(selectedLog.timestamp || selectedLog.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && logToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div className="mt-2 text-center">
                <h3 className="text-lg font-medium text-gray-900">Delete AI Log</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this AI analysis log? This action cannot be undone.
                  </p>
                  <div className="mt-4 text-left bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium text-gray-900">
                      Patient: {logToDelete.patientId?.firstName} {logToDelete.patientId?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Specialty: {logToDelete.analysis?.recommendedSpecialty}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(logToDelete.timestamp || logToDelete.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={cancelDeleteLog}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteLog}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AILogs;
