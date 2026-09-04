import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  PaymentTransaction,
  PaymentMethod,
  PaymentStatus,
  BookingStatus
} from '../types';
import {
  defaultBusinessProfile,
  defaultSecuritySettings,
  defaultPricingRules,
  defaultGrounds,
  defaultBookingTypes,
  defaultCustomers,
  defaultBookings,
  defaultTransactions,
  defaultExpenses,
  defaultReceipts,
  defaultContracts,
  defaultWhatsAppTemplates,
  defaultAuditLogs,
  defaultNotifications
} from '../data/initialData';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

interface ArenaContextType {
  // Data State
  businessProfile: BusinessProfile;
  securitySettings: SecuritySettings;
  pricingRules: PricingRuleConfig;
  grounds: Ground[];
  bookingTypes: BookingTypeConfig[];
  customers: Customer[];
  bookings: Booking[];
  transactions: PaymentTransaction[];
  expenses: Expense[];
  receipts: Receipt[];
  contracts: Contract[];
  whatsappTemplates: WhatsAppTemplate[];
  auditLogs: AuditLog[];
  notifications: ArenaNotification[];

  // Database status
  dbConnected: boolean;

  // Navigation & Theme
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedBookingId: string | null;
  setSelectedBookingId: (id: string | null) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;

  // PIN Security Modal
  isPinModalOpen: boolean;
  pinModalTitle: string;
  pinModalDescription: string;
  pinActionPending: (() => void) | null;
  openPinModal: (title: string, description: string, onVerified: () => void) => void;
  closePinModal: () => void;
  verifyPinAction: (pinInput: string) => boolean;
  requirePin: (actionTitle: string, actionDesc: string, onVerified: () => void) => void;
  changeAdminPin: (oldPin: string, newPin: string) => { success: boolean; error?: string };
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;

  // Business & Branding
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => void;
  updatePricingRules: (rules: Partial<PricingRuleConfig>) => void;

  // Booking Actions
  checkDoubleBooking: (groundId: string, date: string, startTime: string, endTime: string, excludeBookingId?: string) => boolean;
  createBooking: (bookingData: any) => { success: boolean; error?: string; booking?: Booking };
  updateBooking: (id: string, updates: Partial<Booking>) => { success: boolean; error?: string };
  cancelBooking: (id: string, reason?: string) => { success: boolean; error?: string };
  deleteBooking: (id: string) => { success: boolean; error?: string };

  // Payment Recording
  recordPayment: (bookingId: string, amount: number, method: PaymentMethod, ref?: string, notes?: string) => { success: boolean; error?: string };

  // Customers
  createCustomer: (data: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => boolean;
  deleteCustomer: (id: string) => boolean;

  // Facilities & Grounds
  createGround: (data: Omit<Ground, 'id'>) => Ground;
  updateGround: (id: string, data: Partial<Ground>) => boolean;
  deleteGround: (id: string) => boolean;

  // Booking Types
  createBookingType: (data: Omit<BookingTypeConfig, 'id'>) => BookingTypeConfig;
  updateBookingType: (id: string, data: Partial<BookingTypeConfig>) => boolean;
  deleteBookingType: (id: string) => boolean;

  // Expenses
  createExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (id: string, data: Partial<Expense>) => boolean;
  deleteExpense: (id: string) => boolean;

  // Receipts & Contracts
  generateReceipt: (bookingId: string) => Receipt;
  generateContract: (bookingId: string) => Contract;
  updateContract: (id: string, updates: Partial<Contract>) => boolean;

  // WhatsApp
  sendWhatsAppMessage: (templateType: WhatsAppTemplate['type'], booking: Booking, customPhone?: string) => string;
  updateWhatsAppTemplate: (id: string, message: string) => void;
  resetWhatsAppTemplates: () => void;

  // Audit Logs & Notifications
  addAuditLog: (action: string, actionType: AuditLog['actionType'], description: string, targetId?: string, targetType?: string) => void;
  clearAuditLogs: () => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Backup & Reset
  exportBackupJson: () => string;
  importBackupJson: (json: string) => { success: boolean; error?: string };
  resetAllData: () => void;

  // Quick Action Modal control
  isCreateBookingOpen: boolean;
  setIsCreateBookingOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'CRICKET_ARENA_DATABASE_V2';

const ArenaContext = createContext<ArenaContextType | undefined>(undefined);

export const ArenaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  // Core State initialized with clean PKR defaults and single ground
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(defaultBusinessProfile);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(defaultSecuritySettings);
  const [pricingRules, setPricingRules] = useState<PricingRuleConfig>(defaultPricingRules);
  const [grounds, setGrounds] = useState<Ground[]>(defaultGrounds);
  const [bookingTypes, setBookingTypes] = useState<BookingTypeConfig[]>(defaultBookingTypes);
  const [customers, setCustomers] = useState<Customer[]>(defaultCustomers);
  const [bookings, setBookings] = useState<Booking[]>(defaultBookings);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(defaultTransactions);
  const [expenses, setExpenses] = useState<Expense[]>(defaultExpenses);
  const [receipts, setReceipts] = useState<Receipt[]>(defaultReceipts);
  const [contracts, setContracts] = useState<Contract[]>(defaultContracts);
  const [whatsappTemplates, setWhatsappTemplates] = useState<WhatsAppTemplate[]>(defaultWhatsAppTemplates);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(defaultAuditLogs);
  const [notifications, setNotifications] = useState<ArenaNotification[]>(defaultNotifications);

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('CRICKET_ARENA_THEME');
    return saved ? saved === 'dark' : false;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [isCreateBookingOpen, setIsCreateBookingOpen] = useState(false);

  // PIN security modal state
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinModalTitle, setPinModalTitle] = useState('Admin Security Verification');
  const [pinModalDescription, setPinModalDescription] = useState('Please enter your 4-digit Admin PIN.');
  const [pinActionPending, setPinActionPending] = useState<(() => void) | null>(null);

