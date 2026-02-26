import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { PositionBadge } from '@/components/players/PositionBadge';
import { formatDate, formatTime } from '@/utils/dateUtils';
import type { AttendanceStatus } from '@/types';
import { clsx } from 'clsx';

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; icon: typeof CheckCircle; color: string }[] = [
  { value: 'Present', label: 'P', icon: CheckCircle, color: 'text-pitch-600 bg-pitch-50 border-pitch-300' },
  { value: 'Absent', label: 'A', icon: XCircle, color: 'text-red-600 bg-red-50 border-red-300' },
  { value: 'Excused', label: 'E', icon: MinusCircle, color: 'text-yellow-600 bg-yellow-50 border-yellow-300' },
];

export function AttendancePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { events, players, markAttendance, getStatusForPlayer, updateEvent } = useApp();

  const event = events.find(e => e.id === eventId);
  const activePlayers = players.filter(p => p.isActive);

  if (!event) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Event not found.</p>
        <Link to="/schedule" className="text-pitch-600 mt-2 inline-block">← Back to Schedule</Link>
      </div>
    );
  }

  const statuses = activePlayers.map(p => getStatusForPlayer(event.id, p.id));
  const presentCount = statuses.filter(s => s === 'Present').length;
  const totalMarked = statuses.filter(s => s !== undefined).length;

  function handleMark(playerId: string, status: AttendanceStatus) {
    markAttendance(event!.id, playerId, status);
    // Auto-mark event as completed when attendance is taken
    if (!event!.isCompleted) {
      updateEvent(event!.id, { isCompleted: true });
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link to="/schedule" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft size={18} />
        </Link>
        <span className="text-sm text-gray-500">Schedule</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium">Attendance</span>
      </div>

      <Card className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">{event.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {formatDate(event.date)} · {formatTime(event.time)} · {event.location}
        </p>
        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-pitch-700 font-semibold">{presentCount} present</span>
          <span className="text-gray-500">{activePlayers.length - presentCount} absent/excused</span>
          {totalMarked < activePlayers.length && (
            <span className="text-yellow-600">{activePlayers.length - totalMarked} unmarked</span>
          )}
        </div>
      </Card>

      <div className="space-y-2">
        {activePlayers.map(player => {
          const currentStatus = getStatusForPlayer(event.id, player.id);
          return (
            <Card key={player.id} className="flex items-center gap-4">
              <Avatar firstName={player.firstName} lastName={player.lastName} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">
                    #{player.jerseyNumber} {player.firstName} {player.lastName}
                  </p>
                  <PositionBadge position={player.position} />
                </div>
              </div>
              <div className="flex gap-1.5">
                {STATUS_OPTIONS.map(({ value, label, color }) => (
                  <button
                    key={value}
                    onClick={() => handleMark(player.id, value)}
                    className={clsx(
                      'w-9 h-9 rounded-lg border-2 text-sm font-bold transition-all',
                      currentStatus === value
                        ? color
                        : 'text-gray-400 bg-gray-50 border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {currentStatus && (
                <Badge
                  color={currentStatus === 'Present' ? 'green' : currentStatus === 'Absent' ? 'red' : 'yellow'}
                >
                  {currentStatus}
                </Badge>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
