import { Link, useNavigate } from 'react-router-dom';
import { ClipboardCheck, Calendar } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, formatTime } from '@/utils/dateUtils';

export function AttendanceListPage() {
  const { events, records } = useApp();
  const navigate = useNavigate();

  const completedEvents = events
    .filter(e => e.isCompleted)
    .sort((a, b) => b.date.localeCompare(a.date));

  const upcomingEvents = events
    .filter(e => !e.isCompleted)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track who shows up to practices and games</p>
      </div>

      {upcomingEvents.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Upcoming — Take Attendance</h2>
          <div className="space-y-2">
            {upcomingEvents.slice(0, 5).map(event => {
              const eventRecords = records.filter(r => r.eventId === event.id);
              return (
                <Card key={event.id} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{event.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(event.date)} · {formatTime(event.time)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {eventRecords.length > 0 && (
                      <Badge color="green">{eventRecords.filter(r => r.status === 'Present').length} present</Badge>
                    )}
                    <Button size="sm" onClick={() => navigate(`/attendance/${event.id}`)}>
                      <ClipboardCheck size={13} />
                      Take Attendance
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Past Events</h2>
      {completedEvents.length === 0 ? (
        <EmptyState
          icon={<Calendar size={56} />}
          title="No past events"
          description="Completed events will appear here. Go to Schedule to add events."
        />
      ) : (
        <div className="space-y-2">
          {completedEvents.map(event => {
            const eventRecords = records.filter(r => r.eventId === event.id);
            const present = eventRecords.filter(r => r.status === 'Present').length;
            const total = eventRecords.length;
            return (
              <Link key={event.id} to={`/attendance/${event.id}`}>
                <Card className="flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{event.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(event.date)} · {formatTime(event.time)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {total > 0 ? (
                      <>
                        <Badge color="green">{present} present</Badge>
                        {eventRecords.filter(r => r.status === 'Absent').length > 0 && (
                          <Badge color="red">{eventRecords.filter(r => r.status === 'Absent').length} absent</Badge>
                        )}
                      </>
                    ) : (
                      <Badge color="gray">No records</Badge>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
