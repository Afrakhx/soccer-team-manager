import { Star } from 'lucide-react';
import { STAR_LABELS } from '@/constants/skills';
import { clsx } from 'clsx';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ value, onChange, readOnly = false, size = 'md' }: StarRatingProps) {
  const starSize = size === 'sm' ? 14 : size === 'md' ? 20 : 28;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={clsx(
            'transition-colors focus:outline-none',
            !readOnly && 'hover:scale-110 cursor-pointer',
            readOnly && 'cursor-default'
          )}
          title={STAR_LABELS[star]}
        >
          <Star
            size={starSize}
            className={star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-100'}
          />
        </button>
      ))}
      {!readOnly && value > 0 && (
        <span className="ml-1 text-xs text-gray-500">{STAR_LABELS[value]}</span>
      )}
    </div>
  );
}
