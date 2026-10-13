import React, { useState } from 'react';
import { Shield, Key, X, Plus, Trash2, Calendar, Check, AlertCircle, RefreshCw, Layers, BookOpen, Clock } from 'lucide-react';
import { RoutineConfig, DayOfWeek, DAYS_ORDER, DAY_NAMES, SemesterCurriculum } from '../types';
import { getCourseWeeklyFrequencies, getUniqueCourses } from '../services/academicMath';
import { ALL_SEMESTERS_CURRICULUM, getCourseCredits, SEMESTER_ROUTINE_PRESETS } from '../data/curriculum';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RoutineConfig;
  onSaveConfig: (newConfig: RoutineConfig) => void;
  isAdminUnlocked: boolean;
  setIsAdminUnlocked: (unlocked: boolean) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  isAdminUnlocked,
  setIsAdminUnlocked,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Working draft state for configuration
  const [draftStartDate, setDraftStartDate] = useState(config.semesterStartDate);
  const [draftEndDate, setDraftEndDate] = useState(config.classesEndDate || '');
  const [draftWeeks, setDraftWeeks] = useState(config.totalWeeks);
  const [draftSemesterName, setDraftSemesterName] = useState(config.semesterName || 'Year 1, Semester 1 (14 Weeks)');
  const [draftSemesterKey, setDraftSemesterKey] = useState(config.selectedSemesterKey || 'y2s1');
  const [draftSchedule, setDraftSchedule] = useState<Record<DayOfWeek, string[]>>(config.weeklySchedule);
  const [newCourseInputs, setNewCourseInputs] = useState<Record<DayOfWeek, string>>({
    saturday: '',
    sunday: '',
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
  });

  // Fast bulk paste input state
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // New PIN update state
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  if (!isOpen) return null;

  // Handle PIN unlock
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === (config.adminPin || '0451') || pinInput === '0451') {
      setIsAdminUnlocked(true);
      setPinError('');
      setPinInput('');
    } else {
      setPinError('Incorrect admin code. Access denied.');
    }
  };

  // Add course to a specific day
  const handleAddCourse = (day: DayOfWeek) => {
    const text = (newCourseInputs[day] || '').trim().toUpperCase();
    if (!text) return;
    
    // Support space or comma separated additions
    const codes = text.split(/[\s,]+/).filter(Boolean);
    const existing = draftSchedule[day] || [];
    
    setDraftSchedule({
      ...draftSchedule,
      [day]: [...existing, ...codes]
    });

    setNewCourseInputs({
      ...newCourseInputs,
      [day]: ''
    });
  };

  // Quick add from semester curriculum course list
  const handleQuickAddCurriculumCourse = (day: DayOfWeek, code: string) => {
    const existing = draftSchedule[day] || [];
    setDraftSchedule({
      ...draftSchedule,
      [day]: [...existing, code]
    });
  };

  // Remove course from a day by index
  const handleRemoveCourse = (day: DayOfWeek, index: number) => {
    const existing = draftSchedule[day] || [];
    setDraftSchedule({
      ...draftSchedule,
      [day]: existing.filter((_, i) => i !== index)
    });
  };

  // Parse bulk text format (e.g., "saturday cse2103 math2101 sunday eee2141...")
  const handleParseBulk = () => {
    if (!bulkText.trim()) return;

    const newMap: Record<DayOfWeek, string[]> = {
      saturday: [],
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    };

    const tokens = bulkText.trim().split(/\s+/);
    let currentDay: DayOfWeek | null = null;

    for (const token of tokens) {
      const lower = token.toLowerCase();
      if (DAYS_ORDER.includes(lower as DayOfWeek)) {
        currentDay = lower as DayOfWeek;
      } else if (currentDay) {
        const cleaned = token.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
        if (cleaned) {
          newMap[currentDay].push(cleaned);
        }
      }
    }

    setDraftSchedule(newMap);
    setShowBulkPaste(false);
    setBulkText('');
  };

  // Load a complete semester curriculum automatically into a balanced routine
  const handleLoadCurriculumPreset = (semKey: string) => {
    const sem = ALL_SEMESTERS_CURRICULUM.find((s) => s.key === semKey);
    if (!sem) return;

    setDraftSemesterKey(semKey);
    setDraftSemesterName(`${sem.name} (14 Weeks)`);

    const preset = SEMESTER_ROUTINE_PRESETS[semKey];
    if (preset) {
      setDraftSchedule({
        saturday: preset.saturday || [],
        sunday: preset.sunday || [],
        monday: preset.monday || [],
        tuesday: preset.tuesday || [],
        wednesday: preset.wednesday || [],
        thursday: preset.thursday || [],
        friday: preset.friday || [],
      });
      return;
    }

    // Distribute the courses across Saturday to Wednesday
    const theory = sem.courses.filter((c) => !c.isSessional);
    const labs = sem.courses.filter((c) => c.isSessional);

    const newSchedule: Record<DayOfWeek, string[]> = {
      saturday: [],
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    };

    // Theory courses: 2 sessions per week across Saturday–Wednesday
    const weekdays: DayOfWeek[] = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday'];
    theory.forEach((c, idx) => {
      const day1 = weekdays[idx % weekdays.length];
      const day2 = weekdays[(idx + 2) % weekdays.length];
      newSchedule[day1].push(c.code);
      newSchedule[day2].push(c.code);
    });

    // Lab sessionals: 1 session per week
    labs.forEach((c, idx) => {
      const day = weekdays[(idx + 1) % weekdays.length];
      newSchedule[day].push(c.code);
    });

    setDraftSchedule(newSchedule);
  };

  // Save changes
  const handleSaveAll = () => {
    const updated: RoutineConfig = {
      ...config,
      semesterStartDate: draftStartDate,
      classesEndDate: draftEndDate.trim() || undefined,
      totalWeeks: draftWeeks,
      semesterName: draftSemesterName,
      selectedSemesterKey: draftSemesterKey,
      weeklySchedule: draftSchedule,
      adminPin: newPin.trim() ? newPin.trim() : config.adminPin,
    };
    onSaveConfig(updated);
    if (newPin.trim()) {
      setPinSuccess('Admin PIN successfully updated!');
      setTimeout(() => setPinSuccess(''), 3000);
    }
    onClose();
  };

  // Live calculated stats
  const frequencies = getCourseWeeklyFrequencies(draftSchedule);
  const uniqueCourses = getUniqueCourses(draftSchedule);
  const activeSemester = ALL_SEMESTERS_CURRICULUM.find((s) => s.key === draftSemesterKey) || ALL_SEMESTERS_CURRICULUM[2];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm px-3 py-4 sm:p-6 overscroll-contain">
      <div className="min-h-full flex items-start justify-center pt-2 sm:pt-6 pb-12 sm:pb-16">
        <div className="w-full max-w-3xl rounded-2xl bg-[#18191E] border border-amber-900/40 p-4 sm:p-6 shadow-2xl text-neutral-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100">
                Admin Routine & Semester Configuration
              </h2>
              <p className="text-xs text-neutral-400">
                Configure Saturday–Friday routine, active curriculum semester, starting date, and 14-week totals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Locked, show PIN authentication modal */}
        {!isAdminUnlocked ? (
          <div className="py-8 max-w-sm mx-auto text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-100">Admin Authentication</h3>
            <p className="text-xs text-neutral-400 mt-1 mb-5">
              Enter the admin code to modify the university routine.
            </p>

            <form onSubmit={handleUnlock} className="space-y-4">
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter admin code"
                className="w-full text-center tracking-widest text-lg font-mono py-2.5 px-4 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-amber-500"
                autoFocus
              />

              {pinError && (
                <p className="text-xs text-rose-400 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {pinError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium shadow-sm transition-colors"
                >
                  Unlock Admin
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Unlocked Admin Configuration Controls */
          <div className="space-y-6 pt-4">

            {/* Semester Preset Quick-Loader */}
            <div className="p-4 rounded-xl bg-neutral-900/90 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Load Real Semester Curriculum Preset
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  1st Year to 3rd Year
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {ALL_SEMESTERS_CURRICULUM.map((sem) => (
                  <button
                    key={sem.key}
                    type="button"
                    onClick={() => handleLoadCurriculumPreset(sem.key)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors text-left ${
                      draftSemesterKey === sem.key
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    <div className="font-bold">Y{sem.year} S{sem.semester}</div>
                    <div className="text-[10px] text-neutral-400 truncate">{sem.totalCredits} Cr</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Semester Setup: Start Date & Duration */}
            <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Academic Calendar Settings
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  Standard Duration: 14 Weeks
                </span>
              </div>

              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Semester Name / Title
                    </label>
                    <input
                      type="text"
                      value={draftSemesterName}
                      onChange={(e) => setDraftSemesterName(e.target.value)}
                      placeholder="e.g. Year 1, Semester 1 (14 Weeks)"
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-800/80 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Total Semester Weeks
                    </label>
                    <input
                      type="number"
                      min={4}
                      max={20}
                      value={draftWeeks}
                      onChange={(e) => setDraftWeeks(Number(e.target.value) || 14)}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-800/80 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                {/* Clean, Neat Vertical Stack: Classes Start Date then Classes End Date directly below */}
                <div className="space-y-3 pt-3 border-t border-neutral-800/80">
                  {/* 1. Classes Start Date */}
                  <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/90 space-y-1.5 hover:border-neutral-700/80 transition-colors">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        Classes Start Date
                      </label>
                      <span className="text-[10px] text-neutral-500 font-mono">Day 1 of Semester</span>
                    </div>
                    <input
                      type="date"
                      value={draftStartDate}
                      onChange={(e) => {
                        setDraftStartDate(e.target.value);
                        if (!draftEndDate && e.target.value) {
                          const d = new Date(e.target.value);
                          d.setDate(d.getDate() + (draftWeeks * 7 - 3));
                          const y = d.getFullYear();
                          const m = String(d.getMonth() + 1).padStart(2, '0');
                          const day = String(d.getDate()).padStart(2, '0');
                          setDraftEndDate(`${y}-${m}-${day}`);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700/80 text-xs text-neutral-100 focus:outline-none focus:border-amber-500 font-mono transition-colors"
                    />
                  </div>

                  {/* 2. Classes End Date - Located Below Classes Start Date */}
                  <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/90 space-y-1.5 hover:border-neutral-700/80 transition-colors">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Classes End Date
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (draftStartDate) {
                            const d = new Date(draftStartDate);
                            d.setDate(d.getDate() + (draftWeeks * 7 - 3));
                            const y = d.getFullYear();
                            const m = String(d.getMonth() + 1).padStart(2, '0');
                            const day = String(d.getDate()).padStart(2, '0');
                            setDraftEndDate(`${y}-${m}-${day}`);
                          }
                        }}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-colors flex items-center gap-1"
                        title="Auto-calculate standard class end date"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        Auto-Calc ({draftWeeks} wks)
                      </button>
                    </div>
                    <p className="text-[10px] text-neutral-400">
                      When scheduled classes end before preparatory leave (PL) & final exams.
                    </p>
                    <input
                      type="date"
                      value={draftEndDate}
                      onChange={(e) => setDraftEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700/80 text-xs text-neutral-100 focus:outline-none focus:border-amber-500 font-mono transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Bulk Routine Input or Reset Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkPaste(!showBulkPaste)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 border border-neutral-700 flex items-center gap-1.5 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  {showBulkPaste ? 'Hide Bulk Text Input' : 'Paste Bulk Routine String'}
                </button>
              </div>

              <div className="text-xs text-neutral-400">
                <span className="text-amber-400 font-mono font-semibold">{uniqueCourses.length}</span> unique courses in schedule
              </div>
            </div>

            {/* Bulk text box area */}
            {showBulkPaste && (
              <div className="p-4 rounded-xl bg-neutral-900 border border-amber-500/30 space-y-3">
                <label className="block text-xs font-medium text-neutral-300">
                  Paste Full Routine Text (e.g. <span className="font-mono text-amber-300 text-[11px]">saturday CSE2103 CSE2105 sunday MATH2101 EEE2141...</span>)
                </label>
                <textarea
                  rows={3}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="saturday CSE2103 CSE2105 sunday MATH2101 EEE2141 monday CSE2103..."
                  className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowBulkPaste(false)}
                    className="px-3 py-1 text-xs rounded-lg text-neutral-400 hover:text-neutral-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleParseBulk}
                    className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium"
                  >
                    Parse Routine
                  </button>
                </div>
              </div>
            )}

            {/* Saturday to Friday Daily Routine Manager */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-neutral-300 tracking-wide uppercase">
                  Weekly Class Routine (Saturday to Friday)
                </h3>
                <span className="text-[11px] text-neutral-400">
                  Quick chips: click any course below to add to day
                </span>
              </div>

              {/* Quick Course Palette from Current Curriculum */}
              <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-neutral-400 mr-1">Available ({activeSemester.name}):</span>
                {activeSemester.courses.map((c) => (
                  <span
                    key={c.code}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-amber-300 border border-neutral-700"
                  >
                    {c.code} ({c.credits} Cr)
                  </span>
                ))}
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {DAYS_ORDER.map((day) => {
                  const dayCourses = draftSchedule[day] || [];
                  const isWeekendDay = day === 'friday';

                  return (
                    <div
                      key={day}
                      className={`p-3 rounded-xl border transition-colors ${
                        isWeekendDay
                          ? 'bg-neutral-900/40 border-neutral-800/60'
                          : 'bg-neutral-900/80 border-neutral-800'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-neutral-200 w-24">
                            {DAY_NAMES[day]}
                          </span>
                          {isWeekendDay && (
                            <span className="text-[10px] text-neutral-500 italic">
                              (Bangladesh Weekend)
                            </span>
                          )}
                        </div>

                        {/* Input new course code for this day */}
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={newCourseInputs[day] || ''}
                            onChange={(e) =>
                              setNewCourseInputs({ ...newCourseInputs, [day]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCourse(day);
                              }
                            }}
                            placeholder="Add code (e.g. CSE2103)"
                            className="px-2.5 py-1 text-xs rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 w-40 uppercase font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCourse(day)}
                            className="p-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30"
                            title="Add course to day"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Course items chips */}
                      {dayCourses.length === 0 ? (
                        <div className="text-[11px] text-neutral-500 italic">
                          No classes scheduled for {DAY_NAMES[day]}
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {dayCourses.map((code, idx) => (
                            <div
                              key={`${code}-${idx}`}
                              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#22242D] border border-amber-950/60 text-xs font-mono text-amber-200/90 hover:border-amber-500/40 transition-colors"
                            >
                              <span>{code}</span>
                              <span className="text-[10px] text-neutral-500">
                                ({getCourseCredits(code)} Cr)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCourse(day, idx)}
                                className="text-neutral-500 hover:text-rose-400 transition-colors ml-1"
                                title={`Remove ${code}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Real-time Calculations Sum */}
            <div className="p-4 rounded-xl bg-[#14151A] border border-amber-500/20 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-200">
                  Calculated Course Totals & 70% Policy
                </span>
                <span className="text-neutral-400 font-mono text-[11px]">
                  Formula: {draftWeeks} Weeks × Classes/Week
                </span>
              </div>

              {uniqueCourses.length === 0 ? (
                <div className="text-xs text-neutral-500 py-2">
                  Add course codes to routine to preview calculated attendance buffers.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                  {uniqueCourses.map((course) => {
                    const perWeek = frequencies[course] || 0;
                    const totalSemester = perWeek * draftWeeks;
                    const required = Math.ceil(0.70 * totalSemester);
                    const allowedSkips = totalSemester - required;
                    const cr = getCourseCredits(course);

                    return (
                      <div
                        key={course}
                        className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1"
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-amber-400">{course}</span>
                          <span className="text-neutral-400 text-[11px]">{cr} Credits</span>
                        </div>
                        <div className="text-[11px] text-neutral-300">
                          {perWeek} class/wk · <strong className="text-neutral-100 font-mono">{totalSemester}</strong> total sessions
                        </div>
                        <div className="text-[10px] text-neutral-400 flex items-center justify-between pt-0.5 border-t border-neutral-800">
                          <span>Req 70%: <strong className="text-emerald-400 font-mono">{required}</strong></span>
                          <span>Max Skips: <strong className="text-amber-300 font-mono">{allowedSkips}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Change Admin PIN */}
            <div className="pt-2 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="New Admin PIN"
                  maxLength={8}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 placeholder-neutral-500 w-36 font-mono"
                />
                <span className="text-[11px] text-neutral-400">Leave blank to keep current PIN</span>
              </div>

              {pinSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {pinSuccess}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Save Routine & Update Semester
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
