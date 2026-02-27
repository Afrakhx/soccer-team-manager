import { useState } from 'react';
import {
  BrainCircuit, Sparkles, AlertTriangle, ChevronRight,
  ChevronLeft, RotateCcw, CheckCircle2, Circle, History, Trash2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { runAIAssessment } from '@/utils/aiAssessment';
import type { AIAssessmentResult, CornerRating, GuidedAssessmentData } from '@/utils/aiAssessment';
import type { AIAssessment } from '@/types';

// ─── What the coach looks for, in plain language ────────────────────────────

const GUIDE_ITEMS = {
  technical: [
    'Controlled the ball cleanly when it was passed or kicked to them',
    'Passed the ball to a teammate with reasonable accuracy',
    'Dribbled with their head up (not just staring at the ball)',
    'Used their weaker foot at least once during the session',
    'Attempted a shot on goal with some technique (not just a wild kick)',
    'Received a ball moving at speed and brought it under control',
  ],
  tactical: [
    'Moved to an open space when their team had the ball',
    'Tracked back or helped defend when the other team had the ball',
    'Made a quick decision — passed or moved without holding the ball too long',
    'Showed awareness of where teammates were (looked around before receiving)',
    'Stayed in or near their position/role rather than chasing the ball everywhere',
    'Reacted to what was happening in the game, not just waiting for the ball',
  ],
  physical: [
    'Kept up with the pace of the game for most of the session',
    'Showed good balance — didn\'t fall over or stumble often',
    'Changed direction quickly and smoothly',
    'Showed some speed when running with or without the ball',
    'Was physically competitive — didn\'t shy away from challenges',
    'Maintained energy levels without tiring out too early',
  ],
  psychological: [
    'Reacted positively after making a mistake (got back up, tried again)',
    'Communicated with teammates — called for the ball, encouraged others',
    'Listened to coaching instructions and made an effort to apply them',
    'Showed confidence — tried things, took on opponents, didn\'t always play safe',
    'Stayed engaged and focused throughout (didn\'t switch off or get distracted)',
    'Showed enjoyment — smiled, was enthusiastic, wanted to be involved',
  ],
};

const STEPS = [
  {
    key: 'technical' as const,
    label: 'Technical',
    subtitle: 'Ball Skills',
    color: 'blue',
    intro: 'Watch how the player interacts with the ball. You don\'t need to use technical terms — just tick what you actually saw during the session.',
  },
  {
    key: 'tactical' as const,
    label: 'Tactical',
    subtitle: 'Game Understanding',
    color: 'purple',
    intro: 'This is about how well the player understands the game — where to be, when to move, when to pass. Tick what you observed.',
  },
  {
    key: 'physical' as const,
    label: 'Physical',
    subtitle: 'Athletic Ability',
    color: 'orange',
    intro: 'Watch how the player moves around the pitch. This isn\'t about being the fastest — it\'s about coordination, energy, and athleticism for their age.',
  },
  {
    key: 'psychological' as const,
    label: 'Mental & Attitude',
    subtitle: 'Mindset',
    color: 'green',
    intro: 'This is often the most important area for young players. How do they handle mistakes? Do they support teammates? Are they coachable?',
  },
];

const COLOR = {
  blue:   { step: 'bg-blue-500',   activeBorder: 'border-blue-400', activeText: 'text-blue-700',   activeBg: 'bg-blue-50',   bar: 'bg-blue-500',   scoreBg: 'bg-blue-100 text-blue-800',   checkBg: 'bg-blue-500' },
  purple: { step: 'bg-purple-500', activeBorder: 'border-purple-400', activeText: 'text-purple-700', activeBg: 'bg-purple-50', bar: 'bg-purple-500', scoreBg: 'bg-purple-100 text-purple-800', checkBg: 'bg-purple-500' },
  orange: { step: 'bg-orange-500', activeBorder: 'border-orange-400', activeText: 'text-orange-700', activeBg: 'bg-orange-50', bar: 'bg-orange-500', scoreBg: 'bg-orange-100 text-orange-800', checkBg: 'bg-orange-500' },
  green:  { step: 'bg-green-500',  activeBorder: 'border-green-400',  activeText: 'text-green-700',  activeBg: 'bg-green-50',  bar: 'bg-green-500',  scoreBg: 'bg-green-100 text-green-800',  checkBg: 'bg-green-500' },
} as const;

function getAgeGroup(dateOfBirth: string): string {
  const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
  if (age <= 6) return 'U7'; if (age <= 8) return 'U9';
  if (age <= 10) return 'U11'; if (age <= 12) return 'U13';
  if (age <= 14) return 'U15'; return 'U17+';
}

const emptyArea = () => ({ checked: [] as string[], notes: '' });
const emptyData = (): GuidedAssessmentData => ({
  technical: emptyArea(), tactical: emptyArea(),
  physical: emptyArea(), psychological: emptyArea(),
});

// ─── Result display ──────────────────────────────────────────────────────────

const CORNER_CONFIG = [
  { key: 'technical' as const,     label: 'Technical',     color: 'blue'   as const },
  { key: 'tactical' as const,      label: 'Tactical',      color: 'purple' as const },
  { key: 'physical' as const,      label: 'Physical',      color: 'orange' as const },
  { key: 'psychological' as const, label: 'Mental',        color: 'green'  as const },
];

function ScoreBar({ score, color }: { score: number; color: keyof typeof COLOR }) {
  const c = COLOR[color];
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-500 ${c.bar}`} style={{ width: `${(score / 5) * 100}%` }} />
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.scoreBg}`}>{score}/5</span>
    </div>
  );
}

