import { useParams } from 'react-router-dom';
import { Trophy, Star, Calendar, ClipboardCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { SkillRadarChart } from '@/components/profile/SkillRadarChart';
import { SkillProgressBars } from '@/components/profile/SkillProgressBars';
import { EventCard } from '@/components/schedule/EventCard';
import { PositionBadge } from '@/components/players/PositionBadge';
import { useApp } from '@/context/AppContext';
import { getOverallScore, getPreviousRating } from '@/utils/skillAggregation';
import { getAttendanceRate } from '@/utils/attendanceUtils';
import { formatDate } from '@/utils/dateUtils';
import { STAR_LABELS } from '@/constants/skills';

export function ParentViewPage() {
  const { accessCode } = useParams<{ accessCode: string }>();
  const {
    getPlayerByAccessCode, getRatingsForPlayer, getLatestForPlayer,
    getUpcoming, settings, events, records,
  } = useApp();

  const player = getPlayerByAccessCode(accessCode ?? '');

  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pitch-900 to-pitch-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Code Not Found</h2>
          <p className="text-sm text-gray-500 mb-4">
            The access code <strong>{accessCode}</strong> is not valid. Please check with your coach.
          </p>
          <a href="/parent" className="text-pitch-600 font-medium text-sm">← Try another code</a>
        </div>
      </div>
    );
  }

  const playerRatings = getRatingsForPlayer(player.id);
  const latest = getLatestForPlayer(player.id);
  const previous = getPreviousRating(playerRatings);
  const attendanceRate = getAttendanceRate(player.id, records, events);
  const upcomingEvents = getUpcoming().slice(0, 4);
  const overallScore = latest ? getOverallScore(latest) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header banner */}
      <div className="bg-pitch-900 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-pitch-500 rounded-lg flex items-center justify-center">
            <Trophy size={18} />
          </div>
          <div>
            <p className="font-bold text-sm">{settings.teamName}</p>
            <p className="text-pitch-400 text-xs">{settings.season} · Parent View</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Player card */}
        <Card>
          <div className="flex items-center gap-4">
            <Avatar
              firstName={player.firstName}
              lastName={player.lastName}
              photoUrl={player.photoUrl}
              size="xl"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {player.firstName} {player.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-500 text-sm">#{player.jerseyNumber}</span>
                <PositionBadge position={player.position} />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Joined {formatDate(player.joinedDate)} · {settings.coachName}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="bg-pitch-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-pitch-700">{overallScore ?? '—'}</p>
              <p className="text-xs text-gray-500">Skill Score</p>
              {overallScore && <p className="text-xs text-pitch-600 mt-0.5">{STAR_LABELS[Math.round(overallScore)]}</p>}
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-blue-700">{attendanceRate}%</p>
              <p className="text-xs text-gray-500">Attendance</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-purple-700">{playerRatings.length}</p>
              <p className="text-xs text-gray-500">Assessments</p>
            </div>
          </div>
        </Card>

        {/* Skills */}
        {latest ? (
          <>
            <Card>
              <h2 className="font-semibold text-gray-900 mb-1">Skill Radar</h2>
              <p className="text-xs text-gray-400 mb-3">{latest.sessionLabel}</p>
              <SkillRadarChart current={latest} previous={previous} />
            </Card>

            <Card>
              <h2 className="font-semibold text-gray-900 mb-4">Skill Breakdown</h2>
              <SkillProgressBars current={latest} previous={previous} />
              {latest.coachNotes && (
                <div className="mt-4 bg-pitch-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-pitch-700 mb-1">Coach's Note</p>
                  <p className="text-sm text-gray-700 italic">"{latest.coachNotes}"</p>
                </div>
              )}
            </Card>
          </>
        ) : (
          <Card className="text-center py-8">
            <Star size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 text-sm">No skill assessments yet.</p>
            <p className="text-gray-400 text-xs mt-1">Your coach will add assessments after practices.</p>
          </Card>
        )}

        {/* Assessment history */}
        {playerRatings.length > 1 && (
          <Card>
            <h2 className="font-semibold text-gray-900 mb-3">Progress History</h2>
            <div className="space-y-2">
              {[...playerRatings].reverse().slice(0, 5).map(rating => (
                <div key={rating.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{rating.sessionLabel}</p>
                    <p className="text-xs text-gray-400">{formatDate(rating.assessedAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={14} fill={s <= Math.round(getOverallScore(rating)) ? 'currentColor' : 'none'} />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">{getOverallScore(rating)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Upcoming schedule */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-pitch-600" />
            <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming events scheduled.</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} compact />
              ))}
            </div>
          )}
        </Card>

        {/* Attendance note */}
        <Card className="bg-blue-50 border-blue-100">
          <div className="flex items-start gap-3">
            <ClipboardCheck size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Attendance</p>
              <p className="text-sm text-blue-700 mt-0.5">
                {player.firstName} has attended <strong>{attendanceRate}%</strong> of sessions.
                {attendanceRate >= 80 ? ' Great commitment! ⚽' : ' Encourage regular attendance!'}
              </p>
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-gray-400 pb-4">
          {settings.teamName} · Powered by Coach {settings.coachName}
        </p>
      </div>
    </div>
  );
}
