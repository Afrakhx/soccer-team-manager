import { useParams } from 'react-router-dom';
import { Trophy, Star, Calendar, ClipboardCheck, BrainCircuit } from 'lucide-react';
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
import type { AIAssessment } from '@/types';

// ── Reusable corner score bar ─────────────────────────────────────────────────
const CORNER_META = [
  { key: 'technical'     as const, label: 'Technical',   shortLabel: 'Ball Skills',      colorBar: '#3b82f6', colorBg: 'bg-blue-50',   colorText: 'text-blue-700',   colorBadge: 'bg-blue-100 text-blue-800'   },
  { key: 'tactical'      as const, label: 'Tactical',    shortLabel: 'Game Understanding',colorBar: '#8b5cf6', colorBg: 'bg-purple-50', colorText: 'text-purple-700', colorBadge: 'bg-purple-100 text-purple-800'},
  { key: 'physical'      as const, label: 'Physical',    shortLabel: 'Athletic Ability',  colorBar: '#f97316', colorBg: 'bg-orange-50', colorText: 'text-orange-700', colorBadge: 'bg-orange-100 text-orange-800'},
  { key: 'psychological' as const, label: 'Attitude',    shortLabel: 'Mindset & Character',colorBar:'#22c55e', colorBg: 'bg-green-50',  colorText: 'text-green-700',  colorBadge: 'bg-green-100 text-green-800' },
] as const;

function AIReportSection({ report, playerFirstName }: { report: AIAssessment; playerFirstName: string }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit size={16} className="text-pitch-600" />
          <h2 className="font-semibold text-gray-900">Development Report</h2>
        </div>
        <p className="text-xs text-gray-400">
          {new Date(report.assessedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* 4 Corner Scores */}
      <div className="grid grid-cols-2 gap-2">
        {CORNER_META.map(cm => {
          const rating = report[cm.key];
          return (
            <div key={cm.key} className={`rounded-xl p-3 ${cm.colorBg}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${cm.colorText} mb-0.5`}>{cm.label}</p>
              <p className="text-xs text-gray-500 mb-2">{cm.shortLabel}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white bg-opacity-60 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${(rating.score / 5) * 100}%`, backgroundColor: cm.colorBar }}
                  />
                </div>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${cm.colorBadge}`}>{rating.score}/5</span>
              </div>
              <p className="text-xs font-medium text-gray-700 mt-1.5">{rating.label}</p>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <Card>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Coach's Summary</p>
        <p className="text-sm text-gray-700 leading-relaxed">{report.summary.replace(/⚠️.*$/, '').trim()}</p>
      </Card>

      {/* Strengths */}
      <Card>
        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
          What {playerFirstName} is doing well
        </p>
        <ul className="space-y-1.5">
          {report.strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>{s}
            </li>
          ))}
        </ul>
      </Card>

      {/* Areas to develop */}
      <Card>
        <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2">
          What we're working on with {playerFirstName}
        </p>
        <ul className="space-y-1.5">
          {report.areasToImprove.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-orange-500 flex-shrink-0 mt-0.5">→</span>{a}
            </li>
          ))}
        </ul>
      </Card>

      {/* Drills to try at home */}
      <Card>
        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">
          Drills to try at home with {playerFirstName}
        </p>
        <div className="space-y-3">
          {report.drills.map((drill, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{drill.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{drill.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function ParentViewPage() {
  const { accessCode } = useParams<{ accessCode: string }>();
  const {
    getPlayerByAccessCode, getRatingsForPlayer, getLatestForPlayer,
    getUpcoming, settings, events, records, getAIAssessmentsForPlayer,
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

  const aiReports = getAIAssessmentsForPlayer(player.id); // newest first
  const latestAIReport = aiReports[0] ?? null;

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
              <p className="text-2xl font-bold text-purple-700">{aiReports.length}</p>
              <p className="text-xs text-gray-500">Reports</p>
            </div>
          </div>
        </Card>

        {/* AI Development Report — shown first if available */}
        {latestAIReport ? (
          <AIReportSection report={latestAIReport} playerFirstName={player.firstName} />
        ) : (
          <Card className="text-center py-6">
            <BrainCircuit size={32} className="mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-500">No development report yet.</p>
            <p className="text-xs text-gray-400 mt-1">Your coach will generate one after the next session.</p>
          </Card>
        )}

        {/* Skills (if coach has done manual skill ratings too) */}
        {latest && (
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
        )}

        {/* Assessment history (skill ratings) */}
        {playerRatings.length > 1 && (
          <Card>
            <h2 className="font-semibold text-gray-900 mb-3">Skill Score History</h2>
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
