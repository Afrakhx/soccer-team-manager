import { createContext, useContext, useEffect } from 'react';
import { usePlayers } from '@/hooks/usePlayers';
import { useEvents } from '@/hooks/useEvents';
import { useSkillRatings } from '@/hooks/useSkillRatings';
import { useAttendance } from '@/hooks/useAttendance';
import { useTeamSettings } from '@/hooks/useTeamSettings';
import { useCoachAuth } from '@/hooks/useCoachAuth';
import {
  SEED_PLAYERS, SEED_EVENTS, SEED_RATINGS, SEED_ATTENDANCE,
} from '@/constants/defaults';
import type { Player, CalendarEvent, SkillRating, AttendanceRecord, AttendanceStatus, TeamSettings } from '@/types';

interface AppContextValue {
  // Players
  players: Player[];
  addPlayer: (data: Omit<Player, 'id' | 'parentAccessCode' | 'joinedDate'>) => Player;
  updatePlayer: (id: string, data: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  getPlayerById: (id: string) => Player | undefined;
  getPlayerByAccessCode: (code: string) => Player | undefined;

  // Events
  events: CalendarEvent[];
  addEvent: (data: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  updateEvent: (id: string, data: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  getUpcoming: () => CalendarEvent[];
  getPast: () => CalendarEvent[];

  // Skill Ratings
  ratings: SkillRating[];
  addRating: (data: Omit<SkillRating, 'id'>) => SkillRating;
  deleteRating: (id: string) => void;
  getRatingsForPlayer: (playerId: string) => SkillRating[];
  getLatestForPlayer: (playerId: string) => SkillRating | undefined;

  // Attendance
  records: AttendanceRecord[];
  markAttendance: (eventId: string, playerId: string, status: AttendanceStatus, notes?: string) => void;
  getAttendanceForEvent: (eventId: string) => AttendanceRecord[];
  getAttendanceForPlayer: (playerId: string) => AttendanceRecord[];
  getStatusForPlayer: (eventId: string, playerId: string) => AttendanceStatus | undefined;

  // Settings
  settings: TeamSettings;
  updateSettings: (data: Partial<TeamSettings>) => void;

  // Auth
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const playersApi = usePlayers();
  const eventsApi = useEvents();
  const ratingsApi = useSkillRatings();
  const attendanceApi = useAttendance();
  const { settings, updateSettings } = useTeamSettings();
  const { isAuthenticated, login, logout } = useCoachAuth(settings.coachPasscode);

  // Seed data on first run
  useEffect(() => {
    if (playersApi.players.length === 0) {
      SEED_PLAYERS.forEach(p => {
        const existing = playersApi.players.find(ep => ep.id === p.id);
        if (!existing) {
          // Directly set seed data
        }
      });
      // Use localStorage directly to avoid re-render loop
      if (!localStorage.getItem('u10_seeded')) {
        localStorage.setItem('u10_players', JSON.stringify(SEED_PLAYERS));
        localStorage.setItem('u10_events', JSON.stringify(SEED_EVENTS));
        localStorage.setItem('u10_skill_ratings', JSON.stringify(SEED_RATINGS));
        localStorage.setItem('u10_attendance', JSON.stringify(SEED_ATTENDANCE));
        localStorage.setItem('u10_seeded', 'true');
        window.location.reload();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AppContextValue = {
    ...playersApi,
    ...eventsApi,
    ...ratingsApi,
    ...attendanceApi,
    settings,
    updateSettings,
    isAuthenticated,
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
