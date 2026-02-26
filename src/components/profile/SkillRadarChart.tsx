import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend,
} from 'recharts';
import type { SkillRating } from '@/types';
import { buildRadarDataWithPrev } from '@/utils/skillAggregation';

interface SkillRadarChartProps {
  current: SkillRating;
  previous?: SkillRating;
}

export function SkillRadarChart({ current, previous }: SkillRadarChartProps) {
  const data = buildRadarDataWithPrev(current, previous);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
          />
          {previous && (
            <Radar
              name="Previous"
              dataKey="previous"
              stroke="#d1d5db"
              fill="#d1d5db"
              fillOpacity={0.3}
              strokeDasharray="4 2"
            />
          )}
          <Radar
            name="Current"
            dataKey="value"
            stroke="#16a34a"
            fill="#16a34a"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          {previous && <Legend wrapperStyle={{ fontSize: '12px' }} />}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
