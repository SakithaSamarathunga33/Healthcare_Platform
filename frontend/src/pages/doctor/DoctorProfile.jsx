import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import doctorService from '../../services/doctorService';
import { 
  UserIcon, 
  CameraIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// Helper function to format address object to string
const formatAddress = (address) => {
  if (!address) return '';
  if (typeof address === 'string') return address;
  
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zipCode) parts.push(address.zipCode);
  if (address.country) parts.push(address.country);
  
  return parts.join(', ');
};

export default function DoctorProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await doctorService.getDoctorProfile();
      
      if (response && response.success) {
        const { user: userData, doctorProfile: doctorData } = response.data;
        
        console.log('API Response - User Data:', userData);
        console.log('API Response - Doctor Data:', doctorData);
        
        // Transform the API response to match our component structure
        const profileData = {
          id: userData._id || user?.id,
          personalInfo: {
            firstName: userData.firstName || user?.firstName || '',
            lastName: userData.lastName || user?.lastName || '',
            email: userData.email || user?.email || '',
            phone: userData.phone || '',
            address: userData.address ? formatAddress(userData.address) : '',
            dateOfBirth: userData.dateOfBirth || '',
            gender: userData.gender || '',
            avatar: null
          },
          professionalInfo: {
            licenseNumber: doctorData.licenseNumber || '',
            specialties: Array.isArray(doctorData.specialties) ? doctorData.specialties : [doctorData.primarySpecialty || ''],
            certifications: doctorData.certifications || [],
            experience: doctorData.yearsOfExperience ? `${doctorData.yearsOfExperience} years` : '',
            languages: doctorData.languages || [],
            hospitalAffiliations: doctorData.hospitalAffiliations || []
          },
          practiceInfo: {
            consultationFee: doctorData.consultationFee || 0,
            followUpFee: doctorData.followUpFee || 0,
            emergencyFee: doctorData.emergencyFee || 0,
            acceptedInsurance: doctorData.acceptedInsurance || [],
            paymentMethods: doctorData.paymentMethods || [],
            officeHours: doctorData.availability || {}
          },
          statistics: {
            totalPatients: doctorData.totalPatients || 0,
            totalAppointments: doctorData.totalAppointments || 0,
            avgRating: doctorData.rating?.average || 0,
            totalReviews: doctorData.rating?.count || 0,
            completedAppointments: doctorData.completedAppointments || 0,
            yearsOfPractice: doctorData.yearsOfExperience || 0
          },
          settings: {
            emailNotifications: true,
            smsNotifications: true,
            appointmentReminders: true,
            marketingEmails: false,
            profileVisibility: 'public'
          }
        };

        setProfile(profileData);
        setEditedProfile(profileData);
      } else {
        throw new Error('Failed to fetch doctor profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to user data if API fails
      const fallbackProfile = {
        id: user?.id,
        personalInfo: {
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          address: '',
          dateOfBirth: '',
          gender: '',
          avatar: null
        },
        professionalInfo: {
          licenseNumber: '',
          specialties: [],
          certifications: [],
          experience: '',
          languages: [],
          hospitalAffiliations: []
        },
        practiceInfo: {
          consultationFee: 0,
          followUpFee: 0,
          emergencyFee: 0,
          acceptedInsurance: [],
          paymentMethods: [],
          officeHours: {}
        },
        statistics: {
          totalPatients: 0,
          totalAppointments: 0,
          avgRating: 0,
          totalReviews: 0,
          completedAppointments: 0,
          yearsOfPractice: 0
        },
        settings: {
          emailNotifications: true,
          smsNotifications: true,
          appointmentReminders: true,
          marketingEmails: false,
          profileVisibility: 'public'
        }
      };
      setProfile(fallbackProfile);
      setEditedProfile(fallbackProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Prepare data for API update
      const updateData = {
        firstName: editedProfile.personalInfo.firstName,
        lastName: editedProfile.personalInfo.lastName,
        phone: editedProfile.personalInfo.phone,
        address: editedProfile.personalInfo.address,
        dateOfBirth: editedProfile.personalInfo.dateOfBirth,
        gender: editedProfile.personalInfo.gender,
        // Professional info
        licenseNumber: editedProfile.professionalInfo.licenseNumber,
        specialties: editedProfile.professionalInfo.specialties,
        education: editedProfile.professionalInfo.education,
        certifications: editedProfile.professionalInfo.certifications,
        yearsOfExperience: parseInt(editedProfile.professionalInfo.experience) || 0,
        languages: editedProfile.professionalInfo.languages,
        hospitalAffiliations: editedProfile.professionalInfo.hospitalAffiliations,
        // Practice info
        consultationFee: editedProfile.practiceInfo.consultationFee,
        followUpFee: editedProfile.practiceInfo.followUpFee,
        emergencyFee: editedProfile.practiceInfo.emergencyFee,
        acceptedInsurance: editedProfile.practiceInfo.acceptedInsurance,
        paymentMethods: editedProfile.practiceInfo.paymentMethods,
        officeHours: editedProfile.practiceInfo.officeHours
      };

      const response = await doctorService.updateDoctorProfile(updateData);
      
      if (response && response.success) {
        setProfile(editedProfile);
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setEditing(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    try {
      // Use auth service to change password
      const authService = await import('../../services/authService');
      const response = await authService.default.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response && response.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordSection(false);
        alert('Password changed successfully!');
      } else {
        throw new Error('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password. Please try again.');
    }
  };

  const addSpecialty = () => {
    const newSpecialty = prompt('Enter new specialty:');
    if (newSpecialty) {
      setEditedProfile(prev => ({
        ...prev,
        professionalInfo: {
          ...prev.professionalInfo,
          specialties: [...prev.professionalInfo.specialties, newSpecialty]
        }
      }));
    }
  };

  const removeSpecialty = (index) => {
    setEditedProfile(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        specialties: prev.professionalInfo.specialties.filter((_, i) => i !== index)
      }
    }));
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
              <h1 className="text-3xl font-bold text-gray-900">Doctor Profile</h1>
              <p className="text-gray-600 mt-2">
                Manage your professional information and settings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {editing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Picture and Basic Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="h-32 w-32 rounded-full bg-indigo-100 flex items-center justify-center mx-auto">
                    <UserIcon className="h-16 w-16 text-indigo-600" />
                  </div>
                  {editing && (
                    <button className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 transition-colors">
                      <CameraIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mt-4">
                  Dr. {profile.personalInfo.firstName} {profile.personalInfo.lastName}
                </h3>
                <p className="text-gray-600">
                  {profile.professionalInfo.specialties.join(', ')}
                </p>
                <div className="flex items-center justify-center mt-2">
                  <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">
                    {profile.statistics.avgRating} ({profile.statistics.totalReviews} reviews)
                  </span>
                </div>
              </div>
            </div>



            {/* Password Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Security</h4>
                <button
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Change Password
                </button>
              </div>
              
              {showPasswordSection && (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    >
                      Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPasswordSection(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editing ? editedProfile.personalInfo.firstName : profile.personalInfo.firstName}
                    onChange={(e) => editing && setEditedProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, firstName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={!editing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editing ? editedProfile.personalInfo.lastName : profile.personalInfo.lastName}
                    onChange={(e) => editing && setEditedProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, lastName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={!editing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editing ? editedProfile.personalInfo.email : profile.personalInfo.email}
                    onChange={(e) => editing && setEditedProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, email: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={!editing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editing ? editedProfile.personalInfo.phone : profile.personalInfo.phone}
                    onChange={(e) => editing && setEditedProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, phone: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={!editing}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editing ? editedProfile.personalInfo.address : profile.personalInfo.address}
                    onChange={(e) => editing && setEditedProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, address: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={!editing}
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number
                  </label>
                  <input
                    type="text"
                    value={editing ? editedProfile.professionalInfo.licenseNumber : profile.professionalInfo.licenseNumber}
                    onChange={(e) => editing && setEditedProfile(prev => ({
                      ...prev,
                      professionalInfo: { ...prev.professionalInfo, licenseNumber: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={!editing}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Specialties
                    </label>
                    {editing && (
                      <button
                        onClick={addSpecialty}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        <PlusIcon className="h-4 w-4 inline mr-1" />
                        Add
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {(editing ? editedProfile.professionalInfo.specialties : profile.professionalInfo.specialties).map((specialty, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                        <span className="text-sm">{specialty}</span>
                        {editing && (
                          <button
                            onClick={() => removeSpecialty(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>


              </div>
            </div>




          </div>
        </div>
      </div>
    </div>
  );
} 