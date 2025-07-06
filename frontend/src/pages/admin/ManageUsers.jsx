/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  PencilIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  PlusIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import adminService from '../../services/adminService';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    dateOfBirth: '',
    gender: '',
    // Doctor-specific fields
    specialties: [],
    primarySpecialty: '',
    licenseNumber: '',
    yearsOfExperience: '',
    bio: '',
    consultationFee: '',
    languages: [],
    isAcceptingPatients: true
  });
  const [editLoading, setEditLoading] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: '',
    dateOfBirth: '',
    gender: '',
    // Doctor-specific fields
    primarySpecialty: '',
    licenseNumber: '',
    yearsOfExperience: '',
    bio: '',
    consultationFee: '',
    isAcceptingPatients: true
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminService.getSystemUsers();
      
      // The API interceptor returns response.data directly, so response.data contains the users array
      const userData = response && Array.isArray(response.data) ? response.data : [];
      
      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, status) => {
    try {
      const response = await adminService.updateUserStatus(userId, status);
      if (response.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const newIsActive = !currentStatus; // If currently active (true), make it false and vice versa
      const response = await adminService.updateUserStatus(userId, { isActive: newIsActive });
      if (response.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleEditUser = async (user) => {
    setEditingUser(user);
    
    // Base user data
    const baseData = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      gender: user.gender || '',
      // Doctor-specific fields - initialize with defaults
      specialties: [],
      primarySpecialty: '',
      licenseNumber: '',
      yearsOfExperience: '',
      bio: '',
      consultationFee: '',
      languages: [],
      isAcceptingPatients: true
    };

    // If user is a doctor, fetch their doctor profile
    if (user.role === 'doctor') {
      try {
        const doctorResponse = await adminService.getDoctorProfile(user._id);
        
        if (doctorResponse && doctorResponse.success && doctorResponse.user) {
          let doctorDetails = null;
          
          // Check if response has user with doctorDetails
          if (doctorResponse.user && doctorResponse.user.doctorDetails) {
            doctorDetails = doctorResponse.user.doctorDetails;
          }
          // Check if response has doctorDetails directly
          else if (doctorResponse.doctorDetails) {
            doctorDetails = doctorResponse.doctorDetails;
          }
          // Check if the entire user object is the doctor details
          else if (doctorResponse.user && (doctorResponse.user.specialties || doctorResponse.user.primarySpecialty)) {
            doctorDetails = doctorResponse.user;
          }
          
          if (doctorDetails) {
            setDoctorProfile(doctorDetails);
            
            // Merge doctor-specific data
            baseData.specialties = doctorDetails.specialties || [];
            baseData.primarySpecialty = doctorDetails.primarySpecialty || '';
            baseData.licenseNumber = doctorDetails.licenseNumber || '';
            baseData.yearsOfExperience = doctorDetails.yearsOfExperience || '';
            baseData.bio = doctorDetails.bio || '';
            baseData.consultationFee = doctorDetails.consultationFee || '';
            baseData.languages = doctorDetails.languages || [];
            baseData.isAcceptingPatients = doctorDetails.isAcceptingPatients !== undefined ? doctorDetails.isAcceptingPatients : true;
          } else {
            setDoctorProfile(null);
          }
        }
      } catch (error) {
        console.error('Error fetching doctor profile:', error);
        setDoctorProfile(null);
      }
    } else {
      setDoctorProfile(null);
    }

    setEditFormData(baseData);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      // Prepare data for backend - the backend expects doctor fields directly in the body
      const userData = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        phone: editFormData.phone,
        role: editFormData.role
      };

      // If user is a doctor, include doctor-specific fields directly in the body
      if (editingUser.role === 'doctor') {
        userData.primarySpecialty = editFormData.primarySpecialty;
        userData.licenseNumber = editFormData.licenseNumber;
        userData.yearsOfExperience = editFormData.yearsOfExperience ? parseInt(editFormData.yearsOfExperience) : undefined;
        userData.bio = editFormData.bio;
        userData.consultationFee = editFormData.consultationFee ? parseFloat(editFormData.consultationFee) : undefined;
        userData.isAcceptingPatients = editFormData.isAcceptingPatients;
      } else {
        // For non-doctor users, include dateOfBirth and gender
        userData.dateOfBirth = editFormData.dateOfBirth;
        userData.gender = editFormData.gender;
      }

      const response = await adminService.updateUserProfile(editingUser._id, userData);
      if (response.success) {
        fetchUsers();
        setEditingUser(null);
        setDoctorProfile(null);
        setEditFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          role: '',
          dateOfBirth: '',
          gender: '',
          specialties: [],
          primarySpecialty: '',
          licenseNumber: '',
          yearsOfExperience: '',
          bio: '',
          consultationFee: '',
          languages: [],
          isAcceptingPatients: true
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setDoctorProfile(null);
    setEditFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      dateOfBirth: '',
      gender: '',
      specialties: [],
      primarySpecialty: '',
      licenseNumber: '',
      yearsOfExperience: '',
      bio: '',
      consultationFee: '',
      languages: [],
      isAcceptingPatients: true
    });
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(''); // Clear previous errors

    try {
      // Prepare data for backend
      const userData = {
        firstName: createFormData.firstName.trim(),
        lastName: createFormData.lastName.trim(),
        email: createFormData.email.trim(),
        password: createFormData.password,
        phone: createFormData.phone ? createFormData.phone.trim() : '',
        role: createFormData.role
      };

      // Add role-specific fields
      if (createFormData.role === 'doctor') {
        // For doctors, include doctor-specific fields
        if (createFormData.primarySpecialty) {
          userData.specialties = [createFormData.primarySpecialty];
          userData.primarySpecialty = createFormData.primarySpecialty;
        }
        if (createFormData.licenseNumber) {
          userData.licenseNumber = createFormData.licenseNumber;
        }
        if (createFormData.yearsOfExperience) {
          userData.yearsOfExperience = parseInt(createFormData.yearsOfExperience);
        }
        if (createFormData.bio) {
          userData.bio = createFormData.bio;
        }
        if (createFormData.consultationFee) {
          userData.consultationFee = parseFloat(createFormData.consultationFee);
        }
        userData.isAcceptingPatients = createFormData.isAcceptingPatients;
      } else {
        // For patients and admins, include personal details
        if (createFormData.dateOfBirth) {
          userData.dateOfBirth = createFormData.dateOfBirth;
        }
        if (createFormData.gender) {
          userData.gender = createFormData.gender;
        }
      }

      const response = await adminService.createUser(userData);
      if (response.success) {
        fetchUsers();
        setShowCreateModal(false);
        setCreateError('');
        setCreateFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          phone: '',
          role: '',
          dateOfBirth: '',
          gender: '',
          primarySpecialty: '',
          licenseNumber: '',
          yearsOfExperience: '',
          bio: '',
          consultationFee: '',
          isAcceptingPatients: true
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Handle validation errors
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const errorMessages = error.response.data.details.map(detail => detail.msg).join(', ');
        setCreateError(errorMessages);
      } else if (error.response?.data?.error) {
        setCreateError(error.response.data.error);
      } else {
        setCreateError('Failed to create user. Please try again.');
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateModal(false);
    setCreateError('');
    setCreateFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      role: '',
      dateOfBirth: '',
      gender: '',
      primarySpecialty: '',
      licenseNumber: '',
      yearsOfExperience: '',
      bio: '',
      consultationFee: '',
      isAcceptingPatients: true
    });
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await adminService.deleteUser(userToDelete._id);
      if (response.success) {
        fetchUsers();
        setShowDeleteModal(false);
        setUserToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const filteredUsers = users.filter(user => {
    // Handle filter matching - check role and active status
    let matchesFilter = false;
    if (filter === 'all') {
      matchesFilter = true;
    } else if (filter === 'active') {
      matchesFilter = user.isActive === true;
    } else if (filter === 'inactive') {
      matchesFilter = user.isActive === false;
    } else {
      matchesFilter = user.role === filter;
    }

    // Handle search matching - search by name and email with null checks
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const email = user.email || '';
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'patient':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <ArrowPathIcon className="h-16 w-16 text-blue-600 animate-spin mx-auto" />
            <div className="absolute inset-0 h-16 w-16 border-4 border-blue-200 rounded-full animate-pulse mx-auto"></div>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg font-medium text-gray-700"
          >
            Loading users...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 lg:p-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Manage Users
                </h1>
                <p className="text-gray-600 font-medium">View and manage all system users with advanced controls</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500 shadow-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10 pr-8 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm appearance-none cursor-pointer min-w-[160px]"
                  >
                    <option value="all">All Users</option>
                    <option value="patient">Patients</option>
                    <option value="doctor">Doctors</option>
                    <option value="admin">Admins</option>
                    <option value="active">Active Users</option>
                    <option value="inactive">Inactive Users</option>
                  </select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create New User
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4" />
                      <span>User</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-100">
                <AnimatePresence>
                  {Array.isArray(filteredUsers) && filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-white/80 transition-all duration-200 group"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                              <span className="text-white font-bold text-lg">
                                {user.firstName?.charAt(0)?.toUpperCase()}{user.lastName?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">{user.email}</div>
                          </div>
                        </div>
                      </td>
                       <td className="px-6 py-5 whitespace-nowrap">
                         <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getRoleColor(user.role)}`}>
                           {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                         </span>
                       </td>
                       <td className="px-6 py-5 whitespace-nowrap">
                         <div className="flex items-center">
                           <div className={`flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                             user.isActive 
                               ? 'bg-green-100 text-green-800' 
                               : 'bg-red-100 text-red-800'
                           }`}>
                             {user.isActive ? (
                               <CheckCircleIcon className="h-4 w-4 mr-1" />
                             ) : (
                               <XCircleIcon className="h-4 w-4 mr-1" />
                             )}
                             <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">
                         {new Date(user.createdAt).toLocaleDateString('en-US', {
                           year: 'numeric',
                           month: 'short',
                           day: 'numeric'
                         })}
                       </td>
                       <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                         <div className="flex space-x-2">
                           <motion.button
                             whileHover={{ scale: 1.05 }}
                             whileTap={{ scale: 0.95 }}
                             onClick={() => handleStatusToggle(user._id, user.isActive)}
                             className={`px-3 py-1 rounded-lg text-xs font-bold shadow-sm transition-all duration-200 ${
                               user.isActive
                                 ? 'bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-md'
                                 : 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-md'
                             }`}
                           >
                             {user.isActive ? 'Deactivate' : 'Activate'}
                           </motion.button>
                           <motion.button
                             whileHover={{ scale: 1.1 }}
                             whileTap={{ scale: 0.9 }}
                             onClick={() => handleEditUser(user)}
                             className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                             title="Edit User"
                           >
                             <PencilIcon className="h-4 w-4" />
                           </motion.button>
                           <motion.button
                             whileHover={{ scale: 1.1 }}
                             whileTap={{ scale: 0.9 }}
                             onClick={() => handleDeleteUser(user)}
                             className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                             title="Delete User"
                           >
                             <TrashIcon className="h-4 w-4" />
                           </motion.button>
                         </div>
                       </td>
                     </motion.tr>
                   ))}
                 </AnimatePresence>
               </tbody>
          </table>
        </div>
        </motion.div>

        {Array.isArray(filteredUsers) && filteredUsers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-12 mx-auto max-w-md">
              <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Users Found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          </motion.div>
        )}

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden ${editingUser.role === 'doctor' ? 'w-full max-w-4xl' : 'w-full max-w-md'}`}
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <PencilIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Edit User
                      </h3>
                      <p className="text-blue-100">
                        {editingUser.firstName} {editingUser.lastName}
                        {editingUser.role === 'doctor' && <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">(Doctor)</span>}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCancelEdit}
                    className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </motion.button>
                </div>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  {/* Basic User Information */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center space-x-2 mb-4">
                      <UserIcon className="h-5 w-5 text-gray-600" />
                      <h4 className="text-lg font-bold text-gray-800">Basic Information</h4>
                    </div>
                     <div className="grid grid-cols-2 gap-6">
                       <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">
                           First Name
                         </label>
                         <input
                           type="text"
                           name="firstName"
                           value={editFormData.firstName}
                           onChange={handleEditFormChange}
                           className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                           required
                         />
                       </div>

                       <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">
                           Last Name
                         </label>
                         <input
                           type="text"
                           name="lastName"
                           value={editFormData.lastName}
                           onChange={handleEditFormChange}
                           className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                           required
                         />
                       </div>
                     </div>

                      <div className="grid grid-cols-2 gap-6 mt-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={editFormData.email}
                            onChange={handleEditFormChange}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 shadow-sm"
                            required
                            disabled
                          />
                          <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            Email cannot be changed
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={editFormData.phone}
                            onChange={handleEditFormChange}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                          />
                        </div>
                      </div>

                       <div className="grid grid-cols-3 gap-6 mt-6">
                         <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2">
                             Role
                           </label>
                           <select
                             name="role"
                             value={editFormData.role}
                             onChange={handleEditFormChange}
                             className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                             required
                           >
                             <option value="">Select Role</option>
                             <option value="patient">Patient</option>
                             <option value="doctor">Doctor</option>
                             <option value="admin">Admin</option>
                           </select>
                         </div>

                         {/* Only show Date of Birth and Gender for non-doctor users */}
                         {editingUser.role !== 'doctor' && (
                           <>
                             <div>
                               <label className="block text-sm font-bold text-gray-700 mb-2">
                                 Date of Birth
                               </label>
                               <input
                                 type="date"
                                 name="dateOfBirth"
                                 value={editFormData.dateOfBirth}
                                 onChange={handleEditFormChange}
                                 className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                               />
                             </div>

                             <div>
                               <label className="block text-sm font-bold text-gray-700 mb-2">
                                 Gender
                               </label>
                               <select
                                 name="gender"
                                 value={editFormData.gender}
                                 onChange={handleEditFormChange}
                                 className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                               >
                                 <option value="">Select Gender</option>
                                 <option value="male">Male</option>
                                 <option value="female">Female</option>
                                 <option value="other">Other</option>
                               </select>
                             </div>
                           </>
                         )}
                       </div>
                    </motion.div>

                  {/* Doctor-Specific Fields */}
                  {editingUser.role === 'doctor' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200 shadow-sm"
                    >
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="bg-blue-500 p-2 rounded-lg">
                          <UserIcon className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-blue-800">Doctor Information</h4>
                      </div>
                    
                       <div className="grid grid-cols-2 gap-6">
                         <div>
                           <label className="block text-sm font-bold text-blue-700 mb-2">
                             Primary Specialty
                           </label>
                           <select
                             name="primarySpecialty"
                             value={editFormData.primarySpecialty}
                             onChange={handleEditFormChange}
                             className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                           >
                             <option value="">Select Specialty</option>
                             <option value="General Practice">General Practice</option>
                             <option value="Cardiology">Cardiology</option>
                             <option value="Dermatology">Dermatology</option>
                             <option value="Endocrinology">Endocrinology</option>
                             <option value="Gastroenterology">Gastroenterology</option>
                             <option value="Neurology">Neurology</option>
                             <option value="Oncology">Oncology</option>
                             <option value="Orthopedics">Orthopedics</option>
                             <option value="Pediatrics">Pediatrics</option>
                             <option value="Psychiatry">Psychiatry</option>
                             <option value="Surgery">Surgery</option>
                           </select>
                         </div>

                         <div>
                           <label className="block text-sm font-bold text-blue-700 mb-2">
                             License Number
                           </label>
                           <input
                             type="text"
                             name="licenseNumber"
                             value={editFormData.licenseNumber}
                             onChange={handleEditFormChange}
                             className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                           />
                         </div>
                       </div>

                        <div className="grid grid-cols-2 gap-6 mt-6">
                          <div>
                            <label className="block text-sm font-bold text-blue-700 mb-2">
                              Years of Experience
                            </label>
                            <input
                              type="number"
                              name="yearsOfExperience"
                              value={editFormData.yearsOfExperience}
                              onChange={handleEditFormChange}
                              min="0"
                              className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-blue-700 mb-2">
                              Consultation Fee ($)
                            </label>
                            <input
                              type="number"
                              name="consultationFee"
                              value={editFormData.consultationFee}
                              onChange={handleEditFormChange}
                              min="0"
                              className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="mt-6">
                          <label className="block text-sm font-bold text-blue-700 mb-2">
                            Bio
                          </label>
                          <textarea
                            name="bio"
                            value={editFormData.bio}
                            onChange={handleEditFormChange}
                            rows="3"
                            className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm resize-none"
                            placeholder="Brief professional biography..."
                          />
                        </div>

                        <div className="mt-6">
                          <label className="flex items-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200 cursor-pointer hover:from-green-100 hover:to-blue-100 transition-all duration-200">
                            <input
                              type="checkbox"
                              name="isAcceptingPatients"
                              checked={editFormData.isAcceptingPatients}
                              onChange={(e) => setEditFormData(prev => ({
                                ...prev,
                                isAcceptingPatients: e.target.checked
                              }))}
                              className="w-5 h-5 text-green-600 border-2 border-green-300 rounded focus:ring-2 focus:ring-green-500 transition-all duration-200"
                            />
                            <span className="ml-3 text-sm font-medium text-green-700">Currently accepting new patients</span>
                          </label>
                        </div>
                      </motion.div>
                )}

                <div className="flex justify-end space-x-4 pt-6">
                  <motion.button
                    type="button"
                    onClick={handleCancelEdit}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 border-2 border-gray-300 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-sm"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={editLoading}
                    whileHover={{ scale: editLoading ? 1 : 1.02 }}
                    whileTap={{ scale: editLoading ? 1 : 0.98 }}
                    className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 shadow-lg"
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative mx-auto border-0 shadow-2xl rounded-2xl bg-white ${createFormData.role === 'doctor' ? 'w-full max-w-4xl' : 'w-full max-w-md'} max-h-[90vh] overflow-y-auto`}
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-8 w-8 text-white" />
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Create New User
                      </h3>
                      {createFormData.role === 'doctor' && (
                        <span className="text-blue-100 text-sm font-medium">(Doctor Account)</span>
                      )}
                    </div>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-white hover:text-gray-200 transition-colors duration-200"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </motion.button>
                </div>
              </div>
              <div className="p-6">

                {createError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl shadow-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                      <p className="text-sm font-medium">{createError}</p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleCreateSubmit} className="space-y-6">
                  {/* Basic User Information */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200 shadow-sm"
                  >
                    <div className="flex items-center space-x-2 mb-4">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                      <h4 className="text-lg font-bold text-blue-800">Basic Information</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-blue-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={createFormData.firstName}
                          onChange={handleCreateFormChange}
                          className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-blue-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={createFormData.lastName}
                          onChange={handleCreateFormChange}
                          className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-bold text-blue-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={createFormData.email}
                          onChange={handleCreateFormChange}
                          className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-blue-700 mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={createFormData.password}
                          onChange={handleCreateFormChange}
                          className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                          required
                          minLength="6"
                        />
                        <p className="text-xs text-blue-600 mt-2 font-medium">
                          Must contain at least one uppercase letter, one lowercase letter, and one number
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-bold text-blue-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={createFormData.phone}
                          onChange={handleCreateFormChange}
                          className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-blue-700 mb-2">
                          Role
                        </label>
                        <select
                          name="role"
                          value={createFormData.role}
                          onChange={handleCreateFormChange}
                          className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                          required
                        >
                          <option value="">Select Role</option>
                          <option value="patient">Patient</option>
                          <option value="doctor">Doctor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>

                    {/* Only show Date of Birth and Gender for non-doctor users */}
                    {createFormData.role && createFormData.role !== 'doctor' && (
                      <div className="grid grid-cols-2 gap-6 mt-6">
                        <div>
                          <label className="block text-sm font-bold text-blue-700 mb-2">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={createFormData.dateOfBirth}
                            onChange={handleCreateFormChange}
                            className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-blue-700 mb-2">
                            Gender
                          </label>
                          <select
                            name="gender"
                            value={createFormData.gender}
                            onChange={handleCreateFormChange}
                            className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Doctor-Specific Fields */}
                  {createFormData.role === 'doctor' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200 shadow-sm"
                    >
                      <div className="flex items-center space-x-2 mb-4">
                        <UserIcon className="h-5 w-5 text-purple-600" />
                        <h4 className="text-lg font-bold text-purple-800">Doctor Information</h4>
                      </div>
                    
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-purple-700 mb-2">
                            Primary Specialty
                          </label>
                          <select
                            name="primarySpecialty"
                            value={createFormData.primarySpecialty}
                            onChange={handleCreateFormChange}
                            className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                            required
                          >
                            <option value="">Select Specialty</option>
                            <option value="General Practice">General Practice</option>
                            <option value="Cardiology">Cardiology</option>
                            <option value="Dermatology">Dermatology</option>
                            <option value="Endocrinology">Endocrinology</option>
                            <option value="Gastroenterology">Gastroenterology</option>
                            <option value="Neurology">Neurology</option>
                            <option value="Oncology">Oncology</option>
                            <option value="Orthopedics">Orthopedics</option>
                            <option value="Pediatrics">Pediatrics</option>
                            <option value="Psychiatry">Psychiatry</option>
                            <option value="Surgery">Surgery</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-purple-700 mb-2">
                            License Number
                          </label>
                          <input
                            type="text"
                            name="licenseNumber"
                            value={createFormData.licenseNumber}
                            onChange={handleCreateFormChange}
                            className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mt-6">
                        <div>
                          <label className="block text-sm font-bold text-purple-700 mb-2">
                            Years of Experience
                          </label>
                          <input
                            type="number"
                            name="yearsOfExperience"
                            value={createFormData.yearsOfExperience}
                            onChange={handleCreateFormChange}
                            min="0"
                            className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-purple-700 mb-2">
                            Consultation Fee ($)
                          </label>
                          <input
                            type="number"
                            name="consultationFee"
                            value={createFormData.consultationFee}
                            onChange={handleCreateFormChange}
                            min="0"
                            className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-bold text-purple-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={createFormData.bio}
                          onChange={handleCreateFormChange}
                          rows="3"
                          className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm resize-none"
                          placeholder="Brief professional biography..."
                        />
                      </div>

                      <div className="mt-6">
                        <label className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all duration-200">
                          <input
                            type="checkbox"
                            name="isAcceptingPatients"
                            checked={createFormData.isAcceptingPatients}
                            onChange={(e) => setCreateFormData(prev => ({
                              ...prev,
                              isAcceptingPatients: e.target.checked
                            }))}
                            className="w-5 h-5 rounded border-2 border-purple-300 text-purple-600 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-all duration-200"
                          />
                          <span className="ml-3 text-sm font-semibold text-purple-700">Currently accepting new patients</span>
                        </label>
                      </div>
                    </motion.div>
                  )}

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <motion.button
                    type="button"
                    onClick={handleCancelCreate}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-300 rounded-xl hover:from-gray-200 hover:to-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 shadow-sm"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={createLoading}
                    whileHover={{ scale: createLoading ? 1 : 1.02 }}
                    whileTap={{ scale: createLoading ? 1 : 0.98 }}
                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-transparent rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                  >
                    {createLoading ? 'Creating...' : 'Create User'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">
                Delete User
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete <strong>{userToDelete.firstName} {userToDelete.lastName}</strong>?
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone. All data associated with this user will be permanently removed.
                </p>
                {userToDelete.role === 'doctor' && (
                  <p className="text-sm text-red-600 mt-2 font-medium">
                    ⚠️ This will also delete their doctor profile and all related medical data.
                  </p>
                )}
              </div>
              <div className="flex justify-center space-x-3 px-7 py-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ManageUsers;
