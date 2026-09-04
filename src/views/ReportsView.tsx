import React, { useState } from 'react';
import { useArena } from '../context/ArenaContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  Calendar,
  Filter,
  BarChart3,
  Building2,
  Users,
  DollarSign
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { bookings, expenses, grounds, customers, businessProfile } = useArena();

  const [activeReport, setActiveReport] = useState<string>('bookings');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const reportTypes = [
    { id: 'bookings', label: 'Match Bookings Report', icon: FileSpreadsheet },
    { id: 'revenue', label: 'Revenue & Sales Stream', icon: DollarSign },
    { id: 'expenses', label: 'Operational Expense Audit', icon: BarChart3 },
    { id: 'outstanding', label: 'Outstanding Receivables', icon: Filter },
    { id: 'utilization', label: 'Pitch Utilization & Hours', icon: Building2 },
    { id: 'customers', label: 'Customer Loyalty & Teams', icon: Users }
  ];

  // Export CSV generator
  const exportToCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `cricket_arena_${activeReport}_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeReport === 'bookings') {
      headers = ['Booking Code', 'Customer', 'Team', 'Phone', 'Ground', 'Date', 'Time', 'Total', 'Paid', 'Balance', 'Status'];
      rows = bookings.map(b => [
        b.bookingCode,
        b.customerName,
        b.teamName,
        b.customerPhone,
        b.groundName,
        b.date,
        `${b.startTime}-${b.endTime}`,
        b.totalAmount,
        b.amountPaid,
        b.remainingBalance,
        b.status
      ]);
    } else if (activeReport === 'revenue') {
      headers = ['Booking Code', 'Customer', 'Team', 'Date', 'Base Rate', 'Floodlights', 'Equipment', 'Services', 'Discount', 'Total'];
      rows = bookings.map(b => [
        b.bookingCode,
        b.customerName,
        b.teamName,
        b.date,
        b.baseRate,
        b.floodlightCharges,
        b.equipmentCharges,
        b.additionalServicesCharges,
        b.discount,
        b.totalAmount
      ]);
    } else if (activeReport === 'expenses') {
      headers = ['Date', 'Title', 'Category', 'Vendor', 'Invoice Ref', 'Amount'];
      rows = expenses.map(e => [e.date, e.title, e.category, e.vendor || '', e.receiptNumber || '', e.amount]);
    } else if (activeReport === 'outstanding') {
      headers = ['Booking Code', 'Customer', 'Team', 'Phone', 'Ground', 'Date', 'Agreed Fee', 'Paid', 'Outstanding Due'];
      rows = bookings
        .filter(b => b.remainingBalance > 0)
        .map(b => [
          b.bookingCode,
          b.customerName,
          b.teamName,
          b.customerPhone,
          b.groundName,
          b.date,
          b.totalAmount,
          b.amountPaid,
          b.remainingBalance
        ]);
    } else if (activeReport === 'utilization') {
      headers = ['Pitch Name', 'Type', 'Total Bookings', 'Total Hours Reserved', 'Weekday Rate', 'Status'];
      rows = grounds.map(g => {
        const gBookings = bookings.filter(b => b.groundId === g.id && b.status !== 'cancelled');
        const hours = gBookings.reduce((sum, b) => sum + b.durationHours, 0);
        return [g.name, g.pitchType, gBookings.length, hours, g.hourlyRate, g.status];
      });
    } else if (activeReport === 'customers') {
      headers = ['Captain Name', 'Team Name', 'Phone', 'WhatsApp', 'Email', 'Total Fixtures', 'Total Spent', 'Balance'];
      rows = customers.map(c => [
        c.name,
        c.teamName,
        c.phone,
        c.whatsapp,
        c.email,
        c.totalBookings,
        c.totalSpent,
        c.outstandingBalance
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            <span>Business Intelligence & Management Reports</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Multi-dimensional reporting, CSV exports, pitch utilization metrics, and audit statements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex flex-wrap gap-2">
        {reportTypes.map(rep => {
          const Icon = rep.icon;
          const isActive = activeReport === rep.id;
          return (
            <button
              key={rep.id}
              onClick={() => setActiveReport(rep.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{rep.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Content Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            {reportTypes.find(r => r.id === activeReport)?.label}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {businessProfile.arenaName} • Confidential
          </span>
        </div>

        <div className="overflow-x-auto">
          {activeReport === 'bookings' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Ref</th>
                  <th className="p-3">Team & Captain</th>
                  <th className="p-3">Facility</th>
                  <th className="p-3">Date / Time</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Paid</th>
                  <th className="p-3">Balance</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td className="p-3 font-mono font-bold text-emerald-600">{b.bookingCode}</td>
                    <td className="p-3 font-semibold">{b.teamName} ({b.customerName})</td>
                    <td className="p-3">{b.groundName}</td>
                    <td className="p-3">{b.date} ({b.startTime}-{b.endTime})</td>
                    <td className="p-3 font-bold">{businessProfile.currencySymbol}{(b.totalAmount ?? 0).toFixed(2)}</td>
                    <td className="p-3 text-emerald-600">{businessProfile.currencySymbol}{(b.amountPaid ?? 0).toFixed(2)}</td>
                    <td className="p-3 text-rose-600">{businessProfile.currencySymbol}{(b.remainingBalance ?? 0).toFixed(2)}</td>
                    <td className="p-3 uppercase font-bold text-[10px]">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'revenue' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Team</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Base Pitch</th>
                  <th className="p-3">Floodlights</th>
                  <th className="p-3">Equipment</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Gross Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td className="p-3 font-mono font-bold">{b.bookingCode}</td>
                    <td className="p-3 font-semibold">{b.teamName}</td>
                    <td className="p-3">{b.date}</td>
                    <td className="p-3">{businessProfile.currencySymbol}{(b.baseRate ?? 0).toFixed(2)}</td>
                    <td className="p-3">{businessProfile.currencySymbol}{(b.floodlightCharges ?? 0).toFixed(2)}</td>
                    <td className="p-3">{businessProfile.currencySymbol}{(b.equipmentCharges ?? 0).toFixed(2)}</td>
                    <td className="p-3 text-emerald-600">-{businessProfile.currencySymbol}{(b.discount ?? 0).toFixed(2)}</td>
                    <td className="p-3 font-bold">{businessProfile.currencySymbol}{(b.totalAmount ?? 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'expenses' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Vendor</th>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.map(e => (
                  <tr key={e.id}>
                    <td className="p-3">{e.date}</td>
                    <td className="p-3 font-semibold">{e.title}</td>
                    <td className="p-3 capitalize">{e.category.replace('-', ' ')}</td>
                    <td className="p-3">{e.vendor || '—'}</td>
                    <td className="p-3 font-mono">{e.receiptNumber || '—'}</td>
                    <td className="p-3 font-bold text-amber-600">{businessProfile.currencySymbol}{(e.amount ?? 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'outstanding' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Ref</th>
                  <th className="p-3">Team</th>
                  <th className="p-3">Captain Contact</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Total Agreed</th>
                  <th className="p-3">Paid</th>
                  <th className="p-3">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bookings
                  .filter(b => (b.remainingBalance ?? 0) > 0)
                  .map(b => (
                    <tr key={b.id}>
                      <td className="p-3 font-mono font-bold">{b.bookingCode}</td>
                      <td className="p-3 font-semibold">{b.teamName}</td>
                      <td className="p-3">{b.customerName} ({b.customerPhone})</td>
                      <td className="p-3">{b.date}</td>
                      <td className="p-3">{businessProfile.currencySymbol}{(b.totalAmount ?? 0).toFixed(2)}</td>
                      <td className="p-3 text-emerald-600">{businessProfile.currencySymbol}{(b.amountPaid ?? 0).toFixed(2)}</td>
                      <td className="p-3 font-bold text-rose-600">{businessProfile.currencySymbol}{(b.remainingBalance ?? 0).toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {activeReport === 'utilization' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Pitch / Facility</th>
                  <th className="p-3">Surface Type</th>
                  <th className="p-3">Bookings Count</th>
                  <th className="p-3">Total Hours Played</th>
                  <th className="p-3">Hourly Rate</th>
                  <th className="p-3">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {grounds.map(g => {
                  const gBookings = bookings.filter(b => b.groundId === g.id && b.status !== 'cancelled');
                  const hours = gBookings.reduce((sum, b) => sum + (b.durationHours || 0), 0);
                  return (
                    <tr key={g.id}>
                      <td className="p-3 font-bold">{g.name}</td>
                      <td className="p-3 capitalize">{g.pitchType.replace('-', ' ')}</td>
                      <td className="p-3 font-semibold">{gBookings.length} fixtures</td>
                      <td className="p-3 font-bold text-emerald-600">{hours} Hours</td>
                      <td className="p-3">{businessProfile.currencySymbol}{g.hourlyRate}/h</td>
                      <td className="p-3 capitalize">{g.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeReport === 'customers' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Captain Name</th>
                  <th className="p-3">Team Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Total Matches</th>
                  <th className="p-3">Lifetime Spent</th>
                  <th className="p-3">Current Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customers.map(c => (
                  <tr key={c.id}>
                    <td className="p-3 font-bold">{c.name}</td>
                    <td className="p-3 font-semibold text-emerald-600">{c.teamName}</td>
                    <td className="p-3">{c.phone}</td>
                    <td className="p-3 font-semibold">{c.totalBookings ?? 0}</td>
                    <td className="p-3 font-bold">{businessProfile.currencySymbol}{(c.totalSpent ?? 0).toFixed(2)}</td>
                    <td className="p-3 text-rose-600 font-bold">{businessProfile.currencySymbol}{(c.outstandingBalance ?? 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
