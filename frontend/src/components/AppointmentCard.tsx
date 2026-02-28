import React from 'react';
import type { AppointmentDto } from '../services/appointmentApi';
import StatusBadge from './StatusBadge';

interface AppointmentCardProps {
  appointment: AppointmentDto;
  onCancel?: (id: number) => void;
  showCancelButton?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onCancel, showCancelButton }) => {
  const start = new Date(appointment.startDateTime);
  const end = new Date(appointment.endDateTime);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{appointment.serviceName}</h3>
          <p className="text-sm text-gray-500">{formatDate(start)}</p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="flex flex-col gap-1 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatTime(start)} – {formatTime(end)} ({appointment.durationMinutes} min)
        </div>
        {appointment.cosmetologistName && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {appointment.cosmetologistName}
          </div>
        )}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ${appointment.servicePrice.toFixed(2)}
        </div>
        {appointment.notes && (
          <p className="text-gray-500 italic mt-1">"{appointment.notes}"</p>
        )}
      </div>

      {showCancelButton && appointment.status === 'Pending' && onCancel && (
        <button
          onClick={() => onCancel(appointment.id)}
          className="mt-2 self-start text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
        >
          Cancel appointment
        </button>
      )}
    </div>
  );
};

export default AppointmentCard;
