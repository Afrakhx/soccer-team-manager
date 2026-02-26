import { useState } from 'react';
import { SKILL_KEYS, SKILL_LABELS, SKILL_DESCRIPTIONS } from '@/constants/skills';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { SkillKey } from '@/types';

interface SkillAssessmentFormProps {
  coachName: string;
  playerId: string;
  onSubmit: (data: {
    playerId: string;
    assessedBy: string;
    assessedAt: string;
    sessionLabel: string;
    ratings: Record<SkillKey, number>;
    coachNotes: string;
  }) => void;
  onCancel: () => void;
}

const defaultRatings = (): Record<SkillKey, number> =>
  Object.fromEntries(SKILL_KEYS.map(k => [k, 3])) as Record<SkillKey, number>;

export function SkillAssessmentForm({ coachName, playerId, onSubmit, onCancel }: SkillAssessmentFormProps) {
  const [sessionLabel, setSessionLabel] = useState('');
  const [ratings, setRatings] = useState(defaultRatings());
  const [coachNotes, setCoachNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionLabel.trim()) return;
    onSubmit({
      playerId,
      assessedBy: coachName,
      assessedAt: new Date().toISOString(),
      sessionLabel: sessionLabel.trim(),
      ratings,
      coachNotes,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Session Label"
        id="sessionLabel"
        placeholder={`e.g. Week 5 Practice – ${today}`}
        value={sessionLabel}
        onChange={e => setSessionLabel(e.target.value)}
        required
      />

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Skills (1 = Needs Work · 5 = Outstanding)</p>
        <div className="space-y-4">
          {SKILL_KEYS.map(key => (
            <div key={key} className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{SKILL_LABELS[key]}</p>
                <p className="text-xs text-gray-500">{SKILL_DESCRIPTIONS[key]}</p>
              </div>
              <StarRating
                value={ratings[key]}
                onChange={val => setRatings(r => ({ ...r, [key]: val }))}
                size="md"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Coach Notes (optional)</label>
        <textarea
          rows={3}
          value={coachNotes}
          onChange={e => setCoachNotes(e.target.value)}
          placeholder="Great improvement in dribbling today..."
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={!sessionLabel.trim()}>Save Assessment</Button>
      </div>
    </form>
  );
}
