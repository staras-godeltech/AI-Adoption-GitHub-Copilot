import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminServiceForm from '../components/AdminServiceForm';
import { serviceApi } from '../services/serviceApi';
import type { CreateServiceDto, UpdateServiceDto } from '../services/serviceApi';

const CreateServicePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: CreateServiceDto | UpdateServiceDto) => {
    await serviceApi.create(data as CreateServiceDto);
    navigate('/admin/services');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Service</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6 max-w-lg">
        <AdminServiceForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/services')}
        />
      </div>
    </div>
  );
};

export default CreateServicePage;
