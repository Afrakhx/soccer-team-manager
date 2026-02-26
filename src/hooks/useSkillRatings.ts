import { useLocalStorage } from './useLocalStorage';
import { generateId } from '@/utils/generateId';
import type { SkillRating } from '@/types';

export function useSkillRatings(initial: SkillRating[] = []) {
  const [ratings, setRatings] = useLocalStorage<SkillRating[]>('u10_skill_ratings', initial);

  function addRating(data: Omit<SkillRating, 'id'>): SkillRating {
    const rating: SkillRating = { ...data, id: generateId() };
    setRatings([...ratings, rating]);
    return rating;
  }

  function deleteRating(id: string) {
    setRatings(ratings.filter(r => r.id !== id));
  }

  function getRatingsForPlayer(playerId: string): SkillRating[] {
    return ratings
      .filter(r => r.playerId === playerId)
      .sort((a, b) => a.assessedAt.localeCompare(b.assessedAt));
  }

  function getLatestForPlayer(playerId: string): SkillRating | undefined {
    const playerRatings = getRatingsForPlayer(playerId);
    return playerRatings[playerRatings.length - 1];
  }

  return { ratings, addRating, deleteRating, getRatingsForPlayer, getLatestForPlayer };
}
