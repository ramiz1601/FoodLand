import React, { useState } from 'react';
import { useArena } from '../context/ArenaContext';
import { Ground, PitchType, GroundStatus } from '../types';
import {
  Building2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  X,
  Save,
  Check
} from 'lucide-react';

export const GroundsView: React.FC = () => {
  const { grounds, businessProfile, updateGround } = useArena();

  // The single ground
  const mainGround: Ground = grounds[0] || {
    id: 'ground-main',
    name: 'Main Cricket Ground',
    type: 'main-ground',
    description: 'Full size championship cricket stadium with professional natural turf wicket, 65m boundary, sight screens, and high-mast LED floodlights.',
    capacity: 22,
    pitchType: 'natural-turf',
    hourlyRate: 5000,
    dayRate: 35000,
    nightRate: 6500,
    weekendRate: 6000,
    floodlightRatePerHour: 1500,
    hasFloodlights: true,
    status: 'available',
    features: ['Full Boundary', 'Turf Pitch', 'LED Floodlights', 'Dugouts & Pavilion', 'Sight Screens', 'Digital Scoreboard']
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Form states
  const [name, setName] = useState(mainGround.name);
  const [pitchType, setPitchType] = useState<PitchType>(mainGround.pitchType);
  const [status, setStatus] = useState<GroundStatus>(mainGround.status);
  const [hourlyRate, setHourlyRate] = useState<number>(mainGround.hourlyRate);
  const [weekendRate, setWeekendRate] = useState<number>(mainGround.weekendRate);
  const [nightRate, setNightRate] = useState<number>(mainGround.nightRate);
  const [floodlightRate, setFloodlightRate] = useState<number>(mainGround.floodlightRatePerHour);
  const [hasFloodlights, setHasFloodlights] = useState<boolean>(mainGround.hasFloodlights ?? true);
  const [description, setDescription] = useState(mainGround.description || '');

  const openEdit = () => {
    setName(mainGround.name);
    setPitchType(mainGround.pitchType);
    setStatus(mainGround.status);
    setHourlyRate(mainGround.hourlyRate);
    setWeekendRate(mainGround.weekendRate);
    setNightRate(mainGround.nightRate);
    setFloodlightRate(mainGround.floodlightRatePerHour);
    setHasFloodlights(mainGround.hasFloodlights ?? true);
    setDescription(mainGround.description || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateGround(mainGround.id, {
      name,
      pitchType,
      status,
      hourlyRate: Number(hourlyRate),
      weekendRate: Number(weekendRate),
      nightRate: Number(nightRate),
      floodlightRatePerHour: Number(floodlightRate),
      hasFloodlights,
      description
    });
    setIsModalOpen(false);
    setFeedback('Ground specifications and rates saved to database!');
    setTimeout(() => setFeedback(''), 3000);
  };

  const statusBadge = (s: GroundStatus) => {
    switch (s) {
      case 'available':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'maintenance':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'closed':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-emerald-600" />
            <span>Cricket Ground & Pitch Facility</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Arena facility configuration, turf wicket specifications, rates in PKR and floodlight status
          </p>
        </div>

        <div className="flex items-center gap-3">
          {feedback && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <Check className="w-4 h-4" />
              <span>{feedback}</span>
            </div>
          )}

          <button
            onClick={openEdit}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Ground & Rates</span>
          </button>
        </div>
      </div>

      {/* Main Ground Feature Card */}
      <div className="max-w-4xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Banner */}
        <div className="relative h-48 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 flex flex-col justify-end text-white overflow-hidden">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${statusBadge(
                mainGround.status
              )}`}
            >
              ● {mainGround.status}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
              Only Ground
            </span>
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-black">{mainGround.name}</h3>
            <p className="text-xs text-emerald-200 mt-1 capitalize font-medium flex items-center gap-2">
              <span>{mainGround.pitchType.replace('-', ' ')}</span>
              <span>•</span>
              <span>Capacity: {mainGround.capacity} Players</span>
              {mainGround.hasFloodlights && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                    High-Mast Floodlit
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Details & Pricing */}
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-slate-500 mb-2">
              Facility Description
            </h4>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {mainGround.description || 'Championship standard cricket ground with floodlight arena and natural turf wicket.'}
            </p>
          </div>

          {/* Pricing Grid in PKR */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-slate-500 mb-3">
              Rental Rates (PKR)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Weekday Rate</span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  Rs. {mainGround.hourlyRate?.toLocaleString() || 0}
                </span>
                <span className="text-[10px] text-slate-400 block">per hour</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Weekend Rate</span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  Rs. {mainGround.weekendRate?.toLocaleString() || 0}
                </span>
                <span className="text-[10px] text-slate-400 block">per hour</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Night Match Rate</span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  Rs. {mainGround.nightRate?.toLocaleString() || 0}
                </span>
                <span className="text-[10px] text-slate-400 block">per hour</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Floodlights Add-on</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  +Rs. {mainGround.floodlightRatePerHour?.toLocaleString() || 0}
                </span>
                <span className="text-[10px] text-slate-400 block">per hour</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-slate-500 mb-3">
              Included Amenities & Equipment
            </h4>
            <div className="flex flex-wrap gap-2">
              {(mainGround.features || ['Full Boundary', 'Turf Pitch', 'LED Floodlights', 'Dugouts & Pavilion', 'Digital Scoreboard']).map((feat, i) => (
                <span
                  key={i}
                  className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{feat}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Ground Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Edit Main Cricket Ground</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ground Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pitch Surface Type
                  </label>
                  <select
                    value={pitchType}
                    onChange={e => setPitchType(e.target.value as PitchType)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
                  >
                    <option value="natural-turf">Natural Turf Pitch</option>
                    <option value="astro-turf">Astro Turf</option>
                    <option value="matting">Coir Matting Pitch</option>
                    <option value="concrete">Cement / Hard Pitch</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as GroundStatus)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-bold"
                  >
                    <option value="available">Available for Bookings</option>
                    <option value="maintenance">Under Pitch Maintenance</option>
                    <option value="closed">Temporarily Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Weekday Rate (PKR/hr)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={hourlyRate}
                    onChange={e => setHourlyRate(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Weekend Rate (PKR/hr)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={weekendRate}
                    onChange={e => setWeekendRate(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Night Rate (PKR/hr)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={nightRate}
                    onChange={e => setNightRate(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Floodlight Rate (PKR/hr)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={floodlightRate}
                    onChange={e => setFloodlightRate(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasFloodlights}
                    onChange={e => setHasFloodlights(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                  />
                  <span>Has high-mast LED floodlights installed</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save to Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
