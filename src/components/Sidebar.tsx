import React from 'react';
import { useArena } from '../context/ArenaContext';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  Users,
  Building2,
  Receipt,
  FileSignature,
  DollarSign,
  TrendingDown,
  FileBarChart2,
  MessageSquare,
  History,
  Settings,
  AlertCircle,
  Sun,
  Moon,
  Shield,
  ShieldCheck,
  PlusCircle,
  X
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    businessProfile,
    activeTab,
    setActiveTab,
    bookings,
    darkMode,
    toggleDarkMode,
    securitySettings,
    setIsCreateBookingOpen
  } = useArena();

  // Count outstanding bookings
  const outstandingCount = bookings.filter(b => b.status !== 'cancelled' && b.remainingBalance > 0).length;

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: CalendarDays },
    { id: 'calendar', label: 'Booking Calendar', icon: CalendarRange },
    { id: 'customers', label: 'Customers & Teams', icon: Users },
    { id: 'grounds', label: 'Grounds & Pitches', icon: Building2 },
    { id: 'outstanding', label: 'Outstanding Payments', icon: AlertCircle, badge: outstandingCount > 0 ? outstandingCount : undefined },
    { id: 'receipts', label: 'Receipts', icon: Receipt },
    { id: 'contracts', label: 'Contracts & Agreements', icon: FileSignature },
    { id: 'expenses', label: 'Expense Manager', icon: TrendingDown },
    { id: 'finance', label: 'Finance & P&L', icon: DollarSign },
    { id: 'reports', label: 'Reports & Analytics', icon: FileBarChart2 },
    { id: 'whatsapp', label: 'WhatsApp Messaging', icon: MessageSquare },
    { id: 'audit', label: 'Activity & Audit Log', icon: History },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 md:w-72 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {businessProfile.logoUrl ? (
              <img
                src={businessProfile.logoUrl}
                alt="Arena Logo"
                className="w-10 h-10 rounded-xl object-cover bg-slate-800 border border-emerald-500/30 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-500/20 shrink-0 border border-emerald-400/30">
                🏏
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold text-white truncate tracking-tight">
                {businessProfile.arenaName}
              </h1>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Cricket Arena Pro
              </span>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick New Booking Button */}
        <div className="p-3 border-b border-slate-800">
          <button
            onClick={() => {
              setIsCreateBookingOpen(true);
              setMobileOpen(false);
            }}
            className="w-full py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>New Booking</span>
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
          <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Management
          </div>

          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight shrink-0 ${
                      isActive
                        ? 'bg-white text-emerald-800'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info & theme toggle */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {/* Security PIN status badge */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              {securitySettings.requirePinForActions ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>PIN Security</span>
            </div>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                securitySettings.requirePinForActions
                  ? 'text-emerald-400 bg-emerald-950/40'
                  : 'text-amber-400 bg-amber-950/40'
              }`}
            >
              {securitySettings.requirePinForActions ? 'Active' : 'Disabled'}
            </span>
          </div>

          {/* Theme Switcher */}
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[11px] text-slate-400">Interface Theme</span>
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
