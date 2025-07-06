import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SparklesIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon,
  CalendarIcon,
  XMarkIcon,
  PlusIcon,
  UserIcon,
  StarIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import aiService from '../../services/aiService';
import doctorService from '../../services/doctorService';

export default function SymptomInput() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    symptoms: [],
    severity: '',
    duration: '',
    description: '',
    additionalInfo: ''
  });
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const commonSymptoms = [
    'Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea', 'Chest Pain',
    'Shortness of Breath', 'Dizziness', 'Sore Throat', 'Muscle Pain',
    'Abdominal Pain', 'Joint Pain', 'Skin Rash', 'Vomiting', 'Diarrhea'
  ];

  const severityLevels = [
    { value: 'mild', label: 'Mild', description: 'Slight discomfort, doesn\'t interfere with daily activities' },
    { value: 'moderate', label: 'Moderate', description: 'Noticeable discomfort, some interference with activities' },
    { value: 'severe', label: 'Severe', description: 'Significant discomfort, major interference with activities' },
    { value: 'critical', label: 'Critical', description: 'Extreme discomfort, unable to perform normal activities' }
  ];

  const durationOptions = [
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' }
  ];

  const addSymptom = (symptom) => {
    if (symptom && !formData.symptoms.includes(symptom)) {
      setFormData({
        ...formData,
        symptoms: [...formData.symptoms, symptom]
      });
      setCurrentSymptom('');
    }
  };

  const removeSymptom = (symptomToRemove) => {
    setFormData({
      ...formData,
      symptoms: formData.symptoms.filter(symptom => symptom !== symptomToRemove)
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.symptoms.length === 0) {
      newErrors.symptoms = 'Please add at least one symptom';
    }
    
    if (!formData.severity) {
      newErrors.severity = 'Please select severity level';
    }
    
    if (!formData.duration) {
      newErrors.duration = 'Please select duration';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const analyzeSymptoms = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Create symptom description from selected symptoms and additional info
      const symptomDescription = `
        I am experiencing: ${formData.symptoms.join(', ')}.
        Severity: ${formData.severity}.
        Duration: ${formData.duration}.
        ${formData.description ? `Additional details: ${formData.description}` : ''}
        ${formData.additionalInfo ? `Other information: ${formData.additionalInfo}` : ''}
      `.trim();

             // Call the real AI API
       const response = await aiService.analyzeSymptoms({
         symptoms: symptomDescription
       });

       // API interceptor unwraps axios response, so check response.success (not response.data.success)
       if (response && response.success) {
         const analysis = response.data;
         
        setAnalysis({
          confidence: Math.round(analysis.confidence * 100),
          recommendedSpecialty: analysis.recommendedSpecialty,
          urgencyLevel: analysis.urgencyLevel,
          reasoning: analysis.reasoning,
          alternativeSpecialties: analysis.alternativeSpecialties || [],
          suggestedQuestions: analysis.suggestedQuestions || [],
          redFlags: analysis.redFlags || []
        });
        
        // Fetch recommended doctors for the recommended specialty
        if (analysis.recommendedSpecialty) {
          await fetchRecommendedDoctors(analysis.recommendedSpecialty);
        }
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
      setErrors({ form: `Analysis failed: ${error.response?.data?.error || error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (level) => {
    switch (level) {
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

  const fetchRecommendedDoctors = async (specialty) => {
    setLoadingDoctors(true);
    try {
      // If AI recommends "General Practice", show all available doctors
      let response;
      if (specialty === 'General Practice') {
        response = await doctorService.getDoctors({ 
          isAcceptingPatients: true,
          limit: 10 
        });
      } else {
        response = await doctorService.getDoctors({ 
        specialty: specialty,
        isAcceptingPatients: true,
        limit: 10 
      });
      }
      
      if (response && response.success) {
        setRecommendedDoctors(response.data || []);
      } else {
        setRecommendedDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching recommended doctors:', error);
      setRecommendedDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const bookAppointment = (doctorId) => {
    navigate(`/patient/book-appointment/${doctorId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SparklesIcon className="h-8 w-8 mr-3 text-purple-600" />
            AI Symptom Analysis
          </h1>
          <p className="text-gray-600 mt-2">
            Describe your symptoms and get personalized doctor recommendations.
          </p>
        </div>

        {!analysis ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Symptoms Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What symptoms are you experiencing?
              </label>
              
              {/* Current Symptoms */}
              {formData.symptoms.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.symptoms.map((symptom, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                    >
                      {symptom}
                      <button
                        type="button"
                        onClick={() => removeSymptom(symptom)}
                        className="ml-2 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add Custom Symptom */}
              <div className="mb-4">
                <div className="flex">
                  <input
                    type="text"
                    value={currentSymptom}
                    onChange={(e) => setCurrentSymptom(e.target.value)}
                    placeholder="Type a symptom..."
                    className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSymptom(currentSymptom);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addSymptom(currentSymptom)}
                    className="px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Common Symptoms */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Or select from common symptoms:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {commonSymptoms.map((symptom) => (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => addSymptom(symptom)}
                      disabled={formData.symptoms.includes(symptom)}
                      className={`text-sm px-3 py-2 rounded-md border transition-colors ${
                        formData.symptoms.includes(symptom)
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>
              
              {errors.symptoms && (
                <p className="mt-2 text-sm text-red-600">{errors.symptoms}</p>
              )}
            </div>

            {/* Severity Level */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How severe are your symptoms?
              </label>
              <div className="space-y-2">
                {severityLevels.map((level) => (
                  <label key={level.value} className="flex items-start">
                    <input
                      type="radio"
                      name="severity"
                      value={level.value}
                      checked={formData.severity === level.value}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="mt-1 mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{level.label}</div>
                      <div className="text-sm text-gray-600">{level.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.severity && (
                <p className="mt-2 text-sm text-red-600">{errors.severity}</p>
              )}
            </div>

            {/* Duration */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How long have you had these symptoms?
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select duration</option>
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.duration && (
                <p className="mt-2 text-sm text-red-600">{errors.duration}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please describe your symptoms in detail (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe when symptoms occur, what triggers them, what makes them better or worse..."
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Additional Information */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Any additional information? (optional)
              </label>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                rows={2}
                placeholder="Medical history, current medications, recent changes..."
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Error Message */}
            {errors.form && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.form}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={analyzeSymptoms}
                disabled={loading}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } transition-colors duration-200`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Symptoms...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    Analyze Symptoms with AI
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Analysis Results */
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
                <CheckCircleIcon className="h-6 w-6 mr-2 text-green-500" />
                Analysis Complete
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Your Symptoms</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.symptoms.map((symptom, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Recommended Specialty</h3>
                  <p className="text-indigo-600 font-medium">{analysis.recommendedSpecialty}</p>
                  <p className="text-sm text-gray-600">Confidence: {analysis.confidence}%</p>
                </div>
              </div>
            </div>

            {/* Urgency Level */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Urgency Assessment</h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(analysis.urgencyLevel)}`}>
                {analysis.urgencyLevel.charAt(0).toUpperCase() + analysis.urgencyLevel.slice(1)} Priority
              </div>
            </div>

            {/* AI Reasoning */}
            {analysis.reasoning && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis</h3>
                <p className="text-gray-700 leading-relaxed">{analysis.reasoning}</p>
              </div>
            )}

            {/* Alternative Specialties */}
            {analysis.alternativeSpecialties && analysis.alternativeSpecialties.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alternative Specialties</h3>
                <div className="space-y-3">
                  {analysis.alternativeSpecialties.map((alt, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{alt.specialty}</span>
                      <span className="text-sm text-gray-600">{Math.round(alt.confidence * 100)}% confidence</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {analysis.suggestedQuestions && analysis.suggestedQuestions.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions to Ask Your Doctor</h3>
                <ul className="space-y-2">
                  {analysis.suggestedQuestions.map((question, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-indigo-500 mr-2 mt-1">•</span>
                      <span className="text-gray-700">{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Red Flags */}
            {analysis.redFlags && analysis.redFlags.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  Important Warning Signs
                </h3>
                <ul className="space-y-2">
                  {analysis.redFlags.map((flag, index) => (
                    <li key={index} className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-red-700">{flag}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-red-600 font-medium">
                  Seek immediate medical attention if you experience any of these symptoms.
                </p>
              </div>
            )}

            {/* Recommended Doctors */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-indigo-600" />
                {analysis.recommendedSpecialty === 'General Practice' 
                  ? 'Available Healthcare Specialists' 
                  : `Recommended ${analysis.recommendedSpecialty} Specialists`
                }
              </h3>
              
              {loadingDoctors ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-gray-600">Finding specialists...</span>
                </div>
              ) : recommendedDoctors.length > 0 ? (
                <div className="space-y-4">
                  {recommendedDoctors.map((doctor) => (
                    <div key={doctor._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-indigo-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-gray-900">
                              Dr. {doctor.firstName} {doctor.lastName}
                              {doctor.isVerified && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ✓ Verified
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600">{doctor.primarySpecialty}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
                                {doctor.rating?.average ? `${doctor.rating.average.toFixed(1)} (${doctor.rating.count})` : 'New'}
                              </span>
                              <span className="flex items-center">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {doctor.yearsOfExperience || 0} years
                              </span>
                              <span className="flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                {doctor.address?.city || 'Location not specified'}
                              </span>
                            </div>
                            {doctor.bio && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {doctor.bio}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className="text-right">
                            <p className="text-lg font-semibold text-indigo-600">
                              ${doctor.consultationFee || 0}
                            </p>
                            <p className="text-sm text-gray-500">per consultation</p>
                          </div>
                          <button
                            onClick={() => bookAppointment(doctor._id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                          >
                            Book Appointment
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">No specialists available</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {analysis.recommendedSpecialty === 'General Practice' 
                      ? 'No healthcare specialists are currently accepting new patients.'
                      : `No ${analysis.recommendedSpecialty} specialists are currently accepting new patients.`
                    }
                  </p>
                  <button
                    onClick={() => navigate('/patient/doctors')}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Browse All Doctors
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => {
                  setAnalysis(null);
                  setRecommendedDoctors([]);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Analyze New Symptoms
              </button>
              <button
                onClick={() => navigate('/patient/doctors')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Browse All Doctors
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 