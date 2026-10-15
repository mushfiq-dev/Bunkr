import React from 'react';
import {
  Check,
  X,
  Circle,
  CalendarDays,
} from 'lucide-react';
import {
  RoutineConfig,
  CalendarDayInfo,
  AttendanceRecord,
  DAY_NAMES,
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

  // Scheduled courses strictly for today
  const scheduledCourses = config.weeklySchedule[todayDayOfWeek] || [];

  // Summary counts for today's scheduled classes
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

  // Format today's date cleanly for display
  const formattedToday = todayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#161720] border border-neutral-800 p-5 sm:p-7 shadow-xl transition-all shrink-0">
      {/* Subtle ambient ember glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        
        {/* Top Header: Title, Device Date & Summary Counter Pod */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <CalendarDays className="w-5 h-5 text-amber-400" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-neutral-100 tracking-tight">
                  Today's Attendance Fast-Log
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Live Today Log" />
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                {formattedToday}
              </p>
            </div>
          </div>

          {/* Stats Pod */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="px-3.5 py-1.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-xs font-mono flex items-center gap-2.5">
              <span className="text-emerald-400 font-semibold" title="Attended">✓ {attendedCount} Attended</span>
              <span className="text-neutral-700">·</span>
              <span className="text-rose-400 font-semibold" title="Skipped">✕ {skippedCount} Skipped</span>
              <span className="text-neutral-700">·</span>
              <span className="text-neutral-400" title="Unmarked">○ {unmarkedCount} Blank</span>
            </div>
          </div>
        </div>

        {/* Today's Course Quick-Log Buttons */}
        <div>
          {scheduledCourses.length === 0 ? (
            <div className="py-4 px-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 text-xs text-neutral-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>
                No classes scheduled for today (<strong className="capitalize text-neutral-300">{DAY_NAMES[todayDayOfWeek]}</strong> is an off-day or weekend).
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                Check the Calendar tab to review or edit past attendance
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-neutral-400">
                <span className="text-[11px]">
                  Tap once for <strong className="text-emerald-400">Attended</strong>, twice for <strong className="text-rose-400">Skipped</strong>, thrice to reset:
                </span>
                <span className="text-[11px] font-mono text-neutral-500">
                  Cycle: Attended ➔ Skipped ➔ Unmarked
                </span>
              </div>

              {/* Perfectly Aligned Responsive Grid of Course Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5">
                {scheduledCourses.map((course) => {
                  const key = `${todayKey}_${course}`;
                  const record = attendanceRecords[key];
                  const status = record?.status || 'unmarked';

                  return (
                    <button
                      key={course}
                      onClick={() => onToggleAttendance(todayKey, course)}
                      className={`min-h-[100px] p-3.5 sm:p-4 rounded-2xl border transition-all text-left flex flex-col justify-between shadow-sm cursor-pointer select-none active:scale-[0.98] ${
                        status === 'attended'
                          ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-100 hover:border-emerald-400 shadow-emerald-950/40'
                          : status === 'skipped'
                          ? 'bg-rose-950/60 border-rose-500/80 text-rose-100 hover:border-rose-400 shadow-rose-950/40'
                          : 'bg-neutral-900/90 border-neutral-700/80 text-neutral-200 hover:border-amber-500/50 hover:bg-neutral-850'
                      }`}
                      title={`Click to cycle attendance for ${course} today (${todayKey}) — Currently: ${status}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-base sm:text-lg tracking-wide text-neutral-100">
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

                      <div className="flex flex-col items-start gap-0.5 text-[10px] sm:text-xs font-mono pt-1 mt-auto">
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

              {/* Helpful Hint to Use Calendar for Past/Future Days */}
              <div className="pt-2 text-right">
                <span className="text-[11px] font-mono text-neutral-500">
                  To view or change attendance for past or future days, use the <strong className="text-amber-400/90 font-semibold">Calendar</strong> tab.
                </span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
