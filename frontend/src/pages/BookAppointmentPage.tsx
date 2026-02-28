import React from 'react';
import BookingForm from '../components/BookingForm';

const BookAppointmentPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Book an Appointment</h1>
      <BookingForm />
    </div>
  );
};

export default BookAppointmentPage;
