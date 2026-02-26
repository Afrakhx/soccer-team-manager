import type { Player, CalendarEvent, SkillRating, AttendanceRecord } from '@/types';

export const SEED_PLAYERS: Player[] = [
  {
    id: 'p1', firstName: 'Liam', lastName: 'Torres', jerseyNumber: 1,
    dateOfBirth: '2016-03-15', position: 'Goalkeeper',
    parentName: 'Maria Torres', parentEmail: 'maria.torres@email.com',
    parentPhone: '555-0101', notes: 'Great reflexes, needs to work on communication',
    parentAccessCode: 'LT1234', isActive: true, joinedDate: '2025-09-01',
  },
  {
    id: 'p2', firstName: 'Noah', lastName: 'Kim', jerseyNumber: 4,
    dateOfBirth: '2015-07-22', position: 'Defender',
    parentName: 'James Kim', parentEmail: 'james.kim@email.com',
    parentPhone: '555-0102', notes: 'Strong in the air, improving first touch',
    parentAccessCode: 'NK4321', isActive: true, joinedDate: '2025-09-01',
  },
  {
    id: 'p3', firstName: 'Emma', lastName: 'Patel', jerseyNumber: 7,
    dateOfBirth: '2016-01-10', position: 'Midfielder',
    parentName: 'Priya Patel', parentEmail: 'priya.patel@email.com',
    parentPhone: '555-0103', notes: 'Excellent vision, needs to shoot more',
    parentAccessCode: 'EP7777', isActive: true, joinedDate: '2025-09-01',
  },
  {
    id: 'p4', firstName: 'Aiden', lastName: 'Johnson', jerseyNumber: 9,
    dateOfBirth: '2015-11-05', position: 'Forward',
    parentName: 'Sarah Johnson', parentEmail: 'sarah.j@email.com',
    parentPhone: '555-0104', notes: 'Natural goal scorer, work on tracking back',
    parentAccessCode: 'AJ9999', isActive: true, joinedDate: '2025-09-01',
  },
  {
    id: 'p5', firstName: 'Sofia', lastName: 'Martinez', jerseyNumber: 11,
    dateOfBirth: '2016-05-30', position: 'Forward',
    parentName: 'Carlos Martinez', parentEmail: 'carlos.m@email.com',
    parentPhone: '555-0105', notes: 'Fastest player on the team, improving finishing',
    parentAccessCode: 'SM1111', isActive: true, joinedDate: '2025-09-01',
  },
  {
    id: 'p6', firstName: 'Ethan', lastName: 'Brown', jerseyNumber: 5,
    dateOfBirth: '2015-09-18', position: 'Defender',
    parentName: 'Mike Brown', parentEmail: 'mike.brown@email.com',
    parentPhone: '555-0106', notes: 'Great attitude, developing positioning',
    parentAccessCode: 'EB5555', isActive: true, joinedDate: '2025-09-01',
  },
];

