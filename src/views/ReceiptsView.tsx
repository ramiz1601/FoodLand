import React, { useState } from 'react';
import { useArena } from '../context/ArenaContext';
import { Receipt, Booking } from '../types';
import {
  Receipt as ReceiptIcon,
  Search,
  Printer,
  MessageSquare,
  Eye,
  Calendar,
  DollarSign,
  Download,
  Share2
} from 'lucide-react';
import { ReceiptModal } from '../components/ReceiptModal';

export const ReceiptsView: React.FC = () => {
  const { receipts, bookings, businessProfile, sendWhatsAppMessage } = useArena();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const filtered = receipts.filter(r => {
    const q = searchTerm.toLowerCase();
    return (
      r.receiptNumber.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.teamName.toLowerCase().includes(q) ||
      r.customerPhone.includes(q) ||
      r.bookingDate.includes(q)
    );
  });

  const getBookingForReceipt = (r: Receipt): Booking | undefined => {
    return bookings.find(b => b.id === r.bookingId);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <ReceiptIcon className="w-6 h-6 text-emerald-600" />
            <span>Official Booking Receipts & Invoices</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View, print, download, and WhatsApp official itemized receipts with arena seal
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 self-start sm:self-auto">
          Total Generated: <span className="font-bold text-emerald-600">{receipts.length} Receipts</span>
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
            placeholder="Search by receipt number (e.g. CRA-2026-00001), team, customer, date..."
            className="w-full py-2 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
          />
        </div>
      </div>

      {/* Receipts Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-4">Date Issued</th>
                <th className="py-3.5 px-4">Customer / Team</th>
                <th className="py-3.5 px-4">Ground & Fixture</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Paid / Balance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No receipts found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map(r => {
                  const associatedBooking = getBookingForReceipt(r);

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {r.receiptNumber}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {r.dateIssued}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{r.customerName}</div>
                        <div className="text-[11px] text-emerald-600 font-semibold">{r.teamName}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{r.groundName}</div>
                        <div className="text-[11px] text-slate-500">
                          {r.bookingDate} ({r.bookingTime})
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {businessProfile.currencySymbol}{(r.totalAmount ?? 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-600 block">
                          Paid: {businessProfile.currencySymbol}{(r.amountPaid ?? 0).toFixed(2)}
                        </span>
                        {(r.remainingBalance ?? 0) > 0 && (
                          <span className="text-[10px] font-bold text-rose-600 block">
                            Due: {businessProfile.currencySymbol}{(r.remainingBalance ?? 0).toFixed(2)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block uppercase tracking-wider ${
                            r.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : r.paymentStatus === 'partially-paid'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {r.paymentStatus.replace('-', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedReceipt(r)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="View / Print Receipt"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (associatedBooking) {
                                sendWhatsAppMessage('receipt-share', associatedBooking);
                              } else {
                                const waUrl = `https://wa.me/${r.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  `Hello ${r.customerName}, here is your official receipt #${r.receiptNumber} from ${businessProfile.arenaName}. Total: ${businessProfile.currencySymbol}${(r.totalAmount ?? 0).toFixed(2)}.`
                                )}`;
                                window.open(waUrl, '_blank');
                              }
                            }}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Share on WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          booking={getBookingForReceipt(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
