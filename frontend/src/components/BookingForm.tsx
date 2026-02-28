import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceApi, type Service } from '../services/serviceApi';
import { appointmentApi, type AvailableSlotDto } from '../services/appointmentApi';
import TimeSlotPicker from './TimeSlotPicker';
import { apiClient } from '../services/api';

interface Cosmetologist {
  id: number;
  name: string;
  email: string;
}

const STEPS = ['Select Service', 'Select Cosmetologist', 'Select Date & Time', 'Confirm'];

const BookingForm: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [services, setServices] = useState<Service[]>([]);
  const [cosmetologists, setCosmetologists] = useState<Cosmetologist[]>([]);
  const [slots, setSlots] = useState<AvailableSlotDto[]>([]);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedCosmetologist, setSelectedCosmetologist] = useState<Cosmetologist | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingCosmetologists, setLoadingCosmetologists] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load services on mount
  useEffect(() => {
    setLoadingServices(true);
    serviceApi.getAll()
      .then((res) => setServices(res.data.filter((s) => s.isActive)))
      .catch(() => setError('Failed to load services.'))
      .finally(() => setLoadingServices(false));
  }, []);

  // Load cosmetologists when step 1 is reached
  useEffect(() => {
    if (step === 1) {
      setLoadingCosmetologists(true);
      apiClient.get<Cosmetologist[]>('/api/users/cosmetologists')
        .then((res) => setCosmetologists(res.data))
        .catch(() => setCosmetologists([]))
        .finally(() => setLoadingCosmetologists(false));
    }
  }, [step]);

  // Load time slots when date changes
  useEffect(() => {
    if (step === 2 && selectedDate && selectedService) {
      setLoadingSlots(true);
      setSlots([]);
      setSelectedSlot(null);
      appointmentApi
        .getAvailableSlots(selectedDate, selectedService.id, selectedCosmetologist?.id)
        .then((res) => setSlots(res.data))
        .catch(() => setError('Failed to load time slots.'))
        .finally(() => setLoadingSlots(false));
    }
  }, [step, selectedDate, selectedService, selectedCosmetologist]);

  const handleNext = () => {
    setError(null);
    if (step === 0 && !selectedService) { setError('Please select a service.'); return; }
    if (step === 2 && !selectedSlot) { setError('Please select a time slot.'); return; }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      await appointmentApi.create({
        serviceId: selectedService.id,
        cosmetologistId: selectedCosmetologist?.id,
        appointmentDate: selectedSlot,
        notes: notes || undefined,
      });
      navigate('/customer/appointments');
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } };
      setError(anyErr?.response?.data?.message ?? 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  i < step
                    ? 'bg-indigo-600 text-white'
                    : i === step
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-200'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs mt-1 text-gray-600 hidden sm:block">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Step 0: Select Service */}
      {step === 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Service</h2>
          {loadingServices ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : (
            <div className="grid gap-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedService?.id === service.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{service.name}</p>
                      {service.description && (
                        <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">{service.durationMinutes} min</p>
                    </div>
                    <span className="text-indigo-700 font-semibold">${service.price.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Select Cosmetologist */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Cosmetologist (optional)</h2>
          {loadingCosmetologists ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : (
            <div className="grid gap-3">
              <button
                onClick={() => setSelectedCosmetologist(null)}
                className={`text-left p-4 rounded-lg border-2 transition-colors ${
                  !selectedCosmetologist ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <p className="font-medium text-gray-900">Any Available Cosmetologist</p>
                <p className="text-sm text-gray-500">We'll find you the next available slot</p>
              </button>
              {cosmetologists.map((cosm) => (
                <button
                  key={cosm.id}
                  onClick={() => setSelectedCosmetologist(cosm)}
                  className={`text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedCosmetologist?.id === cosm.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">{cosm.name}</p>
                  <p className="text-sm text-gray-500">{cosm.email}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Date & Time</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
              <TimeSlotPicker
                slots={slots}
                selectedSlot={selectedSlot}
                onSelect={setSelectedSlot}
                loading={loadingSlots}
              />
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirm Booking</h2>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium text-gray-900">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium text-gray-900">{selectedService?.durationMinutes} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-medium text-gray-900">${selectedService?.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cosmetologist:</span>
              <span className="font-medium text-gray-900">{selectedCosmetologist?.name ?? 'Any available'}</span>
            </div>
            {selectedSlot && (
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium text-gray-900">
                  {new Date(selectedSlot).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any special requests or information..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={handleBack}
          disabled={step === 0}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? 'Booking...' : 'Confirm Booking'}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
