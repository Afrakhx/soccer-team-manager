import { Link } from 'react-router-dom';
import { Phone, Mail, Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { PositionBadge } from './PositionBadge';
import type { Player, SkillRating } from '@/types';
import { getOverallScore } from '@/utils/skillAggregation';

interface PlayerCardProps {
  player: Player;
  latestRating?: SkillRating;
  attendanceRate: number;
}

export function PlayerCard({ player, latestRating, attendanceRate }: PlayerCardProps) {
  return (
    <Link to={`/players/${player.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-start gap-4">
          <Avatar firstName={player.firstName} lastName={player.lastName} photoUrl={player.photoUrl} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold text-gray-400">#{player.jerseyNumber}</span>
              <PositionBadge position={player.position} />
            </div>
            <h3 className="font-semibold text-gray-900 leading-tight">
              {player.firstName} {player.lastName}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{player.parentName}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-pitch-50 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-pitch-700">
              <Star size={13} fill="currentColor" />
              <span className="text-sm font-bold">
                {latestRating ? getOverallScore(latestRating) : '—'}
              </span>
            </div>
            <p className="text-xs text-gray-500">Skill score</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <span className="text-sm font-bold text-blue-700">{attendanceRate}%</span>
            <p className="text-xs text-gray-500">Attendance</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <a href={`mailto:${player.parentEmail}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 hover:text-pitch-600">
            <Mail size={12} /> {player.parentEmail}
          </a>
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
          <Phone size={12} /> {player.parentPhone}
        </div>
      </Card>
    </Link>
  );
}
