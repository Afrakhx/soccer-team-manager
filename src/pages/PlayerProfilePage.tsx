import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, ClipboardPlus, Key, ChevronDown, ChevronUp } from 'lucide-react';
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
import type { Player } from '@/types';

export function PlayerProfilePage() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const {
    getPlayerById, updatePlayer, deletePlayer,
    getRatingsForPlayer, getLatestForPlayer, addRating,
    events, records, settings,
  } = useApp();

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAssess, setShowAssess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAccessCode, setShowAccessCode] = useState(false);

  const player = getPlayerById(playerId!);

  const playerRatings = player ? getRatingsForPlayer(player.id) : [];
  const latest = player ? getLatestForPlayer(player.id) : undefined;
  const previous = getPreviousRating(playerRatings);
  const attendanceRate = player ? getAttendanceRate(player.id, records, events) : 0;

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

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="bg-pitch-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-pitch-700">
              {latest ? getOverallScore(latest) : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Overall Score</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{attendanceRate}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Attendance</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-purple-700">{playerRatings.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Assessments</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Radar chart */}
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

        {/* Progress bars */}
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
          <h2 className="text-base font-semibold text-gray-900 mb-4">Assessment Log</h2>
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
