import React, { useState } from 'react';
import { type AppointmentDto, appointmentApi } from '../services/appointmentApi';
import StatusBadge from './StatusBadge';

interface AppointmentDetailsModalProps {
  appointment: AppointmentDto;
  onClose: () => void;
  onStatusUpdated: () => void;
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  onClose,
  onStatusUpdated,
}) => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transitions = STATUS_TRANSITIONS[appointment.status] ?? [];

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    setError(null);
    try {
      await appointmentApi.updateStatus(appointment.id, { status: newStatus });
      onStatusUpdated();
      onClose();
    } catch {
      setError('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const date = new Date(appointment.appointmentDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Appointment Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <StatusBadge status={appointment.status} />
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Customer</span>
            <span className="font-medium text-gray-900">{appointment.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Service</span>
            <span className="font-medium text-gray-900">{appointment.serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Cosmetologist</span>
            <span className="font-medium text-gray-900">{appointment.cosmetologistName ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date & Time</span>
            <span className="font-medium text-gray-900">
              {date.toLocaleDateString()} {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Duration</span>
            <span className="font-medium text-gray-900">{appointment.duration} min</span>
          </div>
          {appointment.notes && (
            <div>
              <span className="text-gray-500">Notes</span>
              <p className="mt-1 text-gray-900 bg-gray-50 rounded p-2">{appointment.notes}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
        )}

        {transitions.length > 0 && (
          <div className="mt-5 flex gap-2 flex-wrap">
            {transitions.map((nextStatus) => (
              <button
                key={nextStatus}
                disabled={updating}
                onClick={() => handleStatusChange(nextStatus)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  nextStatus === 'Cancelled'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } disabled:opacity-50`}
              >
                {updating ? 'Updating…' : `→ ${nextStatus}`}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-3 w-full py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;
