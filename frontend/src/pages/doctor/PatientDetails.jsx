import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  UserIcon, 
  CalendarIcon, 
  ClockIcon,
  DocumentTextIcon,
  HeartIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CakeIcon,
  IdentificationIcon,
  StarIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CubeIcon,
  BeakerIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function PatientDetails() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPatientDetails();
  }, [patientId]);

  const fetchPatientDetails = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockPatient = {
        id: patientId,
        personalInfo: {
          name: 'John Smith',
          dateOfBirth: '1978-03-15',
          age: 45,
          gender: 'Male',
          phone: '+1 (555) 123-4567',
          email: 'john.smith@email.com',
          address: '123 Main St, Anytown, CA 90210',
          emergencyContact: 'Jane Smith (Wife) - (555) 987-6543',
          avatar: null
        },
        medicalInfo: {
          bloodType: 'O+',
          allergies: ['Penicillin', 'Shellfish'],
          chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
          currentMedications: [
            { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
            { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
            { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' }
          ],
          insurance: 'Blue Cross Blue Shield',
          primaryPhysician: 'Dr. Sarah Johnson'
        },
        appointments: [
          {
            id: 1,
            date: '2024-07-15',
            time: '09:00',
            type: 'In-Person',
            status: 'confirmed',
            reason: 'Chest pain evaluation',
            symptoms: 'Chest pain, shortness of breath, fatigue',
            notes: 'Follow-up on previous ECG results',
            doctor: 'Dr. Michael Chen'
          },
          {
            id: 2,
            date: '2024-06-20',
            time: '14:30',
            type: 'Video Call',
            status: 'completed',
            reason: 'Routine checkup',
            symptoms: 'General wellness check',
            notes: 'Blood pressure stable, continue current medications',
            doctor: 'Dr. Sarah Johnson'
          },
          {
            id: 3,
            date: '2024-05-15',
            time: '10:00',
            type: 'In-Person',
            status: 'completed',
            reason: 'Diabetes management',
            symptoms: 'Blood sugar monitoring',
            notes: 'HbA1c improved, medication adjusted',
            doctor: 'Dr. Emily Davis'
          }
        ],
        aiAnalyses: [
          {
            id: 1,
            date: '2024-07-10',
            symptoms: 'Chest pain, shortness of breath, fatigue',
            analysis: 'Potential cardiac evaluation recommended',
            confidence: 85,
            recommendations: [
              'Consult with cardiologist',
              'ECG and echocardiogram',
              'Monitor blood pressure closely'
            ],
            specialtyRecommendation: 'Cardiology'
          },
          {
            id: 2,
            date: '2024-06-15',
            symptoms: 'Headache, dizziness, fatigue',
            analysis: 'Possible hypertension-related symptoms',
            confidence: 72,
            recommendations: [
              'Blood pressure monitoring',
              'Medication review',
              'Lifestyle modifications'
            ],
            specialtyRecommendation: 'Internal Medicine'
          }
        ],
        vitalSigns: [
          {
            date: '2024-07-10',
            bloodPressure: '140/90',
            heartRate: '82',
            temperature: '98.6°F',
            weight: '185 lbs',
            height: '5\'10"',
            bmi: '26.5'
          },
          {
            date: '2024-06-20',
            bloodPressure: '135/85',
            heartRate: '78',
            temperature: '98.4°F',
            weight: '183 lbs',
            height: '5\'10"',
            bmi: '26.2'
          }
        ],
        testResults: [
          {
            id: 1,
            date: '2024-07-05',
            type: 'Blood Panel',
            status: 'completed',
            results: {
              'Total Cholesterol': '220 mg/dL',
              'LDL': '140 mg/dL',
              'HDL': '45 mg/dL',
              'Triglycerides': '175 mg/dL',
              'Glucose': '115 mg/dL',
              'HbA1c': '7.2%'
            },
            notes: 'Cholesterol elevated, diabetes well-controlled'
          },
          {
            id: 2,
            date: '2024-06-15',
            type: 'ECG',
            status: 'completed',
            results: {
              'Rhythm': 'Normal sinus rhythm',
              'Rate': '82 bpm',
              'Axis': 'Normal',
              'Intervals': 'Normal'
            },
            notes: 'No acute abnormalities noted'
          }
        ]
      };

      setPatient(mockPatient);
    } catch (error) {
      console.error('Error fetching patient details:', error);
    } finally {
      setLoading(false);
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Patient Not Found</h2>
          <p className="text-gray-600">The patient you're looking for doesn't exist.</p>
          <Link 
            to="/doctor/appointments" 
            className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Appointments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                to="/doctor/appointments" 
                className="mr-4 p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {patient.personalInfo.name}
                </h1>
                <p className="text-gray-600 mt-2">
                  Patient ID: {patient.id} • Age: {calculateAge(patient.personalInfo.dateOfBirth)} • 
                  {patient.personalInfo.gender}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                New Appointment
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Add Note
              </button>
            </div>
          </div>
        </div>

        {/* Patient Overview Card */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-indigo-600" />
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    {patient.personalInfo.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    {patient.personalInfo.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {patient.personalInfo.address}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CakeIcon className="h-4 w-4 mr-2" />
                    {formatDate(patient.personalInfo.dateOfBirth)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <HeartIcon className="h-4 w-4 mr-2" />
                    Blood Type: {patient.medicalInfo.bloodType}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <IdentificationIcon className="h-4 w-4 mr-2" />
                    {patient.medicalInfo.insurance}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Emergency Contact:</span>
                    <p className="text-gray-600">{patient.personalInfo.emergencyContact}</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Primary Physician:</span>
                    <p className="text-gray-600">{patient.medicalInfo.primaryPhysician}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: UserIcon },
                { id: 'appointments', name: 'Appointments', icon: CalendarIcon },
                { id: 'vitals', name: 'Vital Signs', icon: ChartBarIcon },
                { id: 'tests', name: 'Test Results', icon: BeakerIcon },
                { id: 'ai-analysis', name: 'AI Analysis', icon: DocumentTextIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Medical Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Allergies</h4>
                      <div className="space-y-2">
                        {patient.medicalInfo.allergies.map((allergy, index) => (
                          <span key={index} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-2">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Chronic Conditions</h4>
                      <div className="space-y-2">
                        {patient.medicalInfo.chronicConditions.map((condition, index) => (
                          <span key={index} className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mr-2">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Medications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Medications</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {patient.medicalInfo.currentMedications.map((medication, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <div className="flex items-center">
                            <CubeIcon className="h-5 w-5 text-blue-600 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">{medication.name}</p>
                              <p className="text-sm text-gray-600">{medication.dosage} - {medication.frequency}</p>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Appointment History</h3>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                    Schedule New
                  </button>
                </div>
                
                <div className="space-y-3">
                  {patient.appointments.map((appointment) => (
                    <div key={appointment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-gray-900">
                              {formatDate(appointment.date)}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {appointment.time} • {appointment.type} • {appointment.reason}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Doctor: {appointment.doctor}
                          </p>
                          {appointment.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              {appointment.notes}
                            </p>
                          )}
                        </div>
                        <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vital Signs Tab */}
            {activeTab === 'vitals' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Vital Signs History</h3>
                
                <div className="space-y-3">
                  {patient.vitalSigns.map((vitals, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-900">{formatDate(vitals.date)}</span>
                        <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-sm text-gray-600">Blood Pressure</p>
                          <p className="text-lg font-semibold text-gray-900">{vitals.bloodPressure}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-sm text-gray-600">Heart Rate</p>
                          <p className="text-lg font-semibold text-gray-900">{vitals.heartRate} bpm</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-sm text-gray-600">Temperature</p>
                          <p className="text-lg font-semibold text-gray-900">{vitals.temperature}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-sm text-gray-600">Weight</p>
                          <p className="text-lg font-semibold text-gray-900">{vitals.weight}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-sm text-gray-600">Height</p>
                          <p className="text-lg font-semibold text-gray-900">{vitals.height}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-sm text-gray-600">BMI</p>
                          <p className="text-lg font-semibold text-gray-900">{vitals.bmi}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Test Results Tab */}
            {activeTab === 'tests' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                    Add Result
                  </button>
                </div>
                
                <div className="space-y-3">
                  {patient.testResults.map((test) => (
                    <div key={test.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-medium text-gray-900">{test.type}</span>
                          <span className="ml-2 text-sm text-gray-600">{formatDate(test.date)}</span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                          {test.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(test.results).map(([key, value]) => (
                          <div key={key} className="bg-white rounded-lg p-3">
                            <p className="text-sm text-gray-600">{key}</p>
                            <p className="text-lg font-semibold text-gray-900">{value}</p>
                          </div>
                        ))}
                      </div>
                      {test.notes && (
                        <p className="text-sm text-gray-600 mt-3 italic">
                          Notes: {test.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Analysis Tab */}
            {activeTab === 'ai-analysis' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">AI Analysis History</h3>
                
                <div className="space-y-3">
                  {patient.aiAnalyses.map((analysis) => (
                    <div key={analysis.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-900">{formatDate(analysis.date)}</span>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-2">Confidence:</span>
                          <span className="font-semibold text-indigo-600">{analysis.confidence}%</span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Symptoms:</p>
                        <p className="text-gray-900">{analysis.symptoms}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Analysis:</p>
                        <p className="text-gray-900">{analysis.analysis}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Specialty Recommendation:</p>
                        <span className="inline-block bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded-full">
                          {analysis.specialtyRecommendation}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Recommendations:</p>
                        <ul className="list-disc list-inside text-sm text-gray-900 space-y-1">
                          {analysis.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 