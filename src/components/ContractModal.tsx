import React from 'react';
import { useArena } from '../context/ArenaContext';
import { Contract, Booking } from '../types';
import {
  Printer,
  Share2,
  MessageSquare,
  X,
  FileCheck,
  ShieldAlert,
  Calendar,
  Clock
} from 'lucide-react';

interface ContractModalProps {
  contract: Contract | null;
  booking?: Booking;
  onClose: () => void;
}

export const ContractModal: React.FC<ContractModalProps> = ({ contract, booking, onClose }) => {
  const { businessProfile, sendWhatsAppMessage } = useArena();

  if (!contract) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    if (booking) {
      sendWhatsAppMessage('contract-share', booking);
    } else {
      const text = `Official Cricket Ground Agreement #${contract.contractNumber} from ${businessProfile.arenaName} for ${contract.customerName} (${contract.teamName}) scheduled on ${contract.bookingDate}. Total Fee: ${businessProfile.currencySymbol}${(contract.totalAmount ?? 0).toFixed(2)}. Balance Due: ${businessProfile.currencySymbol}${(contract.balanceDue ?? 0).toFixed(2)}.`;
      window.open(`https://wa.me/${contract.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleShare = () => {
    const text = `Contract Agreement #${contract.contractNumber} - ${businessProfile.arenaName}\nTeam: ${contract.teamName} (${contract.customerName})\nDate: ${contract.bookingDate} at ${contract.groundName}\nTotal: ${businessProfile.currencySymbol}${(contract.totalAmount ?? 0).toFixed(2)}`;
    navigator.clipboard.writeText(text);
    alert('Contract details copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-emerald-400">{contract.contractNumber}</span>
            <span className="text-xs text-slate-400">• Arena Fixture Agreement</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Agreement</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send WhatsApp</span>
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Contract Body */}
        <div className="p-8 md:p-10 space-y-6 text-slate-900 bg-white font-sans text-xs">
          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-6 space-y-2">
            <div className="flex justify-center mb-2">
              {businessProfile.logoUrl ? (
                <img src={businessProfile.logoUrl} alt="Logo" className="w-14 h-14 object-contain" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-2xl font-black">
                  🏏
                </div>
              )}
            </div>
            <h2 className="text-xl font-black tracking-tight uppercase text-slate-900">
              {businessProfile.arenaName}
            </h2>
            <p className="text-slate-500 text-xs font-medium">
              CRICKET GROUND FACILITY HIRE & FIXTURE AGREEMENT
            </p>
            <div className="text-[11px] font-mono text-slate-500 flex justify-center gap-4 pt-1">
              <span>Contract Ref: <strong>{contract.contractNumber}</strong></span>
              <span>Date Issued: <strong>{contract.dateGenerated}</strong></span>
            </div>
          </div>

          {/* Party Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">FACILITY PROVIDER</span>
              <span className="font-bold text-sm text-slate-900 block mt-0.5">{businessProfile.arenaName}</span>
              <span className="text-slate-600 block mt-0.5">{businessProfile.address}, {businessProfile.city}</span>
              <span className="text-slate-600 block">Phone: {businessProfile.phone}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">HIRER / TEAM CAPTAIN</span>
              <span className="font-bold text-sm text-slate-900 block mt-0.5">{contract.customerName}</span>
              <span className="font-bold text-emerald-700 block mt-0.5">{contract.teamName}</span>
              <span className="text-slate-600 block">Phone: {contract.customerPhone}</span>
            </div>
          </div>

          {/* Schedule of Reservation & Financial Summary */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 font-bold px-4 py-2 border-b border-slate-200 text-slate-800">
              1. SCHEDULE OF FIXTURE & HIRE CHARGES
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Facility Pitch</span>
                <span className="font-bold text-slate-900">{contract.groundName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Fixture Date</span>
                <span className="font-bold text-slate-900">{contract.bookingDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Match Timings</span>
                <span className="font-bold text-slate-900">{contract.bookingTime}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Total Agreed Fee</span>
                <span className="font-bold text-emerald-700">
                  {businessProfile.currencySymbol}{(contract.totalAmount ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex justify-between text-[11px] font-semibold">
              <span>Advance Paid: {businessProfile.currencySymbol}{(contract.advancePaid ?? 0).toFixed(2)}</span>
              <span className={(contract.balanceDue ?? 0) > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                Balance Due Prior to Match Start: {businessProfile.currencySymbol}{(contract.balanceDue ?? 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Rules and Regulations */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              2. GROUND CODE OF CONDUCT & PITCH REGULATIONS
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 leading-relaxed">
              {contract.rulesAndRegulations.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ol>
          </div>

          {/* Cancellation Policy */}
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              3. CANCELLATION & WEATHER / WASHOUT POLICY
            </h4>
            <p className="text-slate-600 leading-relaxed">{contract.cancellationPolicy}</p>
          </div>

          {/* Damage Liability */}
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              4. DAMAGE INDEMNITY & EQUIPMENT REPLACEMENT
            </h4>
            <p className="text-slate-600 leading-relaxed">{contract.damageLiabilityTerms}</p>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center">
            <div className="space-y-4">
              <div className="h-12 flex items-end justify-center">
                <span className="font-serif italic text-sm text-slate-800">
                  {contract.signedByCustomer || contract.customerName}
                </span>
              </div>
              <div className="border-t border-slate-400 pt-1">
                <div className="font-bold text-slate-800">Hirer / Team Captain Signature</div>
                <div className="text-[10px] text-slate-500">I agree to the above terms and arena regulations</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-12 flex items-end justify-center">
                <span className="font-serif italic text-sm text-emerald-800 font-semibold">
                  {contract.arenaRepresentative}
                </span>
              </div>
              <div className="border-t border-slate-400 pt-1">
                <div className="font-bold text-slate-800">Authorized Arena Representative</div>
                <div className="text-[10px] text-slate-500">Apex Cricket Arena Administration Seal</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
