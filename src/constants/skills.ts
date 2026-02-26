import type { SkillKey } from '@/types';

export const SKILL_KEYS: SkillKey[] = [
  'ballControl',
  'dribbling',
  'passing',
  'shooting',
  'defending',
  'positioning',
  'teamwork',
  'effort',
];

export const SKILL_LABELS: Record<SkillKey, string> = {
  ballControl: 'Ball Control',
  dribbling: 'Dribbling',
  passing: 'Passing',
  shooting: 'Shooting',
  defending: 'Defending',
  positioning: 'Positioning',
  teamwork: 'Teamwork',
  effort: 'Effort & Attitude',
};

export const SKILL_DESCRIPTIONS: Record<SkillKey, string> = {
  ballControl: 'First touch, receiving the ball, keeping control under pressure',
  dribbling: 'Close control, 1v1 confidence, changing direction',
  passing: 'Accuracy, weight of pass, choosing the right pass',
  shooting: 'Technique, power appropriate for age, accuracy on goal',
  defending: 'Fair challenges, tracking opponents, winning the ball',
  positioning: 'Off-ball movement, understanding space, supporting teammates',
  teamwork: 'Communication, sharing the ball, supporting teammates',
  effort: 'Hustle, attitude, coachability, giving 100%',
};

export const STAR_LABELS: Record<number, string> = {
  1: 'Needs Work',
  2: 'Developing',
  3: 'On Track',
  4: 'Excellent',
  5: 'Outstanding',
};
