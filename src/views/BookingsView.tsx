import React, { useState } from 'react';
import { useArena } from '../context/ArenaContext';
import { Booking, BookingStatus } from '../types';
import {
  Search,
  Filter,
  CalendarPlus,
  Receipt,
  FileText,
  DollarSign,
  MessageSquare,
  Edit2,
  Trash2,
  Ban,
  CheckCircle,
  Clock,
  ArrowUpDown,
  MoreVertical,
  ChevronDown,
  Phone,
  Eye,
  ShieldAlert
} from 'lucide-react';
import { CreateBookingModal } from './CreateBookingModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { ContractModal } from '../components/ContractModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';

export const BookingsView: React.FC = () => {
  const {
    bookings,
    grounds,
    businessProfile,
    setIsCreateBookingOpen,
    generateReceipt,
    generateContract,
    sendWhatsAppMessage,
    cancelBooking,
    deleteBooking,
    requirePin
  } = useArena();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [groundFilter, setGroundFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Modals & Active items
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [viewingReceiptBooking, setViewingReceiptBooking] = useState<Booking | null>(null);
  const [viewingContractBooking, setViewingContractBooking] = useState<Booking | null>(null);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);

  // Cancellation prompt modal state
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Filtering
  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerPhone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesGround = groundFilter === 'all' || b.groundId === groundFilter;
    const matchesDate = !dateFilter || b.date === dateFilter;

    return matchesSearch && matchesStatus && matchesGround && matchesDate;
  });

  const handleCancelBooking = (booking: Booking) => {
    setCancelModalBooking(booking);
    setCancelReason('');
  };

  const confirmCancel = () => {
    if (!cancelModalBooking) return;
    requirePin(
      'Cancel Booking',
      `Cancel fixture #${cancelModalBooking.bookingCode} for ${cancelModalBooking.customerName}`,
      () => {
        cancelBooking(cancelModalBooking.id, cancelReason || 'Cancelled by customer');
        setCancelModalBooking(null);
      }
    );
  };

  const handleDeleteBooking = (booking: Booking) => {
    requirePin(
      'Delete Booking Permanently',
      `Irreversible deletion of booking #${booking.bookingCode}`,
      () => {
        deleteBooking(booking.id);
      }
    );
  };

  const statusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'completed':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      case 'pending':
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & New Booking */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            Bookings & Match Fixtures
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage reservations, team fixtures, smart pricing, and player receipts
          </p>
        </div>

        <button
          onClick={() => setIsCreateBookingOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>New Cricket Booking</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search booking code, team, captain name, phone..."
            className="w-full py-2 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 outline-none w-full md:w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Ground filter */}
        <select
          value={groundFilter}
          onChange={e => setGroundFilter(e.target.value)}
          className="py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 outline-none w-full md:w-auto"
        >
          <option value="all">All Pitches / Nets</option>
          {grounds.map(g => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        {/* Date filter */}
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 outline-none w-full md:w-auto"
        />

        {(searchTerm || statusFilter !== 'all' || groundFilter !== 'all' || dateFilter) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setGroundFilter('all');
              setDateFilter('');
            }}
            className="text-xs text-rose-500 hover:underline px-2 whitespace-nowrap"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Booking Code</th>
                <th className="py-3.5 px-4">Customer & Team</th>
                <th className="py-3.5 px-4">Pitch Facility</th>
                <th className="py-3.5 px-4">Date & Slot</th>
                <th className="py-3.5 px-4">Pricing</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No bookings found matching your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map(b => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Booking Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {b.bookingCode}
                    </td>

                    {/* Customer & Team */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{b.customerName}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">{b.teamName}</div>
                      <div className="text-[10px] text-slate-400">📞 {b.customerPhone}</div>
                    </td>

                    {/* Pitch */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{b.groundName}</div>
                      <div className="text-[10px] text-slate-500">{b.bookingTypeName}</div>
                    </td>

                    {/* Date & Slot */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 dark:text-white">{b.date}</div>
                      <div className="text-[11px] text-slate-500">
                        {b.startTime} - {b.endTime} ({b.durationHours}h)
                      </div>
                      {b.isNightSession && (
                        <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                          Floodlights ON
                        </span>
                      )}
                    </td>

                    {/* Pricing */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {businessProfile.currencySymbol}{(b.totalAmount ?? 0).toFixed(2)}
                      </div>
                      {(b.discount || 0) > 0 && (
                        <div className="text-[10px] text-emerald-600">
                          -{businessProfile.currencySymbol}{b.discount} disc
                        </div>
                      )}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {businessProfile.currencySymbol}{(b.amountPaid ?? 0).toFixed(2)}
                        </span>
                        {(b.remainingBalance ?? 0) > 0 && (
                          <span className="text-[10px] text-rose-600 font-bold">
                            (Due {businessProfile.currencySymbol}{(b.remainingBalance ?? 0).toFixed(0)})
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 uppercase tracking-wider ${
                          b.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : b.paymentStatus === 'partially-paid'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {b.paymentStatus.replace('-', ' ')}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusBadge(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Receipt action */}
                        <button
                          onClick={() => setViewingReceiptBooking(b)}
                          title="Generate / View Official Receipt"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>

                        {/* Contract Agreement action */}
                        <button
                          onClick={() => setViewingContractBooking(b)}
                          title="Generate Arena Agreement / Contract"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* WhatsApp reminder */}
                        <button
                          onClick={() => sendWhatsAppMessage('booking-confirmation', b)}
                          title="Send Booking Details via WhatsApp"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        {/* Record Payment (if remaining balance > 0) */}
                        {b.remainingBalance > 0 && (
                          <button
                            onClick={() => setPayingBookingId(b.id)}
                            title="Record Payment"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors font-bold"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          onClick={() => setEditingBooking(b)}
                          title="Edit Booking"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Cancel */}
                        {b.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelBooking(b)}
                            title="Cancel Booking"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteBooking(b)}
                          title="Delete Booking (Admin PIN)"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Edit Booking Modal */}
      {editingBooking && (
        <CreateBookingModal
          isOpen={true}
          onClose={() => setEditingBooking(null)}
          editBooking={editingBooking}
        />
      )}

      {/* Receipt Modal */}
      {viewingReceiptBooking && (
        <ReceiptModal
          receipt={generateReceipt(viewingReceiptBooking)}
          booking={viewingReceiptBooking}
          onClose={() => setViewingReceiptBooking(null)}
        />
      )}

      {/* Contract Modal */}
      {viewingContractBooking && (
        <ContractModal
          contract={generateContract(viewingContractBooking)}
          booking={viewingContractBooking}
          onClose={() => setViewingContractBooking(null)}
        />
      )}

      {/* Record Payment Modal */}
      {payingBookingId && (
        <RecordPaymentModal
          isOpen={true}
          onClose={() => setPayingBookingId(null)}
          preselectedBookingId={payingBookingId}
        />
      )}

      {/* Cancellation Reason Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Cancel Booking</h3>
                <p className="text-xs text-slate-500">
                  {cancelModalBooking.bookingCode} — {cancelModalBooking.customerName}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Reason for Cancellation (Weather, Customer Request, etc.)
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="e.g. Heavy rain washout / Customer rescheduled"
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
