import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';

export function ParentAccessPage() {
  const { settings, getPlayerByAccessCode } = useApp();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const player = getPlayerByAccessCode(code);
    if (player) {
      navigate(`/parent/${player.parentAccessCode}`);
    } else {
      setError('Code not found. Please check with your coach.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pitch-900 to-pitch-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-pitch-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} className="text-pitch-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{settings.teamName}</h1>
          <p className="text-gray-500 text-sm mt-1">Parent Progress Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Player Access Code
            </label>
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder="e.g. AJ9999"
              maxLength={6}
              className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg font-mono font-bold tracking-widest uppercase focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500"
            />
            {error && <p className="mt-1.5 text-sm text-red-600 text-center">{error}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={code.length < 4}>
            View Progress <ArrowRight size={16} />
          </Button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 text-center">
            Your access code was provided by your coach. It's printed on your team info sheet.
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Coach? <a href="/login" className="text-pitch-600 font-medium">Sign in here →</a>
        </p>
      </div>
    </div>
  );
}
