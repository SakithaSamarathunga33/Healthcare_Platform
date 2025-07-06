import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import doctorService from '../../services/doctorService';
import appointmentService from '../../services/appointmentService';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('consultation');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);

  const appointmentTypes = [
    { value: 'consultation', label: 'General Consultation', duration: '30 min' },
    { value: 'follow-up', label: 'Follow-up Visit', duration: '20 min' },
    { value: 'urgent', label: 'Urgent Care', duration: '15 min' }
  ];

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const response = await doctorService.getDoctorById(doctorId);
        setDoctor(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching doctor data:', error);
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [doctorId]);

  const generateAvailableDates = () => {
    if (!doctor) return [];
    
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Check if doctor has availability for this day of the week
      if (doctor && doctor.availability) {
        const dayAvailability = doctor.availability.find(avail => avail.day === dayName);
        if (dayAvailability && dayAvailability.slots && dayAvailability.slots.length > 0) {
          const availableSlots = dayAvailability.slots.filter(slot => slot.isAvailable);
          if (availableSlots.length > 0) {
            dates.push({
              date: dateString,
              displayDate: date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              }),
              slots: availableSlots.map(slot => `${slot.startTime} - ${slot.endTime}`)
            });
          }
        }
      }
    }
    
    return dates;
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    setBooking(true);
    try {
      await appointmentService.bookAppointment(doctorId, {
        date: selectedDate,
        time: selectedTime,
        appointmentType,
        notes
      });
      setSuccess(true);
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointment Booked!</h2>
          <p className="text-gray-600 mb-6">
            Your appointment with {doctor.name} has been successfully scheduled for{' '}
            {new Date(selectedDate).toLocaleDateString()} at {selectedTime}.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/patient/doctors')}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      </div>
    );
  }

  const availableDates = generateAvailableDates();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-600 mt-2">Schedule your consultation with {doctor?.userDetails?.name || doctor?.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <UserIcon className="h-10 w-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{doctor?.userDetails?.name || doctor?.name}</h3>
                <p className="text-indigo-600">{doctor?.primarySpecialty}</p>
                <p className="text-sm text-gray-600">{doctor?.hospital?.name}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Consultation Fee</span>
                  <span className="font-semibold text-gray-900">${doctor?.consultationFee}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  <span className="font-semibold text-gray-900">{doctor?.rating?.average?.toFixed(1) || '0.0'} ⭐</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Date & Time</h2>

              {/* Appointment Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Appointment Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {appointmentTypes.map((type) => (
                    <label key={type.value} className="relative">
                      <input
                        type="radio"
                        name="appointmentType"
                        value={type.value}
                        checked={appointmentType === type.value}
                        onChange={(e) => setAppointmentType(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        appointmentType === type.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-sm text-gray-600">{type.duration}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Date
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableDates.map((dateInfo) => (
                    <button
                      key={dateInfo.date}
                      onClick={() => {
                        setSelectedDate(dateInfo.date);
                        setSelectedTime(''); // Reset time when date changes
                      }}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        selectedDate === dateInfo.date
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">{dateInfo.displayDate}</div>
                      <div className="text-xs text-gray-600">{dateInfo.slots.length} slots</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Time
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {availableDates
                      .find(d => d.date === selectedDate)
                      ?.slots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            selectedTime === time
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="mb-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe your symptoms or concerns..."
                />
              </div>

              {/* Booking Summary */}
              {selectedDate && selectedTime && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Doctor:</span> {doctor?.userDetails?.name || doctor?.name}</p>
                    <p><span className="text-gray-600">Date:</span> {new Date(selectedDate).toLocaleDateString()}</p>
                    <p><span className="text-gray-600">Time:</span> {selectedTime}</p>
                    <p><span className="text-gray-600">Type:</span> {appointmentTypes.find(t => t.value === appointmentType)?.label}</p>
                    <p><span className="text-gray-600">Fee:</span> ${doctor?.consultationFee}</p>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime || booking}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  !selectedDate || !selectedTime || booking
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {booking ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Booking Appointment...
                  </div>
                ) : (
                  'Book Appointment'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}