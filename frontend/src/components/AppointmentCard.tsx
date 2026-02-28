import React from 'react';
import { type AppointmentDto } from '../services/appointmentApi';
import StatusBadge from './StatusBadge';

interface AppointmentCardProps {
  appointment: AppointmentDto;
  onCancel?: (id: number) => void;
  showCancelButton?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onCancel, showCancelButton }) => {
  const date = new Date(appointment.appointmentDate);
  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{appointment.serviceName}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{formattedDate} at {formattedTime}</p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <p><span className="font-medium">Duration:</span> {appointment.duration} min</p>
        {appointment.cosmetologistName && (
          <p><span className="font-medium">Cosmetologist:</span> {appointment.cosmetologistName}</p>
        )}
        {appointment.notes && (
          <p><span className="font-medium">Notes:</span> {appointment.notes}</p>
        )}
      </div>

      {showCancelButton && appointment.status === 'Pending' && onCancel && (
        <button
          onClick={() => onCancel(appointment.id)}
          className="mt-2 self-start text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
        >
          Cancel Appointment
        </button>
      )}
    </div>
  );
};

export default AppointmentCard;
