import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, ClipboardCheck, Settings } from 'lucide-react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Home', exact: true },
  { to: '/roster', icon: Users, label: 'Roster' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-pb">
      <div className="flex">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => clsx(
              'flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors',
              isActive ? 'text-pitch-600' : 'text-gray-400'
            )}
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
