import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Lock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';

export function CoachLoginPage() {
  const { login, settings } = useApp();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (login(pin)) {
      navigate('/');
    } else {
      setError('Incorrect PIN. Try again.');
      setPin('');
    }
  }

  function handleDigit(d: string) {
    if (pin.length < 4) {
      const newPin = pin + d;
      setPin(newPin);
      setError('');
      if (newPin.length === 4) {
        if (login(newPin)) {
          navigate('/');
        } else {
          setError('Incorrect PIN. Try again.');
          setPin('');
        }
      }
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
          <p className="text-gray-500 text-sm mt-1">Coach Portal · {settings.season}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              <Lock size={14} className="inline mr-1" />
              Enter your 4-digit PIN
            </label>
            <div className="flex justify-center gap-3 mb-2">
              {[0,1,2,3].map(i => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-colors ${
                    pin.length > i
                      ? 'border-pitch-500 bg-pitch-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {pin.length > i ? '●' : ''}
                </div>
              ))}
            </div>
            {error && <p className="text-center text-sm text-red-600">{error}</p>}
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2">
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
              <button
                key={i}
                type="button"
                disabled={!d}
                onClick={() => {
                  if (d === '⌫') setPin(p => p.slice(0, -1));
                  else if (d) handleDigit(d);
                }}
                className={`h-14 rounded-xl text-lg font-semibold transition-colors ${
                  d
                    ? 'bg-gray-100 hover:bg-pitch-100 hover:text-pitch-700 active:bg-pitch-200'
                    : 'invisible'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={pin.length < 4}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Parent? <a href="/parent" className="text-pitch-600 font-medium">View your child's progress →</a>
        </p>
      </div>
    </div>
  );
}
