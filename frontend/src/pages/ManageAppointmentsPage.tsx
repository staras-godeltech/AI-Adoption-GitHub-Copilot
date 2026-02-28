import React, { useEffect, useState, useCallback } from 'react';
import { appointmentApi, type AppointmentDto, type AppointmentStatisticsDto, type CalendarAppointmentDto } from '../services/appointmentApi';
import AdminAppointmentTable from '../components/AdminAppointmentTable';
import DashboardStatCard from '../components/DashboardStatCard';
import AppointmentCalendar from '../components/AppointmentCalendar';
import AppointmentFilters, { type FilterState } from '../components/AppointmentFilters';
import AppointmentDetailsModal from '../components/AppointmentDetailsModal';
import BulkActionToolbar from '../components/BulkActionToolbar';

const EMPTY_FILTERS: FilterState = { fromDate: '', toDate: '', statuses: [], cosmetologistId: '' };

const ManageAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [calendarAppointments, setCalendarAppointments] = useState<CalendarAppointmentDto[]>([]);
  const [statistics, setStatistics] = useState<AppointmentStatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'table' | 'calendar'>('table');
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [modalAppointment, setModalAppointment] = useState<AppointmentDto | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStatistics = useCallback(() => {
    setStatsLoading(true);
    appointmentApi.getStatistics()
      .then((res) => setStatistics(res.data))
      .catch(() => {/* stats are non-critical */})
      .finally(() => setStatsLoading(false));
  }, []);

  const fetchAppointments = useCallback(() => {
    setLoading(true);
    setError(null);
    const statusParam = filters.statuses.length > 0 ? filters.statuses.join(',') : undefined;
    const params = {
      from: filters.fromDate || undefined,
      to: filters.toDate || undefined,
      status: statusParam,
      cosmetologistId: filters.cosmetologistId ? Number(filters.cosmetologistId) : undefined,
    };
    appointmentApi.getAll(params)
      .then((res) => setAppointments(res.data))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false));
  }, [filters]);

  const fetchCalendarAppointments = useCallback((start: Date, end: Date) => {
    appointmentApi.getCalendarAppointments(start.toISOString(), end.toISOString())
      .then((res) => setCalendarAppointments(res.data))
      .catch(() => {/* calendar is non-critical */});
  }, []);

  useEffect(() => {
    fetchStatistics();
    fetchAppointments();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- intentional: load on mount only

  const handleApplyFilters = () => {
    setSelectedIds([]);
    fetchAppointments();
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSelectedIds([]);
    setLoading(true);
    setError(null);
    appointmentApi.getAll({})
      .then((res) => setAppointments(res.data))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false));
  };

  const handleStatusUpdated = () => {
    fetchAppointments();
    fetchStatistics();
    showToast('Status updated successfully.');
  };

  const handleBulkUpdateStatus = async (newStatus: string) => {
    try {
      await appointmentApi.bulkUpdateStatus({ appointmentIds: selectedIds, newStatus });
      setSelectedIds([]);
      fetchAppointments();
      fetchStatistics();
      showToast(`${selectedIds.length} appointment(s) updated to ${newStatus}.`);
    } catch {
      setError('Bulk update failed. Please try again.');
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await appointmentApi.exportAppointments({
        startDate: filters.fromDate || undefined,
        endDate: filters.toDate || undefined,
        format: 'csv',
      });
      const url = window.URL.createObjectURL(res.data as Blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `appointments-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Export downloaded successfully.');
    } catch {
      setError('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleCalendarRangeChange = (start: Date, end: Date) => {
    fetchCalendarAppointments(start, end);
  };

  const handleCalendarEventClick = (appt: CalendarAppointmentDto) => {
    const full = appointments.find((a) => a.id === appt.id);
    if (full) {
      setModalAppointment(full);
    } else {
      // Fetch full appointment if not loaded
      appointmentApi.getById(appt.id).then((res) => setModalAppointment(res.data)).catch(() => {});
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Appointments</h1>
        <button
          onClick={handleExport}
          disabled={exportLoading}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          {exportLoading ? 'Exporting…' : '↓ Export CSV'}
        </button>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{toast}</div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <DashboardStatCard
          label="Today's Appointments"
          count={statistics?.todayTotal ?? 0}
          loading={statsLoading}
          colorClass="bg-indigo-100 text-indigo-600"
          icon={<span className="text-xl">📅</span>}
        />
        <DashboardStatCard
          label="Pending"
          count={statistics?.pendingCount ?? 0}
          loading={statsLoading}
          colorClass="bg-yellow-100 text-yellow-600"
          icon={<span className="text-xl">⏳</span>}
        />
        <DashboardStatCard
          label="Confirmed"
          count={statistics?.confirmedCount ?? 0}
          loading={statsLoading}
          colorClass="bg-blue-100 text-blue-600"
          icon={<span className="text-xl">✅</span>}
        />
        <DashboardStatCard
          label="Completed"
          count={statistics?.completedCount ?? 0}
          loading={statsLoading}
          colorClass="bg-green-100 text-green-600"
          icon={<span className="text-xl">🎉</span>}
        />
        <DashboardStatCard
          label="Cancelled"
          count={statistics?.cancelledCount ?? 0}
          loading={statsLoading}
          colorClass="bg-red-100 text-red-600"
          icon={<span className="text-xl">❌</span>}
        />
      </div>

      {/* View Switcher */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView('table')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'table' ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Table View
        </button>
        <button
          onClick={() => {
            setView('calendar');
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            fetchCalendarAppointments(start, end);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'calendar' ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Calendar View
        </button>
      </div>

      {/* Filters */}
      <AppointmentFilters
        filters={filters}
        onChange={setFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {view === 'table' ? (
        <>
          {/* Bulk Action Toolbar */}
          <BulkActionToolbar
            selectedCount={selectedIds.length}
            onUpdateStatus={handleBulkUpdateStatus}
            onClearSelection={() => setSelectedIds([])}
          />

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border">
              <AdminAppointmentTable
                appointments={appointments}
                onStatusUpdated={handleStatusUpdated}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
              />
            </div>
          )}
        </>
      ) : (
        <AppointmentCalendar
          appointments={calendarAppointments}
          onSelectEvent={handleCalendarEventClick}
          onRangeChange={handleCalendarRangeChange}
        />
      )}

      {/* Appointment Details Modal */}
      {modalAppointment && (
        <AppointmentDetailsModal
          appointment={modalAppointment}
          onClose={() => setModalAppointment(null)}
          onStatusUpdated={() => {
            setModalAppointment(null);
            handleStatusUpdated();
          }}
        />
      )}
    </div>
  );
};

export default ManageAppointmentsPage;
