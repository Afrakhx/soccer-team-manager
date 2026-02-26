import { SKILL_KEYS, SKILL_LABELS } from '@/constants/skills';
import type { SkillRating } from '@/types';

interface SkillProgressBarsProps {
  current: SkillRating;
  previous?: SkillRating;
}

export function SkillProgressBars({ current, previous }: SkillProgressBarsProps) {
  return (
    <div className="space-y-3">
      {SKILL_KEYS.map(key => {
        const val = current.ratings[key];
        const prev = previous?.ratings[key];
        const change = prev !== undefined ? val - prev : 0;
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{SKILL_LABELS[key]}</span>
              <div className="flex items-center gap-2">
                {change !== 0 && (
                  <span className={`text-xs font-semibold ${change > 0 ? 'text-pitch-600' : 'text-red-500'}`}>
                    {change > 0 ? '+' : ''}{change}
                  </span>
                )}
                <span className="text-sm font-bold text-gray-900">{val}/5</span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-pitch-500 rounded-full transition-all duration-500"
                style={{ width: `${(val / 5) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
