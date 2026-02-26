import { useState } from 'react';
import { UserPlus, Search, Users } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PlayerCard } from '@/components/players/PlayerCard';
import { PlayerForm } from '@/components/players/PlayerForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { getAttendanceRate } from '@/utils/attendanceUtils';
import type { Player } from '@/types';

export function RosterPage() {
  const { players, addPlayer, events, records, getLatestForPlayer } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const activePlayers = players.filter(p => p.isActive);
  const filtered = activePlayers.filter(p => {
    const q = search.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      String(p.jerseyNumber).includes(q) ||
      p.position.toLowerCase().includes(q)
    );
  });

  function handleAdd(data: Omit<Player, 'id' | 'parentAccessCode' | 'joinedDate' | 'isActive'>) {
    addPlayer({ ...data, isActive: true });
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roster</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activePlayers.length} players</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="md">
          <UserPlus size={16} />
          Add Player
        </Button>
      </div>

      {activePlayers.length > 0 && (
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, number, or position..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={56} />}
          title={search ? 'No players found' : 'No players yet'}
          description={search ? 'Try a different search.' : 'Add your first player to get started!'}
          action={!search ? { label: 'Add Player', onClick: () => setShowForm(true) } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              latestRating={getLatestForPlayer(player.id)}
              attendanceRate={getAttendanceRate(player.id, records, events)}
            />
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add New Player" size="lg">
        <PlayerForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
