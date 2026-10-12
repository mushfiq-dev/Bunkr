import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Check, X, Shield, Info, AlertCircle } from 'lucide-react';
import { BangladeshHoliday } from '../types';

interface HolidaysManagerProps {
  holidays: BangladeshHoliday[];
  onUpdateHolidays: (updated: BangladeshHoliday[]) => void;
  isAdminUnlocked: boolean;
  onOpenAdmin: () => void;
}

export const HolidaysManager: React.FC<HolidaysManagerProps> = ({
  holidays,
  onUpdateHolidays,
  isAdminUnlocked,
  onOpenAdmin,
}) => {
  const [newDate, setNewDate] = useState('');
  const [newName, setNewName] = useState('');
  const [newNameBangla, setNewNameBangla] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'official' | 'custom'>('all');

  const handleToggleHoliday = (id: string) => {
    const updated = holidays.map((h) =>
      h.id === id ? { ...h, enabled: !h.enabled } : h
    );
    onUpdateHolidays(updated);
  };

  const handleAddCustomHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newName.trim()) return;

    const newHoliday: BangladeshHoliday = {
      id: `custom-${Date.now()}`,
      date: newDate,
      name: newName.trim(),
      nameBangla: newNameBangla.trim() || undefined,
      description: newDesc.trim() || 'Custom university off-day',
      isOfficial: false,
      enabled: true,
    };

    onUpdateHolidays([...holidays, newHoliday]);
    setNewDate('');
    setNewName('');
    setNewNameBangla('');
    setNewDesc('');
  };

  const handleDeleteHoliday = (id: string) => {
    const updated = holidays.filter((h) => h.id !== id);
    onUpdateHolidays(updated);
  };

  const filtered = holidays.filter((h) => {
    if (filterType === 'official') return h.isOfficial;
    if (filterType === 'custom') return !h.isOfficial;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#16171D] border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
            <span className="text-amber-500 font-mono text-xs border border-amber-500/40 px-1.5 py-0.5 rounded">
              BD
            </span>
            Bangladesh Public Holidays & Academic Recesses
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Pre-loaded official government holidays for the academic year. Days marked off are highlighted in the calendar grid.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              filterType === 'all'
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All ({holidays.length})
          </button>
          <button
            onClick={() => setFilterType('official')}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              filterType === 'official'
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Official National
          </button>
          <button
            onClick={() => setFilterType('custom')}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              filterType === 'custom'
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            University Custom
          </button>
        </div>
      </div>

      {/* Add Custom Holiday Form (Admin) */}
      {isAdminUnlocked ? (
        <form
          onSubmit={handleAddCustomHoliday}
          className="p-4 rounded-xl bg-neutral-900 border border-amber-500/30 space-y-3"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
            <span>Add University Recess / Custom Off-Day</span>
            <span className="text-neutral-500 font-normal">Admin Mode Active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Date</label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Holiday Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Midterm Break"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Bangla Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. মিডটার্ম ছুটি"
                value={newNameBangla}
                onChange={(e) => setNewNameBangla(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Off-Day
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs flex items-center justify-between text-neutral-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-500" />
            <span>To add custom university recess dates or study holidays, unlock Admin Mode.</span>
          </div>
          <button
            onClick={onOpenAdmin}
            className="text-amber-400 hover:text-amber-300 font-medium underline"
          >
            Unlock Admin
          </button>
        </div>
      )}

      {/* Holidays List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((holiday) => (
          <div
            key={holiday.id}
            className={`p-3.5 rounded-xl border transition-all ${
              holiday.enabled
                ? 'bg-neutral-900/90 border-neutral-800'
                : 'bg-neutral-900/30 border-neutral-800/40 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-semibold text-amber-400">
                  {holiday.date}
                </span>
                <h4 className="text-sm font-semibold text-neutral-200 mt-0.5">
                  {holiday.name}
                </h4>
                {holiday.nameBangla && (
                  <p className="text-xs text-amber-300/80 font-medium mt-0.5">
                    {holiday.nameBangla}
                  </p>
                )}
                {holiday.description && (
                  <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                    {holiday.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Toggle on/off */}
                <button
                  onClick={() => handleToggleHoliday(holiday.id)}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    holiday.enabled
                      ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-400'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-500'
                  }`}
                  title={holiday.enabled ? 'Observed (Active)' : 'Ignored'}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>

                {/* Delete if custom */}
                {!holiday.isOfficial && isAdminUnlocked && (
                  <button
                    onClick={() => handleDeleteHoliday(holiday.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 transition-colors"
                    title="Delete custom holiday"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-500">
              <span>{holiday.isOfficial ? 'National Public Holiday' : 'University Recess'}</span>
              <span>{holiday.enabled ? 'Counts as Off-Day' : 'Class Held as Scheduled'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
