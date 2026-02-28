import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceApi } from '../services/serviceApi';
import type { Service } from '../services/serviceApi';

const ServiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    serviceApi.getById(Number(id))
      .then(res => setService(res.data))
      .catch(() => setError('Service not found or unavailable.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-48 bg-gray-200 rounded-xl mb-6" />
          <div className="h-4 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-red-600 mb-4">{error || 'Service not found.'}</p>
          <button onClick={() => navigate('/services')} className="text-indigo-600 hover:underline">
            ← Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/services')} className="text-indigo-600 hover:underline mb-6 inline-block">
          ← Back to Services
        </button>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="w-full h-48 bg-indigo-50 flex items-center justify-center">
            <svg className="w-20 h-20 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>

            {service.description && (
              <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
            )}

            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700 font-medium">{service.durationMinutes} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-indigo-600">${service.price.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/customer/book')}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-lg"
            >
              Book This Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsPage;
