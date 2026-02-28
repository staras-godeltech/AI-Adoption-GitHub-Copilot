import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Service } from '../services/serviceApi';

interface AdminServiceTableProps {
  services: Service[];
  onDelete: (id: number) => Promise<void>;
  loading?: boolean;
}

const AdminServiceTable: React.FC<AdminServiceTableProps> = ({ services, onDelete, loading }) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded" />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return <p className="text-gray-500 text-center py-8">No services found.</p>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{service.name}</td>
                <td className="px-4 py-3 text-gray-600">{service.durationMinutes} min</td>
                <td className="px-4 py-3 text-gray-600">${service.price.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => navigate(`/admin/services/${service.id}/edit`)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmId(service.id)}
                    disabled={deletingId === service.id}
                    className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                  >
                    {deletingId === service.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation modal */}
      {confirmId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Deactivate Service</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to deactivate this service? It will be hidden from the public catalog.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={deletingId !== null}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-60"
              >
                {deletingId !== null ? 'Deleting...' : 'Deactivate'}
              </button>
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminServiceTable;
