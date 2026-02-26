import { Trophy, Menu } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { settings } = useApp();

  return (
    <header className="md:hidden bg-pitch-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
      <button onClick={onMenuClick} className="p-1 -ml-1">
        <Menu size={22} />
      </button>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-pitch-500 rounded flex items-center justify-center">
          <Trophy size={16} />
        </div>
        <span className="font-bold text-sm">{settings.teamName}</span>
      </div>
    </header>
  );
}
