import React, { useState, useEffect } from 'react';
import { useArena } from '../context/ArenaContext';
import { PaymentMethod, Booking } from '../types';
import { DollarSign, Check, X, AlertCircle, CreditCard, Banknote, Landmark, Smartphone } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBookingId?: string | null;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  preselectedBookingId
}) => {
  const { bookings, recordPayment, businessProfile, requirePin } = useArena();

  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Unpaid or partially paid bookings
  const pendingBookings = bookings.filter(b => b.status !== 'cancelled' && b.remainingBalance > 0);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      if (preselectedBookingId) {
        setSelectedBookingId(preselectedBookingId);
        const b = bookings.find(x => x.id === preselectedBookingId);
        if (b) setAmount(b.remainingBalance);
      } else if (pendingBookings.length > 0) {
        setSelectedBookingId(pendingBookings[0].id);
        setAmount(pendingBookings[0].remainingBalance);
      } else {
        setSelectedBookingId('');
        setAmount(0);
      }
    }
  }, [isOpen, preselectedBookingId]);

  if (!isOpen) return null;

  const currentBooking = bookings.find(b => b.id === selectedBookingId);

  const handleBookingChange = (id: string) => {
    setSelectedBookingId(id);
    const b = bookings.find(x => x.id === id);
    if (b) {
      setAmount(b.remainingBalance);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !currentBooking) {
      setError('Please select a booking.');
      return;
    }
    if (amount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }
    if (amount > (currentBooking.remainingBalance ?? 0) + 0.01) {
      setError(`Payment cannot exceed remaining balance of ${businessProfile.currencySymbol}${(currentBooking.remainingBalance ?? 0).toFixed(2)}.`);
      return;
    }

    requirePin('Record Customer Payment', `Collect ${businessProfile.currencySymbol}${(amount ?? 0).toFixed(2)} for ${currentBooking.customerName} (${currentBooking.bookingCode})`, () => {
      const res = recordPayment(selectedBookingId, amount, method, reference, notes);
      if (res.success) {
        setSuccessMsg(`Payment of ${businessProfile.currencySymbol}${(amount ?? 0).toFixed(2)} recorded successfully!`);
        setTimeout(() => {
          onClose();
        }, 900);
      } else {
        setError(res.error || 'Failed to record payment');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <h3 className="font-bold text-base">Record Payment</h3>
              <p className="text-xs text-emerald-100/90">Instant balance & receipt settlement</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Select Booking */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
              Select Outstanding Booking
            </label>
            <select
              value={selectedBookingId}
              onChange={e => handleBookingChange(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {pendingBookings.length === 0 ? (
                <option value="">No outstanding balances found</option>
              ) : (
                pendingBookings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.bookingCode} — {b.customerName} ({b.teamName}) — Due: {businessProfile.currencySymbol}{b.remainingBalance.toFixed(2)} ({b.date})
                  </option>
                ))
              )}
            </select>
          </div>

          {currentBooking && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Total Fee</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {businessProfile.currencySymbol}{(currentBooking.totalAmount ?? 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Paid</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {businessProfile.currencySymbol}{(currentBooking.amountPaid ?? 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Remaining</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {businessProfile.currencySymbol}{(currentBooking.remainingBalance ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Payment Amount ({businessProfile.currencySymbol})
              </label>
              {currentBooking && (currentBooking.remainingBalance ?? 0) > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(currentBooking.remainingBalance)}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  Pay Full Balance ({businessProfile.currencySymbol}{(currentBooking.remainingBalance ?? 0).toFixed(2)})
                </button>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                {businessProfile.currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={currentBooking ? currentBooking.remainingBalance : undefined}
                value={amount || ''}
                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full py-2.5 pl-8 pr-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-base outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'bank-transfer', label: 'Bank Transfer', icon: Landmark },
                { id: 'card', label: 'Card / POS', icon: CreditCard },
                { id: 'online', label: 'Online / QR', icon: Smartphone }
              ].map(item => {
                const Icon = item.icon;
                const isSelected = method === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMethod(item.id as PaymentMethod)}
                    className={`py-2 px-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reference & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Transaction Ref / Cheque #
              </label>
              <input
                type="text"
                value={reference}
                onChange={e => setReference(e.target.value)}
                placeholder="e.g. WIRE-9018, POS-112"
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Internal Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Received at reception counter"
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!currentBooking || amount <= 0}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Record & Update Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
