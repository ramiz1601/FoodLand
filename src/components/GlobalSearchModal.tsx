import React, { useState, useEffect } from 'react';
import { useArena } from '../context/ArenaContext';
import { Search, X, Calendar, User, Receipt, FileText, ArrowRight, DollarSign } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    searchModalOpen,
    setSearchModalOpen,
    bookings,
    customers,
    receipts,
    contracts,
    expenses,
    setActiveTab,
    setSelectedBookingId,
    setSelectedCustomerId,
    businessProfile
  } = useArena();

  const [query, setQuery] = useState('');

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
      if (e.key === 'Escape' && searchModalOpen) {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, setSearchModalOpen]);

  if (!searchModalOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredBookings = q
    ? bookings.filter(
        b =>
          b.bookingCode.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.teamName.toLowerCase().includes(q) ||
          b.customerPhone.toLowerCase().includes(q) ||
          b.groundName.toLowerCase().includes(q) ||
          b.date.includes(q)
      )
    : [];

  const filteredCustomers = q
    ? customers.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.teamName.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      )
    : [];

  const filteredReceipts = q
    ? receipts.filter(
        r =>
          r.receiptNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.teamName.toLowerCase().includes(q)
      )
    : [];

  const filteredContracts = q
    ? contracts.filter(
        c =>
          c.contractNumber.toLowerCase().includes(q) ||
          c.customerName.toLowerCase().includes(q) ||
          c.teamName.toLowerCase().includes(q)
      )
    : [];

  const totalResults =
    filteredBookings.length + filteredCustomers.length + filteredReceipts.length + filteredContracts.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-black/60 backdrop-blur-xs p-4 transition-all">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search booking code, customer, phone, receipt number, team..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setSearchModalOpen(false)}
            className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!q && (
            <div className="text-center py-10 space-y-2 text-slate-400">
              <Search className="w-8 h-8 mx-auto stroke-1 text-slate-400" />
              <p className="text-xs">Type a customer name, phone number, booking code, or team to search...</p>
              <div className="flex justify-center gap-2 pt-2">
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  e.g. Shaheen Strikers
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  e.g. CRA-BKG-2026-0101
                </span>
              </div>
            </div>
          )}

          {q && totalResults === 0 && (
            <div className="text-center py-10 text-xs text-slate-400">
              No matching arena records found for "{query}".
            </div>
          )}

          {/* Bookings Match */}
          {filteredBookings.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>Bookings ({filteredBookings.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredBookings.map(b => (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBookingId(b.id);
                      setActiveTab('bookings');
                      setSearchModalOpen(false);
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {b.bookingCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {b.customerName} ({b.teamName})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {b.date} • {b.startTime} - {b.endTime} • {b.groundName}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {businessProfile.currencySymbol}{b.totalAmount.toFixed(2)}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 ml-auto mt-1 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers Match */}
          {filteredCustomers.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span>Customers & Teams ({filteredCustomers.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredCustomers.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomerId(c.id);
                      setActiveTab('customers');
                      setSearchModalOpen(false);
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {c.name} • <span className="text-emerald-600 dark:text-emerald-400">{c.teamName}</span>
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                        📞 {c.phone} {c.email ? `• ✉️ ${c.email}` : ''}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Receipts Match */}
          {filteredReceipts.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-purple-500" />
                <span>Receipts ({filteredReceipts.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredReceipts.map(r => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedBookingId(r.bookingId);
                      setActiveTab('receipts');
                      setSearchModalOpen(false);
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400 block">
                        {r.receiptNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                        {r.customerName} ({r.teamName}) • {r.bookingDate}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {businessProfile.currencySymbol}{r.totalAmount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contracts Match */}
          {filteredContracts.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>Agreements & Contracts ({filteredContracts.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredContracts.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedBookingId(c.bookingId);
                      setActiveTab('contracts');
                      setSearchModalOpen(false);
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400 block">
                        {c.contractNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                        {c.customerName} • {c.teamName} ({c.bookingDate})
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
