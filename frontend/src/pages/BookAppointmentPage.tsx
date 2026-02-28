import React from 'react';

const BookAppointmentPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Book an Appointment</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <p className="text-gray-500">
          Service selection and time slot booking will be available here.
        </p>
      </div>
    </div>
  );
};

export default BookAppointmentPage;
