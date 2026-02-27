import { useState } from 'react';
import { BrainCircuit, Sparkles, AlertTriangle, ChevronDown, RotateCcw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { runAIAssessment } from '@/utils/aiAssessment';
import type { AIAssessmentResult, CornerRating } from '@/utils/aiAssessment';

const CORNER_CONFIG = [
  { key: 'technical' as const, label: 'Technical', color: 'blue', desc: 'Ball control, passing, shooting, dribbling' },
  { key: 'tactical' as const, label: 'Tactical', color: 'purple', desc: 'Positioning, decisions, game reading' },
  { key: 'physical' as const, label: 'Physical', color: 'orange', desc: 'Speed, strength, coordination, endurance' },
  { key: 'psychological' as const, label: 'Psychological', color: 'green', desc: 'Attitude, resilience, focus, coachability' },
];

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; bar: string; score: string }> = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   bar: 'bg-blue-500',   score: 'bg-blue-100 text-blue-800' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', bar: 'bg-purple-500', score: 'bg-purple-100 text-purple-800' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', bar: 'bg-orange-500', score: 'bg-orange-100 text-orange-800' },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  bar: 'bg-green-500',  score: 'bg-green-100 text-green-800' },
};

const GUIDED_PROMPTS = [
  { label: 'Technical', text: 'Technically, I noticed that ' },
  { label: 'Tactical', text: 'In terms of game understanding and decisions, ' },
  { label: 'Physical', text: 'Physically during the session, ' },
  { label: 'Mental/Attitude', text: 'Their attitude and mental approach today was ' },
];

function getAgeGroup(dateOfBirth: string): string {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  if (age <= 6) return 'U7';
  if (age <= 8) return 'U9';
  if (age <= 10) return 'U11';
  if (age <= 12) return 'U13';
  if (age <= 14) return 'U15';
  return 'U17+';
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  const c = COLOR_CLASSES[color];
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${c.bar}`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.score}`}>{score}/5</span>
    </div>
  );
}

function CornerCard({ corner, rating }: { corner: typeof CORNER_CONFIG[0]; rating: CornerRating }) {
  const c = COLOR_CLASSES[corner.color];
  return (
    <div className={`rounded-xl border p-4 ${c.bg} ${c.border}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${c.text}`}>{corner.label}</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5">{rating.label}</p>
        </div>
      </div>
      <ScoreBar score={rating.score} color={corner.color} />
      <p className="text-xs text-gray-600 mt-3 leading-relaxed">{rating.observation}</p>
    </div>
  );
}

export function CoachesCornerPage() {
  const { players, settings } = useApp();
  const activePlayers = players.filter(p => p.isActive);

  const [selectedPlayerId, setSelectedPlayerId] = useState(activePlayers[0]?.id ?? '');
  const [observations, setObservations] = useState('');
  const [result, setResult] = useState<AIAssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedPlayer = activePlayers.find(p => p.id === selectedPlayerId);
  const hasApiKey = !!localStorage.getItem('u10_claude_key');

  async function handleAnalyze() {
    if (!selectedPlayer || observations.trim().length < 20) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const ageGroup = getAgeGroup(selectedPlayer.dateOfBirth);
      const name = `${selectedPlayer.firstName} ${selectedPlayer.lastName}`;
      const res = await runAIAssessment(observations, name, selectedPlayer.position, ageGroup);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Check your API key in Settings.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setObservations('');
  }

  function appendPrompt(text: string) {
    setObservations(prev => {
      const base = prev.trim();
      return base ? `${base}\n\n${text}` : text;
    });
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BrainCircuit size={22} className="text-pitch-600" />
          <h1 className="text-2xl font-bold text-gray-900">Coaches Corner</h1>
        </div>
        <p className="text-sm text-gray-500">
          Describe what you observed — AI will produce an objective 4-corner development assessment.
        </p>
      </div>

      {!hasApiKey && (
        <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Demo mode — no API key connected</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Results are generated from coaching frameworks but not AI-powered.{' '}
              <a href="/settings" className="underline font-medium">Add your Claude API key in Settings</a> for real analysis.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="space-y-4">
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Select Player</h2>
            <div className="relative">
              <select
                value={selectedPlayerId}
                onChange={e => setSelectedPlayerId(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm appearance-none pr-8 focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500"
              >
                {activePlayers.map(p => (
                  <option key={p.id} value={p.id}>
                    #{p.jerseyNumber} {p.firstName} {p.lastName} — {p.position}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
            </div>
            {selectedPlayer && (
              <div className="mt-3 flex gap-2">
                <span className="text-xs bg-pitch-100 text-pitch-700 font-medium px-2 py-1 rounded-full">
                  {selectedPlayer.position}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2 py-1 rounded-full">
                  {getAgeGroup(selectedPlayer.dateOfBirth)} · Age {new Date().getFullYear() - new Date(selectedPlayer.dateOfBirth).getFullYear()}
                </span>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-700">Your Observations</h2>
              <span className="text-xs text-gray-400">{observations.length} chars</span>
            </div>

            {/* Guided prompt chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {GUIDED_PROMPTS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => appendPrompt(p.text)}
                  className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-pitch-100 hover:text-pitch-700 transition-colors font-medium"
                >
                  + {p.label}
                </button>
              ))}
            </div>

            <textarea
              rows={8}
              value={observations}
              onChange={e => setObservations(e.target.value)}
              placeholder={`Describe what you observed in plain language. For example:\n\n"Today Emma showed great vision with her passing but struggled to hold her position defensively. She was vocal and encouraging to teammates, and her first touch with her right foot has clearly improved. Left foot still needs work. Physically she kept up well but tired in the last 10 minutes."`}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1.5">Minimum 20 characters. More detail = better assessment.</p>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={loading || observations.trim().length < 20 || !selectedPlayerId}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  {hasApiKey ? 'Analyze with AI' : 'Generate Demo Assessment'}
                </>
              )}
            </Button>
            {result && (
              <Button variant="secondary" onClick={handleReset}>
                <RotateCcw size={15} />
                Reset
              </Button>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Results panel */}
        <div>
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-64 text-center border-2 border-dashed border-gray-200 rounded-2xl p-8">
              <BrainCircuit size={40} className="text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-400">Assessment results will appear here</p>
              <p className="text-xs text-gray-400 mt-1">Select a player, describe what you saw, and click Analyze</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-64 text-center border-2 border-dashed border-pitch-200 rounded-2xl p-8 bg-pitch-50">
              <div className="w-10 h-10 border-4 border-pitch-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium text-pitch-700">Analyzing observations...</p>
              <p className="text-xs text-pitch-500 mt-1">Applying 4-corner development framework</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {result.isDemo && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">Demo assessment — based on coaching frameworks, not live AI</p>
                </div>
              )}

              {/* 4 corner grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CORNER_CONFIG.map(corner => (
                  <CornerCard key={corner.key} corner={corner} rating={result[corner.key]} />
                ))}
              </div>

              {/* Strengths & areas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card>
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Strengths Observed</p>
                  <ul className="space-y-1.5">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card>
                  <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2">Areas to Develop</p>
                  <ul className="space-y-1.5">
                    {result.areasToImprove.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-orange-500 mt-0.5 flex-shrink-0">→</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* Drill recommendations */}
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
                  Assessment for <strong>{selectedPlayer?.firstName} {selectedPlayer?.lastName}</strong> · {new Date().toLocaleDateString()} · Coach: {settings.coachName}
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
