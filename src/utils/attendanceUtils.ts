import type { AttendanceRecord, CalendarEvent } from '@/types';

export function getAttendanceRate(
  playerId: string,
  records: AttendanceRecord[],
  events: CalendarEvent[]
): number {
  const completedEventIds = events
    .filter(e => e.isCompleted)
    .map(e => e.id);

  if (completedEventIds.length === 0) return 100;

  const playerRecords = records.filter(
    r => r.playerId === playerId && completedEventIds.includes(r.eventId)
  );

  const present = playerRecords.filter(r => r.status === 'Present').length;
  return Math.round((present / completedEventIds.length) * 100);
}

export function getEventAttendanceSummary(
  eventId: string,
  records: AttendanceRecord[]
) {
  const eventRecords = records.filter(r => r.eventId === eventId);
  return {
    present: eventRecords.filter(r => r.status === 'Present').length,
    absent: eventRecords.filter(r => r.status === 'Absent').length,
    excused: eventRecords.filter(r => r.status === 'Excused').length,
    total: eventRecords.length,
  };
}
