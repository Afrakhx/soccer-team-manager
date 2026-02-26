import { format, parseISO, isAfter, isBefore, isToday } from 'date-fns';

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d');
}

export function formatDateTime(dateStr: string, timeStr: string): string {
  return `${format(parseISO(dateStr), 'EEE, MMM d')} at ${formatTime(timeStr)}`;
}

export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

export function isUpcoming(dateStr: string): boolean {
  return isAfter(parseISO(dateStr), new Date()) || isToday(parseISO(dateStr));
}

export function isPast(dateStr: string): boolean {
  return isBefore(parseISO(dateStr), new Date()) && !isToday(parseISO(dateStr));
}

export function sortByDate(a: string, b: string): number {
  return parseISO(a).getTime() - parseISO(b).getTime();
}

export function formatMonthYear(dateStr: string): string {
  return format(parseISO(dateStr), 'MMMM yyyy');
}
