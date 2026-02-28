import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceApi, type Service } from '../services/serviceApi';
import { appointmentApi, availabilityApi, type AvailableSlotDto } from '../services/appointmentApi';
import { apiClient } from '../services/api';
import TimeSlotPicker from './TimeSlotPicker';

interface Cosmetologist {
  id: number;
  name: string;
}

const STEPS = ['Select Service', 'Select Cosmetologist', 'Pick Date & Time', 'Confirm'];

const BookingForm: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [cosmetologists, setCosmetologists] = useState<Cosmetologist[]>([]);
  const [slots, setSlots] = useState<AvailableSlotDto[]>([]);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedCosmetologistId, setSelectedCosmetologistId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingCosmetologists, setLoadingCosmetologists] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load services
  useEffect(() => {
    serviceApi.getAll()
      .then((r) => setServices(r.data.filter((s) => s.isActive)))
      .finally(() => setLoadingServices(false));
  }, []);

  // Load cosmetologists
  useEffect(() => {
    if (step === 1) {
      setLoadingCosmetologists(true);
      apiClient.get<Cosmetologist[]>('/api/users?role=Cosmetologist')
        .then((r) => setCosmetologists(r.data))
        .catch(() => setCosmetologists([]))
        .finally(() => setLoadingCosmetologists(false));
    }
  }, [step]);

  // Load slots when date changes
  useEffect(() => {
    if (step === 2 && selectedDate && selectedService) {
      setLoadingSlots(true);
      setSelectedSlot(null);
      availabilityApi.getSlots(selectedDate, selectedService.id, selectedCosmetologistId ?? undefined)
        .then((r) => setSlots(r.data))
        .catch(() => setSlots([]))
        .finally(() => setLoadingSlots(false));
    }
  }, [step, selectedDate, selectedService, selectedCosmetologistId]);

  const canGoNext = () => {
    if (step === 0) return !!selectedService;
    if (step === 1) return true; // cosmetologist is optional
    if (step === 2) return !!selectedSlot;
    return true;
  };

  const handleNext = () => {
    setError(null);
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
        cosmetologistId: selectedCosmetologistId ?? undefined,
        startDateTime: selectedSlot,
        notes: notes || undefined,
      });
      navigate('/customer/appointments');
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError?.response?.data?.message ?? 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                ${i < step ? 'bg-indigo-600 border-indigo-600 text-white'
                  : i === step ? 'border-indigo-600 text-indigo-600'
                  : 'border-gray-300 text-gray-400'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-1 hidden sm:block ${i === step ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        {/* Step 0: Select Service */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a service</h2>
            {loadingServices ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : (
              <div className="grid gap-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
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
                        <p className="text-sm text-gray-500 mt-1">{service.durationMinutes} min</p>
                      </div>
                      <span className="font-semibold text-indigo-600">${service.price.toFixed(2)}</span>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Choose a cosmetologist</h2>
            <p className="text-sm text-gray-500 mb-4">Optional — leave unselected for auto-assignment.</p>
            {loadingCosmetologists ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : (
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCosmetologistId(null)}
                  className={`text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedCosmetologistId === null
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">Any available cosmetologist</p>
                </button>
                {cosmetologists.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCosmetologistId(c.id)}
                    className={`text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedCosmetologistId === c.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{c.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Pick Date & Time */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pick a date and time</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {selectedDate && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Available time slots</p>
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

        {/* Step 3: Notes & Confirm */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirm your booking</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium">{selectedService?.durationMinutes} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Price</span>
                <span className="font-medium">${selectedService?.price.toFixed(2)}</span>
              </div>
              {selectedCosmetologistId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Cosmetologist</span>
                  <span className="font-medium">
                    {cosmetologists.find((c) => c.id === selectedCosmetologistId)?.name}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Date & Time</span>
                <span className="font-medium">
                  {selectedSlot && new Date(selectedSlot).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or notes..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
