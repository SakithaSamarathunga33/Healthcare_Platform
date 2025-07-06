import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import doctorService from '../../services/doctorService';

export default function DoctorBrowse() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const specialties = [
    'General Practice',
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry'
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    // Filter doctors based on search term
    if (searchTerm.trim() === '') {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter(doctor => 
        doctor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.primarySpecialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDoctors(filtered);
    }
  }, [searchTerm, doctors]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorService.getDoctors({ 
        isAcceptingPatients: true,
        limit: 50 
      });
      
      if (response && response.success) {
        setDoctors(response.data || []);
        setFilteredDoctors(response.data || []);
      } else {
        setDoctors([]);
        setFilteredDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
      );
    }
    
    const emptyStars = 5 - fullStars;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }
    
    return stars;
  };

  const bookAppointment = (doctorId) => {
    navigate(`/patient/book-appointment/${doctorId}`);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find a Doctor</h1>
          <p className="text-gray-600 mt-2">
            Browse qualified healthcare professionals and book your appointment
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors, specialties, or hospitals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredDoctors.length} doctors found
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-indigo-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {doctor.firstName?.startsWith('Dr.') ? `${doctor.firstName} ${doctor.lastName}` : `Dr. ${doctor.firstName} ${doctor.lastName}`}
                          {doctor.isVerified && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Verified
                            </span>
                          )}
                        </h3>
                        <p className="text-indigo-600 font-medium">{doctor.primarySpecialty}</p>
                        <p className="text-sm text-gray-600">{doctor.address?.city || 'Location not specified'}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          {doctor.rating?.average ? (
                            <>
                              {renderStars(doctor.rating.average)}
                          <span className="ml-2 text-sm text-gray-600">
                                {doctor.rating.average.toFixed(1)} ({doctor.rating.count})
                          </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">New</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {doctor.yearsOfExperience || 0} years exp.
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {doctor.address?.city || 'Location not specified'}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                        ${doctor.consultationFee || 0} consultation
                      </div>
                      <div className="flex items-center text-green-600">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Accepting patients
                      </div>
                    </div>

                    {doctor.bio && (
                    <p className="mt-3 text-sm text-gray-600">
                        {doctor.bio}
                    </p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Languages:</span> {doctor.languages?.join(', ') || 'English'}
                      </div>
                      <button
                        onClick={() => bookAppointment(doctor._id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
} 