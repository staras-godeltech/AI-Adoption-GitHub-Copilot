import React from 'react';
import Button from '../components/Button';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Cosmetology Booking App
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Book your beauty appointments with ease
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="primary">Book Now</Button>
            <Button variant="secondary">View Services</Button>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Browse Services</h3>
            <p className="text-gray-600">Explore our wide range of beauty services</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
            <p className="text-gray-600">Schedule appointments in just a few clicks</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Expert Staff</h3>
            <p className="text-gray-600">Professional cosmetologists at your service</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
