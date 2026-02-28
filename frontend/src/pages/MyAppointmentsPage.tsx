import React from 'react';

const MyAppointmentsPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <p className="text-gray-500">You have no appointments yet.</p>
      </div>
    </div>
  );
};

export default MyAppointmentsPage;
