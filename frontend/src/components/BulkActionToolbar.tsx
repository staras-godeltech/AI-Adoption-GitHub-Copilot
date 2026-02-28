import React, { useState } from 'react';

const STATUS_OPTIONS = ['Confirmed', 'Completed', 'Cancelled'];

interface BulkActionToolbarProps {
  selectedCount: number;
  onUpdateStatus: (newStatus: string) => Promise<void>;
  onClearSelection: () => void;
}

const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedCount,
  onUpdateStatus,
  onClearSelection,
}) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  if (selectedCount === 0) return null;

  const handleUpdate = async () => {
    if (!selectedStatus) return;
    setUpdating(true);
    try {
      await onUpdateStatus(selectedStatus);
      setSelectedStatus('');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 mb-4">
      <span className="text-sm font-medium text-indigo-700">
        {selectedCount} appointment{selectedCount !== 1 ? 's' : ''} selected
      </span>
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="border border-indigo-300 rounded-lg px-2 py-1.5 text-sm text-gray-700 bg-white"
      >
        <option value="">Update status…</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button
        disabled={!selectedStatus || updating}
        onClick={handleUpdate}
        className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {updating ? 'Updating…' : 'Apply'}
      </button>
      <button
        onClick={onClearSelection}
        className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-white"
      >
        Clear Selection
      </button>
    </div>
  );
};

export default BulkActionToolbar;
