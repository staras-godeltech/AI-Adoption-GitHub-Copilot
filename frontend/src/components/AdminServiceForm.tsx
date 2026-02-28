import React, { useState, useEffect } from 'react';
import type { Service, CreateServiceDto, UpdateServiceDto } from '../services/serviceApi';

interface AdminServiceFormProps {
  initialData?: Service;
  onSubmit: (data: CreateServiceDto | UpdateServiceDto) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

const AdminServiceForm: React.FC<AdminServiceFormProps> = ({ initialData, onSubmit, onCancel, isEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [price, setPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description ?? '');
      setDurationMinutes(String(initialData.durationMinutes));
      setPrice(String(initialData.price));
      setIsActive(initialData.isActive);
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required.';
    const dur = parseInt(durationMinutes, 10);
    if (!durationMinutes || isNaN(dur) || dur <= 0) newErrors.durationMinutes = 'Duration must be a positive number.';
    const pr = parseFloat(price);
    if (!price || isNaN(pr) || pr < 0) newErrors.price = 'Price must be a non-negative number.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const dto = isEdit
        ? { name: name.trim(), description: description.trim() || undefined, durationMinutes: parseInt(durationMinutes, 10), price: parseFloat(price), isActive }
        : { name: name.trim(), description: description.trim() || undefined, durationMinutes: parseInt(durationMinutes, 10), price: parseFloat(price) };
      await onSubmit(dto);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {submitError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="Service name"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Service description (optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) <span className="text-red-500">*</span></label>
        <input
          type="number"
          value={durationMinutes}
          onChange={e => setDurationMinutes(e.target.value)}
          min={1}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.durationMinutes ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="e.g. 60"
        />
        {errors.durationMinutes && <p className="text-red-500 text-xs mt-1">{errors.durationMinutes}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) <span className="text-red-500">*</span></label>
        <input
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          min={0}
          step={0.01}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.price ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="e.g. 45.00"
        />
        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
      </div>

      {isEdit && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={e => setIsActive(e.target.checked)}
            className="h-4 w-4 text-indigo-600 rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-60"
        >
          {submitting ? 'Saving...' : isEdit ? 'Update Service' : 'Create Service'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AdminServiceForm;
