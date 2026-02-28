import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminServiceForm from '../components/AdminServiceForm';
import { serviceApi } from '../services/serviceApi';
import type { Service, CreateServiceDto, UpdateServiceDto } from '../services/serviceApi';

const EditServicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    serviceApi.getById(Number(id))
      .then(res => setService(res.data))
      .catch(() => setError('Service not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: CreateServiceDto | UpdateServiceDto) => {
    await serviceApi.update(Number(id), data as UpdateServiceDto);
    navigate('/admin/services');
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Service</h1>
        <div className="bg-white rounded-xl shadow-sm border p-6 max-w-lg animate-pulse">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Service</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Service not found.'}
        </div>
        <button onClick={() => navigate('/admin/services')} className="mt-4 text-indigo-600 hover:underline">
          ← Back to Services
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Service</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6 max-w-lg">
        <AdminServiceForm
          initialData={service}
          isEdit
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/services')}
        />
      </div>
    </div>
  );
};

export default EditServicePage;
