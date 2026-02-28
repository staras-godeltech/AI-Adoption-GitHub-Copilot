import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appointmentApi, type AppointmentDto } from '../services/appointmentApi';
import AppointmentList from '../components/AppointmentList';

const MyAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = () => {
    setLoading(true);
    appointmentApi.getMy()
      .then((r) => setAppointments(r.data))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = (id: number) => {
    setCancelConfirm(id);
  };

  const confirmCancel = async () => {
    if (!cancelConfirm) return;
    setCancelling(true);
    try {
      await appointmentApi.cancel(cancelConfirm);
      setCancelConfirm(null);
      fetchAppointments();
    } catch {
      setError('Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  const upcoming = appointments.filter(
    (a) => a.status === 'Pending' || a.status === 'Confirmed'
  );
  const past = appointments.filter(
    (a) => a.status === 'Completed' || a.status === 'Cancelled'
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <Link
          to="/customer/book"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Book New
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Upcoming</h2>
        <AppointmentList
          appointments={upcoming}
          loading={loading}
          onCancel={handleCancel}
          showCancelButton
          emptyMessage="No upcoming appointments."
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Past</h2>
        <AppointmentList
          appointments={past}
          loading={loading}
          emptyMessage="No past appointments."
        />
      </section>

      {/* Cancel confirmation modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel appointment?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. The appointment will be marked as cancelled.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCancelConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Keep
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelling}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointmentsPage;
