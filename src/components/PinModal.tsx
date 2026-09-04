import React, { useState, useEffect } from 'react';
import { useArena } from '../context/ArenaContext';
import { ShieldCheck, Lock, Eye, EyeOff, X, KeyRound, AlertCircle } from 'lucide-react';

export const PinModal: React.FC = () => {
  const { isPinModalOpen, pinModalTitle, pinModalDescription, closePinModal, verifyPinAction, securitySettings } = useArena();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isPinModalOpen) {
      setPin('');
      setError('');
      setShowPin(false);
    }
  }, [isPinModalOpen]);

  if (!isPinModalOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) {
      setError('Please enter your Admin PIN');
      return;
    }

    const valid = verifyPinAction(pin);
    if (!valid) {
      setError('Invalid Admin PIN. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin('');
    } else {
      setError('');
    }
  };

  const handleKeypadPress = (val: string) => {
    if (pin.length < 8) {
      setPin(prev => prev + val);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-200">
      <div
        className={`relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        {/* Header banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <ShieldCheck className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">Admin Security PIN</h3>
              <p className="text-xs text-emerald-100/90">Verification Required</p>
            </div>
          </div>
          <button
            onClick={closePinModal}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Action context description */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">{pinModalTitle}</span>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 leading-relaxed">{pinModalDescription}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                Enter Administrative PIN
              </label>

              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={8}
                  autoFocus
                  value={pin}
                  onChange={e => {
                    setPin(e.target.value);
                    setError('');
                  }}
                  placeholder="••••"
                  className="w-full text-center text-2xl tracking-widest font-mono font-bold py-3.5 px-12 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition-colors"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Quick Digital Keypad for Touch / Mouse Convenience */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num.toString())}
                  className="h-11 rounded-lg bg-slate-100 hover:bg-emerald-50 active:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200 text-lg transition-colors border border-slate-200 dark:border-slate-700"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleBackspace}
                className="h-11 rounded-lg bg-slate-100 hover:bg-rose-50 text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-rose-400 font-medium text-xs transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="h-11 rounded-lg bg-slate-100 hover:bg-emerald-50 active:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200 text-lg transition-colors border border-slate-200 dark:border-slate-700"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => setPin(securitySettings.adminPin)}
                className="h-11 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-medium text-xs transition-colors border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1"
                title="Use configured demo PIN"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Fill PIN</span>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={closePinModal}
                className="w-1/2 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-1/2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Proceed</span>
              </button>
            </div>
          </form>

          <div className="text-center">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Default Admin PIN: <strong className="text-emerald-600 dark:text-emerald-400">1234</strong> (Configurable in Settings → Security)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
