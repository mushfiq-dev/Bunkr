import React, { useState } from 'react';
import {
  Check,
  X,
  Circle,
  CalendarDays,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import {
  RoutineConfig,
  CalendarDayInfo,
  AttendanceRecord,
  DayOfWeek,
  DAYS_ORDER,
  DAY_NAMES,
  DAY_SHORT_NAMES,
} from '../types';
import { jsDayToDayOfWeek, formatDateToKey } from '../services/academicMath';

interface DailyAttendanceBannerProps {
  config: RoutineConfig;
  calendarDays: CalendarDayInfo[];
  attendanceRecords: Record<string, AttendanceRecord>;
  onToggleAttendance: (date: string, courseCode: string) => void;
  onOpenAttendanceTab?: () => void;
  onOpenAdmin?: () => void;
}

export const DailyAttendanceBanner: React.FC<DailyAttendanceBannerProps> = ({
  config,
  calendarDays,
  attendanceRecords,
  onToggleAttendance,
  onOpenAttendanceTab,
}) => {
  // Target is strictly and always the current device date
  const todayDate = new Date();
  const todayKey = formatDateToKey(todayDate);
  const todayDayOfWeek = jsDayToDayOfWeek(todayDate.getDay());

  // Active day filter in the fast-log bar (defaults to today's day of week)
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDayOfWeek);

  // Scheduled courses for the selected routine day
  const scheduledCourses = config.weeklySchedule[selectedDay] || [];

  // Summary counts for this day on device target date
  let attendedCount = 0;
  let skippedCount = 0;
  let unmarkedCount = 0;

  scheduledCourses.forEach((c) => {
    const key = `${todayKey}_${c}`;
    const status = attendanceRecords[key]?.status || 'unmarked';
    if (status === 'attended') attendedCount++;
    else if (status === 'skipped') skippedCount++;
    else unmarkedCount++;
  });

  const isTodaySelected = selectedDay === todayDayOfWeek;

  // Format today's date cleanly for display
  const formattedToday = todayDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#17181F] via-[#1B1917] to-[#17181F] border border-amber-900/50 p-4 sm:p-5 shadow-xl transition-all">
      {/* Subtle ember glow background */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-3.5">
        
        {/* Top Header: Title, Device Date & Summary Counter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <CalendarDays className="w-5 h-5 text-amber-400" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-neutral-100 tracking-tight">
                  Daily Attendance Fast-Log
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Live Attendance Log" />
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                {formattedToday}
              </p>
            </div>
          </div>

          {/* Clean Alignment: Stats Pill & Quick Grid Link */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs font-mono flex items-center gap-2.5">
              <span className="text-emerald-400 font-semibold" title="Attended">✓ {attendedCount}</span>
              <span className="text-neutral-700">|</span>
              <span className="text-rose-400 font-semibold" title="Skipped">✕ {skippedCount}</span>
              <span className="text-neutral-700">|</span>
              <span className="text-neutral-400" title="Unmarked">○ {unmarkedCount}</span>
            </div>

            {onOpenAttendanceTab && (
              <button
                onClick={onOpenAttendanceTab}
                className="px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/40 text-xs text-neutral-400 hover:text-amber-300 transition-colors font-mono flex items-center gap-1.5 shrink-0"
                title="View full 14-week matrix grid"
              >
                <span>14-Wk Grid</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Day Selector Tabs (Sat, Sun, Mon, Tue, Wed, Thu, Fri) */}
        <div className="flex items-center justify-between gap-2 border-y border-neutral-800/80 py-2.5 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-mono uppercase text-neutral-500 mr-1 hidden sm:inline">
              Routine Day:
            </span>
            {DAYS_ORDER.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = day === todayDayOfWeek;
              const courseCount = (config.weeklySchedule[day] || []).length;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm font-bold'
                      : 'bg-neutral-900/70 text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:bg-neutral-800/80'
                  }`}
                >
                  <span className="capitalize">{DAY_SHORT_NAMES[day]}</span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Device Today" />
                  )}
                  {courseCount > 0 && (
                    <span
                      className={`text-[10px] px-1 rounded ${
                        isSelected
                          ? 'bg-amber-500/30 text-amber-200'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {courseCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-mono text-neutral-400 shrink-0 hidden md:block">
            {isTodaySelected ? (
              <span className="text-amber-400 font-semibold">Today's Routine</span>
            ) : (
              <span className="text-neutral-400 capitalize">{DAY_NAMES[selectedDay]} Routine</span>
            )}
          </div>
        </div>

        {/* Instructions & Course Quick-Log Buttons */}
        <div>
          {scheduledCourses.length === 0 ? (
            <div className="py-4 px-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-xs text-neutral-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>
                No classes scheduled on <strong className="capitalize text-neutral-300">{DAY_NAMES[selectedDay]}</strong> (Weekend or Off-Day).
              </span>
              <div className="flex items-center gap-2">
                {!isTodaySelected && (
                  <button
                    onClick={() => setSelectedDay(todayDayOfWeek)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono hover:bg-amber-500/25"
                  >
                    Switch to Today
                  </button>
                )}
                <span className="text-[11px] font-mono text-neutral-500">
                  Select Sat–Wed to log other routine classes
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-neutral-400">
                <span className="text-[11px]">
                  Tap once for <strong className="text-emerald-400">Attended</strong>, twice for <strong className="text-rose-400">Skipped</strong>, thrice to reset:
                </span>
                <span className="text-[11px] font-mono text-neutral-500">
                  Cycle: Attended ➔ Skipped ➔ Unmarked
                </span>
              </div>

              {/* Perfectly Aligned Responsive Grid of Course Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {scheduledCourses.map((course) => {
                  const key = `${todayKey}_${course}`;
                  const record = attendanceRecords[key];
                  const status = record?.status || 'unmarked';

                  return (
                    <button
                      key={course}
                      onClick={() => onToggleAttendance(todayKey, course)}
                      className={`h-[88px] p-3 rounded-xl border transition-all text-left flex flex-col justify-between shadow-sm cursor-pointer select-none ${
                        status === 'attended'
                          ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-100 hover:border-emerald-400 shadow-emerald-950/40'
                          : status === 'skipped'
                          ? 'bg-rose-950/60 border-rose-500/80 text-rose-100 hover:border-rose-400 shadow-rose-950/40'
                          : 'bg-neutral-900/90 border-neutral-700/80 text-neutral-200 hover:border-amber-500/50 hover:bg-neutral-850'
                      }`}
                      title={`Click to cycle attendance for ${course} on ${todayKey} (Currently: ${status})`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sm tracking-wide">
                          {course}
                        </span>
                        {status === 'attended' && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {status === 'skipped' && (
                          <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold">
                            <X className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {status === 'unmarked' && (
                          <div className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500">
                            <Circle className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span
                          className={
                            status === 'attended'
                              ? 'text-emerald-300 font-semibold'
                              : status === 'skipped'
                              ? 'text-rose-300 font-semibold'
                              : 'text-neutral-400'
                          }
                        >
                          {status === 'attended'
                            ? 'Attended'
                            : status === 'skipped'
                            ? 'Skipped'
                            : 'Unmarked'}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {status === 'attended' ? '✓ Logged' : status === 'skipped' ? '✕ Logged' : 'Tap to log'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
