import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, ClipboardPlus, Key, ChevronDown, ChevronUp, BrainCircuit, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StarRating } from '@/components/ui/StarRating';
import { PositionBadge } from '@/components/players/PositionBadge';
import { PlayerForm } from '@/components/players/PlayerForm';
import { SkillRadarChart } from '@/components/profile/SkillRadarChart';
import { SkillProgressBars } from '@/components/profile/SkillProgressBars';
import { SkillHistory } from '@/components/profile/SkillHistory';
import { SkillAssessmentForm } from '@/components/skills/SkillAssessmentForm';
import { getAttendanceRate } from '@/utils/attendanceUtils';
import { formatDate } from '@/utils/dateUtils';
import { getOverallScore, getPreviousRating } from '@/utils/skillAggregation';
import type { Player, AIAssessment } from '@/types';

// ── Corner score colours (matches CoachesCornerPage) ─────────────────────────
const CORNER_META = [
  { key: 'technical'     as const, label: 'Technical',  colorBar: '#3b82f6', colorBg: 'bg-blue-50',   colorText: 'text-blue-700',   colorBadge: 'bg-blue-100 text-blue-800'   },
  { key: 'tactical'      as const, label: 'Tactical',   colorBar: '#8b5cf6', colorBg: 'bg-purple-50', colorText: 'text-purple-700', colorBadge: 'bg-purple-100 text-purple-800'},
  { key: 'physical'      as const, label: 'Physical',   colorBar: '#f97316', colorBg: 'bg-orange-50', colorText: 'text-orange-700', colorBadge: 'bg-orange-100 text-orange-800'},
  { key: 'psychological' as const, label: 'Mental',     colorBar: '#22c55e', colorBg: 'bg-green-50',  colorText: 'text-green-700',  colorBadge: 'bg-green-100 text-green-800' },
] as const;