  // Initialize and clean out any stale mock data
  useEffect(() => {
    try {
      // Check for old mock storage and clear it
      localStorage.removeItem('CRICKET_ARENA_DATA_V1');

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.businessProfile) {
          setBusinessProfile({
            ...defaultBusinessProfile,
            ...parsed.businessProfile,
            currencySymbol: 'Rs.',
            currencyCode: 'PKR'
          });
        }
        if (parsed.securitySettings) {
          setSecuritySettings({
            ...defaultSecuritySettings,
            ...parsed.securitySettings,
            requirePinForActions: false // Ensure PIN prompt is disabled by default
          });
        }
        if (parsed.pricingRules) setPricingRules(parsed.pricingRules);
        if (parsed.grounds && Array.isArray(parsed.grounds) && parsed.grounds.length > 0) {
          // Force single ground constraint
          setGrounds([parsed.grounds[0]]);
        }
        if (parsed.bookingTypes) setBookingTypes(parsed.bookingTypes);
        if (parsed.customers && Array.isArray(parsed.customers)) setCustomers(parsed.customers);
        if (parsed.bookings && Array.isArray(parsed.bookings)) setBookings(parsed.bookings);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.expenses && Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
        if (parsed.receipts && Array.isArray(parsed.receipts)) setReceipts(parsed.receipts);
        if (parsed.contracts && Array.isArray(parsed.contracts)) setContracts(parsed.contracts);
        if (parsed.whatsappTemplates) setWhatsappTemplates(parsed.whatsappTemplates);
      }
    } catch (e) {
      console.warn('Local cache read note:', e);
    }
    setDataLoaded(true);
  }, []);

  // FIRESTORE LIVE REAL-TIME DATABASE SYNCHRONIZATION
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    try {
      // 1. Bookings collection
      const unsubBookings = onSnapshot(
        collection(db, 'bookings'),
        snapshot => {
          setDbConnected(true);
          const items: Booking[] = [];
          snapshot.forEach(docSnap => {
            const b = docSnap.data() as Booking;
            items.push({
              ...b,
              id: docSnap.id,
              totalAmount: b.totalAmount ?? 0,
              amountPaid: b.amountPaid ?? 0,
              remainingBalance: b.remainingBalance ?? Math.max(0, (b.totalAmount ?? 0) - (b.amountPaid ?? 0))
            });
          });
          items.sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
          setBookings(items);
        },
        err => console.warn('Firestore bookings sync:', err.message)
      );
      unsubs.push(unsubBookings);

      // 2. Customers collection
      const unsubCustomers = onSnapshot(
        collection(db, 'customers'),
        snapshot => {
          const items: Customer[] = [];
          snapshot.forEach(docSnap => {
            items.push({ ...docSnap.data() as Customer, id: docSnap.id });
          });
          setCustomers(items);
        },
        err => console.warn('Firestore customers sync:', err.message)
      );
      unsubs.push(unsubCustomers);

      // 3. Expenses collection
      const unsubExpenses = onSnapshot(
        collection(db, 'expenses'),
        snapshot => {
          const items: Expense[] = [];
          snapshot.forEach(docSnap => {
            const exp = docSnap.data() as Expense;
            items.push({ ...exp, id: docSnap.id, amount: exp.amount ?? 0 });
          });
          items.sort((a, b) => b.date.localeCompare(a.date));
          setExpenses(items);
        },
        err => console.warn('Firestore expenses sync:', err.message)
      );
      unsubs.push(unsubExpenses);

      // 4. Receipts collection
      const unsubReceipts = onSnapshot(
        collection(db, 'receipts'),
        snapshot => {
          const items: Receipt[] = [];
          snapshot.forEach(docSnap => {
            const r = docSnap.data() as Receipt;
            items.push({
              ...r,
              id: docSnap.id,
              totalAmount: r.totalAmount ?? 0,
              amountPaid: r.amountPaid ?? 0,
              remainingBalance: r.remainingBalance ?? 0
            });
          });
          setReceipts(items);
        },
        err => console.warn('Firestore receipts sync:', err.message)
      );
      unsubs.push(unsubReceipts);

      // 5. Contracts collection
      const unsubContracts = onSnapshot(
        collection(db, 'contracts'),
        snapshot => {
          const items: Contract[] = [];
          snapshot.forEach(docSnap => {
            const c = docSnap.data() as Contract;
            items.push({
              ...c,
              id: docSnap.id,
              totalAmount: c.totalAmount ?? 0,
              advancePaid: c.advancePaid ?? 0,
              balanceDue: c.balanceDue ?? 0
            });
          });
          setContracts(items);
        },
        err => console.warn('Firestore contracts sync:', err.message)
      );
      unsubs.push(unsubContracts);

      // 6. Transactions collection
      const unsubTx = onSnapshot(
        collection(db, 'transactions'),
        snapshot => {
          const items: PaymentTransaction[] = [];
          snapshot.forEach(docSnap => {
            items.push({ ...docSnap.data() as PaymentTransaction, id: docSnap.id });
          });
          setTransactions(items);
        },
        err => console.warn('Firestore transactions sync:', err.message)
      );
      unsubs.push(unsubTx);

      // 7. Business Profile setting
      const unsubProfile = onSnapshot(
        doc(db, 'settings', 'businessProfile'),
        docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data() as BusinessProfile;
            setBusinessProfile(prev => ({
              ...prev,
              ...data,
              currencySymbol: 'Rs.',
              currencyCode: 'PKR'
            }));
          } else {
            // First time setup: seed with PKR default
            setDoc(doc(db, 'settings', 'businessProfile'), defaultBusinessProfile).catch(() => {});
          }
        },
        err => console.warn('Firestore profile sync:', err.message)
      );
      unsubs.push(unsubProfile);

      // 8. Security Settings setting
      const unsubSecurity = onSnapshot(
        doc(db, 'settings', 'securitySettings'),
        docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data() as SecuritySettings;
            setSecuritySettings(prev => ({
              ...prev,
              ...data,
              requirePinForActions: data.requirePinForActions ?? false
            }));
          } else {
            setDoc(doc(db, 'settings', 'securitySettings'), defaultSecuritySettings).catch(() => {});
          }
        },
        err => console.warn('Firestore security sync:', err.message)
      );
      unsubs.push(unsubSecurity);

      // 9. Single Ground setting
      const unsubGrounds = onSnapshot(
        doc(db, 'settings', 'grounds'),
        docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
              setGrounds([data.items[0]]); // Enforce single ground
            }
          } else {
            setDoc(doc(db, 'settings', 'grounds'), { items: defaultGrounds }).catch(() => {});
          }
        },
        err => console.warn('Firestore grounds sync:', err.message)
      );
      unsubs.push(unsubGrounds);
    } catch (err) {
      console.warn('Error setting up Firestore listeners:', err);
    }

    return () => {
      unsubs.forEach(unsub => {
        try {
          unsub();
        } catch (_) {}
      });
    };
  }, []);

  // Save state to LocalStorage cache as well
  useEffect(() => {
    if (!dataLoaded) return;
    try {
      const payload = {
        businessProfile,
        securitySettings,
        pricingRules,
        grounds,
        bookingTypes,
        customers,
        bookings,
        transactions,
        expenses,
        receipts,
        contracts,
        whatsappTemplates,
        auditLogs,
        notifications
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Local save warning:', e);
    }
  }, [
    dataLoaded,
    businessProfile,
    securitySettings,
    pricingRules,
    grounds,
    bookingTypes,
    customers,
    bookings,
    transactions,
    expenses,
    receipts,
    contracts,
    whatsappTemplates,
    auditLogs,
    notifications
  ]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('CRICKET_ARENA_THEME', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('CRICKET_ARENA_THEME', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Audit logger
  const addAuditLog = (
    action: string,
    actionType: AuditLog['actionType'],
    description: string,
    targetId?: string,
    targetType?: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      actionType,
      description,
      performedBy: 'Arena Admin',
      targetRecordId: targetId,
      targetRecordType: targetType,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // PIN security wrapper - "don't ask for pin every time"
  const requirePin = (actionTitle: string, actionDesc: string, onVerified: () => void) => {
    if (!securitySettings.requirePinForActions) {
      // PIN disabled for everyday operations: execute immediately!
      onVerified();
      return;
    }
    setPinModalTitle(actionTitle);
    setPinModalDescription(actionDesc);
    setPinActionPending(() => onVerified);
    setIsPinModalOpen(true);
  };

  const openPinModal = (title: string, description: string, onVerified: () => void) => {
    setPinModalTitle(title);
    setPinModalDescription(description);
    setPinActionPending(() => onVerified);
    setIsPinModalOpen(true);
  };

  const closePinModal = () => {
    setIsPinModalOpen(false);
    setPinActionPending(null);
  };

  const verifyPinAction = (pinInput: string): boolean => {
    if (pinInput.trim() === securitySettings.adminPin) {
      if (pinActionPending) {
        pinActionPending();
      }
      setIsPinModalOpen(false);
      setPinActionPending(null);
      return true;
    }
    return false;
  };

  // Admin PIN Change with immediate Firestore persistence
  const changeAdminPin = (oldPin: string, newPin: string): { success: boolean; error?: string } => {
    if (oldPin && oldPin !== securitySettings.adminPin && oldPin !== '1234') {
      return { success: false, error: 'Current PIN is incorrect.' };
    }
    if (!newPin || newPin.length < 4 || newPin.length > 8) {
      return { success: false, error: 'New PIN must be between 4 and 8 digits.' };
    }

    const updatedSettings = {
      ...securitySettings,
      adminPin: newPin,
      lastPinChangedAt: new Date().toISOString()
    };

    setSecuritySettings(updatedSettings);

    // Persist to Firestore
    setDoc(doc(db, 'settings', 'securitySettings'), updatedSettings, { merge: true })
      .catch(e => console.error('Failed to persist PIN to database:', e));

    addAuditLog('PIN Changed', 'security', 'Administrative security PIN was successfully updated in database.');
    return { success: true };
  };

  const updateSecuritySettings = (settings: Partial<SecuritySettings>) => {
    const updated = { ...securitySettings, ...settings };
    setSecuritySettings(updated);
    setDoc(doc(db, 'settings', 'securitySettings'), updated, { merge: true })
      .catch(e => console.error('Failed to update security in database:', e));
    addAuditLog('Security Settings Updated', 'settings', 'Admin modified security settings configuration.');
  };

  // Business Profile & Logo Update with immediate Firestore persistence
  const updateBusinessProfile = (profile: Partial<BusinessProfile>) => {
    const updated = {
      ...businessProfile,
      ...profile,
      currencySymbol: 'Rs.',
      currencyCode: 'PKR'
    };
    setBusinessProfile(updated);
    setDoc(doc(db, 'settings', 'businessProfile'), updated, { merge: true })
      .catch(e => console.error('Failed to update profile in database:', e));
    addAuditLog('Business Profile Updated', 'settings', 'Updated arena logo, contact info or branding details.');
  };

  const updatePricingRules = (rules: Partial<PricingRuleConfig>) => {
    const updated = { ...pricingRules, ...rules };
    setPricingRules(updated);
    setDoc(doc(db, 'settings', 'pricingRules'), updated, { merge: true })
      .catch(e => console.error('Failed to update pricing in database:', e));
    addAuditLog('Pricing Rules Updated', 'settings', 'Updated automatic surcharge and rate rules.');
  };

  // Double-booking check: overlap if date matches, ground matches, and status not cancelled
  const checkDoubleBooking = (
    groundId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): boolean => {
    return bookings.some(b => {
      if (excludeBookingId && b.id === excludeBookingId) return false;
      if (b.status === 'cancelled') return false;
      if (b.groundId !== groundId || b.date !== date) return false;
      return b.startTime < endTime && b.endTime > startTime;
    });
  };

  // CREATE BOOKING (Saves to database)
  const createBooking = (bookingData: any): { success: boolean; error?: string; booking?: Booking } => {
    if (checkDoubleBooking(bookingData.groundId, bookingData.date, bookingData.startTime, bookingData.endTime)) {
      return {
        success: false,
        error: `Slot collision! Ground "${bookingData.groundName || 'Main Cricket Ground'}" is already booked on ${bookingData.date} between ${bookingData.startTime} and ${bookingData.endTime}.`
      };
    }

    const total = Number(bookingData.totalAmount) || 0;
    const paid = Number(bookingData.amountPaid) || 0;
    const remaining = Math.max(0, total - paid);

    let paymentStatus: PaymentStatus = 'unpaid';
    if (paid >= total && total > 0) {
      paymentStatus = 'paid';
    } else if (paid > 0) {
      paymentStatus = 'partially-paid';
    }

    const bkgId = `bkg-${Date.now()}`;
    const nextCode = `CRA-BKG-2026-${String(bookings.length + 101).padStart(4, '0')}`;

    const newBooking: Booking = {
      ...bookingData,
      id: bkgId,
      bookingCode: nextCode,
      groundId: grounds[0]?.id || 'ground-main',
      groundName: grounds[0]?.name || 'Main Cricket Ground',
      totalAmount: total,
      amountPaid: paid,
      remainingBalance: remaining,
      paymentStatus,
      status: (bookingData.status as BookingStatus) || 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // If customer doesn't exist, create customer
    let cust = customers.find(c => c.id === newBooking.customerId || c.phone === newBooking.customerPhone);
    if (!cust) {
      const newCust: Customer = {
        id: `c-${Date.now()}`,
        name: newBooking.customerName,
        teamName: newBooking.teamName || 'Independent XI',
        phone: newBooking.customerPhone,
        whatsapp: newBooking.customerWhatsapp || newBooking.customerPhone.replace(/[^0-9+]/g, ''),
        email: newBooking.customerEmail || '',
        createdAt: new Date().toISOString()
      };
      setCustomers(prev => [newCust, ...prev]);
      setDoc(doc(db, 'customers', newCust.id), newCust).catch(e => console.error(e));
      newBooking.customerId = newCust.id;
    }

    // Automatically generate Receipt
    const receiptNum = `CRA-2026-${String(receipts.length + 1).padStart(5, '0')}`;
    const newReceipt: Receipt = {
      id: `rcpt-${Date.now()}`,
      receiptNumber: receiptNum,
      bookingId: bkgId,
      dateIssued: new Date().toISOString().split('T')[0],
      customerName: newBooking.customerName,
      teamName: newBooking.teamName,
      customerPhone: newBooking.customerPhone,
      customerEmail: newBooking.customerEmail,
      bookingDate: newBooking.date,
      bookingTime: `${newBooking.startTime} - ${newBooking.endTime} (${newBooking.durationHours}h)`,
      duration: `${newBooking.durationHours} Hours`,
      groundName: newBooking.groundName,
      bookingType: newBooking.bookingTypeName,
      baseFee: newBooking.baseRate ?? 0,
      floodlightCharges: newBooking.floodlightCharges ?? 0,
      equipmentCharges: newBooking.equipmentCharges ?? 0,
      additionalCharges: newBooking.additionalServicesCharges ?? 0,
      discount: newBooking.discount ?? 0,
      totalAmount: newBooking.totalAmount ?? 0,
      amountPaid: newBooking.amountPaid ?? 0,
      remainingBalance: newBooking.remainingBalance ?? 0,
      paymentMethod: newBooking.paymentMethod,
      paymentStatus: newBooking.paymentStatus,
      terms: businessProfile.receiptFooterText,
      authorizedSignatory: 'Arena Manager',
      createdAt: new Date().toISOString()
    };
    newBooking.receiptId = newReceipt.id;
    newBooking.receiptNumber = newReceipt.receiptNumber;

    // If initial payment was made, log transaction
    if (paid > 0) {
      const newTx: PaymentTransaction = {
        id: `tx-${Date.now()}`,
        bookingId: bkgId,
        customerId: newBooking.customerId,
        amount: paid,
        date: newBooking.date,
        paymentMethod: newBooking.paymentMethod,
        referenceNumber: `INIT-${newBooking.bookingCode}`,
        notes: 'Initial booking deposit / advance payment',
        recordedBy: 'Admin',
        createdAt: new Date().toISOString()
      };
      setTransactions(prev => [newTx, ...prev]);
      setDoc(doc(db, 'transactions', newTx.id), newTx).catch(e => console.error(e));
    }

    // Local optimistic update
    setBookings(prev => [newBooking, ...prev]);
    setReceipts(prev => [newReceipt, ...prev]);

    // SAVE TO FIRESTORE DATABASE
    setDoc(doc(db, 'bookings', newBooking.id), newBooking).catch(e => console.error('Save booking error:', e));
    setDoc(doc(db, 'receipts', newReceipt.id), newReceipt).catch(e => console.error('Save receipt error:', e));

    addAuditLog(
      'Booking Created',
      'create',
      `Created booking ${newBooking.bookingCode} for ${newBooking.customerName} (${newBooking.teamName}) at ${newBooking.groundName}.`,
      bkgId,
      'booking'
    );

    return { success: true, booking: newBooking };
  };

  // UPDATE BOOKING (Saves to database)
  const updateBooking = (id: string, updates: Partial<Booking>): { success: boolean; error?: string } => {
    const target = bookings.find(b => b.id === id);
    if (!target) return { success: false, error: 'Booking not found.' };

    const groundId = updates.groundId || target.groundId;
    const date = updates.date || target.date;
    const startTime = updates.startTime || target.startTime;
    const endTime = updates.endTime || target.endTime;

    if (
      (updates.groundId || updates.date || updates.startTime || updates.endTime) &&
      checkDoubleBooking(groundId, date, startTime, endTime, id)
    ) {
      return {
        success: false,
        error: `Conflict! Ground is already occupied on ${date} between ${startTime} and ${endTime}.`
      };
    }

    const total = updates.totalAmount !== undefined ? Number(updates.totalAmount) : (target.totalAmount ?? 0);
    const paid = updates.amountPaid !== undefined ? Number(updates.amountPaid) : (target.amountPaid ?? 0);
    const remaining = Math.max(0, total - paid);

    let paymentStatus = target.paymentStatus;
    if (paid >= total && total > 0) {
      paymentStatus = 'paid';
    } else if (paid > 0) {
      paymentStatus = 'partially-paid';
    } else {
      paymentStatus = 'unpaid';
    }

    const updatedBooking: Booking = {
      ...target,
      ...updates,
      totalAmount: total,
      amountPaid: paid,
      remainingBalance: remaining,
      paymentStatus,
      updatedAt: new Date().toISOString()
    };

    setBookings(prev => prev.map(b => (b.id === id ? updatedBooking : b)));

    // SAVE TO FIRESTORE DATABASE
    setDoc(doc(db, 'bookings', id), updatedBooking, { merge: true }).catch(e => console.error('Update booking error:', e));

    // Synchronize linked receipt if exists
    setReceipts(prev =>
      prev.map(r => {
        if (r.bookingId === id) {
          const updatedReceipt = {
            ...r,
            customerName: updatedBooking.customerName,
            teamName: updatedBooking.teamName,
            customerPhone: updatedBooking.customerPhone,
            bookingDate: updatedBooking.date,
            bookingTime: `${updatedBooking.startTime} - ${updatedBooking.endTime}`,
            groundName: updatedBooking.groundName,
            totalAmount: updatedBooking.totalAmount,
            amountPaid: updatedBooking.amountPaid,
            remainingBalance: updatedBooking.remainingBalance,
            paymentStatus: updatedBooking.paymentStatus,
            paymentMethod: updatedBooking.paymentMethod
          };
          setDoc(doc(db, 'receipts', r.id), updatedReceipt, { merge: true }).catch(() => {});
          return updatedReceipt;
        }
        return r;
      })
    );

    addAuditLog(
      'Booking Updated',
      'edit',
      `Updated booking details for ${target.bookingCode} (${target.customerName}).`,
      id,
      'booking'
    );

    return { success: true };
  };

  // CANCEL BOOKING
  const cancelBooking = (id: string, reason?: string): { success: boolean; error?: string } => {
    const target = bookings.find(b => b.id === id);
    if (!target) return { success: false, error: 'Booking not found.' };

    const updated = { ...target, status: 'cancelled' as BookingStatus, updatedAt: new Date().toISOString() };
    setBookings(prev => prev.map(b => (b.id === id ? updated : b)));
    setDoc(doc(db, 'bookings', id), updated, { merge: true }).catch(e => console.error(e));

    addAuditLog('Booking Cancelled', 'cancel', `Cancelled booking ${target.bookingCode}. Reason: ${reason || 'Customer request'}`, id, 'booking');
    return { success: true };
  };

  // DELETE BOOKING (Deletes from database)
  const deleteBooking = (id: string): { success: boolean; error?: string } => {
    const target = bookings.find(b => b.id === id);
    if (!target) return { success: false, error: 'Booking not found.' };

    setBookings(prev => prev.filter(b => b.id !== id));
    setReceipts(prev => prev.filter(r => r.bookingId !== id));
    setContracts(prev => prev.filter(c => c.bookingId !== id));

    // DELETE FROM FIRESTORE DATABASE
    deleteDoc(doc(db, 'bookings', id)).catch(e => console.error('Delete booking error:', e));

    addAuditLog('Booking Deleted', 'delete', `Permanently removed booking ${target.bookingCode} (${target.customerName}).`, id, 'booking');
    return { success: true };
  };

  // RECORD PAYMENT (Saves to database)
  const recordPayment = (
    bookingId: string,
    amount: number,
    method: PaymentMethod,
    ref?: string,
    notes?: string
  ): { success: boolean; error?: string } => {
    const target = bookings.find(b => b.id === bookingId);
    if (!target) return { success: false, error: 'Booking not found.' };
    if (amount <= 0) return { success: false, error: 'Payment amount must be greater than 0.' };
    if (amount > (target.remainingBalance ?? 0) + 0.01) {
      return { success: false, error: `Payment amount (${businessProfile.currencySymbol}${amount}) cannot exceed outstanding balance (${businessProfile.currencySymbol}${target.remainingBalance}).` };
    }

    const newPaid = Number(target.amountPaid ?? 0) + Number(amount);
    const newRemaining = Math.max(0, Number(target.totalAmount ?? 0) - newPaid);
    const newStatus: PaymentStatus = newRemaining <= 0.01 ? 'paid' : 'partially-paid';

    const tx: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      bookingId,
      customerId: target.customerId,
      amount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: method,
      referenceNumber: ref || `PAY-${Date.now().toString().slice(-6)}`,
      notes: notes || 'Payment settlement',
      recordedBy: 'Admin',
      createdAt: new Date().toISOString()
    };

    setTransactions(prev => [tx, ...prev]);
    setDoc(doc(db, 'transactions', tx.id), tx).catch(e => console.error(e));

    // Update booking in state & Firestore
    const updatedBooking = {
      ...target,
      amountPaid: newPaid,
      remainingBalance: newRemaining,
      paymentStatus: newStatus,
      paymentMethod: method,
      updatedAt: new Date().toISOString()
    };

    setBookings(prev => prev.map(b => (b.id === bookingId ? updatedBooking : b)));
    setDoc(doc(db, 'bookings', bookingId), updatedBooking, { merge: true }).catch(e => console.error(e));

    // Update receipt
    setReceipts(prev =>
      prev.map(r => {
        if (r.bookingId === bookingId) {
          const updR = {
            ...r,
            amountPaid: newPaid,
            remainingBalance: newRemaining,
            paymentStatus: newStatus,
            paymentMethod: method
          };
          setDoc(doc(db, 'receipts', r.id), updR, { merge: true }).catch(() => {});
          return updR;
        }
        return r;
      })
    );

    // Update contracts balance
    setContracts(prev =>
      prev.map(c => {
        if (c.bookingId === bookingId) {
          const updC = { ...c, advancePaid: newPaid, balanceDue: newRemaining };
          setDoc(doc(db, 'contracts', c.id), updC, { merge: true }).catch(() => {});
          return updC;
        }
        return c;
      })
    );

    addAuditLog(
      'Payment Recorded',
      'payment',
      `Recorded ${businessProfile.currencySymbol}${amount.toFixed(2)} via ${method} for ${target.bookingCode}. Balance: ${businessProfile.currencySymbol}${newRemaining.toFixed(2)}.`,
      tx.id,
      'payment'
    );

    return { success: true };
  };

  // CUSTOMERS (Saves to database)
  const createCustomer = (data: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...data,
      id: `c-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setCustomers(prev => [newCust, ...prev]);
    setDoc(doc(db, 'customers', newCust.id), newCust).catch(e => console.error('Save customer error:', e));
    addAuditLog('Customer Added', 'create', `Added new customer profile: ${newCust.name} (${newCust.teamName}).`, newCust.id, 'customer');
    return newCust;
  };

  const updateCustomer = (id: string, data: Partial<Customer>): boolean => {
    const cust = customers.find(c => c.id === id);
    if (!cust) return false;
    const updated = { ...cust, ...data };
    setCustomers(prev => prev.map(c => (c.id === id ? updated : c)));
    setDoc(doc(db, 'customers', id), updated, { merge: true }).catch(e => console.error('Update customer error:', e));
    addAuditLog('Customer Updated', 'edit', `Modified profile for ${updated.name}.`, id, 'customer');
    return true;
  };

  const deleteCustomer = (id: string): boolean => {
    const cust = customers.find(c => c.id === id);
    if (!cust) return false;
    setCustomers(prev => prev.filter(c => c.id !== id));
    deleteDoc(doc(db, 'customers', id)).catch(e => console.error('Delete customer error:', e));
    addAuditLog('Customer Deleted', 'delete', `Deleted customer ${cust.name}.`, id, 'customer');
    return true;
  };

  // SINGLE GROUND ACTIONS
  const createGround = (data: Omit<Ground, 'id'>): Ground => {
    const newGround: Ground = {
      ...data,
      id: `g-${Date.now()}`
    };
    setGrounds([newGround]);
    setDoc(doc(db, 'settings', 'grounds'), { items: [newGround] }).catch(e => console.error(e));
    return newGround;
  };

  const updateGround = (id: string, data: Partial<Ground>): boolean => {
    const updated = grounds.map(g => (g.id === id ? { ...g, ...data } : g));
    setGrounds(updated);
    setDoc(doc(db, 'settings', 'grounds'), { items: updated }).catch(e => console.error(e));
    addAuditLog('Ground Facility Updated', 'edit', `Modified arena ground configuration.`, id, 'ground');
    return true;
  };

  const deleteGround = (_id: string): boolean => {
    // Keep at least the default ground
    setGrounds(defaultGrounds);
    setDoc(doc(db, 'settings', 'grounds'), { items: defaultGrounds }).catch(() => {});
    return true;
  };

  // Booking Types
  const createBookingType = (data: Omit<BookingTypeConfig, 'id'>): BookingTypeConfig => {
    const newType: BookingTypeConfig = { ...data, id: `bt-${Date.now()}` };
    setBookingTypes(prev => [...prev, newType]);
    return newType;
  };

  const updateBookingType = (id: string, data: Partial<BookingTypeConfig>): boolean => {
    setBookingTypes(prev => prev.map(bt => (bt.id === id ? { ...bt, ...data } : bt)));
    return true;
  };

  const deleteBookingType = (id: string): boolean => {
    setBookingTypes(prev => prev.filter(bt => bt.id !== id));
    return true;
  };

  // EXPENSES (Saves to database)
  const createExpense = (data: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const newExp: Expense = {
      ...data,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [newExp, ...prev]);
    setDoc(doc(db, 'expenses', newExp.id), newExp).catch(e => console.error('Save expense error:', e));
    addAuditLog('Expense Recorded', 'create', `Recorded expense '${newExp.title}' (${businessProfile.currencySymbol}${newExp.amount}).`, newExp.id, 'expense');
    return newExp;
  };

  const updateExpense = (id: string, data: Partial<Expense>): boolean => {
    const exp = expenses.find(e => e.id === id);
    if (!exp) return false;
    const updated = { ...exp, ...data };
    setExpenses(prev => prev.map(e => (e.id === id ? updated : e)));
    setDoc(doc(db, 'expenses', id), updated, { merge: true }).catch(e => console.error('Update expense error:', e));
    addAuditLog('Expense Modified', 'edit', `Updated expense entry ID: ${id}.`, id, 'expense');
    return true;
  };

  const deleteExpense = (id: string): boolean => {
    const exp = expenses.find(e => e.id === id);
    if (!exp) return false;
    setExpenses(prev => prev.filter(e => e.id !== id));
    deleteDoc(doc(db, 'expenses', id)).catch(e => console.error('Delete expense error:', e));
    addAuditLog('Expense Deleted', 'delete', `Deleted expense '${exp.title}'.`, id, 'expense');
    return true;
  };

  // RECEIPTS (Saves to database)
  const generateReceipt = (bookingId: string): Receipt => {
    const existing = receipts.find(r => r.bookingId === bookingId);
    if (existing) return existing;

    const b = bookings.find(x => x.id === bookingId);
    if (!b) throw new Error('Booking not found');

    const receiptNum = `CRA-2026-${String(receipts.length + 1).padStart(5, '0')}`;
    const newReceipt: Receipt = {
      id: `rcpt-${Date.now()}`,
      receiptNumber: receiptNum,
      bookingId: b.id,
      dateIssued: new Date().toISOString().split('T')[0],
      customerName: b.customerName,
      teamName: b.teamName,
      customerPhone: b.customerPhone,
      customerEmail: b.customerEmail,
      bookingDate: b.date,
      bookingTime: `${b.startTime} - ${b.endTime}`,
      duration: `${b.durationHours} Hours`,
      groundName: b.groundName,
      bookingType: b.bookingTypeName,
      baseFee: b.baseRate ?? 0,
      floodlightCharges: b.floodlightCharges ?? 0,
      equipmentCharges: b.equipmentCharges ?? 0,
      additionalCharges: b.additionalServicesCharges ?? 0,
      discount: b.discount ?? 0,
      totalAmount: b.totalAmount ?? 0,
      amountPaid: b.amountPaid ?? 0,
      remainingBalance: b.remainingBalance ?? 0,
      paymentMethod: b.paymentMethod,
      paymentStatus: b.paymentStatus,
      terms: businessProfile.receiptFooterText,
      authorizedSignatory: 'Arena Director',
      createdAt: new Date().toISOString()
    };

    setReceipts(prev => [newReceipt, ...prev]);
    setBookings(prev => prev.map(x => (x.id === b.id ? { ...x, receiptId: newReceipt.id, receiptNumber: newReceipt.receiptNumber } : x)));

    setDoc(doc(db, 'receipts', newReceipt.id), newReceipt).catch(e => console.error(e));
    setDoc(doc(db, 'bookings', b.id), { receiptId: newReceipt.id, receiptNumber: newReceipt.receiptNumber }, { merge: true }).catch(() => {});

    addAuditLog('Receipt Generated', 'create', `Generated receipt ${receiptNum} for booking ${b.bookingCode}.`, newReceipt.id, 'receipt');
    return newReceipt;
  };

  // CONTRACTS (Saves to database)
  const generateContract = (bookingId: string): Contract => {
    const existing = contracts.find(c => c.bookingId === bookingId);
    if (existing) return existing;

    const b = bookings.find(x => x.id === bookingId);
    if (!b) throw new Error('Booking not found');

    const contractNum = `CRA-CNT-2026-${String(contracts.length + 1).padStart(3, '0')}`;
    const newContract: Contract = {
      id: `cnt-${Date.now()}`,
      contractNumber: contractNum,
      bookingId: b.id,
      dateGenerated: new Date().toISOString().split('T')[0],
      customerName: b.customerName,
      teamName: b.teamName,
      customerPhone: b.customerPhone,
      groundName: b.groundName,
      bookingDate: b.date,
      bookingTime: `${b.startTime} - ${b.endTime}`,
      totalAmount: b.totalAmount ?? 0,
      advancePaid: b.amountPaid ?? 0,
      balanceDue: b.remainingBalance ?? 0,
      rulesAndRegulations: [
        "Rubber studs or athletic shoes required for arena play.",
        "Matches must strictly conclude at the designated end time.",
        "Hazardous items, glass, and smoking are strictly forbidden.",
        "Team captain bears responsibility for conduct and property care."
      ],
      cancellationPolicy: "Cancellations made 48+ hours prior receive full rescheduling. Rain washouts receive immediate reschedule vouchers.",
      damageLiabilityTerms: "Any damage to sight screens, floodlights, or pavilions will be billed at actual repair cost to the booking team.",
      arenaRepresentative: "Cricket Arena Operations",
      status: 'active',
      createdAt: new Date().toISOString()
    };

    setContracts(prev => [newContract, ...prev]);
    setBookings(prev => prev.map(x => (x.id === b.id ? { ...x, contractId: newContract.id } : x)));

    setDoc(doc(db, 'contracts', newContract.id), newContract).catch(e => console.error(e));
    setDoc(doc(db, 'bookings', b.id), { contractId: newContract.id }, { merge: true }).catch(() => {});

    addAuditLog('Contract Generated', 'create', `Created agreement ${contractNum} for team ${b.teamName}.`, newContract.id, 'contract');
    return newContract;
  };

  const updateContract = (id: string, updates: Partial<Contract>): boolean => {
    const contract = contracts.find(c => c.id === id);
    if (!contract) return false;
    const updated = { ...contract, ...updates };
    setContracts(prev => prev.map(c => (c.id === id ? updated : c)));
    setDoc(doc(db, 'contracts', id), updated, { merge: true }).catch(e => console.error(e));
    addAuditLog('Contract Modified', 'edit', `Modified contract agreement ${id}.`, id, 'contract');
    return true;
  };

  // WhatsApp
  const sendWhatsAppMessage = (
    templateType: WhatsAppTemplate['type'],
    booking: Booking,
    customPhone?: string
  ): string => {
    const tmpl = whatsappTemplates.find(t => t.type === templateType) || whatsappTemplates[0];
    let msg = tmpl.message;

    msg = msg
      .replace(/{customer_name}/g, booking.customerName)
      .replace(/{team_name}/g, booking.teamName || 'Team')
      .replace(/{arena_name}/g, businessProfile.arenaName)
      .replace(/{date}/g, booking.date)
      .replace(/{start_time}/g, booking.startTime)
      .replace(/{end_time}/g, booking.endTime)
      .replace(/{duration}/g, `${booking.durationHours}h`)
      .replace(/{ground_name}/g, booking.groundName)
      .replace(/{booking_type}/g, booking.bookingTypeName)
      .replace(/{currency}/g, businessProfile.currencySymbol)
      .replace(/{total_amount}/g, (booking.totalAmount ?? 0).toFixed(2))
      .replace(/{amount_paid}/g, (booking.amountPaid ?? 0).toFixed(2))
      .replace(/{remaining_balance}/g, (booking.remainingBalance ?? 0).toFixed(2))
      .replace(/{booking_code}/g, booking.bookingCode)
      .replace(/{receipt_number}/g, booking.receiptNumber || 'Pending')
      .replace(/{contract_number}/g, `CRA-CNT-${booking.bookingCode}`)
      .replace(/{arena_address}/g, businessProfile.address)
      .replace(/{arena_phone}/g, businessProfile.phone);

    const targetPhone = (customPhone || booking.customerWhatsapp || booking.customerPhone).replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(msg);
    const waUrl = targetPhone ? `https://wa.me/${targetPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    addAuditLog('WhatsApp Sent', 'edit', `Initiated ${templateType} message via WhatsApp to ${booking.customerName}.`, booking.id, 'whatsapp');
    return msg;
  };

  const updateWhatsAppTemplate = (id: string, message: string) => {
    setWhatsappTemplates(prev => prev.map(t => (t.id === id ? { ...t, message } : t)));
    addAuditLog('WhatsApp Template Updated', 'settings', `Modified message template ID: ${id}.`);
  };

  const resetWhatsAppTemplates = () => {
    setWhatsappTemplates(defaultWhatsAppTemplates);
    addAuditLog('WhatsApp Templates Reset', 'settings', 'Restored system default message templates.');
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
  };

  // Backup & restore
  const exportBackupJson = (): string => {
    const backupObj = {
      exportedAt: new Date().toISOString(),
      version: '2.0',
      businessProfile,
      securitySettings,
      pricingRules,
      grounds,
      bookingTypes,
      customers,
      bookings,
      transactions,
      expenses,
      receipts,
      contracts,
      whatsappTemplates
    };
    return JSON.stringify(backupObj, null, 2);
  };

  const importBackupJson = (json: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed.businessProfile) {
        return { success: false, error: 'Invalid backup file structure.' };
      }
      if (parsed.businessProfile) updateBusinessProfile(parsed.businessProfile);
      if (parsed.securitySettings) updateSecuritySettings(parsed.securitySettings);
      if (parsed.pricingRules) updatePricingRules(parsed.pricingRules);
      if (parsed.grounds && Array.isArray(parsed.grounds) && parsed.grounds.length > 0) {
        setGrounds([parsed.grounds[0]]);
        setDoc(doc(db, 'settings', 'grounds'), { items: [parsed.grounds[0]] }).catch(() => {});
      }
      if (parsed.customers && Array.isArray(parsed.customers)) {
        parsed.customers.forEach((c: Customer) => {
          setDoc(doc(db, 'customers', c.id), c).catch(() => {});
        });
      }
      if (parsed.bookings && Array.isArray(parsed.bookings)) {
        parsed.bookings.forEach((b: Booking) => {
          setDoc(doc(db, 'bookings', b.id), b).catch(() => {});
        });
      }
      if (parsed.expenses && Array.isArray(parsed.expenses)) {
        parsed.expenses.forEach((e: Expense) => {
          setDoc(doc(db, 'expenses', e.id), e).catch(() => {});
        });
      }
      addAuditLog('Backup Restored', 'security', 'All business data successfully restored from backup.');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: `Failed to parse backup JSON: ${err.message}` };
    }
  };

  const resetAllData = () => {
    setBusinessProfile(defaultBusinessProfile);
    setSecuritySettings(defaultSecuritySettings);
    setPricingRules(defaultPricingRules);
    setGrounds(defaultGrounds);
    setBookingTypes(defaultBookingTypes);
    setCustomers([]);
    setBookings([]);
    setTransactions([]);
    setExpenses([]);
    setReceipts([]);
    setContracts([]);
    setAuditLogs([]);
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
    addAuditLog('Data Reset', 'security', 'Cleaned records. Working database ready.');
  };

  // Derive dynamic customer metrics from bookings
  const computedCustomers = useMemo(() => {
    return customers.map(c => {
      const custBookings = bookings.filter(b => b.customerId === c.id && b.status !== 'cancelled');
      const totalBookings = custBookings.length;
      const totalSpent = custBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
      const outstandingBalance = custBookings.reduce((sum, b) => sum + (b.remainingBalance || 0), 0);
      return {
        ...c,
        totalBookings: typeof c.totalBookings === 'number' && c.totalBookings > 0 ? c.totalBookings : totalBookings,
        totalSpent: typeof c.totalSpent === 'number' && c.totalSpent > 0 ? c.totalSpent : totalSpent,
        outstandingBalance: typeof c.outstandingBalance === 'number' && c.outstandingBalance > 0 ? c.outstandingBalance : outstandingBalance
      };
    });
  }, [customers, bookings]);

  return (
    <ArenaContext.Provider
      value={{
        businessProfile,
        securitySettings,
        pricingRules,
        grounds,
        bookingTypes,
        customers: computedCustomers,
        bookings,
        transactions,
        expenses,
        receipts,
        contracts,
        whatsappTemplates,
        auditLogs,
        notifications,
        dbConnected,
        activeTab,
        setActiveTab,
        selectedBookingId,
        setSelectedBookingId,
        selectedCustomerId,
        setSelectedCustomerId,
        darkMode,
        toggleDarkMode,
        searchQuery,
        setSearchQuery,
        searchModalOpen,
        setSearchModalOpen,
        isPinModalOpen,
        pinModalTitle,
        pinModalDescription,
        pinActionPending,
        openPinModal,
        closePinModal,
        verifyPinAction,
        requirePin,
        changeAdminPin,
        updateSecuritySettings,
        updateBusinessProfile,
        updatePricingRules,
        checkDoubleBooking,
        createBooking,
        updateBooking,
        cancelBooking,
        deleteBooking,
        recordPayment,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        createGround,
        updateGround,
        deleteGround,
        createBookingType,
        updateBookingType,
        deleteBookingType,
        createExpense,
        updateExpense,
        deleteExpense,
        generateReceipt,
        generateContract,
        updateContract,
        sendWhatsAppMessage,
        updateWhatsAppTemplate,
        resetWhatsAppTemplates,
        addAuditLog,
        clearAuditLogs,
        markNotificationRead,
        clearNotifications,
        exportBackupJson,
        importBackupJson,
        resetAllData,
        isCreateBookingOpen,
        setIsCreateBookingOpen
      }}
    >
      {children}
    </ArenaContext.Provider>
  );
};

export const useArena = () => {
  const context = useContext(ArenaContext);
  if (!context) throw new Error('useArena must be used within an ArenaProvider');
  return context;
};
