import React, { useState } from 'react';
import { useArena } from '../context/ArenaContext';
import { WhatsAppTemplate, Booking } from '../types';
import {
  MessageSquare,
  Send,
  Sparkles,
  Smartphone,
  Check,
  RotateCcw,
  Copy,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const WhatsAppView: React.FC = () => {
  const {
    whatsappTemplates,
    updateWhatsAppTemplate,
    resetWhatsAppTemplates,
    bookings,
    businessProfile,
    sendWhatsAppMessage,
    requirePin
  } = useArena();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(whatsappTemplates[0]?.id || 'wt-1');
  const [templateText, setTemplateText] = useState<string>('');
  const [testBookingId, setTestBookingId] = useState<string>(bookings[0]?.id || '');
  const [saveFeedback, setSaveFeedback] = useState('');

  const activeTemplate = whatsappTemplates.find(t => t.id === selectedTemplateId) || whatsappTemplates[0];

  React.useEffect(() => {
    if (activeTemplate) {
      setTemplateText(activeTemplate.message);
    }
  }, [selectedTemplateId, whatsappTemplates]);

  const testBooking = bookings.find(b => b.id === testBookingId) || bookings[0];

  // Render preview replacing variables
  const renderPreview = (text: string, b?: Booking): string => {
    if (!b) return text;
    return text
      .replace(/{customer_name}/g, b.customerName)
      .replace(/{team_name}/g, b.teamName)
      .replace(/{arena_name}/g, businessProfile.arenaName)
      .replace(/{booking_code}/g, b.bookingCode)
      .replace(/{ground_name}/g, b.groundName)
      .replace(/{date}/g, b.date)
      .replace(/{time}/g, `${b.startTime} - ${b.endTime}`)
      .replace(/{total_amount}/g, (b.totalAmount ?? 0).toFixed(2))
      .replace(/{amount_paid}/g, (b.amountPaid ?? 0).toFixed(2))
      .replace(/{balance_due}/g, (b.remainingBalance ?? 0).toFixed(2))
      .replace(/{currency}/g, businessProfile.currencySymbol);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    requirePin('Save WhatsApp Template', `Update template "${activeTemplate.name}"`, () => {
      updateWhatsAppTemplate(selectedTemplateId, templateText);
      setSaveFeedback('Template updated successfully!');
      setTimeout(() => setSaveFeedback(''), 2500);
    });
  };

  const handleTestSend = () => {
    if (testBooking && activeTemplate) {
      sendWhatsAppMessage(activeTemplate.type, testBooking);
    }
  };

  const insertVariable = (variable: string) => {
    setTemplateText(prev => prev + ' ' + variable);
  };

  const variables = [
    '{customer_name}',
    '{team_name}',
    '{arena_name}',
    '{booking_code}',
    '{ground_name}',
    '{date}',
    '{time}',
    '{total_amount}',
    '{amount_paid}',
    '{balance_due}',
    '{currency}'
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-emerald-600" />
            <span>WhatsApp Communications & Reminders Hub</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure automated fixture notifications, match alerts, payment reminders & digital receipt delivery
          </p>
        </div>

        <button
          onClick={() => {
            requirePin('Reset WhatsApp Templates', 'Restore default official templates', () => {
              resetWhatsAppTemplates();
            });
          }}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Main Grid: Template Editor vs Live Phone Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Template Selector & Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Template Selection Tabs */}
          <div className="flex flex-wrap gap-2">
            {whatsappTemplates.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplateId(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedTemplateId === t.id
                    ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/25'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Editor Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {activeTemplate.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize text tokens to automatically personalize messages
                </p>
              </div>

              {saveFeedback && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>{saveFeedback}</span>
                </span>
              )}
            </div>

            {/* Variable Pills */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Click Token to Insert:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {variables.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <textarea
                rows={9}
                value={templateText}
                onChange={e => setTemplateText(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none font-mono leading-relaxed focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Requires Admin PIN</span>
                </span>

                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Live Preview & Testing Box (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Live WhatsApp Message Preview</span>
              </h3>
            </div>

            {/* Select test booking */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Preview with Test Fixture:
              </label>
              <select
                value={testBookingId}
                onChange={e => setTestBookingId(e.target.value)}
                className="w-full py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none"
              >
                {bookings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.bookingCode} — {b.teamName} ({b.date})
                  </option>
                ))}
              </select>
            </div>

            {/* Chat Bubble Simulation */}
            <div className="p-4 rounded-2xl bg-[#0b141a] text-white border border-[#202c33] space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-[#202c33] pb-2 text-[11px] text-[#8696a0]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                    🏏
                  </div>
                  <span className="font-bold text-white">{businessProfile.arenaName}</span>
                </div>
                <span>Today</span>
              </div>

              {/* WhatsApp Bubble */}
              <div className="bg-[#005c4b] p-3.5 rounded-2xl rounded-tr-xs text-xs text-[#e9edef] whitespace-pre-wrap leading-relaxed shadow-sm">
                {renderPreview(templateText, testBooking)}
                <div className="text-right text-[10px] text-[#8696a0] mt-1">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                </div>
              </div>
            </div>

            {/* Test Send Trigger */}
            <button
              onClick={handleTestSend}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Launch Live WhatsApp Web / App</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
