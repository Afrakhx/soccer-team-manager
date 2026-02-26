import { useLocalStorage } from './useLocalStorage';
import type { TeamSettings } from '@/types';

const DEFAULT_SETTINGS: TeamSettings = {
  teamName: 'Stars FC',
  season: 'Spring 2026',
  coachName: 'Coach',
  coachPasscode: '1234',
  teamColor: '#16a34a',
};

export function useTeamSettings() {
  const [settings, setSettings] = useLocalStorage<TeamSettings>('u10_settings', DEFAULT_SETTINGS);

  function updateSettings(data: Partial<TeamSettings>) {
    setSettings({ ...settings, ...data });
  }

  return { settings, updateSettings };
}
