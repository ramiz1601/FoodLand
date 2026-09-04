import React, { useState } from 'react';
import { useArena } from '../context/ArenaContext';
import { Contract, Booking } from '../types';
import {
  FileText,
  Search,
  Printer,
  MessageSquare,
  Eye,
  Calendar,
  DollarSign,
  ShieldCheck
} from 'lucide-react';
import { ContractModal } from '../components/ContractModal';

export const ContractsView: React.FC = () => {
  const { contracts, bookings, businessProfile, sendWhatsAppMessage } = useArena();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const filtered = contracts.filter(c => {
    const q = searchTerm.toLowerCase();
    return (
      c.contractNumber.toLowerCase().includes(q) ||
      c.customerName.toLowerCase().includes(q) ||
      c.teamName.toLowerCase().includes(q) ||
      c.customerPhone.includes(q) ||
      c.bookingDate.includes(q)
    );
  });

  const getBookingForContract = (c: Contract): Booking | undefined => {
    return bookings.find(b => b.id === c.bookingId);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-amber-500" />
            <span>Facility Hire Agreements & Team Contracts</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Official agreements, pitch rules, damage liability, cancellation policies & team signatures
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 self-start sm:self-auto">
          Active Contracts: <span className="font-bold text-amber-600">{contracts.length} Agreements</span>
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
            placeholder="Search by contract number (e.g. CRA-CON-2026-00001), team, captain, date..."
            className="w-full py-2 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
          />
        </div>
      </div>

      {/* Contracts Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Contract Ref</th>
                <th className="py-3.5 px-4">Date Issued</th>
                <th className="py-3.5 px-4">Team & Hirer</th>
                <th className="py-3.5 px-4">Pitch Schedule</th>
                <th className="py-3.5 px-4">Agreed Fee</th>
                <th className="py-3.5 px-4">Balance Due</th>
                <th className="py-3.5 px-4">Signatory</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No agreements found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const associatedBooking = getBookingForContract(c);

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {c.contractNumber}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {c.dateGenerated}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{c.teamName}</div>
                        <div className="text-[11px] text-slate-500">{c.customerName}</div>
                        <div className="text-[10px] text-slate-400">📞 {c.customerPhone}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{c.groundName}</div>
                        <div className="text-[11px] text-slate-500">
                          {c.bookingDate} ({c.bookingTime})
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {businessProfile.currencySymbol}{(c.totalAmount ?? 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold ${
                            (c.balanceDue ?? 0) > 0 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {businessProfile.currencySymbol}{(c.balanceDue ?? 0).toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 italic">
                        {c.signedByCustomer || 'Pending sign'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedContract(c)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                            title="View / Print Contract"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (associatedBooking) {
                                sendWhatsAppMessage('contract-share', associatedBooking);
                              } else {
                                const text = `Official Cricket Ground Agreement #${c.contractNumber} from ${businessProfile.arenaName} for ${c.teamName} on ${c.bookingDate}. Total: ${businessProfile.currencySymbol}${(c.totalAmount ?? 0).toFixed(2)}.`;
                                window.open(
                                  `https://wa.me/${c.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`,
                                  '_blank'
                                );
                              }
                            }}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Share Contract on WhatsApp"
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

      {/* Contract Modal */}
      {selectedContract && (
        <ContractModal
          contract={selectedContract}
          booking={getBookingForContract(selectedContract)}
          onClose={() => setSelectedContract(null)}
        />
      )}
    </div>
  );
};
