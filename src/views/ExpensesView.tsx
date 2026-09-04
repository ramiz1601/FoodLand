import React, { useState } from 'react';
import { useArena } from '../context/ArenaContext';
import { Expense, ExpenseCategory } from '../types';
import {
  TrendingDown,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Tag,
  Edit2,
  Trash2,
  X,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const ExpensesView: React.FC = () => {
  const { expenses, businessProfile, createExpense, updateExpense, deleteExpense, requirePin } = useArena();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('electricity-floodlights');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Category summary for analytics
  const categoryMap: Record<string, number> = {};
  expenses.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });
  const pieData = Object.entries(categoryMap).map(([cat, val]) => ({
    name: cat.replace('-', ' '),
    value: val
  }));
  const COLORS = ['#f43f5e', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899'];

  const openAdd = () => {
    setEditingExpense(null);
    setTitle('');
    setCategory('electricity-floodlights');
    setAmount(0);
    setDate(new Date().toISOString().split('T')[0]);
    setVendor('');
    setReceiptNumber('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEdit = (e: Expense) => {
    setEditingExpense(e);
    setTitle(e.title);
    setCategory(e.category);
    setAmount(e.amount);
    setDate(e.date);
    setVendor(e.vendor || '');
    setReceiptNumber(e.receiptNumber || '');
    setNotes(e.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    if (editingExpense) {
      requirePin('Edit Operational Expense', `Update expense "${title}" (${businessProfile.currencySymbol}${amount})`, () => {
        updateExpense(editingExpense.id, {
          title,
          category,
          amount: Number(amount),
          date,
          vendor,
          receiptNumber,
          notes
        });
        setIsModalOpen(false);
      });
    } else {
      requirePin('Add Arena Expense', `Record expense "${title}" of ${businessProfile.currencySymbol}${amount}`, () => {
        createExpense({
          title,
          category,
          amount: Number(amount),
          date,
          vendor,
          receiptNumber,
          notes
        });
        setIsModalOpen(false);
      });
    }
  };

  const handleDelete = (exp: Expense) => {
    requirePin('Delete Expense', `Remove expense "${exp.title}" (${businessProfile.currencySymbol}${exp.amount})`, () => {
      deleteExpense(exp.id);
    });
  };

  const filtered = expenses.filter(e => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      e.title.toLowerCase().includes(q) ||
      (e.vendor && e.vendor.toLowerCase().includes(q)) ||
      (e.receiptNumber && e.receiptNumber.toLowerCase().includes(q));
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <TrendingDown className="w-6 h-6 text-amber-500" />
            <span>Arena Operational Expenses</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track floodlight power, ground staff, turf maintenance, equipment repairs, and overheads
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* KPI & Chart Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Metric Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Recorded Expenses
            </span>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {businessProfile.currencySymbol}{(totalExpenseAmount ?? 0).toFixed(2)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Across {expenses.length} recorded payments and supplier invoices
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs font-semibold">
            <span className="text-slate-500">Categories Monitored:</span>
            <span className="text-slate-800 dark:text-slate-200">{Object.keys(categoryMap).length}</span>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-6">
          <div className="w-full sm:w-1/2 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full sm:w-1/2 space-y-1.5 text-xs">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-slate-600 dark:text-slate-300 capitalize truncate">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {businessProfile.currencySymbol}{(item.value ?? 0).toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by expense title, vendor, or invoice #..."
            className="w-full py-2 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 outline-none"
        >
          <option value="all">All Categories</option>
          <option value="electricity-floodlights">Electricity & Floodlights</option>
          <option value="ground-maintenance">Ground & Turf Maintenance</option>
          <option value="equipment-purchase">Equipment & Gear</option>
          <option value="staff-wages">Staff & Umpires</option>
          <option value="water-irrigation">Water & Irrigation</option>
          <option value="miscellaneous">Miscellaneous</option>
        </select>
      </div>

      {/* Expense Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Expense Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Vendor / Supplier</th>
                <th className="py-3.5 px-4">Invoice Ref</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No expenses found matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(exp => (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                      {exp.date}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{exp.title}</div>
                      {exp.notes && <div className="text-[10px] text-slate-400 mt-0.5">{exp.notes}</div>}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                        {exp.category.replace('-', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {exp.vendor || '—'}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {exp.receiptNumber || '—'}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400 text-sm">
                      {businessProfile.currencySymbol}{(exp.amount ?? 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(exp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                          title="Edit Expense"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingExpense ? 'Edit Expense Record' : 'Record Arena Operational Expense'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. September High-Mast Electric Bill"
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none capitalize"
                  >
                    <option value="electricity-floodlights">Electricity & Floodlights</option>
                    <option value="ground-maintenance">Ground & Turf Maintenance</option>
                    <option value="equipment-purchase">Equipment & Gear</option>
                    <option value="staff-wages">Staff & Umpires</option>
                    <option value="water-irrigation">Water & Irrigation</option>
                    <option value="marketing">Marketing & Promotion</option>
                    <option value="miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount ({businessProfile.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount || ''}
                    onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vendor / Supplier
                  </label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={e => setVendor(e.target.value)}
                    placeholder="e.g. City Electric Power"
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Invoice / Receipt Number
                </label>
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={e => setReceiptNumber(e.target.value)}
                  placeholder="e.g. INV-98124"
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Paid via corporate debit card"
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
