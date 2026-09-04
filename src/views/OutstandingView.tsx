import React, { useState } from 'react';
import { useArena } from '../context/ArenaContext';
import { Booking } from '../types';
import {
  AlertCircle,
  DollarSign,
  MessageSquare,
  Receipt,
  Search,
  CheckCircle2,
  Calendar,
  Phone,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { ReceiptModal } from '../components/ReceiptModal';

export const OutstandingView: React.FC = () => {
  const { bookings, businessProfile, sendWhatsAppMessage, generateReceipt } = useArena();

  const [searchTerm, setSearchTerm] = useState('');
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);

  // Bookings with remaining balance
  const outstandingBookings = bookings
    .filter(b => b.status !== 'cancelled' && b.remainingBalance > 0)
    .sort((a, b) => b.remainingBalance - a.remainingBalance);

  const totalOutstanding = outstandingBookings.reduce((sum, b) => sum + b.remainingBalance, 0);

  const filtered = outstandingBookings.filter(b => {
    const q = searchTerm.toLowerCase();
    return (
      b.bookingCode.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.teamName.toLowerCase().includes(q) ||
      b.customerPhone.includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <AlertCircle className="w-6 h-6 text-rose-600" />
            <span>Outstanding Payments & Receivables</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track unpaid fixture balances, send payment reminders, and record collections
          </p>
        </div>

        {/* Total Outstanding Callout */}
        <div className="px-5 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-center gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
              Total Uncollected Receivables
            </span>
            <span className="text-2xl font-black text-rose-700 dark:text-rose-300">
              {businessProfile.currencySymbol}{(totalOutstanding ?? 0).toFixed(2)}
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
            {outstandingBookings.length} Fixtures
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by team, customer name, phone, or booking code..."
            className="w-full py-2 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
          />
        </div>
      </div>

      {/* Outstanding Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Team & Captain</th>
                <th className="py-3.5 px-4">Fixture Date & Pitch</th>
                <th className="py-3.5 px-4">Total Agreed</th>
                <th className="py-3.5 px-4">Paid So Far</th>
                <th className="py-3.5 px-4">Remaining Balance</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    {outstandingBookings.length === 0
                      ? '🎉 All booked fixtures have zero balance! Everything is collected.'
                      : 'No outstanding balances matching your search.'}
                  </td>
                </tr>
              ) : (
                filtered.map(b => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {b.bookingCode}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{b.teamName}</div>
                      <div className="text-[11px] text-slate-500">{b.customerName}</div>
                      <div className="text-[10px] text-slate-400">📞 {b.customerPhone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 dark:text-white">{b.date}</div>
                      <div className="text-[11px] text-slate-500">
                        {b.startTime} - {b.endTime} • {b.groundName}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {businessProfile.currencySymbol}{(b.totalAmount ?? 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-emerald-600">
                      {businessProfile.currencySymbol}{(b.amountPaid ?? 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 font-black text-rose-600 text-sm">
                      {businessProfile.currencySymbol}{(b.remainingBalance ?? 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Send Payment Reminder WhatsApp */}
                        <button
                          onClick={() => sendWhatsAppMessage('payment-reminder', b)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Send WhatsApp Payment Reminder"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Remind</span>
                        </button>

                        {/* Record Payment Button */}
                        <button
                          onClick={() => setPayingBookingId(b.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-xs flex items-center gap-1 transition-colors"
                          title="Record Payment"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Collect</span>
                        </button>

                        {/* View Current Receipt */}
                        <button
                          onClick={() => setReceiptBooking(b)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          title="View Current Receipt"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {payingBookingId && (
        <RecordPaymentModal
          isOpen={true}
          onClose={() => setPayingBookingId(null)}
          preselectedBookingId={payingBookingId}
        />
      )}

      {/* Receipt Modal */}
      {receiptBooking && (
        <ReceiptModal
          receipt={generateReceipt(receiptBooking)}
          booking={receiptBooking}
          onClose={() => setReceiptBooking(null)}
        />
      )}
    </div>
  );
};
