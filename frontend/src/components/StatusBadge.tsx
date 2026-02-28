import React from 'react';
import type { AppointmentDto } from '../services/appointmentApi';

type Status = AppointmentDto['status'];

const statusConfig: Record<Status, { label: string; classes: string }> = {
  Pending: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  Confirmed: { label: 'Confirmed', classes: 'bg-blue-100 text-blue-800' },
  Completed: { label: 'Completed', classes: 'bg-green-100 text-green-800' },
  Cancelled: { label: 'Cancelled', classes: 'bg-red-100 text-red-800' },
};

interface StatusBadgeProps {
  status: Status;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] ?? { label: status, classes: 'bg-gray-100 text-gray-800' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
