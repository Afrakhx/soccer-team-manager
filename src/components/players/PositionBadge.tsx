import { Badge } from '@/components/ui/Badge';
import type { Position } from '@/types';

const POSITION_COLORS: Record<Position, 'green' | 'blue' | 'yellow' | 'purple' | 'gray'> = {
  Goalkeeper: 'yellow',
  Defender: 'blue',
  Midfielder: 'green',
  Forward: 'purple',
  Any: 'gray',
};

export function PositionBadge({ position }: { position: Position }) {
  return <Badge color={POSITION_COLORS[position]}>{position}</Badge>;
}
