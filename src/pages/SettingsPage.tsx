import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Save, Download, Upload, KeyRound, CheckCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { TeamSettings } from '@/types';

export function SettingsPage() {
  const { settings, updateSettings } = useApp();
  const { register, handleSubmit } = useForm<TeamSettings>({
    defaultValues: settings,
  });

  const [apiKey, setApiKey] = useState(localStorage.getItem('u10_claude_key') ?? '');
  const [apiKeySaved, setApiKeySaved] = useState(false);

  function onSubmit(data: TeamSettings) {
    updateSettings(data);
    alert('Settings saved!');
  }

  function saveApiKey() {
    if (apiKey.trim()) {
      localStorage.setItem('u10_claude_key', apiKey.trim());
    } else {
      localStorage.removeItem('u10_claude_key');
    }
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2500);
  }

  function handleExport() {
    const data = {
      players: JSON.parse(localStorage.getItem('u10_players') || '[]'),
      events: JSON.parse(localStorage.getItem('u10_events') || '[]'),
      ratings: JSON.parse(localStorage.getItem('u10_skill_ratings') || '[]'),
      attendance: JSON.parse(localStorage.getItem('u10_attendance') || '[]'),
      settings: JSON.parse(localStorage.getItem('u10_settings') || '{}'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${settings.teamName.replace(/\s+/g, '-')}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.players) localStorage.setItem('u10_players', JSON.stringify(data.players));
        if (data.events) localStorage.setItem('u10_events', JSON.stringify(data.events));
        if (data.ratings) localStorage.setItem('u10_skill_ratings', JSON.stringify(data.ratings));
        if (data.attendance) localStorage.setItem('u10_attendance', JSON.stringify(data.attendance));
        if (data.settings) localStorage.setItem('u10_settings', JSON.stringify(data.settings));
        window.location.reload();
      } catch {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Team configuration and data management</p>
      </div>

      <div className="space-y-5 max-w-2xl">
        {/* Team settings */}
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Team Settings</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Team Name" id="teamName" {...register('teamName', { required: true })} />
            <Input label="Season" id="season" placeholder="e.g. Spring 2026" {...register('season')} />
            <Input label="Coach Name" id="coachName" {...register('coachName')} />
            <Input
              label="Coach PIN (4 digits)"
              id="coachPasscode"
              type="password"
              maxLength={4}
              placeholder="••••"
              {...register('coachPasscode', { required: true, minLength: 4, maxLength: 4 })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Color</label>
              <div className="flex items-center gap-3">
                <input type="color" {...register('teamColor')} className="h-10 w-16 rounded border border-gray-300 cursor-pointer" />
                <span className="text-sm text-gray-500">Primary color used throughout the app</span>
              </div>
            </div>
            <Button type="submit">
              <Save size={15} />
              Save Settings
            </Button>
          </form>
        </Card>

        {/* Data backup */}
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Data Backup</h2>
          <p className="text-sm text-gray-500 mb-4">
            Your data is stored locally in this browser. Export a backup to keep it safe.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleExport}>
              <Download size={15} />
              Export Backup
            </Button>
            <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
              <Upload size={15} />
              Import Backup
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
          </div>
        </Card>

        {/* AI / Claude API key */}
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <KeyRound size={16} className="text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">Coaches Corner — AI Settings</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Add your Claude API key to enable real AI-powered assessments. Without a key, demo mode is used.
            Get a free key at <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-pitch-600 underline">console.anthropic.com</a>.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500"
            />
            <Button onClick={saveApiKey} variant={apiKeySaved ? 'secondary' : 'primary'}>
              {apiKeySaved ? <><CheckCircle size={15} /> Saved!</> : <><Save size={15} /> Save Key</>}
            </Button>
          </div>
          {apiKey && (
            <button
              type="button"
              onClick={() => { setApiKey(''); localStorage.removeItem('u10_claude_key'); }}
              className="mt-2 text-xs text-red-500 hover:underline"
            >
              Remove API key
            </button>
          )}
        </Card>

        {/* Parent view info */}
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Parent View</h2>
          <p className="text-sm text-gray-500 mb-3">
            Parents can see their child's progress at <strong>/parent</strong> using their unique access code.
            Find each player's code on their profile page.
          </p>
          <a href="/parent" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm">Open Parent View →</Button>
          </a>
        </Card>
      </div>
    </div>
  );
}
