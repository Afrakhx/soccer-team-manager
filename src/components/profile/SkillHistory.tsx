import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { SKILL_KEYS, SKILL_LABELS } from '@/constants/skills';
import { buildLineChartData } from '@/utils/skillAggregation';
import type { SkillRating } from '@/types';

const COLORS = ['#16a34a','#2563eb','#d97706','#dc2626','#7c3aed','#0891b2','#be185d','#65a30d'];

interface SkillHistoryProps {
  ratings: SkillRating[];
}

export function SkillHistory({ ratings }: SkillHistoryProps) {
  if (ratings.length < 2) {
    return (
      <p className="text-sm text-gray-500 text-center py-6">
        Add at least 2 assessments to see progress over time.
      </p>
    );
  }

  const data = buildLineChartData(ratings);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
        <YAxis domain={[0, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 10 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
        {SKILL_KEYS.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={SKILL_LABELS[key]}
            stroke={COLORS[i]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
