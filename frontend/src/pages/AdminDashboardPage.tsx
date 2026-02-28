import React from 'react';

const AdminDashboardPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Appointments</h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Services</h3>
          <p className="text-3xl font-bold text-indigo-600">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Users</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
