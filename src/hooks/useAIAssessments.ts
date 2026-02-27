import { useLocalStorage } from './useLocalStorage';
import { generateId } from '@/utils/generateId';
import type { AIAssessment } from '@/types';

export function useAIAssessments() {
  const [assessments, setAssessments] = useLocalStorage<AIAssessment[]>('u10_ai_assessments', []);

  function addAssessment(data: Omit<AIAssessment, 'id'>): AIAssessment {
    const assessment: AIAssessment = { ...data, id: generateId() };
    setAssessments([...assessments, assessment]);
    return assessment;
  }

  function deleteAssessment(id: string) {
    setAssessments(assessments.filter(a => a.id !== id));
  }

  function getAssessmentsForPlayer(playerId: string): AIAssessment[] {
    return assessments
      .filter(a => a.playerId === playerId)
      .sort((a, b) => b.assessedAt.localeCompare(a.assessedAt)); // newest first
  }

  function getLatestForPlayer(playerId: string): AIAssessment | undefined {
    return getAssessmentsForPlayer(playerId)[0];
  }

  return { assessments, addAssessment, deleteAssessment, getAssessmentsForPlayer, getLatestForPlayer };
}