function CornerCard({ label, color, rating }: { label: string; color: keyof typeof COLOR; rating: CornerRating }) {
  const c = COLOR[color];
  return (
    <div className={`rounded-xl border p-4 ${c.activeBg} ${c.activeBorder}`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${c.activeText} mb-0.5`}>{label}</p>
      <p className="text-sm font-bold text-gray-900 mb-2">{rating.label}</p>
      <ScoreBar score={rating.score} color={color} />
      <p className="text-xs text-gray-600 mt-3 leading-relaxed">{rating.observation}</p>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export function CoachesCornerPage() {
  const { players, settings, addAIAssessment, getAIAssessmentsForPlayer, deleteAIAssessment } = useApp();
  const activePlayers = players.filter(p => p.isActive);

  const [selectedId, setSelectedId] = useState(activePlayers[0]?.id ?? '');
  const [step, setStep] = useState<'player' | 0 | 1 | 2 | 3 | 'result' | 'history'>('player');
  const [data, setData] = useState<GuidedAssessmentData>(emptyData());
  const [result, setResult] = useState<AIAssessmentResult | null>(null);
  const [historyItem, setHistoryItem] = useState<AIAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const player = activePlayers.find(p => p.id === selectedId);
  const hasApiKey = !!localStorage.getItem('u10_claude_key');

  function toggleCheck(areaKey: keyof GuidedAssessmentData, label: string) {
    setData(d => {
      const area = d[areaKey];
      const checked = area.checked.includes(label)
        ? area.checked.filter(c => c !== label)
        : [...area.checked, label];
      return { ...d, [areaKey]: { ...area, checked } };
    });
  }

  function setNotes(areaKey: keyof GuidedAssessmentData, notes: string) {
    setData(d => ({ ...d, [areaKey]: { ...d[areaKey], notes } }));
  }

  async function generate() {
    if (!player) return;
    setLoading(true);
    setError('');
    try {
      const res = await runAIAssessment(
        data,
        `${player.firstName} ${player.lastName}`,
        player.position,
        getAgeGroup(player.dateOfBirth),
        GUIDE_ITEMS,
      );
      // Persist to localStorage immediately
      addAIAssessment({
        playerId: player.id,
        assessedAt: new Date().toISOString(),
        assessedBy: settings.coachName,
        technical:     res.technical,
        tactical:      res.tactical,
        physical:      res.physical,
        psychological: res.psychological,
        strengths:     res.strengths,
        areasToImprove:res.areasToImprove,
        drills:        res.drills,
        summary:       res.summary,
        isDemo:        res.isDemo,
      });
      setResult(res);
      setStep('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep('player');
    setData(emptyData());
    setResult(null);
    setHistoryItem(null);
    setError('');
  }

  function openHistory(a: AIAssessment) {
    setHistoryItem(a);
    setStep('history');
  }

  // ── Progress bar ──
  const stepIndex = typeof step === 'number' ? step : step === 'result' ? 4 : -1;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BrainCircuit size={22} className="text-pitch-600" />
          <h1 className="text-2xl font-bold text-gray-900">Coaches Corner</h1>
        </div>
        <p className="text-sm text-gray-500">
          Answer simple questions about what you observed — AI does the rest.
        </p>
      </div>

      {/* Demo banner */}
      {!hasApiKey && step !== 'player' && (
        <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            <strong>Demo mode</strong> — results use coaching frameworks but not live AI.{' '}
            <a href="/settings" className="underline">Add API key in Settings</a> for real analysis.
          </p>
        </div>
      )}

      {/* Progress indicator */}
      {step !== 'player' && step !== 'result' && step !== 'history' && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {STEPS.map((s, i) => {
              const done = typeof step === 'number' && i < step;
              const active = step === i;
              const c = COLOR[s.color];
              return (
                <div key={s.key} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0
                    ${done ? 'bg-gray-400' : active ? c.step : 'bg-gray-200'}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${done ? 'bg-gray-400' : 'bg-gray-200'}`} />}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 text-center">
            Step {(stepIndex as number) + 1} of 4 — {STEPS[stepIndex as number]?.label}
          </p>
        </div>
      )}

      {/* ── STEP: Player select ── */}
      {step === 'player' && (
        <div className="space-y-4">
          <Card>
            <h2 className="text-base font-semibold text-gray-800 mb-1">Who are you assessing?</h2>
            <p className="text-sm text-gray-500 mb-4">
              Select the player you want to assess. You'll be guided through 4 short sections — just tick what you observed during the session.
            </p>

            <div className="space-y-2 mb-6">
              {activePlayers.map(p => {
                const history = getAIAssessmentsForPlayer(p.id);
                const latest = history[0];
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors
                      ${selectedId === p.id ? 'border-pitch-500 bg-pitch-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                      ${selectedId === p.id ? 'bg-pitch-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {p.jerseyNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-gray-500">
                        {p.position} · {getAgeGroup(p.dateOfBirth)}
                        {latest && (
                          <span className="ml-2 text-pitch-600">
                            · Last assessed {new Date(latest.assessedAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                    {selectedId === p.id
                      ? <CheckCircle2 size={18} className="text-pitch-500 flex-shrink-0" />
                      : history.length > 0
                        ? <span className="text-xs text-gray-400 flex-shrink-0">{history.length} report{history.length !== 1 ? 's' : ''}</span>
                        : null
                    }
                  </button>
                );
              })}
            </div>

            <Button onClick={() => setStep(0)} disabled={!selectedId} className="w-full">
              Start New Assessment <ChevronRight size={16} />
            </Button>
          </Card>

          {/* Past assessments for selected player */}
          {selectedId && (() => {
            const history = getAIAssessmentsForPlayer(selectedId);
            if (!history.length) return null;
            return (
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <History size={15} className="text-gray-400" />
                  <p className="text-sm font-semibold text-gray-700">Past Assessments</p>
                </div>
                <div className="space-y-2">
                  {history.map(a => (
                    <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(a.assessedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {(['technical','tactical','physical','psychological'] as const).map(k => {
                            const cc = ({ technical:'blue', tactical:'purple', physical:'orange', psychological:'green' } as const)[k];
                            const score = a[k].score;
                            const label = (['Technical','Tactical','Physical','Mental'] as const)[(['technical','tactical','physical','psychological'] as const).indexOf(k)];
                            return (
                              <span key={k} className={`text-xs font-bold px-1.5 py-0.5 rounded ${COLOR[cc].scoreBg}`}>
                                {label[0]}{score}
                              </span>
                            );
                          })}
                          {a.isDemo && <span className="text-xs text-gray-400">demo</span>}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openHistory(a)}
                        className="text-xs text-pitch-600 font-medium hover:text-pitch-800 flex-shrink-0"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAIAssessment(a.id)}
                        className="text-gray-300 hover:text-red-400 flex-shrink-0"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })()}
        </div>
      )}

      {/* ── STEPS 0-3: Observation checklists ── */}
      {typeof step === 'number' && STEPS[step] && (() => {
        const s = STEPS[step];
        const c = COLOR[s.color];
        const areaData = data[s.key];
        const items = GUIDE_ITEMS[s.key];

        return (
          <Card>
            <div className={`-mx-4 -mt-4 px-4 pt-4 pb-4 mb-4 rounded-t-xl ${c.activeBg} border-b ${c.activeBorder}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${c.activeText}`}>{s.subtitle}</p>
              <h2 className="text-lg font-bold text-gray-900">{s.label}</h2>
              <p className="text-sm text-gray-600 mt-1">{s.intro}</p>
            </div>

            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Tick everything you observed during the session:
            </p>

            <div className="space-y-2 mb-5">
              {items.map(item => {
                const checked = areaData.checked.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleCheck(s.key, item)}
                    className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg border-2 text-left transition-all
                      ${checked ? `${c.activeBg} ${c.activeBorder}` : 'border-gray-100 hover:border-gray-300 bg-gray-50'}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {checked
                        ? <CheckCircle2 size={20} className={c.activeText} />
                        : <Circle size={20} className="text-gray-300" />}
                    </div>
                    <p className={`text-sm ${checked ? `font-medium ${c.activeText}` : 'text-gray-600'}`}>{item}</p>
                  </button>
                );
              })}
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Anything else you noticed? (optional)
              </label>
              <textarea
                rows={2}
                value={areaData.notes}
                onChange={e => setNotes(s.key, e.target.value)}
                placeholder={`e.g. "Struggled more in the second half..." or "Much better than last week..."`}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button variant="secondary" onClick={() => setStep(step === 0 ? 'player' : step - 1 as 0 | 1 | 2 | 3)}>
                <ChevronLeft size={16} /> Back
              </Button>
              <div className="text-xs text-gray-400">
                {areaData.checked.length} of {items.length} ticked
              </div>
              {step < 3 ? (
                <Button onClick={() => setStep((step + 1) as 1 | 2 | 3)}>
                  Next <ChevronRight size={16} />
                </Button>
              ) : (
                <Button onClick={generate} disabled={loading}>
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analysing...</>
                    : <><Sparkles size={15} /> {hasApiKey ? 'Generate AI Report' : 'Generate Report'}</>}
                </Button>
              )}
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </Card>
        );
      })()}

      {/* ── RESULT ── */}
      {step === 'result' && result && (
        <div className="space-y-4">
          {result.isDemo && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700 font-medium">Demo report — add Claude API key in Settings for real AI analysis</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Assessment for</p>
              <p className="text-lg font-bold text-gray-900">{player?.firstName} {player?.lastName}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={reset}>
              <RotateCcw size={14} /> New Assessment
            </Button>
          </div>

          {/* 4 corners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CORNER_CONFIG.map(cc => (
              <CornerCard key={cc.key} label={cc.label} color={cc.color} rating={result[cc.key]} />
            ))}
          </div>

          {/* Strengths & areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Strengths Observed</p>
              <ul className="space-y-1.5">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>{s}
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2">Areas to Develop</p>
              <ul className="space-y-1.5">
                {result.areasToImprove.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-orange-500 mt-0.5 flex-shrink-0">→</span>{a}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Drills */}
          <Card>
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">Recommended Drills</p>
            <div className="space-y-3">
              {result.drills.map((drill, i) => (
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

          {/* Summary */}
          <Card>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Development Summary</p>
            <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>
            <p className="text-xs text-gray-400 mt-3">
              {new Date().toLocaleDateString()} · Coach: {settings.coachName} · Saved automatically
            </p>
          </Card>
        </div>
      )}

      {/* ── HISTORY DETAIL ── */}
      {step === 'history' && historyItem && (() => {
        const hp = activePlayers.find(p => p.id === historyItem.playerId);
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {new Date(historyItem.assessedAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-lg font-bold text-gray-900">{hp?.firstName} {hp?.lastName}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={reset}>
                <ChevronLeft size={14} /> Back
              </Button>
            </div>

            {historyItem.isDemo && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700 font-medium">Demo report</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CORNER_CONFIG.map(cc => (
                <CornerCard key={cc.key} label={cc.label} color={cc.color} rating={historyItem[cc.key]} />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Strengths Observed</p>
                <ul className="space-y-1.5">
                  {historyItem.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2">Areas to Develop</p>
                <ul className="space-y-1.5">
                  {historyItem.areasToImprove.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-orange-500 mt-0.5 flex-shrink-0">→</span>{a}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <Card>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">Recommended Drills</p>
              <div className="space-y-3">
                {historyItem.drills.map((drill, i) => (
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

            <Card>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Development Summary</p>
              <p className="text-sm text-gray-700 leading-relaxed">{historyItem.summary}</p>
              <p className="text-xs text-gray-400 mt-3">
                Assessed by {historyItem.assessedBy}
              </p>
            </Card>
          </div>
        );
      })()}
    </div>
  );
}
