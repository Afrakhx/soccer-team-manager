import { Calendar, MapPin, Clock, Trophy, Users, Target } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDateShort, formatTime } from '@/utils/dateUtils';
import type { CalendarEvent } from '@/types';

interface EventCardProps {
  event: CalendarEvent;
  onEdit?: () => void;
  onMarkAttendance?: () => void;
  compact?: boolean;
}

const RESULT_COLORS = { Win: 'green', Loss: 'red', Draw: 'yellow', Upcoming: 'gray' } as const;
const TYPE_ICONS = { Game: Trophy, Practice: Users, Tournament: Target };

export function EventCard({ event, onEdit, onMarkAttendance, compact = false }: EventCardProps) {
  const Icon = TYPE_ICONS[event.type];

  return (
    <Card padding={false} className="overflow-hidden">
      <div className={`flex items-stretch ${compact ? 'gap-0' : ''}`}>
        {/* Date sidebar */}
        <div className={`flex flex-col items-center justify-center bg-pitch-900 text-white flex-shrink-0 ${compact ? 'w-14 py-3 px-1' : 'w-16 py-4'}`}>
          <span className="text-xs font-medium text-pitch-300">{formatDateShort(event.date).split(' ')[0]}</span>
          <span className="text-xl font-bold leading-none">{formatDateShort(event.date).split(' ')[1]}</span>
        </div>

        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start gap-2 mb-1 flex-wrap">
            <Badge color={event.type === 'Game' ? 'blue' : event.type === 'Tournament' ? 'purple' : 'green'}>
              <Icon size={10} className="mr-1" />
              {event.type}
            </Badge>
            {event.result && event.result !== 'Upcoming' && (
              <Badge color={RESULT_COLORS[event.result]}>{event.result}</Badge>
            )}
            {event.homeOrAway && (
              <Badge color="gray">{event.homeOrAway}</Badge>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 text-sm truncate">{event.title}</h3>

          {event.goalsFor !== undefined && (
            <p className="text-lg font-bold text-pitch-700 leading-none mb-1">
              {event.goalsFor} – {event.goalsAgainst}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Clock size={11} />{formatTime(event.time)}</span>
            <span className="flex items-center gap-1 truncate"><MapPin size={11} />{event.location}</span>
          </div>

          {event.notes && !compact && (
            <p className="text-xs text-gray-500 mt-2 italic">{event.notes}</p>
          )}

          {!compact && (
            <div className="flex gap-2 mt-3">
              {onMarkAttendance && event.isCompleted && (
                <Button size="sm" variant="secondary" onClick={onMarkAttendance}>
                  <Calendar size={12} /> Attendance
                </Button>
              )}
              {onEdit && (
                <Button size="sm" variant="ghost" onClick={onEdit}>Edit</Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
