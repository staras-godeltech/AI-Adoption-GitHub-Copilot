import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Service } from '../services/serviceApi';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow flex flex-col">
      <div className="w-full h-32 bg-indigo-50 rounded-lg mb-4 flex items-center justify-center">
        <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
      {service.description && (
        <p className="text-gray-600 text-sm mb-4 flex-1">{service.description}</p>
      )}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-gray-500 text-sm">{service.durationMinutes} min</span>
        <span className="text-indigo-600 font-bold text-lg">${service.price.toFixed(2)}</span>
      </div>
      <button
        onClick={() => navigate(`/services/${service.id}`)}
        className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
      >
        View Details
      </button>
    </div>
  );
};

export default ServiceCard;
