import React from 'react';
import type { AvailableSlotDto } from '../services/appointmentApi';

interface TimeSlotPickerProps {
  slots: AvailableSlotDto[];
  selectedSlot: string | null;
  onSelect: (startTime: string) => void;
  loading?: boolean;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ slots, selectedSlot, onSelect, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4">No time slots available for this date.</p>
    );
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {slots.map((slot) => {
        const isSelected = selectedSlot === slot.startTime;
        return (
          <button
            key={slot.startTime}
            type="button"
            disabled={!slot.available}
            onClick={() => slot.available && onSelect(slot.startTime)}
            className={`
              py-2 px-3 rounded-lg text-sm font-medium border transition-colors
              ${!slot.available
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
              }
            `}
          >
            {formatTime(slot.startTime)}
          </button>
        );
      })}
    </div>
  );
};

export default TimeSlotPicker;
