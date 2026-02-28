import React, { useEffect, useState } from 'react';
import { appointmentApi, type AppointmentDto } from '../services/appointmentApi';
import AdminAppointmentTable from '../components/AdminAppointmentTable';

const STATUS_OPTIONS = ['', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

const ManageAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const fetchAppointments = () => {
    setLoading(true);
    setError(null);
    appointmentApi.getAll({
      status: filterStatus || undefined,
      from: filterFrom || undefined,
      to: filterTo || undefined,
    })
      .then((r) => setAppointments(r.data))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    await appointmentApi.updateStatus(id, { status });
    fetchAppointments();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Appointments</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s || 'All statuses'}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From date</label>
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To date</label>
          <input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={fetchAppointments}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Apply
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <AdminAppointmentTable
          appointments={appointments}
          loading={loading}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
};

export default ManageAppointmentsPage;
