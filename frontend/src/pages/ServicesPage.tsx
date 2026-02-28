import React, { useEffect, useState } from 'react';
import ServiceList from '../components/ServiceList';
import { serviceApi } from '../services/serviceApi';
import type { Service } from '../services/serviceApi';

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    serviceApi.getAll()
      .then(res => setServices(res.data))
      .catch(() => setError('Failed to load services. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Services</h1>
        <p className="text-gray-600 mb-8">Choose from our range of professional beauty services.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <ServiceList services={services} loading={loading} />
      </div>
    </div>
  );
};

export default ServicesPage;
