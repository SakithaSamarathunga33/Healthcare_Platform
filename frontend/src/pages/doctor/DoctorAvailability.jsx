import { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ClockIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import doctorService from '../../services/doctorService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DoctorAvailability() {
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [editing, setEditing] = useState(false);
  const [editedAvailability, setEditedAvailability] = useState({});
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day: '',
    startTime: '',
    endTime: '',
    type: 'regular' // 'regular', 'emergency', 'consultation'
  });
  const [error, setError] = useState(null);

  const daysOfWeek = [
    { key: 'monday', name: 'Monday' },
    { key: 'tuesday', name: 'Tuesday' },
    { key: 'wednesday', name: 'Wednesday' },
    { key: 'thursday', name: 'Thursday' },
    { key: 'friday', name: 'Friday' },
    { key: 'saturday', name: 'Saturday' },
    { key: 'sunday', name: 'Sunday' }
  ];

  const appointmentTypes = [
    { value: 'regular', label: 'Regular Appointment', color: 'bg-blue-100 text-blue-800' },
    { value: 'emergency', label: 'Emergency Only', color: 'bg-red-100 text-red-800' },
    { value: 'consultation', label: 'Consultation', color: 'bg-green-100 text-green-800' }
  ];

  useEffect(() => {
    fetchAvailability();
  }, [currentWeek]);

  const fetchAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both availability settings and appointments
      const [availabilityResponse, appointmentsResponse] = await Promise.all([
        doctorService.getAvailabilitySettings(),
        doctorService.getDoctorAppointments({ limit: 100 }) // Get more appointments to calculate bookings
      ]);
      
      console.log('Raw availability response:', availabilityResponse.data);
      console.log('Raw appointments response:', appointmentsResponse.data);
      
      // Transform backend availability format to frontend format
      const backendAvailability = availabilityResponse.data.availability || [];
      const appointments = appointmentsResponse.data.appointments || [];
      const transformedAvailability = {};
      
      daysOfWeek.forEach(day => {
        const dayData = backendAvailability.find(avail => 
          avail.day.toLowerCase() === day.name.toLowerCase()
        );
        
        if (dayData && dayData.slots && dayData.slots.length > 0) {
          transformedAvailability[day.key] = {
          isAvailable: true,
            slots: dayData.slots.map((slot, index) => {
              // Calculate booked appointments for this time slot
              const slotStart = new Date(`2000-01-01T${slot.startTime}:00`);
              const slotEnd = new Date(`2000-01-01T${slot.endTime}:00`);
              
              const bookedAppointments = appointments.filter(apt => {
                const aptTime = new Date(apt.dateTime);
                const aptTimeOnly = new Date(`2000-01-01T${aptTime.toTimeString().slice(0, 5)}:00`);
                const aptDay = aptTime.toLocaleDateString('en-US', { weekday: 'long' });
                
                // Check both day and time
                return aptDay === day.name && aptTimeOnly >= slotStart && aptTimeOnly < slotEnd;
              });
              
              return {
                id: index + 1,
                startTime: slot.startTime,
                endTime: slot.endTime,
                type: 'regular', // Default type since backend doesn't store this
                booked: bookedAppointments.length,
                capacity: 8, // Default capacity
                appointments: bookedAppointments // Store actual appointments for display
              };
            })
          };
        } else {
          transformedAvailability[day.key] = {
          isAvailable: false,
          slots: []
          };
        }
      });

      setAvailability(transformedAvailability);
      setEditedAvailability(transformedAvailability);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setError('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Transform frontend format back to backend format
      const backendAvailability = [];
      
      Object.keys(editedAvailability).forEach(dayKey => {
        const dayData = editedAvailability[dayKey];
        if (dayData.isAvailable && dayData.slots.length > 0) {
          const dayName = daysOfWeek.find(d => d.key === dayKey)?.name;
          if (dayName) {
            backendAvailability.push({
              day: dayName,
              slots: dayData.slots.map(slot => ({
                startTime: slot.startTime,
                endTime: slot.endTime,
                isAvailable: true
              }))
            });
          }
        }
      });
      
      await doctorService.updateAvailability({ availability: backendAvailability });
      
      setAvailability(editedAvailability);
      setEditing(false);
      
      // Show success message
      alert('Availability updated successfully!');
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Error updating availability. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditedAvailability(availability);
    setEditing(false);
  };

  const toggleDayAvailability = (day) => {
    setEditedAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isAvailable: !prev[day].isAvailable
      }
    }));
  };

  const addTimeSlot = () => {
    if (!newSlot.day || !newSlot.startTime || !newSlot.endTime) {
      alert('Please fill in all fields');
      return;
    }

    const newSlotData = {
      id: Date.now(),
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      type: newSlot.type,
      booked: 0,
      capacity: 8 // Default capacity
    };

    setEditedAvailability(prev => ({
      ...prev,
      [newSlot.day]: {
        ...prev[newSlot.day],
        slots: [...(prev[newSlot.day]?.slots || []), newSlotData]
      }
    }));

    setNewSlot({
      day: '',
      startTime: '',
      endTime: '',
      type: 'regular'
    });
    setShowAddSlot(false);
  };

  const removeTimeSlot = (day, slotId) => {
    setEditedAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter(slot => slot.id !== slotId)
      }
    }));
  };

  const getTypeColor = (type) => {
    const typeConfig = appointmentTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.color : 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type) => {
    const typeConfig = appointmentTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.label : type;
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getWeekDates = (startDate) => {
    const dates = [];
    const start = new Date(startDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    start.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const weekDates = getWeekDates(currentWeek);

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
              <h1 className="text-3xl font-bold text-gray-900">Availability Management</h1>
              <p className="text-gray-600 mt-2">
                Manage your schedule and appointment availability
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
                    Save Changes
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
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Edit Schedule
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
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
        )}

        {/* Week Navigator */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
              
              <div className="flex items-center space-x-4">
                <CalendarIcon className="h-6 w-6 text-indigo-600" />
                <span className="text-lg font-semibold text-gray-900">
                  {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - 
                  {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              
              <button
                onClick={() => navigateWeek(1)}
                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Add Time Slot Modal */}
        {showAddSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Time Slot</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day
                  </label>
                  <select
                    value={newSlot.day}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, day: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Day</option>
                    {daysOfWeek.map(day => (
                      <option key={day.key} value={day.key}>{day.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Type
                  </label>
                  <select
                    value={newSlot.type}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {appointmentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddSlot(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addTimeSlot}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Slot
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Schedule */}
        {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {daysOfWeek.map((day, index) => {
            const dayData = editing ? editedAvailability[day.key] : availability[day.key];
            const weekDate = weekDates[index];
            
            return (
              <div key={day.key} className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{day.name}</h3>
                      <p className="text-sm text-gray-500">
                        {weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    
                    {editing && (
                      <div className="flex items-center space-x-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dayData?.isAvailable || false}
                            onChange={() => toggleDayAvailability(day.key)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  {!dayData?.isAvailable ? (
                    <div className="text-center py-8">
                      <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Not Available</p>
                    </div>
                  ) : dayData.slots?.length === 0 ? (
                    <div className="text-center py-8">
                      <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No time slots</p>
                      {editing && (
                        <button
                          onClick={() => {
                            setNewSlot(prev => ({ ...prev, day: day.key }));
                            setShowAddSlot(true);
                          }}
                          className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          Add Slot
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dayData.slots.map((slot) => (
                        <div key={slot.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <ClockIcon className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-900">
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                              </span>
                            </div>
                            {editing && (
                              <button
                                onClick={() => removeTimeSlot(day.key, slot.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(slot.type)}`}>
                              {getTypeLabel(slot.type)}
                            </span>
                            
                            <div className="text-xs text-gray-500">
                              {slot.booked}/{slot.capacity} booked
                            </div>
                          </div>
                          
                          {/* Show booked appointments */}
                          {slot.appointments && slot.appointments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {slot.appointments.slice(0, 3).map((apt, aptIndex) => (
                                <div key={aptIndex} className="text-xs bg-gray-50 p-1 rounded">
                                  <div className="font-medium text-gray-700">
                                    {apt.patient?.firstName} {apt.patient?.lastName}
                                  </div>
                                  <div className="text-gray-500">
                                    {new Date(apt.dateTime).toLocaleTimeString('en-US', { 
                                      hour: 'numeric', 
                                      minute: '2-digit', 
                                      hour12: true 
                                    })} • {apt.status}
                                  </div>
                                </div>
                              ))}
                              {slot.appointments.length > 3 && (
                                <div className="text-xs text-gray-500 text-center">
                                  +{slot.appointments.length - 3} more
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Capacity Bar */}
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  slot.booked / slot.capacity > 0.8 ? 'bg-red-500' :
                                  slot.booked / slot.capacity > 0.6 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${(slot.booked / slot.capacity) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {editing && (
                        <button
                          onClick={() => {
                            setNewSlot(prev => ({ ...prev, day: day.key }));
                            setShowAddSlot(true);
                          }}
                          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors text-sm font-medium"
                        >
                          <PlusIcon className="h-4 w-4 mx-auto mb-1" />
                          Add Times Slot
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}

      </div>
    </div>
  );
} 