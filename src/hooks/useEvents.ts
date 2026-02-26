import { useLocalStorage } from './useLocalStorage';
import { generateId } from '@/utils/generateId';
import type { CalendarEvent } from '@/types';

export function useEvents(initial: CalendarEvent[] = []) {
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('u10_events', initial);

  function addEvent(data: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const event: CalendarEvent = { ...data, id: generateId() };
    setEvents([...events, event]);
    return event;
  }

  function updateEvent(id: string, data: Partial<CalendarEvent>) {
    setEvents(events.map(e => (e.id === id ? { ...e, ...data } : e)));
  }

  function deleteEvent(id: string) {
    setEvents(events.filter(e => e.id !== id));
  }

  function getUpcoming(): CalendarEvent[] {
    const today = new Date().toISOString().split('T')[0];
    return events
      .filter(e => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  function getPast(): CalendarEvent[] {
    const today = new Date().toISOString().split('T')[0];
    return events
      .filter(e => e.date < today)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  return { events, addEvent, updateEvent, deleteEvent, getUpcoming, getPast };
}
