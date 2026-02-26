import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, ClipboardCheck, Settings, LogOut, Trophy } from 'lucide-react';
import { clsx } from 'clsx';
import { useApp } from '@/context/AppContext';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/roster', icon: Users, label: 'Roster' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { settings, logout } = useApp();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-pitch-900 text-white min-h-screen fixed left-0 top-0 z-40">
      {/* Team branding */}
      <div className="p-5 border-b border-pitch-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-pitch-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Trophy size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{settings.teamName}</p>
            <p className="text-pitch-400 text-xs">{settings.season}</p>
          </div>
        </div>
      </div>

      {/* Coach info */}
      <div className="px-5 py-3 border-b border-pitch-800">
        <p className="text-xs text-pitch-400">Coach</p>
        <p className="text-sm font-medium">{settings.coachName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors',
              isActive
                ? 'bg-pitch-700 text-white'
                : 'text-pitch-300 hover:bg-pitch-800 hover:text-white'
            )}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-pitch-800 space-y-1">
        <a
          href="/parent"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-pitch-300 hover:bg-pitch-800 hover:text-white transition-colors w-full"
        >
          <Users size={18} />
          Parent View
        </a>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-pitch-300 hover:bg-pitch-800 hover:text-white transition-colors w-full"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
