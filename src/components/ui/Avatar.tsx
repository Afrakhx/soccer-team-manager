import { clsx } from 'clsx';

interface AvatarProps {
  firstName: string;
  lastName: string;
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const COLORS = [
  'bg-pitch-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500',
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function Avatar({ firstName, lastName, photoUrl, size = 'md', className }: AvatarProps) {
  const sizeClass = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-2xl',
  }[size];

  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
  const colorClass = getColor(firstName + lastName);

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`${firstName} ${lastName}`}
        className={clsx('rounded-full object-cover', sizeClass, className)}
      />
    );
  }

  return (
    <div className={clsx('rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0', colorClass, sizeClass, className)}>
      {initials}
    </div>
  );
}
