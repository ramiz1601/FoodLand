import {
  Booking,
  Customer,
  Ground,
  BookingTypeConfig,
  Expense,
  Receipt,
  Contract,
  BusinessProfile,
  SecuritySettings,
  WhatsAppTemplate,
  AuditLog,
  ArenaNotification,
  PricingRuleConfig,
  PaymentTransaction
} from '../types';

export const defaultBusinessProfile: BusinessProfile = {
  arenaName: "Cricket Arena",
  tagline: "Premier Cricket Ground, Turf Pitch & Floodlit Arena",
  logoUrl: "", // Dynamic cricket crest if empty, or uploaded logo
  phone: "+92 300 1234567",
  whatsappNumber: "+92 300 1234567",
  email: "info@cricketarena.pk",
  address: "Main Sports Complex Boulevard",
  city: "Lahore",
  website: "https://cricketarena.pk",
  businessDescription: "Professional cricket stadium featuring championship-grade turf pitch, broadcast-standard LED floodlights, digital scoreboard, and player pavilion.",
  receiptFooterText: "Thank you for booking Cricket Arena. Standard cricket gear and safety guidelines apply.",
  currencySymbol: "Rs.",
  currencyCode: "PKR",
  taxRatePercent: 0,
  taxRegistrationNumber: "NTN-PKR-782190"
};

export const defaultSecuritySettings: SecuritySettings = {
  adminPin: "1234",
  requirePinForActions: false, // Disabled by default as requested: "don't ask for pin every time"
  pinLockoutMinutes: 5,
  lastPinChangedAt: new Date().toISOString()
};

export const defaultPricingRules: PricingRuleConfig = {
  weekendSurchargePercent: 15,
  peakHourSurchargePercent: 10,
  nightFloodlightRatePerHour: 1500,
  holidaySurchargePercent: 20,
  defaultTaxPercent: 0,
  peakStartHour: 18,
  peakEndHour: 23
};

// ONLY ONE GROUND AS REQUESTED: "there's only on ground."
export const defaultGrounds: Ground[] = [
  {
    id: "ground-main",
    name: "Main Cricket Ground",
    type: "main-ground",
    description: "Full size championship cricket stadium with professional natural turf wicket, 65m boundary, sight screens, and high-mast LED floodlights.",
    capacity: 22,
    pitchType: "natural-turf",
    hourlyRate: 5000,
    dayRate: 35000,
    nightRate: 6500,
    weekendRate: 6000,
    floodlightRatePerHour: 1500,
    hasFloodlights: true,
    status: "available",
    features: ["Full Boundary", "Turf Pitch", "LED Floodlights", "Dugouts & Pavilion", "Sight Screens", "Digital Scoreboard"]
  }
];

export const defaultBookingTypes: BookingTypeConfig[] = [
  {
    id: "bt-match",
    name: "Cricket Match (T20 / T10)",
    color: "#10b981", // emerald
    description: "Standard or competitive full cricket match with umpire setup",
    baseMultiplier: 1.0
  },
  {
    id: "bt-nets",
    name: "Cricket Nets & Batting Practice",
    color: "#3b82f6", // blue
    description: "Batting and bowling practice on pitch",
    baseMultiplier: 1.0
  },
  {
    id: "bt-practice",
    name: "Team Practice Session",
    color: "#8b5cf6", // purple
    description: "Fielding drills, match simulations and tactical training",
    baseMultiplier: 1.0
  },
  {
    id: "bt-tournament",
    name: "Tournament / League Fixture",
    color: "#f59e0b", // amber
    description: "Multi-hour competitive championship tournament match",
    baseMultiplier: 1.2
  },
  {
    id: "bt-corporate",
    name: "Corporate Cricket Event",
    color: "#ec4899", // pink
    description: "Corporate company sports day with pavilion setup",
    baseMultiplier: 1.25
  },
  {
    id: "bt-box",
    name: "Box / Tape Ball Cricket",
    color: "#f97316", // orange
    description: "Tape-ball cricket fixture or tournament",
    baseMultiplier: 1.0
  }
];

// Clean zero mock data - Live database mode
export const defaultCustomers: Customer[] = [];
export const defaultBookings: Booking[] = [];
export const defaultTransactions: PaymentTransaction[] = [];
export const defaultExpenses: Expense[] = [];
export const defaultReceipts: Receipt[] = [];
export const defaultContracts: Contract[] = [];

export const defaultWhatsAppTemplates: WhatsAppTemplate[] = [
  {
    id: "wa-tmpl-1",
    name: "Booking Confirmation",
    type: "booking-confirmation",
    message: "🏏 *CRICKET ARENA BOOKING CONFIRMATION*\n\nHello *{customer_name}* ({team_name}),\nYour booking at *{arena_name}* is confirmed!\n\n📅 *Date:* {date}\n⏰ *Time:* {start_time} - {end_time} ({duration})\n🏟️ *Facility:* {ground_name}\n🎯 *Type:* {booking_type}\n\n💰 *Total:* {currency}{total_amount}\n✅ *Paid:* {currency}{amount_paid}\n⏳ *Balance Due:* {currency}{remaining_balance}\n\n📍 Location: {arena_address}\n📞 Inquiries: {arena_phone}\n\nPlease arrive 15 minutes before your scheduled slot. Play hard and play fair!"
  },
  {
    id: "wa-tmpl-2",
    name: "Match Day Reminder",
    type: "reminder-24h",
    message: "🏏 *MATCH REMINDER: TOMORROW*\n\nHello *{customer_name}*,\nFriendly reminder for your upcoming cricket match at *{arena_name}* tomorrow!\n\n📅 *Date:* {date}\n⏰ *Start:* {start_time}\n🏟️ *Ground:* {ground_name}\n\nPlease ensure players carry proper sports footwear. Best of luck for your match!"
  },
  {
    id: "wa-tmpl-3",
    name: "Payment Due Reminder",
    type: "payment-due",
    message: "⚠️ *PAYMENT BALANCE DUE*\n\nDear *{customer_name}* ({team_name}),\nRegarding your booking *{booking_code}* at *{arena_name}* on *{date}*:\n\n💵 Outstanding Balance: *{currency}{remaining_balance}*\n\nPlease clear the balance prior to start of play via cash, card, or online transfer.\n\nThank you for your cooperation!"
  },
  {
    id: "wa-tmpl-4",
    name: "Receipt Share",
    type: "receipt-share",
    message: "🧾 *OFFICIAL BOOKING RECEIPT*\n\nReceipt No: *{receipt_number}*\nCustomer: *{customer_name}*\nArena: *{arena_name}*\n\n📅 Date: {date}\n🏟️ Facility: {ground_name}\n💰 Total: {currency}{total_amount}\n✅ Paid: {currency}{amount_paid}\n\nThank you for your business! We look forward to hosting your match."
  },
  {
    id: "wa-tmpl-5",
    name: "Contract & Agreement Share",
    type: "contract-share",
    message: "📋 *MATCH & TOURNAMENT CONTRACT AGREEMENT*\n\nAgreement No: *{contract_number}*\nArena: *{arena_name}*\nTeam: *{team_name}*\n\nYour match fixture agreement has been generated for *{date}* at *{ground_name}*. Please review arena guidelines and pitch rules. See you on the pitch!"
  }
];

export const defaultAuditLogs: AuditLog[] = [];
export const defaultNotifications: ArenaNotification[] = [];
