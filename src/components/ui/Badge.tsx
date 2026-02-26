import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'gray' | 'orange';
  className?: string;
}

export function Badge({ children, color = 'green', className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      {
        'bg-pitch-100 text-pitch-800': color === 'green',
        'bg-blue-100 text-blue-800': color === 'blue',
        'bg-yellow-100 text-yellow-800': color === 'yellow',
        'bg-red-100 text-red-800': color === 'red',
        'bg-purple-100 text-purple-800': color === 'purple',
        'bg-gray-100 text-gray-700': color === 'gray',
        'bg-orange-100 text-orange-800': color === 'orange',
      },
      className
    )}>
      {children}
    </span>
  );
}
