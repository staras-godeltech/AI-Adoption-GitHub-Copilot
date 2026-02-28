import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-red-200">403</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-8">You do not have permission to view this page.</p>
        <Link
          to="/"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
