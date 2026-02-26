import { SKILL_KEYS, SKILL_LABELS } from '@/constants/skills';
import type { SkillRating, SkillKey } from '@/types';

export function getLatestRating(ratings: SkillRating[]): SkillRating | undefined {
  if (ratings.length === 0) return undefined;
  return ratings.reduce((latest, r) =>
    r.assessedAt > latest.assessedAt ? r : latest
  );
}

export function getPreviousRating(ratings: SkillRating[]): SkillRating | undefined {
  if (ratings.length < 2) return undefined;
  const sorted = [...ratings].sort((a, b) => b.assessedAt.localeCompare(a.assessedAt));
  return sorted[1];
}

export function buildRadarData(rating: SkillRating) {
  return SKILL_KEYS.map(key => ({
    skill: SKILL_LABELS[key],
    value: rating.ratings[key],
    fullMark: 5,
  }));
}

export function buildRadarDataWithPrev(current: SkillRating, previous?: SkillRating) {
  return SKILL_KEYS.map(key => ({
    skill: SKILL_LABELS[key],
    value: current.ratings[key],
    previous: previous ? previous.ratings[key] : undefined,
    fullMark: 5,
  }));
}

export function getOverallScore(rating: SkillRating): number {
  const values = SKILL_KEYS.map(k => rating.ratings[k]);
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export function getSkillTrend(ratings: SkillRating[], skill: SkillKey) {
  return [...ratings]
    .sort((a, b) => a.assessedAt.localeCompare(b.assessedAt))
    .map(r => ({
      label: r.sessionLabel,
      date: r.assessedAt,
      value: r.ratings[skill],
    }));
}

export function buildLineChartData(ratings: SkillRating[]) {
  const sorted = [...ratings].sort((a, b) => a.assessedAt.localeCompare(b.assessedAt));
  return sorted.map(r => {
    const entry: Record<string, string | number> = { label: r.sessionLabel };
    SKILL_KEYS.forEach(k => {
      entry[SKILL_LABELS[k]] = r.ratings[k];
    });
    return entry;
  });
}
