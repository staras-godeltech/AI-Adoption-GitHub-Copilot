import React, { useEffect, useState } from 'react';
import { appointmentApi, type AppointmentDto } from '../services/appointmentApi';
import AppointmentCard from '../components/AppointmentCard';

const MyAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);

  const fetchAppointments = () => {
    setLoading(true);
    appointmentApi.getMy()
      .then((res) => setAppointments(res.data))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleCancel = async (id: number) => {
    setCancellingId(id);
    setError(null);
    try {
      await appointmentApi.cancel(id);
      setConfirmCancelId(null);
      fetchAppointments();
    } catch {
      setError('Failed to cancel appointment. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const upcoming = appointments.filter((a) => ['Pending', 'Confirmed'].includes(a.status));
  const past = appointments.filter((a) => ['Completed', 'Cancelled'].includes(a.status));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <a
          href="/customer/book"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          + Book New
        </a>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Cancel confirmation modal */}
      {confirmCancelId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Cancel Appointment</h2>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to cancel this appointment?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCancelId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Keep It
              </button>
              <button
                onClick={() => handleCancel(confirmCancelId)}
                disabled={cancellingId !== null}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {cancellingId !== null ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Upcoming</h2>
            {upcoming.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border p-6 text-gray-500">
                No upcoming appointments. <a href="/customer/book" className="text-indigo-600 hover:underline">Book one now!</a>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {upcoming.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    showCancelButton
                    onCancel={(id) => setConfirmCancelId(id)}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Past</h2>
            {past.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border p-6 text-gray-500">No past appointments.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {past.map((appt) => (
                  <AppointmentCard key={appt.id} appointment={appt} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default MyAppointmentsPage;
