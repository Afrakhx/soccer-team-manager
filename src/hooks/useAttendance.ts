import { useLocalStorage } from './useLocalStorage';
import { generateId } from '@/utils/generateId';
import type { AttendanceRecord, AttendanceStatus } from '@/types';

export function useAttendance(initial: AttendanceRecord[] = []) {
  const [records, setRecords] = useLocalStorage<AttendanceRecord[]>('u10_attendance', initial);

  function markAttendance(eventId: string, playerId: string, status: AttendanceStatus, notes?: string) {
    const existing = records.find(r => r.eventId === eventId && r.playerId === playerId);
    if (existing) {
      setRecords(records.map(r =>
        r.id === existing.id ? { ...r, status, notes } : r
      ));
    } else {
      const record: AttendanceRecord = { id: generateId(), eventId, playerId, status, notes };
      setRecords([...records, record]);
    }
  }

  function getAttendanceForEvent(eventId: string): AttendanceRecord[] {
    return records.filter(r => r.eventId === eventId);
  }

  function getAttendanceForPlayer(playerId: string): AttendanceRecord[] {
    return records.filter(r => r.playerId === playerId);
  }

  function getStatusForPlayer(eventId: string, playerId: string): AttendanceStatus | undefined {
    return records.find(r => r.eventId === eventId && r.playerId === playerId)?.status;
  }

  return { records, markAttendance, getAttendanceForEvent, getAttendanceForPlayer, getStatusForPlayer };
}
