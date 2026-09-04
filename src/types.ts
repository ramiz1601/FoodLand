export type BookingStatus = 'confirmed' | 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'partially-paid' | 'unpaid' | 'refunded';
export type PaymentMethod = 'cash' | 'bank-transfer' | 'card' | 'online' | 'other';
export type FacilityType = 'main-ground' | 'practice-ground' | 'cricket-net' | 'indoor-box' | 'pavilion';
export type FacilityStatus = 'available' | 'maintenance' | 'closed';
export type GroundStatus = FacilityStatus;

export type PitchType = 'natural-turf' | 'astro-turf' | 'matting' | 'cement' | 'indoor-synthetic';

export interface Ground {
  id: string;
  name: string;
  type: FacilityType;
  description: string;
  capacity: number;
  pitchType: PitchType;
  hourlyRate: number;
  dayRate: number;
  nightRate: number; // Includes floodlights
  weekendRate: number;
  floodlightRatePerHour: number;
  hasFloodlights?: boolean;
  status: FacilityStatus;
  features: string[];
}

export interface BookingTypeConfig {
  id: string;
  name: string;
  color: string;
  description: string;
  baseMultiplier: number;
}

export interface Customer {
  id: string;
  name: string;
  teamName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address?: string;
  notes?: string;
  totalBookings?: number;
  totalSpent?: number;
  outstandingBalance?: number;
  createdAt: string;
}

export interface EquipmentAddon {
  id: string;
  name: string;
  price: number;
  selected?: boolean;
}

export interface Booking {
  id: string;
  bookingCode: string; // e.g., CRA-BKG-1082
  customerId: string;
  customerName: string;
  teamName: string;
  customerPhone: string;
  customerWhatsapp: string;
  customerEmail: string;
  groundId: string;
  groundName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationHours: number;
  bookingTypeId: string;
  bookingTypeName: string;
  isNightSession: boolean;
  useFloodlights: boolean;
  numberOfPlayers: number;
  notes?: string;
  
  // Pricing breakdown
  baseRate: number;
  floodlightCharges: number;
  equipmentCharges: number;
  additionalServicesCharges: number;
  discount: number;
  taxAmount: number;
  totalAmount: number;
  
  // Payment
  amountPaid: number;
  remainingBalance: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  
  // Linked docs
  receiptId?: string;
  receiptNumber?: string;
  contractId?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'electricity'
  | 'ground-maintenance'
  | 'floodlights'
  | 'staff-salaries'
  | 'cleaning'
  | 'equipment'
  | 'rent'
  | 'repairs'
  | 'marketing'
  | 'internet'
  | 'water'
  | 'security'
  | 'pitch-materials'
  | 'other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  vendor: string;
  description: string;
  referenceNumber?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string; // e.g. CRA-2026-0001
  bookingId: string;
  dateIssued: string;
  customerName: string;
  teamName: string;
  customerPhone: string;
  customerEmail: string;
  bookingDate: string;
  bookingTime: string;
  duration: string;
  groundName: string;
  bookingType: string;
  baseFee: number;
  floodlightCharges: number;
  equipmentCharges: number;
  additionalCharges: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  terms: string;
  authorizedSignatory: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  contractNumber: string; // e.g. CRA-CNT-2026-001
  bookingId: string;
  dateGenerated: string;
  customerName: string;
  teamName: string;
  customerPhone: string;
  groundName: string;
  bookingDate: string;
  bookingTime: string;
  totalAmount: number;
  advancePaid: number;
  balanceDue: number;
  rulesAndRegulations: string[];
  cancellationPolicy: string;
  damageLiabilityTerms: string;
  arenaRepresentative: string;
  status: 'draft' | 'active' | 'signed' | 'completed' | 'cancelled';
  signedByCustomer?: string;
  signedAt?: string;
  createdAt: string;
}

export interface BusinessProfile {
  arenaName: string;
  tagline: string;
  logoUrl: string; // can be base64 data url or image path
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  city: string;
  website: string;
  businessDescription: string;
  receiptFooterText: string;
  currencySymbol: string;
  currencyCode: string;
  taxRatePercent: number;
  taxRegistrationNumber: string;
}

export interface SecuritySettings {
  adminPin: string; // 4-6 digits hash or PIN
  requirePinForActions: boolean;
  pinLockoutMinutes: number;
  lastPinChangedAt: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  type: 'booking-confirmation' | 'reminder-24h' | 'reminder-2h' | 'payment-due' | 'receipt-share' | 'contract-share' | 'custom';
  message: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actionType: 'create' | 'edit' | 'delete' | 'cancel' | 'payment' | 'security' | 'settings';
  description: string;
  performedBy: string;
  targetRecordId?: string;
  targetRecordType?: string;
  timestamp: string;
}

export interface ArenaNotification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'system' | 'reminder' | 'warning';
  timestamp: string;
  read: boolean;
  linkAction?: {
    tab: string;
    targetId?: string;
  };
}

export interface PricingRuleConfig {
  weekendSurchargePercent: number;
  peakHourSurchargePercent: number;
  nightFloodlightRatePerHour: number;
  holidaySurchargePercent: number;
  defaultTaxPercent: number;
  peakStartHour: number; // e.g. 18 for 6 PM
  peakEndHour: number; // e.g. 23 for 11 PM
}