export const SEED_EVENTS: CalendarEvent[] = [
  {
    id: 'e1', type: 'Practice', title: 'Team Practice',
    date: '2026-02-10', time: '17:00', location: 'Memorial Park Field 2',
    notes: 'Focus on passing drills', isCompleted: true,
  },
  {
    id: 'e2', type: 'Practice', title: 'Team Practice',
    date: '2026-02-13', time: '17:00', location: 'Memorial Park Field 2',
    notes: 'Shooting practice + scrimmage', isCompleted: true,
  },
  {
    id: 'e3', type: 'Game', title: 'vs. River City FC',
    date: '2026-02-15', time: '10:00', location: 'City Sports Complex',
    opponent: 'River City FC', homeOrAway: 'Away',
    result: 'Win', goalsFor: 3, goalsAgainst: 1,
    notes: 'Great team performance! Liam had 2 saves.',
    isCompleted: true,
  },
  {
    id: 'e4', type: 'Practice', title: 'Team Practice',
    date: '2026-02-18', time: '17:00', location: 'Memorial Park Field 2',
    notes: 'Dribbling + small-sided games', isCompleted: true,
  },
  {
    id: 'e5', type: 'Practice', title: 'Team Practice',
    date: '2026-02-24', time: '17:00', location: 'Memorial Park Field 2',
    notes: 'Defensive shape + set pieces', isCompleted: false,
  },
  {
    id: 'e6', type: 'Game', title: 'vs. Northside United',
    date: '2026-03-01', time: '09:00', location: 'Home Field - Riverside Park',
    opponent: 'Northside United', homeOrAway: 'Home',
    notes: 'Season opener at home!', isCompleted: false,
  },
  {
    id: 'e7', type: 'Practice', title: 'Team Practice',
    date: '2026-03-04', time: '17:00', location: 'Memorial Park Field 2',
    notes: '', isCompleted: false,
  },
  {
    id: 'e8', type: 'Game', title: 'vs. Eagles SC',
    date: '2026-03-08', time: '11:00', location: 'Eagles Home Ground',
    opponent: 'Eagles SC', homeOrAway: 'Away',
    notes: '', isCompleted: false,
  },
];

function makeRating(
  id: string, playerId: string, date: string, label: string,
  bc: number, dr: number, pa: number, sh: number, de: number, po: number, tw: number, ef: number
): SkillRating {
  return {
    id, playerId, assessedBy: 'Coach',
    assessedAt: date, sessionLabel: label,
    coachNotes: '',
    ratings: {
      ballControl: bc, dribbling: dr, passing: pa, shooting: sh,
      defending: de, positioning: po, teamwork: tw, effort: ef,
    },
  };
}

export const SEED_RATINGS: SkillRating[] = [
  // Liam (GK)
  makeRating('r1', 'p1', '2026-02-10', 'Feb 10 Practice', 3,2,3,2,4,3,4,5),
  makeRating('r2', 'p1', '2026-02-18', 'Feb 18 Practice', 4,2,3,3,4,4,4,5),
  // Noah (DEF)
  makeRating('r3', 'p2', '2026-02-10', 'Feb 10 Practice', 2,2,3,2,4,3,4,4),
  makeRating('r4', 'p2', '2026-02-18', 'Feb 18 Practice', 3,3,3,2,4,4,4,4),
  // Emma (MID)
  makeRating('r5', 'p3', '2026-02-10', 'Feb 10 Practice', 4,3,5,2,3,4,5,5),
  makeRating('r6', 'p3', '2026-02-18', 'Feb 18 Practice', 4,4,5,3,3,5,5,5),
  // Aiden (FWD)
  makeRating('r7', 'p4', '2026-02-10', 'Feb 10 Practice', 3,4,3,4,2,3,3,5),
  makeRating('r8', 'p4', '2026-02-18', 'Feb 18 Practice', 4,4,3,5,2,4,3,5),
  // Sofia (FWD)
  makeRating('r9', 'p5', '2026-02-10', 'Feb 10 Practice', 3,5,3,3,2,3,3,5),
  makeRating('r10', 'p5', '2026-02-18', 'Feb 18 Practice', 4,5,3,4,3,3,4,5),
  // Ethan (DEF)
  makeRating('r11', 'p6', '2026-02-10', 'Feb 10 Practice', 2,2,2,2,3,3,4,5),
  makeRating('r12', 'p6', '2026-02-18', 'Feb 18 Practice', 3,3,3,2,4,3,4,5),
];

const pastEventIds = ['e1', 'e2', 'e3', 'e4'];
const playerIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];

export const SEED_ATTENDANCE: AttendanceRecord[] = pastEventIds.flatMap((eventId, ei) =>
  playerIds.map((playerId, pi) => ({
    id: `a_${eventId}_${playerId}`,
    eventId,
    playerId,
    status: (pi === 1 && ei === 1) ? 'Absent' : (pi === 4 && ei === 3) ? 'Excused' : 'Present',
  } as AttendanceRecord))
);
