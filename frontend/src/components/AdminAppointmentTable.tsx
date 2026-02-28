import React, { useState } from 'react';
import type { AppointmentDto } from '../services/appointmentApi';
import StatusBadge from './StatusBadge';

interface AdminAppointmentTableProps {
  appointments: AppointmentDto[];
  loading?: boolean;
  onStatusUpdate: (id: number, status: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'Confirmed', label: 'Confirm' },
  { value: 'Completed', label: 'Complete' },
  { value: 'Cancelled', label: 'Cancel' },
];

const AdminAppointmentTable: React.FC<AdminAppointmentTableProps> = ({
  appointments,
  loading,
  onStatusUpdate,
}) => {
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleUpdate = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      await onStatusUpdate(id, status);
    } finally {
      setUpdatingId(null);
    }
  };

  const validNextStatuses = (current: AppointmentDto['status']): string[] => {
    if (current === 'Pending') return ['Confirmed', 'Cancelled'];
    if (current === 'Confirmed') return ['Completed', 'Cancelled'];
    return [];
  };

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
        <p>No appointments found.</p>
      </div>
    );
  }

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Customer', 'Service', 'Cosmetologist', 'Date & Time', 'Status', 'Actions'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {appointments.map((appt) => {
            const nextStatuses = validNextStatuses(appt.status);
            return (
              <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-900">{appt.customerName}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{appt.serviceName}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{appt.cosmetologistName ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(appt.startDateTime)}</td>
                <td className="px-4 py-3"><StatusBadge status={appt.status} /></td>
                <td className="px-4 py-3">
                  {nextStatuses.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {STATUS_OPTIONS.filter((o) => nextStatuses.includes(o.value)).map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleUpdate(appt.id, opt.value)}
                          disabled={updatingId === appt.id}
                          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors disabled:opacity-50
                            ${opt.value === 'Cancelled'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : opt.value === 'Completed'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                        >
                          {updatingId === appt.id ? '...' : opt.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminAppointmentTable;
