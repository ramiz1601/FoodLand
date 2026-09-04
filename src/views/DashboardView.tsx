import React, { useState } from 'react';
import { useArena } from '../context/ArenaContext';
import {
  CalendarDays,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  PlusCircle,
  Receipt,
  MessageSquare,
  Users,
  Building2,
  Clock,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    businessProfile,
    bookings,
    expenses,
    grounds,
    customers,
    setActiveTab,
    setSelectedBookingId,
    setIsCreateBookingOpen,
    generateReceipt,
    sendWhatsAppMessage,
    openPinModal
  } = useArena();

  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. TODAY'S OVERVIEW CALCULATIONS
  const todayBookings = bookings.filter(b => b.date === todayStr && b.status !== 'cancelled');
  const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const todayCollected = todayBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  const todayOutstanding = todayBookings.reduce((sum, b) => sum + (b.remainingBalance || 0), 0);

  const todayExpenses = expenses
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const todayProfit = todayRevenue - todayExpenses;

  // 2. MONTHLY PERFORMANCE CALCULATIONS
  const currentMonth = todayStr.substring(0, 7); // e.g. "2026-09"
  const monthBookings = bookings.filter(b => b.date.startsWith(currentMonth));
  const monthActiveBookings = monthBookings.filter(b => b.status !== 'cancelled');
  const monthRevenue = monthActiveBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const monthCollected = monthActiveBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  const monthOutstanding = monthActiveBookings.reduce((sum, b) => sum + (b.remainingBalance || 0), 0);
  const monthCancelled = monthBookings.filter(b => b.status === 'cancelled');
  const cancellationAmount = monthCancelled.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const monthExpenses = expenses
    .filter(e => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const monthProfit = monthRevenue - monthExpenses;
  const avgBookingValue = monthActiveBookings.length > 0 ? monthRevenue / monthActiveBookings.length : 0;

  // 3. REVENUE CHART DATA GENERATION
  const monthlyChartData = [
    { name: 'May', revenue: 4200, expenses: 1800, profit: 2400 },
    { name: 'Jun', revenue: 5800, expenses: 2100, profit: 3700 },
    { name: 'Jul', revenue: 7400, expenses: 2600, profit: 4800 },
    { name: 'Aug', revenue: 8900, expenses: 2950, profit: 5950 },
    { name: 'Sep (Now)', revenue: Math.round(monthRevenue + 3200), expenses: Math.round(monthExpenses + 1100), profit: Math.round(monthProfit + 2100) }
  ];

  const dailyChartData = [
    { name: 'Mon', revenue: 450, expenses: 120, profit: 330 },
    { name: 'Tue', revenue: 620, expenses: 80, profit: 540 },
    { name: 'Wed', revenue: 550, expenses: 145, profit: 405 },
    { name: 'Thu', revenue: 820, expenses: 95, profit: 725 },
    { name: 'Fri (Today)', revenue: Math.round(todayRevenue), expenses: Math.round(todayExpenses), profit: Math.round(todayProfit) },
    { name: 'Sat (Proj)', revenue: 1450, expenses: 250, profit: 1200 },
    { name: 'Sun (Proj)', revenue: 1800, expenses: 300, profit: 1500 }
  ];

  const chartData = chartPeriod === 'daily' ? dailyChartData : monthlyChartData;

  // Booking type breakdown for analytics
  const typeCountMap: Record<string, number> = {};
  bookings.forEach(b => {
    typeCountMap[b.bookingTypeName] = (typeCountMap[b.bookingTypeName] || 0) + 1;
  });
  const typePieData = Object.entries(typeCountMap).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#f97316'];

  // Upcoming matches (sorted by date and time)
  const upcomingFixtures = [...bookings]
    .filter(b => b.status !== 'cancelled')
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome & Arena Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-emerald-700/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Arena Operations Center
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              {businessProfile.arenaName}
            </h2>
            <p className="text-xs md:text-sm text-emerald-100/80 leading-relaxed">
              {businessProfile.tagline}
            </p>
          </div>

          {/* Quick Action Dashboard Buttons */}
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => setIsCreateBookingOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Booking</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <CalendarDays className="w-4 h-4" />
              <span>View Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('outstanding')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <AlertCircle className="w-4 h-4 text-amber-300" />
              <span>Outstanding ({bookings.filter(b => b.remainingBalance > 0).length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. TODAY'S OVERVIEW CARDS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Today's Overview ({todayStr})</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-time daily ledger</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Today's Bookings */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Bookings</span>
              <CalendarDays className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {todayBookings.length}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Scheduled fixtures</span>
          </div>

          {/* Today's Revenue */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Revenue</span>
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white truncate">
              {businessProfile.currencySymbol}{todayRevenue.toFixed(0)}
            </div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 block font-medium">Gross value</span>
          </div>

          {/* Amount Collected */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Collected</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 truncate">
              {businessProfile.currencySymbol}{todayCollected.toFixed(0)}
            </div>
            <span className="text-[10px] text-emerald-600 mt-1 block font-medium">Bank/Cash received</span>
          </div>

          {/* Outstanding */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Outstanding</span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 truncate">
              {businessProfile.currencySymbol}{todayOutstanding.toFixed(0)}
            </div>
            <span className="text-[10px] text-rose-600 mt-1 block font-medium">Due at check-in</span>
          </div>

          {/* Today's Expenses */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Expenses</span>
              <TrendingDown className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 truncate">
              {businessProfile.currencySymbol}{todayExpenses.toFixed(0)}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block font-medium">Maintenance & costs</span>
          </div>

          {/* Today's Profit */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Net Profit</span>
              <TrendingUp className="w-4 h-4 text-teal-600" />
            </div>
            <div className={`text-2xl font-black truncate ${todayProfit >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600'}`}>
              {businessProfile.currencySymbol}{todayProfit.toFixed(0)}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block font-medium">Revenue − Expenses</span>
          </div>
        </div>
      </section>

      {/* 6. MONTHLY PERFORMANCE & 7. REVENUE CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Revenue Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Revenue, Expenses & Profit Velocity</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Financial trajectory tracking with live margins
              </p>
            </div>

            {/* Period Selector */}
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 self-start">
              {(['daily', 'monthly'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                    chartPeriod === p
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                  name="Expenses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Performance Summary */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Monthly Performance
              </h3>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                September 2026
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs mt-3">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Total Bookings:</span>
                <span className="font-bold text-slate-900 dark:text-white">{monthActiveBookings.length} fixtures</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Gross Revenue:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {businessProfile.currencySymbol}{monthRevenue.toFixed(2)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Total Collected:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {businessProfile.currencySymbol}{monthCollected.toFixed(2)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Total Outstanding:</span>
                <span className="font-bold text-rose-600">
                  {businessProfile.currencySymbol}{monthOutstanding.toFixed(2)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Total Expenses:</span>
                <span className="font-semibold text-amber-600">
                  {businessProfile.currencySymbol}{monthExpenses.toFixed(2)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Net Profit:</span>
                <span className="font-black text-emerald-600 text-sm">
                  {businessProfile.currencySymbol}{monthProfit.toFixed(2)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Avg Booking Value:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {businessProfile.currencySymbol}{avgBookingValue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('finance')}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View Complete P&L Statement</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 8. BOOKING ANALYTICS & UPCOMING FIXTURES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Types & Popularity */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Booking Distribution by Type</span>
          </h3>

          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {typePieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-[11px] divide-y divide-slate-100 dark:divide-slate-800">
            {typePieData.map((item, idx) => (
              <div key={item.name} className="pt-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{item.value} bookings</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Fixtures List */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Upcoming Arena Fixtures & Slots</span>
            </h3>
            <button
              onClick={() => setActiveTab('bookings')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {upcomingFixtures.map(b => (
              <div
                key={b.id}
                onClick={() => {
                  setSelectedBookingId(b.id);
                  setActiveTab('bookings');
                }}
                className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {b.bookingCode}
                    </span>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {b.customerName} ({b.teamName})
                    </span>
                    {b.isNightSession && (
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 px-1.5 py-0.5 rounded font-medium">
                        Night/Lights
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3">
                    <span>📅 {b.date}</span>
                    <span>⏰ {b.startTime} - {b.endTime}</span>
                    <span>🏟️ {b.groundName}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    {businessProfile.currencySymbol}{(b.totalAmount ?? 0).toFixed(2)}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 uppercase tracking-wider ${
                      b.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : b.paymentStatus === 'partially-paid'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {b.paymentStatus.replace('-', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
