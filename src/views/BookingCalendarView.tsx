import React, { useState } from 'react';
import { useArena } from '../context/ArenaContext';
import { Booking } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Clock,
  Building2,
  Users,
  AlertCircle,
  Receipt,
  FileText,
  MessageSquare
} from 'lucide-react';
import { CreateBookingModal } from './CreateBookingModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { ContractModal } from '../components/ContractModal';

export const BookingCalendarView: React.FC = () => {
  const { grounds, bookings, businessProfile, generateReceipt, generateContract, sendWhatsAppMessage } = useArena();

  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedGroundFilter, setSelectedGroundFilter] = useState<string>('all');
  const [calendarMode, setCalendarMode] = useState<'day' | 'week'>('day');

  // New booking creation triggered from clicking a slot
  const [isSlotBookingOpen, setIsSlotBookingOpen] = useState(false);
  const [slotDate, setSlotDate] = useState<string>('');
  const [slotGroundId, setSlotGroundId] = useState<string>('');

  // Selected booking modal preview
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [showReceipt, setShowReceipt] = useState<Booking | null>(null);
  const [showContract, setShowContract] = useState<Booking | null>(null);

  // Time grid hours: 06:00 to 23:00
  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (calendarMode === 'day') {
      d.setDate(d.getDate() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (calendarMode === 'day') {
      d.setDate(d.getDate() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  const activeGrounds = selectedGroundFilter === 'all'
    ? grounds
    : grounds.filter(g => g.id === selectedGroundFilter);

  // Day Bookings
  const dayBookings = bookings.filter(b => b.date === currentDate && b.status !== 'cancelled');

  const handleSlotClick = (groundId: string, hour: number) => {
    setSlotDate(currentDate);
    setSlotGroundId(groundId);
    setIsSlotBookingOpen(true);
  };

  const statusColorClasses = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-600/90 text-white border-emerald-500 hover:bg-emerald-600';
      case 'in-progress':
        return 'bg-blue-600/90 text-white border-blue-500 hover:bg-blue-600';
      case 'completed':
        return 'bg-slate-700/90 text-white border-slate-600 hover:bg-slate-700';
      default:
        return 'bg-amber-600/90 text-white border-amber-500 hover:bg-amber-600';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Calendar Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-emerald-600" />
            <span>Arena Booking Calendar</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time visual schedule, pitch slot allocation & instant booking
          </p>
        </div>

        {/* Date & Mode Navigation */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 shadow-xs">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <input
            type="date"
            value={currentDate}
            onChange={e => setCurrentDate(e.target.value)}
            className="py-1.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none shadow-xs"
          />

          {/* Ground Filter (only if multiple grounds exist) */}
          {grounds.length > 1 && (
            <select
              value={selectedGroundFilter}
              onChange={e => setSelectedGroundFilter(e.target.value)}
              className="py-1.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none shadow-xs"
            >
              <option value="all">All Pitches</option>
              {grounds.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Interactive Day Grid with Pitch Swimlanes */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Pitch Columns Header */}
        <div className="grid grid-cols-[80px_repeat(auto-fit,minmax(220px,1fr))] border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
          <div className="p-3.5 text-center font-bold text-[11px] text-slate-400 border-r border-slate-200 dark:border-slate-800">
            TIME
          </div>
          {activeGrounds.map(ground => (
            <div
              key={ground.id}
              className="p-3.5 border-r last:border-r-0 border-slate-200 dark:border-slate-800 text-center"
            >
              <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                {ground.name}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                {ground.pitchType.replace('-', ' ')} • {businessProfile.currencySymbol}{ground.hourlyRate}/h
              </div>
            </div>
          ))}
        </div>

        {/* Time Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {hours.map(hour => {
            const timeFormatted = `${hour.toString().padStart(2, '0')}:00`;
            const nextHourFormatted = `${(hour + 1).toString().padStart(2, '0')}:00`;

            return (
              <div
                key={hour}
                className="grid grid-cols-[80px_repeat(auto-fit,minmax(220px,1fr))] min-h-[64px]"
              >
                {/* Time Label */}
                <div className="p-2.5 text-center text-xs font-mono font-bold text-slate-400 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-center">
                  {timeFormatted}
                </div>

                {/* Pitch Slots */}
                {activeGrounds.map(ground => {
                  // Find if any booking overlaps with this slot
                  const bookingForSlot = dayBookings.find(b => {
                    if (b.groundId !== ground.id) return false;
                    const startH = parseInt(b.startTime.split(':')[0], 10);
                    const endH = parseInt(b.endTime.split(':')[0], 10);
                    return hour >= startH && hour < endH;
                  });

                  const isSlotStart = bookingForSlot && parseInt(bookingForSlot.startTime.split(':')[0], 10) === hour;

                  return (
                    <div
                      key={ground.id}
                      className="p-1 border-r last:border-r-0 border-slate-200 dark:border-slate-800 relative hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {bookingForSlot ? (
                        isSlotStart ? (
                          <div
                            onClick={() => setActiveBooking(bookingForSlot)}
                            className={`w-full h-full min-h-[56px] rounded-xl p-2.5 border shadow-sm cursor-pointer transition-transform hover:scale-[1.01] ${statusColorClasses(
                              bookingForSlot.status
                            )}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold opacity-90">
                                {bookingForSlot.bookingCode}
                              </span>
                              <span className="text-[10px] font-semibold opacity-90">
                                {bookingForSlot.startTime} - {bookingForSlot.endTime}
                              </span>
                            </div>
                            <div className="font-bold text-xs mt-0.5 truncate">
                              {bookingForSlot.customerName} ({bookingForSlot.teamName})
                            </div>
                            <div className="text-[10px] opacity-85 mt-0.5 flex items-center justify-between">
                              <span>{bookingForSlot.bookingTypeName}</span>
                              <span className="font-bold">
                                {businessProfile.currencySymbol}{bookingForSlot.totalAmount.toFixed(0)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          // Continuation slot for multi-hour booking
                          <div
                            onClick={() => setActiveBooking(bookingForSlot)}
                            className="w-full h-full min-h-[56px] rounded-lg bg-emerald-500/20 border-dashed border-emerald-500/40 p-2 cursor-pointer flex items-center justify-center text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold"
                          >
                            <span>Fixture In Progress: {bookingForSlot.teamName}</span>
                          </div>
                        )
                      ) : (
                        // Empty slot: clickable to book
                        <button
                          onClick={() => handleSlotClick(ground.id, hour)}
                          className="w-full h-full min-h-[56px] rounded-lg border border-transparent hover:border-emerald-300 dark:hover:border-emerald-700/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-slate-300 dark:text-slate-600 hover:text-emerald-600 flex items-center justify-center gap-1 text-[11px] transition-all group"
                        >
                          <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="opacity-0 group-hover:opacity-100 font-semibold">Reserve Slot</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Quick Detail Drawer/Modal */}
      {activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {activeBooking.bookingCode}
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {activeBooking.customerName} ({activeBooking.teamName})
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {activeBooking.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Ground</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeBooking.groundName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Time Slot</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {activeBooking.startTime} - {activeBooking.endTime} ({activeBooking.durationHours}h)
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Total Fee</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {businessProfile.currencySymbol}{(activeBooking.totalAmount ?? 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Balance Due</span>
                <span className={`font-bold ${(activeBooking.remainingBalance ?? 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {businessProfile.currencySymbol}{(activeBooking.remainingBalance ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => {
                  setShowReceipt(activeBooking);
                  setActiveBooking(null);
                }}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold flex flex-col items-center gap-1 transition-colors"
              >
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Receipt</span>
              </button>

              <button
                onClick={() => {
                  setShowContract(activeBooking);
                  setActiveBooking(null);
                }}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-semibold flex flex-col items-center gap-1 transition-colors"
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Contract</span>
              </button>

              <button
                onClick={() => {
                  sendWhatsAppMessage('booking-confirmation', activeBooking);
                }}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold flex flex-col items-center gap-1 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveBooking(null)}
                className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Booking from slot click */}
      {isSlotBookingOpen && (
        <CreateBookingModal
          isOpen={true}
          onClose={() => setIsSlotBookingOpen(false)}
          initialDate={slotDate}
          initialGroundId={slotGroundId}
        />
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <ReceiptModal
          receipt={generateReceipt(showReceipt)}
          booking={showReceipt}
          onClose={() => setShowReceipt(null)}
        />
      )}

      {/* Contract Modal */}
      {showContract && (
        <ContractModal
          contract={generateContract(showContract)}
          booking={showContract}
          onClose={() => setShowContract(null)}
        />
      )}
    </div>
  );
};
