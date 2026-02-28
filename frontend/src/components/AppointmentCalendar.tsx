import React, { useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { type CalendarAppointmentDto } from '../services/appointmentApi';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  Confirmed: '#3b82f6',
  Completed: '#22c55e',
  Cancelled: '#ef4444',
};

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  status: string;
  resource: CalendarAppointmentDto;
}

interface AppointmentCalendarProps {
  appointments: CalendarAppointmentDto[];
  onSelectEvent: (appointment: CalendarAppointmentDto) => void;
  onRangeChange: (start: Date, end: Date) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onSelectEvent,
  onRangeChange,
}) => {
  const events = useMemo<CalendarEvent[]>(() =>
    appointments.map((a) => ({
      id: a.id,
      title: a.title,
      start: new Date(a.start),
      end: new Date(a.end),
      status: a.status,
      resource: a,
    })),
  [appointments]);

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const color = STATUS_COLORS[event.status] ?? '#6366f1';
    return {
      style: {
        backgroundColor: color,
        borderColor: color,
        color: '#fff',
        borderRadius: '4px',
        fontSize: '0.75rem',
        padding: '2px 4px',
      },
    };
  }, []);

  const handleRangeChange = useCallback(
    (range: Date[] | { start: Date; end: Date }) => {
      if (Array.isArray(range)) {
        onRangeChange(range[0], range[range.length - 1]);
      } else {
        onRangeChange(range.start, range.end);
      }
    },
    [onRangeChange]
  );

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => onSelectEvent(event.resource),
    [onSelectEvent]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <span key={status} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
            {status}
          </span>
        ))}
      </div>

      <div style={{ height: 600 }}>
        <Calendar
          localizer={localizer}
          events={events}
          defaultView="month"
          views={['month', 'week', 'day']}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          onRangeChange={handleRangeChange}
          popup
        />
      </div>
    </div>
  );
};

export default AppointmentCalendar;
