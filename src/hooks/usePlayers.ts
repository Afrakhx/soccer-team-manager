import { useLocalStorage } from './useLocalStorage';
import { generateId } from '@/utils/generateId';
import { generateAccessCode } from '@/utils/generateAccessCode';
import type { Player } from '@/types';

export function usePlayers(initial: Player[] = []) {
  const [players, setPlayers] = useLocalStorage<Player[]>('u10_players', initial);

  function addPlayer(data: Omit<Player, 'id' | 'parentAccessCode' | 'joinedDate'>): Player {
    const player: Player = {
      ...data,
      id: generateId(),
      parentAccessCode: generateAccessCode(),
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setPlayers([...players, player]);
    return player;
  }

  function updatePlayer(id: string, data: Partial<Player>) {
    setPlayers(players.map(p => (p.id === id ? { ...p, ...data } : p)));
  }

  function deletePlayer(id: string) {
    setPlayers(players.filter(p => p.id !== id));
  }

  function getPlayerById(id: string): Player | undefined {
    return players.find(p => p.id === id);
  }

  function getPlayerByAccessCode(code: string): Player | undefined {
    return players.find(p => p.parentAccessCode === code.toUpperCase() && p.isActive);
  }

  return { players, addPlayer, updatePlayer, deletePlayer, getPlayerById, getPlayerByAccessCode };
}
