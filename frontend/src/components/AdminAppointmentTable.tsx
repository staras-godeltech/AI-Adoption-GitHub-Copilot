import React, { useState, useMemo } from 'react';
import { type AppointmentDto, appointmentApi } from '../services/appointmentApi';
import StatusBadge from './StatusBadge';

interface AdminAppointmentTableProps {
  appointments: AppointmentDto[];
  onStatusUpdated: () => void;
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

type SortField = 'appointmentDate' | 'status' | 'customerName';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 50;

const AdminAppointmentTable: React.FC<AdminAppointmentTableProps> = ({
  appointments,
  onStatusUpdated,
  selectedIds,
  onSelectionChange,
}) => {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('appointmentDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const sorted = useMemo(() => {
    return [...appointments].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'appointmentDate') {
        cmp = new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime();
      } else if (sortField === 'status') {
        cmp = a.status.localeCompare(b.status);
      } else if (sortField === 'customerName') {
        cmp = a.customerName.localeCompare(b.customerName);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [appointments, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = paginated.length > 0 && paginated.every((a) => selectedSet.has(a.id));
  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange(selectedIds.filter((id) => !paginated.some((a) => a.id === id)));
    } else {
      const newIds = paginated.map((a) => a.id).filter((id) => !selectedIds.includes(id));
      onSelectionChange([...selectedIds, ...newIds]);
    }
  };
  const toggleOne = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 text-gray-400">
      {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  if (appointments.length === 0) {
    return <p className="text-gray-500 text-sm py-4 px-4">No appointments found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mx-4">{error}</div>
      )}
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 w-8">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded" />
            </th>
            <th
              className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
              onClick={() => handleSort('customerName')}
            >
              Customer <SortIcon field="customerName" />
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Service</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Cosmetologist</th>
            <th
              className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
              onClick={() => handleSort('appointmentDate')}
            >
              Date & Time <SortIcon field="appointmentDate" />
            </th>
            <th
              className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
              onClick={() => handleSort('status')}
            >
              Status <SortIcon field="status" />
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginated.map((appt) => {
            const date = new Date(appt.appointmentDate);
            const transitions = STATUS_TRANSITIONS[appt.status] ?? [];
            const isUpdating = updatingId === appt.id;
            const isSelected = selectedSet.has(appt.id);

            return (
              <tr key={appt.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-indigo-50' : ''}`}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOne(appt.id)}
                    className="rounded"
                  />
                </td>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-white"
            >
              ← Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-white"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointmentTable;
