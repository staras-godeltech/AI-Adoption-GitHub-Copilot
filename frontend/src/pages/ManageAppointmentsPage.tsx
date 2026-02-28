import React, { useEffect, useState } from 'react';
import { appointmentApi, type AppointmentDto } from '../services/appointmentApi';
import AdminAppointmentTable from '../components/AdminAppointmentTable';

const STATUS_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 0 },
  { label: 'Confirmed', value: 1 },
  { label: 'Cancelled', value: 2 },
  { label: 'Completed', value: 3 },
];

const ManageAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);

  const fetchAppointments = () => {
    setLoading(true);
    setError(null);

    const params = {
      from: fromDate || undefined,
      to: toDate || undefined,
      status: statusFilter,
    };

    appointmentApi.getAll(params)
      .then((res) => setAppointments(res.data))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Appointments</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={statusFilter ?? ''}
              onChange={(e) => setStatusFilter(e.target.value === '' ? undefined : Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.label} value={s.value ?? ''}>{s.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchAppointments}
            className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            Apply Filters
          </button>
          <button
            onClick={() => { setFromDate(''); setToDate(''); setStatusFilter(undefined); fetchAppointments(); }}
            className="px-4 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border">
          <AdminAppointmentTable appointments={appointments} onStatusUpdated={fetchAppointments} />
        </div>
      )}
    </div>
  );
};

export default ManageAppointmentsPage;
