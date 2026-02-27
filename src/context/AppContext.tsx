import { createContext, useContext } from 'react';
import { usePlayers } from '@/hooks/usePlayers';
import { useEvents } from '@/hooks/useEvents';
import { useSkillRatings } from '@/hooks/useSkillRatings';
import { useAttendance } from '@/hooks/useAttendance';
import { useTeamSettings } from '@/hooks/useTeamSettings';
import { useCoachAuth } from '@/hooks/useCoachAuth';
import { useAIAssessments } from '@/hooks/useAIAssessments';
import {
  SEED_PLAYERS, SEED_EVENTS, SEED_RATINGS, SEED_ATTENDANCE,
} from '@/constants/defaults';
import type { Player, CalendarEvent, SkillRating, AttendanceRecord, AttendanceStatus, TeamSettings, AIAssessment } from '@/types';

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

  // AI Assessments
  aiAssessments: AIAssessment[];
  addAIAssessment: (data: Omit<AIAssessment, 'id'>) => AIAssessment;
  deleteAIAssessment: (id: string) => void;
  getAIAssessmentsForPlayer: (playerId: string) => AIAssessment[];
  getLatestAIAssessmentForPlayer: (playerId: string) => AIAssessment | undefined;

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
  const playersApi = usePlayers(SEED_PLAYERS);
  const eventsApi = useEvents(SEED_EVENTS);
  const ratingsApi = useSkillRatings(SEED_RATINGS);
  const attendanceApi = useAttendance(SEED_ATTENDANCE);
  const aiApi = useAIAssessments();
  const { settings, updateSettings } = useTeamSettings();
  const { isAuthenticated, login, logout } = useCoachAuth(settings.coachPasscode);

  const value: AppContextValue = {
    ...playersApi,
    ...eventsApi,
    ...ratingsApi,
    ...attendanceApi,
    aiAssessments: aiApi.assessments,
    addAIAssessment: aiApi.addAssessment,
    deleteAIAssessment: aiApi.deleteAssessment,
    getAIAssessmentsForPlayer: aiApi.getAssessmentsForPlayer,
    getLatestAIAssessmentForPlayer: aiApi.getLatestForPlayer,
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
