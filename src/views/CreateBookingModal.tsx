import React, { useState, useEffect } from 'react';
import { useArena } from '../context/ArenaContext';
import { Booking, PaymentMethod, BookingStatus } from '../types';
import {
  CalendarPlus,
  X,
  AlertTriangle,
  User,
  Users,
  Phone,
  Mail,
  Building2,
  Clock,
  Sparkles,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialGroundId?: string;
  editBooking?: Booking | null;
}

export const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  initialGroundId,
  editBooking
}) => {
  const {
    grounds,
    bookingTypes,
    customers,
    pricingRules,
    businessProfile,
    createBooking,
    updateBooking,
    checkDoubleBooking,
    requirePin
  } = useArena();

  // Customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Booking details
  const [groundId, setGroundId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('18:00');
  const [endTime, setEndTime] = useState<string>('21:00');
  const [bookingTypeId, setBookingTypeId] = useState<string>('');
  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(22);
  const [useFloodlights, setUseFloodlights] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  // Add-ons
  const [equipmentBalls, setEquipmentBalls] = useState<boolean>(true);
  const [equipmentMachine, setEquipmentMachine] = useState<boolean>(false);
  const [equipmentGear, setEquipmentGear] = useState<boolean>(false);
  const [additionalServices, setAdditionalServices] = useState<number>(0);
  const [manualDiscount, setManualDiscount] = useState<number>(0);

  // Payment
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('confirmed');

  // Error & Feedback
  const [error, setError] = useState<string>('');
  const [hasConflict, setHasConflict] = useState<boolean>(false);

  // Initialize or reset form
  useEffect(() => {
    if (isOpen) {
      setError('');
      if (editBooking) {
        setSelectedCustomerId(editBooking.customerId);
        setCustomerName(editBooking.customerName);
        setTeamName(editBooking.teamName);
        setCustomerPhone(editBooking.customerPhone);
        setCustomerWhatsapp(editBooking.customerWhatsapp);
        setCustomerEmail(editBooking.customerEmail);

        setGroundId(editBooking.groundId);
        setDate(editBooking.date);
        setStartTime(editBooking.startTime);
        setEndTime(editBooking.endTime);
        setBookingTypeId(editBooking.bookingTypeId);
        setNumberOfPlayers(editBooking.numberOfPlayers || 20);
        setUseFloodlights(editBooking.useFloodlights);
        setNotes(editBooking.notes || '');

        setAdditionalServices(editBooking.additionalServicesCharges || 0);
        setManualDiscount(editBooking.discount || 0);
        setAmountPaid(editBooking.amountPaid);
        setPaymentMethod(editBooking.paymentMethod);
        setBookingStatus(editBooking.status);
      } else {
        // Defaults for new booking
        const todayStr = initialDate || new Date().toISOString().split('T')[0];
        setDate(todayStr);
        setGroundId(initialGroundId || (grounds[0] ? grounds[0].id : ''));
        setBookingTypeId(bookingTypes[0] ? bookingTypes[0].id : '');
        setStartTime('18:00');
        setEndTime('21:00');
        setUseFloodlights(true);
        setNumberOfPlayers(22);
        setManualDiscount(0);
        setAdditionalServices(0);
        setAmountPaid(0);
        setPaymentMethod('cash');
        setBookingStatus('confirmed');
        setNotes('');
        setSelectedCustomerId('');
        setCustomerName('');
        setTeamName('');
        setCustomerPhone('');
        setCustomerWhatsapp('');
        setCustomerEmail('');
      }
    }
  }, [isOpen, editBooking, initialDate, initialGroundId]);

  // When an existing customer is selected from dropdown
  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    const cust = customers.find(c => c.id === id);
    if (cust) {
      setCustomerName(cust.name);
      setTeamName(cust.teamName);
      setCustomerPhone(cust.phone);
      setCustomerWhatsapp(cust.whatsapp || cust.phone);
      setCustomerEmail(cust.email);
    }
  };

  // Duration calculation
  const calculateDurationHours = (): number => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let startMin = startH * 60 + startM;
    let endMin = endH * 60 + endM;
    if (endMin < startMin) {
      endMin += 24 * 60; // Next day midnight spillover
    }
    const diffHours = (endMin - startMin) / 60;
    return Math.max(0.5, diffHours);
  };

  const durationHours = calculateDurationHours();

  // Check double booking live
  useEffect(() => {
    if (groundId && date && startTime && endTime) {
      const conflict = checkDoubleBooking(groundId, date, startTime, endTime, editBooking?.id);
      setHasConflict(conflict);
    }
  }, [groundId, date, startTime, endTime, editBooking]);

  const selectedGround = grounds.find(g => g.id === groundId) || grounds[0];
  const selectedType = bookingTypes.find(t => t.id === bookingTypeId) || bookingTypes[0];

  // Smart pricing calculations
  const isWeekend = (() => {
    if (!date) return false;
    const day = new Date(date).getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  })();

  const isNight = parseInt(startTime.split(':')[0], 10) >= 18 || useFloodlights;

  // Base rate
  const groundHourly = isWeekend ? selectedGround?.weekendRate || selectedGround?.hourlyRate : selectedGround?.hourlyRate || 100;
  const multiplier = selectedType?.baseMultiplier || 1.0;
  const calculatedBaseRate = groundHourly * durationHours * multiplier;

  // Floodlight charges
  const floodlightCharges = useFloodlights
    ? (selectedGround?.floodlightRatePerHour || pricingRules.nightFloodlightRatePerHour || 30) * durationHours
    : 0;

  // Equipment add-ons
  let equipmentCharges = 0;
  if (equipmentBalls) equipmentCharges += 25; // 2 quality cricket balls
  if (equipmentMachine) equipmentCharges += 35; // Bola machine & speed radar
  if (equipmentGear) equipmentCharges += 20; // Full protective gear kit

  const subtotalBeforeDiscount = calculatedBaseRate + floodlightCharges + equipmentCharges + Number(additionalServices);
  const subtotalAfterDiscount = Math.max(0, subtotalBeforeDiscount - Number(manualDiscount));
  const taxAmount = (subtotalAfterDiscount * (businessProfile.taxRatePercent || 5)) / 100;
  const calculatedTotal = Number((subtotalAfterDiscount + taxAmount).toFixed(2));
  const remainingBalance = Math.max(0, Number((calculatedTotal - Number(amountPaid)).toFixed(2)));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setError('Please provide customer / captain name.');
      return;
    }
    if (!customerPhone.trim()) {
      setError('Customer contact phone number is required.');
      return;
    }
    if (!groundId) {
      setError('Please select a cricket facility/pitch.');
      return;
    }
    if (startTime >= endTime) {
      setError('End time must be after start time.');
      return;
    }
    if (hasConflict) {
      setError(`Slot conflict! Ground "${selectedGround?.name}" is already booked on ${date} between ${startTime} and ${endTime}.`);
      return;
    }

    const payload = {
      customerId: selectedCustomerId,
      customerName,
      teamName: teamName || 'Independent XI',
      customerPhone,
      customerWhatsapp: customerWhatsapp || customerPhone,
      customerEmail,
      groundId,
      groundName: selectedGround?.name || 'Cricket Ground',
      date,
      startTime,
      endTime,
      durationHours,
      bookingTypeId,
      bookingTypeName: selectedType?.name || 'Cricket Match',
      isNightSession: isNight,
      useFloodlights,
      numberOfPlayers: Number(numberOfPlayers) || 20,
      notes,
      baseRate: calculatedBaseRate,
      floodlightCharges,
      equipmentCharges,
      additionalServicesCharges: Number(additionalServices),
      discount: Number(manualDiscount),
      taxAmount,
      totalAmount: calculatedTotal,
      amountPaid: Number(amountPaid),
      paymentMethod,
      status: bookingStatus
    };

    const actionDesc = editBooking
      ? `Save modifications to booking ${editBooking.bookingCode}`
      : `Confirm new booking for ${customerName} at ${selectedGround?.name}`;

    requirePin(editBooking ? 'Edit Booking' : 'Create New Booking', actionDesc, () => {
      if (editBooking) {
        const res = updateBooking(editBooking.id, payload);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Failed to update booking');
        }
      } else {
        const res = createBooking(payload);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Failed to create booking');
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <CalendarPlus className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg">
                {editBooking ? `Edit Booking: ${editBooking.bookingCode}` : 'Create Cricket Arena Booking'}
              </h3>
              <p className="text-xs text-emerald-100/90">
                Automatic smart pricing, conflict prevention & receipt generation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {hasConflict && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
              <span>
                <strong>Warning:</strong> Another fixture is already registered for <strong>{selectedGround?.name}</strong> at this selected time. Adjust time or select another facility.
              </span>
            </div>
          )}

          {/* Section 1: Customer Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <User className="w-4 h-4 text-emerald-600" />
                <span>1. Customer & Team Details</span>
              </div>

              {/* Autocomplete Existing Customer */}
              <select
                value={selectedCustomerId}
                onChange={e => handleCustomerSelect(e.target.value)}
                className="py-1 px-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="">-- Choose Existing Team / Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.teamName}) — {c.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Customer / Captain Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Tariq Zaman"
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Team / Club Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="e.g. Shaheen Strikers CC"
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  WhatsApp Number (for reminders)
                </label>
                <input
                  type="tel"
                  value={customerWhatsapp}
                  onChange={e => setCustomerWhatsapp(e.target.value)}
                  placeholder="+15550000000"
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="captain@teamcricket.org"
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Fixture & Ground Specification */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800 pb-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>2. Pitch Facility & Schedule</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Select Ground / Pitch *
                </label>
                <select
                  required
                  value={groundId}
                  onChange={e => setGroundId(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {grounds.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.pitchType.replace('-', ' ')}) — {businessProfile.currencySymbol}{g.hourlyRate}/hr
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Fixture Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Booking Type *
                </label>
                <select
                  value={bookingTypeId}
                  onChange={e => setBookingTypeId(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {bookingTypes.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Calculated Duration
                </label>
                <div className="py-2 px-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl font-bold text-slate-800 dark:text-slate-200">
                  {durationHours} Hours
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Player Count
                </label>
                <input
                  type="number"
                  min="2"
                  max="40"
                  value={numberOfPlayers}
                  onChange={e => setNumberOfPlayers(parseInt(e.target.value, 10) || 22)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            {/* Floodlight & Addons Toggles */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useFloodlights}
                  onChange={e => setUseFloodlights(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  LED Floodlights (+{businessProfile.currencySymbol}{selectedGround?.floodlightRatePerHour}/h)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipmentBalls}
                  onChange={e => setEquipmentBalls(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Match Balls Kit (+{businessProfile.currencySymbol}25)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipmentMachine}
                  onChange={e => setEquipmentMachine(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Bowling Machine (+{businessProfile.currencySymbol}35)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipmentGear}
                  onChange={e => setEquipmentGear(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Pads & Helmets (+{businessProfile.currencySymbol}20)
                </span>
              </label>
            </div>
          </div>

          {/* Section 3: Smart Pricing & Financial Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800 pb-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>3. Smart Financial Calculation & Payment</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left: Additional fees & discount inputs */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Services / Extras ({businessProfile.currencySymbol})
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={additionalServices}
                      onChange={e => setAdditionalServices(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Discount ({businessProfile.currencySymbol})
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={manualDiscount}
                      onChange={e => setManualDiscount(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Payment Received ({businessProfile.currencySymbol})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={calculatedTotal}
                      value={amountPaid}
                      onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)}
                      className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none capitalize"
                    >
                      <option value="cash">Cash</option>
                      <option value="bank-transfer">Bank Transfer</option>
                      <option value="card">Card / POS</option>
                      <option value="online">Online / QR</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Special Notes / Match Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Needs 4 match balls, umpires arriving 15m early..."
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Right: Transparent Calculation Summary Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs pb-1 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span>Pricing Summary</span>
                  {isWeekend && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded font-bold">
                      Weekend Rate
                    </span>
                  )}
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Ground Rate ({durationHours}h × {businessProfile.currencySymbol}{groundHourly || 0}):</span>
                  <span className="font-semibold">{businessProfile.currencySymbol}{(calculatedBaseRate ?? 0).toFixed(2)}</span>
                </div>

                {floodlightCharges > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Night Floodlights:</span>
                    <span className="font-semibold">{businessProfile.currencySymbol}{(floodlightCharges ?? 0).toFixed(2)}</span>
                  </div>
                )}

                {equipmentCharges > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Equipment Add-ons:</span>
                    <span className="font-semibold">{businessProfile.currencySymbol}{(equipmentCharges ?? 0).toFixed(2)}</span>
                  </div>
                )}

                {Number(additionalServices) > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Extra Services:</span>
                    <span className="font-semibold">{businessProfile.currencySymbol}{Number(additionalServices || 0).toFixed(2)}</span>
                  </div>
                )}

                {Number(manualDiscount) > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount:</span>
                    <span className="font-semibold">-{businessProfile.currencySymbol}{Number(manualDiscount || 0).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Tax ({businessProfile.taxRatePercent || 5}%):</span>
                  <span>{businessProfile.currencySymbol}{(taxAmount ?? 0).toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white">
                    <span>TOTAL:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {businessProfile.currencySymbol}{(calculatedTotal ?? 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between font-bold text-xs text-slate-700 dark:text-slate-300">
                    <span>PAID NOW:</span>
                    <span>{businessProfile.currencySymbol}{Number(amountPaid || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-slate-200 dark:border-slate-700">
                    <span className={(remainingBalance ?? 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}>
                      BALANCE DUE:
                    </span>
                    <span className={(remainingBalance ?? 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}>
                      {businessProfile.currencySymbol}{(remainingBalance ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Admin PIN verification required upon submission</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={hasConflict}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/25 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editBooking ? 'Update Booking' : 'Confirm & Generate Receipt'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
