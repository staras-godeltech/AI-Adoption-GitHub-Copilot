import React from 'react';
import type { AppointmentDto } from '../services/appointmentApi';
import AppointmentCard from './AppointmentCard';

interface AppointmentListProps {
  appointments: AppointmentDto[];
  loading?: boolean;
  onCancel?: (id: number) => void;
  showCancelButton?: boolean;
  emptyMessage?: string;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  loading,
  onCancel,
  showCancelButton,
  emptyMessage = 'No appointments found.',
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="mx-auto w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {appointments.map((appt) => (
        <AppointmentCard
          key={appt.id}
          appointment={appt}
          onCancel={onCancel}
          showCancelButton={showCancelButton}
        />
      ))}
    </div>
  );
};

export default AppointmentList;
