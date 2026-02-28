import React, { useState } from 'react';
import { type AppointmentDto, appointmentApi } from '../services/appointmentApi';
import StatusBadge from './StatusBadge';

interface AdminAppointmentTableProps {
  appointments: AppointmentDto[];
  onStatusUpdated: () => void;
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

const AdminAppointmentTable: React.FC<AdminAppointmentTableProps> = ({ appointments, onStatusUpdated }) => {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    setError(null);
    try {
      await appointmentApi.updateStatus(id, { status: newStatus });
      onStatusUpdated();
    } catch {
      setError('Failed to update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (appointments.length === 0) {
    return <p className="text-gray-500 text-sm py-4">No appointments found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Service</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Cosmetologist</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {appointments.map((appt) => {
            const date = new Date(appt.appointmentDate);
            const transitions = STATUS_TRANSITIONS[appt.status] ?? [];
            const isUpdating = updatingId === appt.id;

            return (
              <tr key={appt.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">{appt.customerName}</td>
                <td className="px-4 py-3 text-gray-900">{appt.serviceName}</td>
                <td className="px-4 py-3 text-gray-600">{appt.cosmetologistName ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {date.toLocaleDateString()} {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={appt.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {transitions.map((nextStatus) => (
                      <button
                        key={nextStatus}
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(appt.id, nextStatus)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          nextStatus === 'Cancelled'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        } disabled:opacity-50`}
                      >
                        {isUpdating ? '...' : `→ ${nextStatus}`}
                      </button>
                    ))}
                  </div>
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
