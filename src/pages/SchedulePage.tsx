import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Calendar } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EventCard } from '@/components/schedule/EventCard';
import { EventForm } from '@/components/schedule/EventForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatMonthYear } from '@/utils/dateUtils';
import type { CalendarEvent } from '@/types';

export function SchedulePage() {
  const { events, addEvent, updateEvent, getUpcoming, getPast } = useApp();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcoming = getUpcoming();
  const past = getPast();
  const displayed = tab === 'upcoming' ? upcoming : past;

  function groupByMonth(evs: CalendarEvent[]) {
    const groups: Record<string, CalendarEvent[]> = {};
    evs.forEach(e => {
      const month = formatMonthYear(e.date);
      if (!groups[month]) groups[month] = [];
      groups[month].push(e);
    });
    return groups;
  }

  function handleAdd(data: Omit<CalendarEvent, 'id'>) {
    addEvent(data);
    setShowForm(false);
  }

  function handleEdit(data: Omit<CalendarEvent, 'id'>) {
    if (editingEvent) {
      updateEvent(editingEvent.id, data);
      setEditingEvent(null);
    }
  }

  const grouped = groupByMonth(displayed);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-sm text-gray-500 mt-0.5">{events.length} total events</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <CalendarPlus size={16} />
          Add Event
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-5 w-fit">
        {(['upcoming', 'past'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t} ({t === 'upcoming' ? upcoming.length : past.length})
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          icon={<Calendar size={56} />}
          title={tab === 'upcoming' ? 'No upcoming events' : 'No past events'}
          description={tab === 'upcoming' ? 'Add your next practice or game!' : 'Past events will appear here.'}
          action={tab === 'upcoming' ? { label: 'Add Event', onClick: () => setShowForm(true) } : undefined}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, evs]) => (
            <div key={month}>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">{month}</h2>
              <div className="space-y-3">
                {evs.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={() => setEditingEvent(event)}
                    onMarkAttendance={() => navigate(`/attendance/${event.id}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Event" size="lg">
        <EventForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      </Modal>

      <Modal isOpen={!!editingEvent} onClose={() => setEditingEvent(null)} title="Edit Event" size="lg">
        {editingEvent && (
          <EventForm
            defaultValues={editingEvent}
            onSubmit={handleEdit}
            onCancel={() => setEditingEvent(null)}
            submitLabel="Save Changes"
          />
        )}
      </Modal>
    </div>
  );
}
