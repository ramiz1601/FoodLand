import React, { useState, useEffect } from 'react';
import { ArenaProvider, useArena } from './context/ArenaContext';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { PinModal } from './components/PinModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { CreateBookingModal } from './views/CreateBookingModal';

// Views
import { DashboardView } from './views/DashboardView';
import { BookingsView } from './views/BookingsView';
import { BookingCalendarView } from './views/BookingCalendarView';
import { CustomersView } from './views/CustomersView';
import { GroundsView } from './views/GroundsView';
import { OutstandingView } from './views/OutstandingView';
import { ReceiptsView } from './views/ReceiptsView';
import { ContractsView } from './views/ContractsView';
import { ExpensesView } from './views/ExpensesView';
import { FinanceView } from './views/FinanceView';
import { ReportsView } from './views/ReportsView';
import { WhatsAppView } from './views/WhatsAppView';
import { AuditLogView } from './views/AuditLogView';
import { SettingsView } from './views/SettingsView';

const ArenaDashboardLayout: React.FC = () => {
  const { activeTab, isCreateBookingOpen, setIsCreateBookingOpen, darkMode } = useArena();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Synchronize dark mode class on HTML root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'bookings':
        return <BookingsView />;
      case 'calendar':
        return <BookingCalendarView />;
      case 'customers':
        return <CustomersView />;
      case 'grounds':
        return <GroundsView />;
      case 'outstanding':
        return <OutstandingView />;
      case 'receipts':
        return <ReceiptsView />;
      case 'contracts':
        return <ContractsView />;
      case 'expenses':
        return <ExpensesView />;
      case 'finance':
        return <FinanceView />;
      case 'reports':
        return <ReportsView />;
      case 'whatsapp':
        return <WhatsAppView />;
      case 'audit':
        return <AuditLogView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div id="cricket-arena-app" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Persistent Sidebar Navigation */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      {/* Main Content Area */}
      <div className="lg:pl-64 md:lg:pl-72 flex flex-col flex-1 min-w-0 transition-all duration-300">
        {/* Universal Top Header */}
        <TopNav onOpenMobileMenu={() => setMobileSidebarOpen(true)} />

        {/* Dynamic View Host Container */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto transition-all">
          {renderActiveView()}
        </main>
      </div>

      {/* Universal Modal Layers */}
      <GlobalSearchModal />
      <PinModal />
      <CreateBookingModal
        isOpen={isCreateBookingOpen}
        onClose={() => setIsCreateBookingOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ArenaProvider>
      <ArenaDashboardLayout />
    </ArenaProvider>
  );
}
