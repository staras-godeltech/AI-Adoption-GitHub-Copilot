import React from 'react';
import ServiceCard from './ServiceCard';
import type { Service } from '../services/serviceApi';

interface ServiceListProps {
  services: Service[];
  loading?: boolean;
}

const ServiceList: React.FC<ServiceListProps> = ({ services, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
            <div className="w-full h-32 bg-gray-200 rounded-lg mb-4" />
            <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
            <div className="h-4 bg-gray-200 rounded mb-4 w-full" />
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No services available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
};

export default ServiceList;
