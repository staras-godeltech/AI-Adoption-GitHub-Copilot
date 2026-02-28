import React from 'react';
import { type AvailableSlotDto } from '../services/appointmentApi';

interface TimeSlotPickerProps {
  slots: AvailableSlotDto[];
  selectedSlot: string | null;
  onSelect: (startTime: string) => void;
  loading?: boolean;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ slots, selectedSlot, onSelect, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (slots.length === 0) {
    return <p className="text-gray-500 text-sm py-4">No time slots available for the selected date.</p>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => {
        const time = new Date(slot.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const isSelected = selectedSlot === slot.startTime;
        const isAvailable = slot.available;

        return (
          <button
            key={slot.startTime}
            disabled={!isAvailable}
            onClick={() => isAvailable && onSelect(slot.startTime)}
            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
              isSelected
                ? 'bg-indigo-600 text-white border-indigo-600'
                : isAvailable
                ? 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            }`}
          >
            {time}
          </button>
        );
      })}
    </div>
  );
};

export default TimeSlotPicker;
