import React, { useState } from 'react';
import { useArena } from '../context/ArenaContext';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Printer,
  PieChart as PieChartIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const FinanceView: React.FC = () => {
  const { bookings, expenses, businessProfile } = useArena();

  const [dateRange, setDateRange] = useState<'month' | 'year' | 'all'>('month');

  // Filter by selected period
  const today = new Date();
  const currentMonth = today.toISOString().substring(0, 7); // "2026-09"
  const currentYear = today.toISOString().substring(0, 4); // "2026"

  const filteredBookings = bookings.filter(b => {
    if (dateRange === 'month') return b.date.startsWith(currentMonth);
    if (dateRange === 'year') return b.date.startsWith(currentYear);
    return true;
  });

  const filteredExpenses = expenses.filter(e => {
    if (dateRange === 'month') return e.date.startsWith(currentMonth);
    if (dateRange === 'year') return e.date.startsWith(currentYear);
    return true;
  });

  // Calculate detailed P&L Line Items
  const completedOrConfirmed = filteredBookings.filter(b => b.status !== 'cancelled');
  const cancelledBookings = filteredBookings.filter(b => b.status === 'cancelled');

  const groundBaseRevenue = completedOrConfirmed.reduce((sum, b) => sum + (b.baseRate || 0), 0);
  const floodlightRevenue = completedOrConfirmed.reduce((sum, b) => sum + (b.floodlightCharges || 0), 0);
  const equipmentRevenue = completedOrConfirmed.reduce((sum, b) => sum + (b.equipmentCharges || 0), 0);
  const additionalServicesRevenue = completedOrConfirmed.reduce((sum, b) => sum + (b.additionalServicesCharges || 0), 0);
  const discountsGiven = completedOrConfirmed.reduce((sum, b) => sum + (b.discount || 0), 0);
  const taxesCollected = completedOrConfirmed.reduce((sum, b) => sum + (b.taxAmount || 0), 0);

  const grossBookingRevenue =
    groundBaseRevenue + floodlightRevenue + equipmentRevenue + additionalServicesRevenue;
  const netRevenue = grossBookingRevenue - discountsGiven + taxesCollected;
  const collectedCashFlow = completedOrConfirmed.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  const pendingReceivables = completedOrConfirmed.reduce((sum, b) => sum + (b.remainingBalance || 0), 0);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netOperatingProfit = netRevenue - totalExpenses;
  const profitMarginPercent = netRevenue > 0 ? (netOperatingProfit / netRevenue) * 100 : 0;

  // Comparison chart data
  const comparisonData = [
    { name: 'Ground Base', amount: Math.round(groundBaseRevenue) },
    { name: 'Floodlights', amount: Math.round(floodlightRevenue) },
    { name: 'Equipment', amount: Math.round(equipmentRevenue) },
    { name: 'Expenses', amount: Math.round(totalExpenses) },
    { name: 'Net Profit', amount: Math.max(0, Math.round(netOperatingProfit)) }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>Financial Profit & Loss Statement</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Accrual & cash ledger, itemized revenue streams, cost accounting, and net margin
          </p>
        </div>

        {/* Date range picker & Print */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 shadow-xs">
            {(['month', 'year', 'all'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setDateRange(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  dateRange === mode
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {mode === 'month' ? 'This Month' : mode === 'year' ? 'Year 2026' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            title="Print Financial Statement"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Net Arena Revenue
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {businessProfile.currencySymbol}{netRevenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">
            Collected: {businessProfile.currencySymbol}{collectedCashFlow.toFixed(2)}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Operational Expenses
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {businessProfile.currencySymbol}{totalExpenses.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {filteredExpenses.length} bills & invoices
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Net Operating Profit
          </span>
          <div
            className={`text-2xl font-black mt-1 ${
              netOperatingProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
            }`}
          >
            {businessProfile.currencySymbol}{netOperatingProfit.toFixed(2)}
          </div>
          <span className="text-[11px] text-teal-600 font-semibold mt-1 block">
            Profit Margin: {profitMarginPercent.toFixed(1)}%
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Uncollected Receivables
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {businessProfile.currencySymbol}{pendingReceivables.toFixed(2)}
          </div>
          <span className="text-[11px] text-rose-600 mt-1 block">
            Due from active fixtures
          </span>
        </div>
      </div>

      {/* Itemized P&L Statement Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-6 md:p-8 space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Statement of Income & Operational Expenditure
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Period: {dateRange === 'month' ? 'Current Month (Sep 2026)' : dateRange === 'year' ? 'Fiscal Year 2026' : 'Cumulative'}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">All figures in {businessProfile.currency}</span>
        </div>

        <div className="space-y-4 text-xs">
          {/* 1. REVENUE SECTION */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
              1. Operating Revenue Streams
            </h4>
            <div className="space-y-1.5 pl-3 border-l-2 border-emerald-500">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300">Ground & Pitch Hire Base Fees:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {businessProfile.currencySymbol}{groundBaseRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300">Night LED Floodlight Charges:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {businessProfile.currencySymbol}{floodlightRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300">Equipment Rental (Balls, Bowling Machine, Gear):</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {businessProfile.currencySymbol}{equipmentRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300">Additional Services (Umpires, Scoring, Dressing):</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {businessProfile.currencySymbol}{additionalServicesRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-emerald-600">
                <span>Promotional Discounts Allowed:</span>
                <span className="font-semibold">
                  -{businessProfile.currencySymbol}{discountsGiven.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-slate-500">
                <span>Tax Reg ({businessProfile.taxRatePercent}%):</span>
                <span>{businessProfile.currencySymbol}{taxesCollected.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-slate-900 dark:text-white text-sm">
                <span>NET REVENUE:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {businessProfile.currencySymbol}{netRevenue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* 2. OPERATIONAL EXPENSES SECTION */}
          <div className="space-y-2 pt-3">
            <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
              2. Operational & Facility Costs
            </h4>
            <div className="space-y-1.5 pl-3 border-l-2 border-amber-500">
              {filteredExpenses.map(exp => (
                <div
                  key={exp.id}
                  className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800"
                >
                  <span className="text-slate-700 dark:text-slate-300">
                    {exp.title} ({exp.category.replace('-', ' ')}):
                  </span>
                  <span className="font-semibold text-amber-600">
                    {businessProfile.currencySymbol}{(exp.amount ?? 0).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between py-1.5 font-bold text-slate-900 dark:text-white text-sm">
                <span>TOTAL OPERATING EXPENSES:</span>
                <span className="text-amber-600 dark:text-amber-400">
                  {businessProfile.currencySymbol}{totalExpenses.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* 3. NET INCOME SUMMARY */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 mt-4">
            <div className="flex justify-between items-center text-base font-black text-slate-900 dark:text-white">
              <span>NET OPERATING INCOME (EBITDA):</span>
              <span
                className={netOperatingProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}
              >
                {businessProfile.currencySymbol}{netOperatingProfit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Operational Profit Margin:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{profitMarginPercent.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
