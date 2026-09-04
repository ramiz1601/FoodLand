import React, { useRef } from 'react';
import { useArena } from '../context/ArenaContext';
import { Receipt, Booking } from '../types';
import {
  Printer,
  Download,
  Share2,
  MessageSquare,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface ReceiptModalProps {
  receipt: Receipt | null;
  booking?: Booking;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, booking, onClose }) => {
  const { businessProfile, sendWhatsAppMessage } = useArena();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    if (booking) {
      sendWhatsAppMessage('receipt-share', booking);
    } else {
      const waUrl = `https://wa.me/${receipt.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        `Hello ${receipt.customerName}, here is your official receipt #${receipt.receiptNumber} from ${businessProfile.arenaName} for ${receipt.bookingDate}. Total: ${businessProfile.currencySymbol}${(receipt.totalAmount ?? 0).toFixed(2)}, Balance: ${businessProfile.currencySymbol}${(receipt.remainingBalance ?? 0).toFixed(2)}.`
      )}`;
      window.open(waUrl, '_blank');
    }
  };

  const handleShare = async () => {
    const text = `Receipt #${receipt.receiptNumber} - ${businessProfile.arenaName}\nCustomer: ${receipt.customerName} (${receipt.teamName})\nDate: ${receipt.bookingDate}\nTotal: ${businessProfile.currencySymbol}${(receipt.totalAmount ?? 0).toFixed(2)}\nPaid: ${businessProfile.currencySymbol}${(receipt.amountPaid ?? 0).toFixed(2)}\nStatus: ${receipt.paymentStatus.toUpperCase()}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt ${receipt.receiptNumber}`,
          text
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(text);
        alert('Receipt summary copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Receipt summary copied to clipboard!');
    }
  };

  const statusColors = {
    paid: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300',
    'partially-paid': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300',
    unpaid: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300',
    refunded: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-emerald-400">{receipt.receiptNumber}</span>
            <span className="text-xs text-slate-400">• Official Receipt</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share on WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Copy Summary"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Container */}
        <div ref={receiptRef} className="p-6 md:p-8 space-y-6 text-slate-900 bg-white font-sans text-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-3">
              {businessProfile.logoUrl ? (
                <img
                  src={businessProfile.logoUrl}
                  alt="Arena Logo"
                  className="w-16 h-16 rounded-xl object-contain border border-slate-200"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-3xl font-black shadow-sm">
                  🏏
                </div>
              )}
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 leading-tight">
                  {businessProfile.arenaName}
                </h2>
                <p className="text-xs text-slate-500 max-w-sm mt-0.5">{businessProfile.address}, {businessProfile.city}</p>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-3">
                  <span>Tel: {businessProfile.phone}</span>
                  <span>WhatsApp: {businessProfile.whatsappNumber}</span>
                  <span>Tax Reg: {businessProfile.taxRegistrationNumber}</span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">OFFICIAL RECEIPT</div>
              <div className="text-lg font-mono font-black text-emerald-800 mt-0.5">{receipt.receiptNumber}</div>
              <div className="text-xs text-slate-500 mt-1">Date: <strong>{receipt.dateIssued}</strong></div>
              <div className="mt-2">
                <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusColors[receipt.paymentStatus]}`}>
                  {receipt.paymentStatus.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Booking Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">BILLED TO</div>
              <div className="font-bold text-slate-900 text-sm">{receipt.customerName}</div>
              <div className="font-semibold text-emerald-700">{receipt.teamName}</div>
              <div className="text-slate-600 mt-0.5">Phone: {receipt.customerPhone}</div>
              {receipt.customerEmail && <div className="text-slate-600">Email: {receipt.customerEmail}</div>}
            </div>

            <div>
              <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">FIXTURE DETAILS</div>
              <div className="font-semibold text-slate-900">Ground: <span className="font-bold">{receipt.groundName}</span></div>
              <div className="text-slate-600 mt-0.5">Booking Type: <strong>{receipt.bookingType}</strong></div>
              <div className="text-slate-600">Date: <strong>{receipt.bookingDate}</strong></div>
              <div className="text-slate-600">Time: <strong>{receipt.bookingTime}</strong></div>
            </div>
          </div>

          {/* Pricing Itemized Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Item / Description</th>
                  <th className="py-2.5 px-4 text-center">Duration / Qty</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2.5 px-4 font-medium">Ground Pitch Reservation ({receipt.groundName})</td>
                  <td className="py-2.5 px-4 text-center">{receipt.duration}</td>
                  <td className="py-2.5 px-4 text-right font-semibold">
                    {businessProfile.currencySymbol}{(receipt.baseFee ?? 0).toFixed(2)}
                  </td>
                </tr>

                {(receipt.floodlightCharges ?? 0) > 0 && (
                  <tr>
                    <td className="py-2 px-4 text-slate-600">Night High-Mast LED Floodlights</td>
                    <td className="py-2 px-4 text-center">Session</td>
                    <td className="py-2 px-4 text-right font-semibold">
                      {businessProfile.currencySymbol}{(receipt.floodlightCharges ?? 0).toFixed(2)}
                    </td>
                  </tr>
                )}

                {(receipt.equipmentCharges ?? 0) > 0 && (
                  <tr>
                    <td className="py-2 px-4 text-slate-600">Equipment Rental / Match Balls / Bowling Machine</td>
                    <td className="py-2 px-4 text-center">Addon</td>
                    <td className="py-2 px-4 text-right font-semibold">
                      {businessProfile.currencySymbol}{(receipt.equipmentCharges ?? 0).toFixed(2)}
                    </td>
                  </tr>
                )}

                {(receipt.additionalCharges ?? 0) > 0 && (
                  <tr>
                    <td className="py-2 px-4 text-slate-600">Additional Services & Facilities</td>
                    <td className="py-2 px-4 text-center">Service</td>
                    <td className="py-2 px-4 text-right font-semibold">
                      {businessProfile.currencySymbol}{(receipt.additionalCharges ?? 0).toFixed(2)}
                    </td>
                  </tr>
                )}

                {(receipt.discount ?? 0) > 0 && (
                  <tr className="text-emerald-700">
                    <td className="py-2 px-4">Special Promotional Discount</td>
                    <td className="py-2 px-4 text-center">-</td>
                    <td className="py-2 px-4 text-right font-semibold">
                      -{businessProfile.currencySymbol}{(receipt.discount ?? 0).toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Grand Total:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {businessProfile.currencySymbol}{(receipt.totalAmount ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-800">
                <span className="font-medium">Amount Received:</span>
                <span className="font-bold">
                  {businessProfile.currencySymbol}{(receipt.amountPaid ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 font-bold text-sm">
                <span className={(receipt.remainingBalance ?? 0) > 0 ? 'text-rose-600' : 'text-slate-700'}>
                  Balance Due:
                </span>
                <span className={(receipt.remainingBalance ?? 0) > 0 ? 'text-rose-600' : 'text-slate-700'}>
                  {businessProfile.currencySymbol}{(receipt.remainingBalance ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>Payment Mode:</span>
                <span className="capitalize font-semibold">{receipt.paymentMethod.replace('-', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Terms and Signature Footer */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end text-xs">
            <div className="text-[11px] text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">TERMS & NOTES</span>
              <p className="leading-relaxed">{receipt.terms}</p>
              <p className="text-[10px] text-slate-400">Generated automatically by {businessProfile.arenaName} Management Software.</p>
            </div>

            <div className="text-right sm:text-right space-y-3">
              <div className="inline-block border-b-2 border-slate-400 pb-1 w-44 text-center font-serif text-slate-800 italic">
                {receipt.authorizedSignatory}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Authorized Signatory / Arena Seal
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
