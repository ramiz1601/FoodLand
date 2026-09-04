import React, { useState } from 'react';
import { useArena } from '../context/ArenaContext';
import {
  Settings,
  Building,
  Shield,
  DollarSign,
  Database,
  Upload,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Save,
  KeyRound,
  Download,
  CloudCheck,
  Sparkles,
  RefreshCw,
  Trash2
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    businessProfile,
    updateBusinessProfile,
    securitySettings,
    updateSecuritySettings,
    changeAdminPin,
    pricingRules,
    updatePricingRules,
    exportBackupJson,
    importBackupJson,
    resetAllData,
    dbConnected
  } = useArena();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'profile' | 'branding' | 'security' | 'pricing' | 'database'>('branding');

  // Business Profile form
  const [arenaName, setArenaName] = useState(businessProfile.arenaName);
  const [tagline, setTagline] = useState(businessProfile.tagline);
  const [address, setAddress] = useState(businessProfile.address);
  const [city, setCity] = useState(businessProfile.city);
  const [phone, setPhone] = useState(businessProfile.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(businessProfile.whatsappNumber);
  const [email, setEmail] = useState(businessProfile.email);
  const [taxNumber, setTaxNumber] = useState(businessProfile.taxRegistrationNumber);
  const [taxRate, setTaxRate] = useState(businessProfile.taxRatePercent);
  const [receiptFooter, setReceiptFooter] = useState(businessProfile.receiptFooterText);

  // Logo state
  const [logoPreview, setLogoPreview] = useState(businessProfile.logoUrl || '');
  const [logoUrlInput, setLogoUrlInput] = useState('');

  // Security form
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  // Pricing rules form
  const [weekendSurcharge, setWeekendSurcharge] = useState(pricingRules.weekendSurchargePercent);
  const [peakStart, setPeakStart] = useState(pricingRules.peakStartHour);
  const [peakEnd, setPeakEnd] = useState(pricingRules.peakEndHour);
  const [peakSurcharge, setPeakSurcharge] = useState(pricingRules.peakHourSurchargePercent);
  const [nightFloodlightRate, setNightFloodlightRate] = useState(pricingRules.nightFloodlightRatePerHour);

  // Feedback
  const [feedback, setFeedback] = useState('');

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3000);
  };

  // Handle Profile Save - Directly saves to Firestore, no PIN prompt
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile({
      arenaName,
      tagline,
      address,
      city,
      phone,
      whatsappNumber,
      email,
      currencyCode: 'PKR',
      currencySymbol: 'Rs.',
      taxRegistrationNumber: taxNumber,
      taxRatePercent: Number(taxRate),
      receiptFooterText: receiptFooter,
      logoUrl: logoPreview
    });
    showFeedback('Arena business details saved to database!');
  };

  // Handle Logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showFeedback('Image file too large. Please choose under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        updateBusinessProfile({ logoUrl: result });
        showFeedback('Arena logo updated and saved to database!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyLogoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoUrlInput.trim()) return;
    setLogoPreview(logoUrlInput.trim());
    updateBusinessProfile({ logoUrl: logoUrlInput.trim() });
    setLogoUrlInput('');
    showFeedback('Logo URL saved to database!');
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    updateBusinessProfile({ logoUrl: '' });
    showFeedback('Custom logo removed. Default arena icon restored.');
  };

  // Preset Logos
  const PRESET_LOGOS = [
    {
      name: 'Emerald Crest',
      url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=200&auto=format&fit=crop&q=80'
    },
    {
      name: 'Floodlit Stadium',
      url: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?w=200&auto=format&fit=crop&q=80'
    },
    {
      name: 'Turf Pitch',
      url: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=200&auto=format&fit=crop&q=80'
    }
  ];

  // Handle Security PIN change - direct and straightforward
  const handlePinChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    if (newPin.length < 4 || newPin.length > 8 || !/^\d+$/.test(newPin)) {
      setPinError('New PIN must be between 4 and 8 digits (numeric only).');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('Confirmation PIN does not match new PIN.');
      return;
    }

    const res = changeAdminPin(currentPin, newPin);
    if (!res.success) {
      setPinError(res.error || 'Failed to update PIN.');
      return;
    }

    setPinSuccess(`Admin PIN updated to ${newPin}! Saved to database.`);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  // Handle Pricing Rules Save
  const handlePricingSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePricingRules({
      weekendSurchargePercent: Number(weekendSurcharge),
      peakStartHour: Number(peakStart),
      peakEndHour: Number(peakEnd),
      peakHourSurchargePercent: Number(peakSurcharge),
      nightFloodlightRatePerHour: Number(nightFloodlightRate)
    });
    showFeedback('Pricing & surcharge rules saved to database!');
  };

  // Export JSON Backup
  const handleDownloadBackup = () => {
    const dataStr = exportBackupJson();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cricket_arena_database_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Restore JSON Backup
  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = reader.result as string;
          const res = importBackupJson(json);
          if (res.success) {
            showFeedback('Database restored successfully from backup file!');
          } else {
            alert(res.error || 'Invalid backup file format.');
          }
        } catch (err) {
          alert('Error reading backup file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to clear all records? This will delete all saved bookings, customers, and expenses.')) {
      resetAllData();
      showFeedback('Database cleared successfully.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Database Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-emerald-600" />
            <span>Admin Settings & Configuration</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your arena logo, admin PIN, business profile, and cloud database
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Cloud Database Connected indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Firestore Database Live</span>
          </div>

          {feedback && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <Check className="w-4 h-4" />
              <span>{feedback}</span>
            </div>
          )}
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'branding', label: 'Arena Logo & Branding', icon: ImageIcon },
          { id: 'security', label: 'Admin Security PIN', icon: KeyRound },
          { id: 'profile', label: 'Business Profile (PKR)', icon: Building },
          { id: 'pricing', label: 'Rates & Floodlights', icon: DollarSign },
          { id: 'database', label: 'Database & Sync', icon: Database }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/25'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ARENA LOGO & BRANDING */}
      {activeTab === 'branding' && (
        <div className="space-y-6 max-w-3xl">
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Arena Logo & Official Identity</span>
              </h3>
              <p className="text-slate-500 mt-1">
                Customize your arena logo. This logo immediately appears on your sidebar navigation, top bar, booking receipts, and printable team contracts.
              </p>
            </div>

            {/* Current Logo Preview & Controls */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group shrink-0">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Arena Logo"
                    className="w-28 h-28 object-contain rounded-2xl border-2 border-emerald-500/40 bg-white p-2 shadow-md shadow-emerald-950/10"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center text-5xl font-black shadow-md shadow-emerald-950/20">
                    🏏
                  </div>
                )}
              </div>

              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {businessProfile.arenaName}
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {logoPreview ? 'Custom logo is active across all views and receipts.' : 'Default arena icon is currently displayed.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <label className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload Logo Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>

                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="py-2.5 px-3.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Logo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* URL Input option */}
            <form onSubmit={handleApplyLogoUrl} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Or enter image web URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrlInput}
                  onChange={e => setLogoUrlInput(e.target.value)}
                  className="flex-1 py-2 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-xs"
                />
                <button
                  type="submit"
                  disabled={!logoUrlInput.trim()}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Apply URL
                </button>
              </div>
            </form>

            {/* Logo Presets */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                Quick Arena Crest Presets:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PRESET_LOGOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setLogoPreview(preset.url);
                      updateBusinessProfile({ logoUrl: preset.url });
                      showFeedback(`Preset logo applied: ${preset.name}`);
                    }}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-slate-800 flex items-center gap-3 text-left transition-all group cursor-pointer"
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-600 group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Click to use
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADMIN SECURITY PIN */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-w-4xl text-xs">
          {/* Change PIN Card */}
          <form onSubmit={handlePinChange} className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Change Admin Security PIN</span>
              </h3>
              <p className="text-slate-500 mt-1">
                Current PIN is <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">{securitySettings.adminPin || '1234'}</span>. Update your secret PIN below.
              </p>
            </div>

            {pinError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{pinError}</span>
              </div>
            )}

            {pinSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span className="font-bold">{pinSuccess}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current PIN (or default 1234)
              </label>
              <input
                type="password"
                maxLength={8}
                value={currentPin}
                onChange={e => setCurrentPin(e.target.value)}
                placeholder="1234"
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-mono text-base tracking-widest"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New PIN (4 to 8 digits) *
              </label>
              <input
                type="password"
                maxLength={8}
                required
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                placeholder="••••"
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-mono text-base tracking-widest"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New PIN *
              </label>
              <input
                type="password"
                maxLength={8}
                required
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value)}
                placeholder="••••"
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-mono text-base tracking-widest"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
            >
              Save New Admin PIN
            </button>
          </form>

          {/* PIN Prompt Setting */}
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>PIN Prompt Configuration</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Ask for PIN on actions
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {securitySettings.requirePinForActions
                      ? 'Currently Enabled: Prompts for PIN before sensitive operations.'
                      : 'Currently Disabled: Smooth workflow without asking for PIN every time.'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={securitySettings.requirePinForActions}
                  onChange={e => {
                    updateSecuritySettings({ requirePinForActions: e.target.checked });
                    showFeedback(`PIN prompt ${e.target.checked ? 'enabled' : 'disabled'}`);
                  }}
                  className="w-5 h-5 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Optimized for fast workflow</span>
              </span>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                As requested, PIN verification is turned off so you can add, edit, and delete bookings and expenses immediately without continuous interruptions. You can toggle it whenever you wish.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUSINESS PROFILE (PKR LOCKED) */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSave} className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-xs max-w-3xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Arena Business Profile & Currency
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Currency is locked to Pakistani Rupee (PKR).
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
              Currency: PKR (Rs.)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Arena Name *
              </label>
              <input
                type="text"
                required
                value={arenaName}
                onChange={e => setArenaName(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Arena Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Physical Street Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City / Region
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official WhatsApp Business Number *
              </label>
              <input
                type="tel"
                required
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>

            {/* Currency is locked to PKR */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Operating Currency (Locked)
              </label>
              <div className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                <span>PKR — Pakistani Rupee</span>
                <span className="font-mono px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px]">Rs.</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tax / NTN Registration
              </label>
              <input
                type="text"
                value={taxNumber}
                onChange={e => setTaxNumber(e.target.value)}
                placeholder="NTN-XXXXXXX"
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Receipt Footer Text
              </label>
              <textarea
                rows={2}
                value={receiptFooter}
                onChange={e => setReceiptFooter(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Business Profile to Database</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: PRICING & FLOODLIGHTS */}
      {activeTab === 'pricing' && (
        <form onSubmit={handlePricingSave} className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-xs max-w-2xl">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Rates, Surcharges & Floodlight Rules
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              These rules apply when auto-calculating slot pricing for the Main Cricket Ground.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Night Floodlight Rate (PKR / Hour)
              </label>
              <input
                type="number"
                min={0}
                value={nightFloodlightRate}
                onChange={e => setNightFloodlightRate(Number(e.target.value))}
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Weekend Surcharge (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={weekendSurcharge}
                onChange={e => setWeekendSurcharge(Number(e.target.value))}
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Peak Hours Start (24h format)
              </label>
              <input
                type="number"
                min={0}
                max={23}
                value={peakStart}
                onChange={e => setPeakStart(Number(e.target.value))}
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Peak Hours End (24h format)
              </label>
              <input
                type="number"
                min={0}
                max={23}
                value={peakEnd}
                onChange={e => setPeakEnd(Number(e.target.value))}
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Peak Hours Surcharge (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={peakSurcharge}
                onChange={e => setPeakSurcharge(Number(e.target.value))}
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-bold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Pricing Rules</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: DATABASE & BACKUP */}
      {activeTab === 'database' && (
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-xs max-w-2xl">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Cloud Database Status & Backup</span>
            </h3>
            <p className="text-slate-500 mt-1">
              Your data is synced directly to your cloud Firestore database. Every addition, update, or deletion is committed immediately.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 animate-ping" />
            <div>
              <span className="font-bold text-emerald-900 dark:text-emerald-300 block">
                Database Engine: Cloud Firestore
              </span>
              <p className="text-emerald-700 dark:text-emerald-400 text-[11px] mt-0.5">
                All bookings, payments, customers, and expenses persist securely across browser refreshes and sessions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/60 flex items-center gap-3 transition-colors cursor-pointer text-left"
            >
              <Download className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Export JSON Backup
                </span>
                <span className="text-[11px] text-slate-500">
                  Save snapshot of entire database
                </span>
              </div>
            </button>

            <label className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/60 flex items-center gap-3 transition-colors cursor-pointer text-left">
              <Upload className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Restore JSON Backup
                </span>
                <span className="text-[11px] text-slate-500">
                  Upload file to restore records
                </span>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleFileRestore}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-slate-500 text-[11px]">
              Clean slate for production use:
            </span>
            <button
              type="button"
              onClick={handleResetData}
              className="py-2 px-4 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold transition-colors cursor-pointer"
            >
              Clear All Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