function AIReportCard({ report }: { report: AIAssessment }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {CORNER_META.map(cm => {
          const rating = report[cm.key];
          return (
            <div key={cm.key} className={`rounded-xl p-3 ${cm.colorBg}`}>
              <div className="flex items-center justify-between mb-1.5">
                <p className={`text-xs font-semibold ${cm.colorText}`}>{cm.label}</p>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${cm.colorBadge}`}>{rating.score}/5</span>
              </div>
              <div className="bg-white bg-opacity-60 rounded-full h-1.5 mb-1.5">
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${(rating.score / 5) * 100}%`, backgroundColor: cm.colorBar }}
                />
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{rating.observation}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-green-700 mb-1.5">Strengths</p>
          <ul className="space-y-1">
            {report.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                <span className="text-green-500 flex-shrink-0">✓</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-orange-700 mb-1.5">To Develop</p>
          <ul className="space-y-1">
            {report.areasToImprove.map((a, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                <span className="text-orange-500 flex-shrink-0">→</span>{a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-3">
        <p className="text-xs font-semibold text-blue-700 mb-2">Recommended Drills</p>
        <div className="space-y-2">
          {report.drills.map((drill, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
              <div>
                <p className="text-xs font-semibold text-gray-800">{drill.name}</p>
                <p className="text-xs text-gray-500">{drill.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 italic leading-relaxed">{report.summary.replace(/⚠️.*$/, '').trim()}</p>
      <p className="text-xs text-gray-400">
        {new Date(report.assessedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        {report.isDemo && ' · demo'}
      </p>
    </div>
  );
}

export function PlayerProfilePage() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const {
    getPlayerById, updatePlayer, deletePlayer,
    getRatingsForPlayer, getLatestForPlayer, addRating,
    events, records, settings,
    getAIAssessmentsForPlayer, getLatestAIAssessmentForPlayer,
  } = useApp();

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAssess, setShowAssess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [showAllAIReports, setShowAllAIReports] = useState(false);

  const player = getPlayerById(playerId!);

  const playerRatings = player ? getRatingsForPlayer(player.id) : [];
  const latest = player ? getLatestForPlayer(player.id) : undefined;
  const previous = getPreviousRating(playerRatings);
  const attendanceRate = player ? getAttendanceRate(player.id, records, events) : 0;

  const aiReports = player ? getAIAssessmentsForPlayer(player.id) : [];
  const latestAIReport = player ? getLatestAIAssessmentForPlayer(player.id) : undefined;

  function handleUpdate(data: Omit<Player, 'id' | 'parentAccessCode' | 'joinedDate' | 'isActive'>) {
    if (!player) return;
    updatePlayer(player.id, data);
    setShowEdit(false);
  }

  function handleDelete() {
    if (!player) return;
    deletePlayer(player.id);
    navigate('/roster');
  }

  if (!player) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Player not found.</p>
        <Link to="/roster" className="text-pitch-600 mt-2 inline-block">← Back to Roster</Link>
      </div>
    );
  }

  function handleAssessment(data: Parameters<typeof addRating>[0]) {
    addRating(data);
    setShowAssess(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate('/roster')} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm text-gray-500">Roster</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900">{player.firstName} {player.lastName}</span>
      </div>

      {/* Player header card */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar firstName={player.firstName} lastName={player.lastName} photoUrl={player.photoUrl} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-lg font-bold text-gray-400">#{player.jerseyNumber}</span>
              <PositionBadge position={player.position} />
              {!player.isActive && <Badge color="gray">Inactive</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{player.firstName} {player.lastName}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Joined {formatDate(player.joinedDate)}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-500">Parent: </span>
                <span className="font-medium">{player.parentName}</span>
              </div>
              <div>
                <a href={`mailto:${player.parentEmail}`} className="text-pitch-600 hover:underline">{player.parentEmail}</a>
              </div>
              <div>
                <a href={`tel:${player.parentPhone}`} className="text-gray-700">{player.parentPhone}</a>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={() => setShowAssess(true)}>
              <ClipboardPlus size={14} />
              Assess
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setShowEdit(true)}>
              <Edit2 size={14} />
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAccessCode(true)} title="Parent access code">
              <Key size={14} />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowDelete(true)} className="text-red-500 hover:bg-red-50">
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        {/* Stats row — 4 stats */}
        <div className="mt-5 grid grid-cols-4 gap-3">
          <div className="bg-pitch-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-pitch-700">
              {latest ? getOverallScore(latest) : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Skill Score</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{attendanceRate}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Attendance</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-purple-700">{playerRatings.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Skill Ratings</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-emerald-700">{aiReports.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">AI Reports</p>
          </div>
        </div>
      </Card>

      {/* ── AI Development Report ───────────────────────────────────────────── */}
      <Card className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BrainCircuit size={16} className="text-pitch-600" />
            <h2 className="text-base font-semibold text-gray-900">AI Development Report</h2>
          </div>
          <Link
            to="/coaches-corner"
            className="flex items-center gap-1 text-xs text-pitch-600 font-medium hover:text-pitch-800"
          >
            {latestAIReport ? 'New Report' : 'Run Assessment'} <ArrowRight size={13} />
          </Link>
        </div>

        {latestAIReport ? (
          <>
            <AIReportCard report={latestAIReport} />

            {/* Older reports */}
            {aiReports.length > 1 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 font-medium"
                  onClick={() => setShowAllAIReports(r => !r)}
                >
                  {showAllAIReports ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {showAllAIReports ? 'Hide' : 'Show'} {aiReports.length - 1} older report{aiReports.length - 1 !== 1 ? 's' : ''}
                </button>
                {showAllAIReports && (
                  <div className="mt-3 space-y-5">
                    {aiReports.slice(1).map(r => (
                      <div key={r.id} className="border-t border-gray-100 pt-4">
                        <AIReportCard report={r} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <BrainCircuit size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-500">No AI reports yet for {player.firstName}.</p>
            <Link to="/coaches-corner">
              <Button size="sm" className="mt-3">
                <BrainCircuit size={14} /> Run First Assessment
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* ── Skill Radar + Breakdown ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Skill Radar</h2>
          {latest ? (
            <>
              <p className="text-xs text-gray-400 mb-3">
                {latest.sessionLabel}
                {previous && ' (ghost = previous)'}
              </p>
              <SkillRadarChart current={latest} previous={previous} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-gray-400 text-sm">No assessments yet.</p>
              <Button size="sm" className="mt-3" onClick={() => setShowAssess(true)}>
                Add First Assessment
              </Button>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Skill Breakdown</h2>
          {latest ? (
            <SkillProgressBars current={latest} previous={previous} />
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No assessments yet.</p>
          )}
        </Card>
      </div>

      {/* Assessment history */}
      <Card className="mb-5">
        <button
          className="flex items-center justify-between w-full text-left"
          onClick={() => setShowHistory(h => !h)}
        >
          <h2 className="text-base font-semibold text-gray-900">Progress Over Time</h2>
          {showHistory ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {showHistory && (
          <div className="mt-4">
            <SkillHistory ratings={playerRatings} />
          </div>
        )}
      </Card>

      {/* Assessment log */}
      {playerRatings.length > 0 && (
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Skill Assessment Log</h2>
          <div className="space-y-3">
            {[...playerRatings].reverse().map(rating => (
              <div key={rating.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{rating.sessionLabel}</p>
                  <p className="text-xs text-gray-500">{formatDate(rating.assessedAt)} · by {rating.assessedBy}</p>
                  {rating.coachNotes && (
                    <p className="text-xs text-gray-600 mt-1 italic">"{rating.coachNotes}"</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <StarRating value={Math.round(getOverallScore(rating))} readOnly size="sm" />
                  <p className="text-xs text-gray-500 mt-0.5">{getOverallScore(rating)}/5 avg</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Coach notes */}
      {player.notes && (
        <Card className="mt-5">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Coach Notes</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{player.notes}</p>
        </Card>
      )}

      {/* Modals */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Player" size="lg">
        <PlayerForm
          defaultValues={player}
          onSubmit={handleUpdate}
          onCancel={() => setShowEdit(false)}
          submitLabel="Save Changes"
        />
      </Modal>

      <Modal isOpen={showAssess} onClose={() => setShowAssess(false)} title="New Skill Assessment" size="lg">
        <SkillAssessmentForm
          coachName={settings.coachName}
          playerId={player.id}
          onSubmit={handleAssessment}
          onCancel={() => setShowAssess(false)}
        />
      </Modal>

      <Modal isOpen={showAccessCode} onClose={() => setShowAccessCode(false)} title="Parent Access Code" size="sm">
        <p className="text-sm text-gray-600 mb-4">
          Share this code with <strong>{player.parentName}</strong>. They can visit the Parent View and enter it to see {player.firstName}'s progress.
        </p>
        <div className="bg-pitch-50 border-2 border-pitch-200 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold tracking-widest text-pitch-700">{player.parentAccessCode}</p>
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          Direct link: <span className="font-mono text-pitch-600">/parent/{player.parentAccessCode}</span>
        </p>
      </Modal>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Remove Player"
        message={`Remove ${player.firstName} ${player.lastName} from the roster? This will also delete all their assessments and attendance records.`}
      />
    </div>
  );
}
