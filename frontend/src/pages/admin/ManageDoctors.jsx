import React, { useState, useEffect } from 'react';
import { UserIcon, CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon, PencilIcon, XMarkIcon, PhoneIcon, MapPinIcon, CurrencyDollarIcon, StarIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import adminService from '../../services/adminService';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('doctors');
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    consultationFee: 0,
    languages: ['English'],
    hospital: {
      name: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      phone: ''
    },
    isVerified: false,
    isAcceptingPatients: true
  });

  useEffect(() => {
    fetchDoctors();
    fetchApplications();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await adminService.getDoctorManagement();
      console.log('Doctors API response:', response); // Debug log
      
      // Handle the correct response structure: response.data.doctors
      if (response && response.data && Array.isArray(response.data.doctors)) {
        setDoctors(response.data.doctors);
      } else if (response && Array.isArray(response.data)) {
        setDoctors(response.data);
      } else if (response && Array.isArray(response.doctors)) {
        setDoctors(response.doctors);
      } else {
        console.warn('Unexpected doctors response structure:', response);
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]); // Ensure doctors is always an array
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await adminService.getDoctorApplications();
      console.log('Applications API response:', response); // Debug log
      
      // Handle the correct response structure: response.data.applications
      if (response && response.data && Array.isArray(response.data.applications)) {
        setApplications(response.data.applications);
      } else if (response && Array.isArray(response.data)) {
        setApplications(response.data);
      } else if (response && Array.isArray(response.applications)) {
        setApplications(response.applications);
      } else {
        console.warn('Unexpected applications response structure:', response);
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]); // Ensure applications is always an array
    }
  };

  const handleApplication = async (applicationId, action) => {
    try {
      const response = await adminService.handleDoctorApplication(applicationId, action);
      if (response.success) {
        fetchApplications();
        fetchDoctors();
      }
    } catch (error) {
      console.error('Error handling application:', error);
    }
  };

  const updateDoctorStatus = async (doctorId, status) => {
    try {
      const response = await adminService.updateDoctorStatus(doctorId, status);
      if (response.success) {
        fetchDoctors();
      }
    } catch (error) {
      console.error('Error updating doctor status:', error);
    }
  };

  const openEditModal = (doctor) => {
    setEditingDoctor(doctor);
    setEditForm({
      bio: doctor.bio || '',
      consultationFee: doctor.consultationFee || 0,
      languages: doctor.languages || ['English'],
      hospital: {
        name: doctor.hospital?.name || '',
        address: {
          street: doctor.hospital?.address?.street || '',
          city: doctor.hospital?.address?.city || '',
          state: doctor.hospital?.address?.state || '',
          zipCode: doctor.hospital?.address?.zipCode || '',
          country: doctor.hospital?.address?.country || ''
        },
        phone: doctor.hospital?.phone || ''
      },
      isVerified: doctor.isVerified || false,
      isAcceptingPatients: doctor.isAcceptingPatients !== false
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingDoctor(null);
    setEditForm({
      bio: '',
      consultationFee: 0,
      languages: ['English'],
      hospital: {
        name: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        phone: ''
      },
      isVerified: false,
      isAcceptingPatients: true
    });
  };

  const handleEditFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (field.includes('address.')) {
      const addressField = field.split('address.')[1];
      setEditForm(prev => ({
        ...prev,
        hospital: {
          ...prev.hospital,
          address: {
            ...prev.hospital.address,
            [addressField]: value
          }
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleLanguageChange = (index, value) => {
    const newLanguages = [...editForm.languages];
    newLanguages[index] = value;
    setEditForm(prev => ({
      ...prev,
      languages: newLanguages
    }));
  };

  const addLanguage = () => {
    setEditForm(prev => ({
      ...prev,
      languages: [...prev.languages, '']
    }));
  };

  const removeLanguage = (index) => {
    const newLanguages = editForm.languages.filter((_, i) => i !== index);
    setEditForm(prev => ({
      ...prev,
      languages: newLanguages
    }));
  };

  const saveDoctorDetails = async () => {
    try {
      const response = await adminService.updateDoctorProfile(editingDoctor._id, editForm);
      if (response.success) {
        fetchDoctors();
        closeEditModal();
      }
    } catch (error) {
      console.error('Error updating doctor details:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openViewModal = (doctor) => {
    setViewingDoctor(doctor);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingDoctor(null);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Doctors</h1>
        <p className="text-gray-600">Manage doctor accounts and applications</p>
      </div>

      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('doctors')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'doctors'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active Doctors ({Array.isArray(doctors) ? doctors.length : 0})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'applications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Applications ({Array.isArray(applications) ? applications.length : 0})
          </button>
        </nav>
      </div>

      {activeTab === 'doctors' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(doctors) && doctors.map((doctor, index) => (
                  <motion.tr
                    key={doctor._id || doctor.user?._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {doctor.user?.firstName} {doctor.user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{doctor.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doctor.specialties && doctor.specialties.length > 0 ? doctor.specialties.join(', ') : 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doctor.user?.isActive ? 'active' : 'inactive')}`}>
                        {doctor.user?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doctor.totalPatients || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateDoctorStatus(doctor.user?._id, doctor.user?.isActive ? 'inactive' : 'active')}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            doctor.user?.isActive
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {doctor.user?.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => openEditModal(doctor)}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded"
                          title="Edit Doctor Details"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => openViewModal(doctor)}
                          className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded"
                          title="View Doctor Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(applications) && applications.map((application, index) => (
                  <motion.tr
                    key={application._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <ClockIcon className="h-6 w-6 text-yellow-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.firstName} {application.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{application.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.specialties ? application.specialties.join(', ') : 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.experience || 'Not specified'} {application.experience ? 'years' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApplication(application._id, 'approve')}
                          className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 rounded text-xs font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApplication(application._id, 'reject')}
                          className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded text-xs font-medium"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => openViewModal(application)}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded"
                          title="View Application Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {((activeTab === 'doctors' && Array.isArray(doctors) && doctors.length === 0) || 
        (activeTab === 'applications' && Array.isArray(applications) && applications.length === 0)) && (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No {activeTab === 'doctors' ? 'doctors' : 'applications'} found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'doctors' 
              ? 'No doctors are currently registered in the system.'
              : 'No pending doctor applications at this time.'
            }
          </p>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Doctor Details - Dr. {editingDoctor?.user?.firstName} {editingDoctor?.user?.lastName}
              </h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => handleEditFormChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter doctor's bio..."
                />
              </div>

              {/* Consultation Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Fee ($)
                </label>
                <input
                  type="number"
                  value={editForm.consultationFee}
                  onChange={(e) => handleEditFormChange('consultationFee', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages
                </label>
                <div className="space-y-2">
                  {editForm.languages.map((language, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={language}
                        onChange={(e) => handleLanguageChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Language"
                      />
                      {editForm.languages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLanguage(index)}
                          className="px-2 py-2 text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Language
                  </button>
                </div>
              </div>

              {/* Hospital Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hospital Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital Name
                    </label>
                    <input
                      type="text"
                      value={editForm.hospital.name}
                      onChange={(e) => handleEditFormChange('hospital.name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Hospital name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital Phone
                    </label>
                    <input
                      type="text"
                      value={editForm.hospital.phone}
                      onChange={(e) => handleEditFormChange('hospital.phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={editForm.hospital.address.street}
                      onChange={(e) => handleEditFormChange('address.street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={editForm.hospital.address.city}
                      onChange={(e) => handleEditFormChange('address.city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={editForm.hospital.address.state}
                      onChange={(e) => handleEditFormChange('address.state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="State/Province"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      value={editForm.hospital.address.zipCode}
                      onChange={(e) => handleEditFormChange('address.zipCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ZIP/Postal code"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={editForm.hospital.address.country}
                      onChange={(e) => handleEditFormChange('address.country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              {/* Status Toggles */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Verified Doctor</label>
                      <p className="text-sm text-gray-500">Mark this doctor as verified</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.isVerified}
                        onChange={(e) => handleEditFormChange('isVerified', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Accepting Patients</label>
                      <p className="text-sm text-gray-500">Allow this doctor to accept new patients</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.isAcceptingPatients}
                        onChange={(e) => handleEditFormChange('isAcceptingPatients', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveDoctorDetails}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Doctor Details Modal */}
      {showViewModal && viewingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Doctor Details - Dr. {viewingDoctor.user?.firstName} {viewingDoctor.user?.lastName}
              </h2>
              <button
                onClick={closeViewModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-sm text-gray-900">{viewingDoctor.user?.firstName} {viewingDoctor.user?.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{viewingDoctor.user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-sm text-gray-900">{viewingDoctor.user?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                      <p className="text-sm text-gray-900">
                        {viewingDoctor.user?.dateOfBirth ? new Date(viewingDoctor.user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Gender</label>
                      <p className="text-sm text-gray-900">{viewingDoctor.user?.gender || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        viewingDoctor.user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {viewingDoctor.user?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Member Since</label>
                      <p className="text-sm text-gray-900">
                        {viewingDoctor.user?.createdAt ? new Date(viewingDoctor.user.createdAt).toLocaleDateString() : 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <StarIcon className="h-5 w-5 mr-2" />
                    Professional Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Specialties</label>
                      <p className="text-sm text-gray-900">
                        {viewingDoctor.specialties && viewingDoctor.specialties.length > 0 
                          ? viewingDoctor.specialties.join(', ') 
                          : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Experience</label>
                      <p className="text-sm text-gray-900">
                        {viewingDoctor.experience ? `${viewingDoctor.experience} years` : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">License Number</label>
                      <p className="text-sm text-gray-900">{viewingDoctor.licenseNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Education</label>
                      <p className="text-sm text-gray-900">{viewingDoctor.education || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Languages</label>
                      <p className="text-sm text-gray-900">
                        {viewingDoctor.languages && viewingDoctor.languages.length > 0 
                          ? viewingDoctor.languages.join(', ') 
                          : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Patients</label>
                      <p className="text-sm text-gray-900">{viewingDoctor.totalPatients || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio and Consultation Fee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Bio</h3>
                  <p className="text-sm text-gray-900">
                    {viewingDoctor.bio || 'No bio provided'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                    Consultation Fee
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    ${viewingDoctor.consultationFee || 0}
                  </p>
                </div>
              </div>

              {/* Hospital Information */}
              {viewingDoctor.hospital && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    Hospital Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Hospital Name</label>
                      <p className="text-sm text-gray-900">{viewingDoctor.hospital.name || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-sm text-gray-900 flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        {viewingDoctor.hospital.phone || 'Not provided'}
                      </p>
                    </div>
                    {viewingDoctor.hospital.address && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Street Address</label>
                          <p className="text-sm text-gray-900">{viewingDoctor.hospital.address.street || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">City</label>
                          <p className="text-sm text-gray-900">{viewingDoctor.hospital.address.city || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">State/Province</label>
                          <p className="text-sm text-gray-900">{viewingDoctor.hospital.address.state || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">ZIP/Postal Code</label>
                          <p className="text-sm text-gray-900">{viewingDoctor.hospital.address.zipCode || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Country</label>
                          <p className="text-sm text-gray-900">{viewingDoctor.hospital.address.country || 'Not specified'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Status Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">Verified:</span>
                    {viewingDoctor.isVerified ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-sm text-gray-900">
                      {viewingDoctor.isVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">Accepting Patients:</span>
                    {viewingDoctor.isAcceptingPatients !== false ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-sm text-gray-900">
                      {viewingDoctor.isAcceptingPatients !== false ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">Account Active:</span>
                    {viewingDoctor.user?.isActive ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-sm text-gray-900">
                      {viewingDoctor.user?.isActive ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={closeViewModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeViewModal();
                  openEditModal(viewingDoctor);
                }}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium transition-colors"
              >
                Edit Details
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;
