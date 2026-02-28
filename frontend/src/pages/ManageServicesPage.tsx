import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminServiceTable from '../components/AdminServiceTable';
import { serviceApi } from '../services/serviceApi';
import type { Service } from '../services/serviceApi';

const ManageServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchServices = () => {
    setLoading(true);
    serviceApi.getAll()
      .then(res => setServices(res.data))
      .catch(() => setError('Failed to load services.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const handleDelete = async (id: number) => {
    try {
      await serviceApi.delete(id);
      fetchServices();
    } catch {
      setError('Failed to delete service. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Services</h1>
        <button
          onClick={() => navigate('/admin/services/new')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          + Add Service
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border">
        <AdminServiceTable services={services} onDelete={handleDelete} loading={loading} />
      </div>
    </div>
  );
};

export default ManageServicesPage;
