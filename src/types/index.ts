export type Position = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward' | 'Any';

export type AttendanceStatus = 'Present' | 'Absent' | 'Excused';

export type GameResult = 'Win' | 'Loss' | 'Draw' | 'Upcoming';

export type EventType = 'Game' | 'Practice' | 'Tournament';

export type SkillKey =
  | 'ballControl'
  | 'dribbling'
  | 'passing'
  | 'shooting'
  | 'defending'
  | 'positioning'
  | 'teamwork'
  | 'effort';

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number;
  dateOfBirth: string;
  position: Position;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  photoUrl?: string;
  notes: string;
  parentAccessCode: string;
  isActive: boolean;
  joinedDate: string;
}

export interface SkillRating {
  id: string;
  playerId: string;
  assessedBy: string;
  assessedAt: string;
  sessionLabel: string;
  ratings: Record<SkillKey, number>;
  coachNotes: string;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  playerId: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  type: EventType;
  title: string;
  date: string;
  time: string;
  location: string;
  opponent?: string;
  homeOrAway?: 'Home' | 'Away';
  result?: GameResult;
  goalsFor?: number;
  goalsAgainst?: number;
  notes: string;
  isCompleted: boolean;
}

export interface TeamSettings {
  teamName: string;
  season: string;
  coachName: string;
  coachPasscode: string;
  teamColor: string;
}

export interface PlayerWithStats extends Player {
  latestSkillRating?: SkillRating;
  attendanceRate: number;
  gamesPlayed: number;
}

export interface AICornerRating {
  score: number;
  label: string;
  observation: string;
}

export interface AIAssessment {
  id: string;
  playerId: string;
  assessedAt: string;         // ISO date string
  assessedBy: string;         // coach name
  technical: AICornerRating;
  tactical: AICornerRating;
  physical: AICornerRating;
  psychological: AICornerRating;
  strengths: string[];
  areasToImprove: string[];
  drills: { name: string; description: string }[];
  summary: string;
  isDemo: boolean;
}
